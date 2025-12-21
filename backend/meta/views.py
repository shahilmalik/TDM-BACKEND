
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import MetaAccessToken, ClientPageMapping
from .serializers import MetaAccessTokenSerializer, ClientPageMappingSerializer

# Placeholder for Meta Graph API client and encryption helpers
# from .utils import meta_graph_api_request, decrypt_token

class RequestOTPForAccessTokenView(APIView):
	"""
	POST: Request OTP to be sent to BusinessInfo.secondary_email
	Purpose: Initiate the process to add a new access token
	"""
	def post(self, request):
		from .otp_helpers import generate_otp, store_otp
		from core.utils import send_otp_email
		from invoice.models import BusinessInfo
		
		# Get business info
		try:
			business_info = BusinessInfo.objects.last()
			if not business_info or not business_info.secondary_email:
				return Response({"detail": "Secondary email not configured"}, status=status.HTTP_400_BAD_REQUEST)
		except BusinessInfo.DoesNotExist:
			return Response({"detail": "Business info not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Generate and store OTP (using user_id=1 as placeholder for testing)
		otp = generate_otp()
		store_otp(1, otp, timeout=900)  # 15 minutes
		
		# Send OTP using core.utils
		try:
			send_otp_email(business_info.secondary_email, otp)
		except Exception as e:
			return Response({"detail": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
		
		return Response({
			"message": "OTP sent to secondary email",
			"secondary_email": business_info.secondary_email
		})


class CreateAccessTokenView(APIView):
	"""
	POST: { access_token, otp, account_label }
	Verify OTP, validate access token with Meta, and save it.
	"""
	def post(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		from .otp_helpers import verify_otp, clear_otp
		
		access_token = request.data.get("access_token")
		otp = request.data.get("otp")
		account_label = request.data.get("account_label", "")
		user_id = 1  # Default user_id for testing (no auth required)
		
		if not access_token or not otp:
			return Response({"detail": "Missing access_token or otp"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Verify OTP
		if not verify_otp(user_id, otp):
			return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Verify access token with Meta
		try:
			data = meta_graph_api_request(
				"/me",
				access_token,
				params={"fields": "id,name"}
			)
			meta_user_id = data.get("id")
			user_name = data.get("name")
			
			if not meta_user_id or not user_name:
				return Response({"detail": "Unable to retrieve account info from Meta"}, status=status.HTTP_400_BAD_REQUEST)
			
		except MetaGraphAPIError as e:
			return Response({"detail": f"Invalid access token: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Create and save token (append-only; does not affect other tokens)
		from datetime import datetime, timedelta
		token = MetaAccessToken.objects.create(
			account_label=account_label or user_name,
			access_token=access_token,
			expires_at=datetime.now() + timedelta(days=60),
			status="active"
		)
		
		# Clear OTP
		clear_otp(user_id)
		
		return Response({
			"success": True,
			"token_id": token.id,
			"account_label": token.account_label,
			"message": "Access token saved successfully"
		})

class FetchLinkedPagesView(APIView):
	"""
	GET: List all FB Pages for all stored tokens.
	"""
	def get(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		# Fetch pages across all ACTIVE tokens.
		# Do not overwrite or invalidate other tokens when adding a new token.
		tokens = MetaAccessToken.objects.filter(status="active").order_by("-created_at")
		all_pages = []
		for token in tokens:
			try:
				data = meta_graph_api_request(
					"/me/accounts",
					token.access_token,
					params={"fields": "id,name,picture,access_token,instagram_business_account"}
				)
				for page in data.get("data", []):
					all_pages.append({
						"account_label": token.account_label,
						"token_id": token.id,
						"fb_page_id": page.get("id"),
						"fb_page_name": page.get("name"),
						"fb_page_picture": page.get("picture", {}).get("data", {}).get("url"),
						"ig_account_id": page.get("instagram_business_account", {}).get("id") if page.get("instagram_business_account") else None
					})
			except MetaGraphAPIError as e:
				# Mark ONLY this token invalid if the Graph API indicates auth failure.
				if getattr(e, "status_code", None) == 401:
					token.status = "invalid"
					token.save(update_fields=["status", "updated_at"])
				continue
			except Exception as e:
				# Catch any other errors and continue
				continue
		return Response({"pages": all_pages})

class ClientPageSyncView(APIView):
	"""
	POST: { client_id, fb_page_id }
	Internally finds the token that owns this page, fetches page access token and IG account ID.
	"""
	def post(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		from core.models import ClientProfile
		
		client_id = request.data.get("client_id")
		fb_page_id = request.data.get("fb_page_id")
		
		if not client_id or not fb_page_id:
			return Response({"detail": "Missing client_id or fb_page_id"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Get ClientProfile
		try:
			client_profile = ClientProfile.objects.get(id=client_id)
		except ClientProfile.DoesNotExist:
			return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Find the token that owns this page
		tokens = MetaAccessToken.objects.filter(status="active")
		page_data = None
		owning_token = None
		
		for token in tokens:
			try:
				data = meta_graph_api_request(
					"/me/accounts",
					token.access_token,
					params={"fields": "id,name,access_token,instagram_business_account"}
				)
				# Search for the page in this token's accounts
				for page in data.get("data", []):
					if page.get("id") == fb_page_id:
						page_data = page
						owning_token = token
						break
				
				if page_data:
					break
			except MetaGraphAPIError:
				continue
		
		if not page_data or not owning_token:
			return Response({"detail": "Page not found or not accessible"}, status=status.HTTP_404_NOT_FOUND)
		
		# Extract page access token and IG account ID
		page_access_token = page_data.get("access_token")
		ig_account_id = page_data.get("instagram_business_account", {}).get("id") if page_data.get("instagram_business_account") else None
		
		# Delete all existing mappings for this client first (one mapping per client)
		client_profile.page_mappings.all().delete()
		
		# Create new mapping
		mapping = ClientPageMapping.objects.create(
			client=client_profile,
			fb_page_id=fb_page_id,
			ig_account_id=ig_account_id,
			page_access_token=page_access_token,
		)
		
		return Response({
			"success": True,
			"mapping": {
				"client_id": client_id,
				"client_email": client_profile.user.email,
				"fb_page_id": fb_page_id,
				"ig_account_id": ig_account_id,
				"page_name": page_data.get("name")
			}
		})

class InstagramProfileDataView(APIView):
	"""
	GET: Fetch IG profile data for a mapped page.
	"""
	def get(self, request, client_id):
		from .utils import meta_graph_api_request, MetaGraphAPIError, get_cached_instagram_grid, cache_instagram_grid
		from core.models import ClientProfile
		
		try:
			client_profile = ClientProfile.objects.get(id=client_id)
			mapping = client_profile.page_mappings.first()
			if not mapping:
				return Response({"detail": "No page mapping found for this client"}, status=status.HTTP_404_NOT_FOUND)
		except ClientProfile.DoesNotExist:
			return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
		
		if not mapping.ig_account_id:
			return Response({"detail": "No Instagram account linked"}, status=status.HTTP_200_OK)
		# Check cache for grid
		cached = get_cached_instagram_grid(mapping.ig_account_id)
		if cached:
			return Response(cached)
		# Fetch IG profile data
		try:
			profile = meta_graph_api_request(
				f"/{mapping.ig_account_id}",
				mapping.page_access_token,
				params={"fields": "followers_count,follows_count,media_count,username,profile_picture_url,biography"}
			)
			media = meta_graph_api_request(
				f"/{mapping.ig_account_id}/media",
				mapping.page_access_token,
				params={"fields": "id,media_url,media_type,thumbnail_url,timestamp,permalink,like_count,insights.metric(impressions,reach)"}
			)
			# Process media to include likes and views, remove caption
			processed_media = []
			for item in media.get("data", []):
				processed_item = {
					"id": item.get("id"),
					"media_url": item.get("media_url"),
					"media_type": item.get("media_type"),
					"thumbnail_url": item.get("thumbnail_url"),
					"timestamp": item.get("timestamp"),
					"permalink": item.get("permalink"),
					"like_count": item.get("like_count"),
				}
				# Extract impressions and reach from insights if available
				insights = item.get("insights", {}).get("data", [])
				for insight in insights:
					if insight.get("name") == "impressions":
						processed_item["views"] = insight.get("values", [{}])[0].get("value", 0)
					elif insight.get("name") == "reach":
						processed_item["reach"] = insight.get("values", [{}])[0].get("value", 0)
				processed_media.append(processed_item)
			
			result = {
				"profile": profile,
				"media": processed_media
			}
			cache_instagram_grid(mapping.ig_account_id, result)
			return Response(result)
		except MetaGraphAPIError as e:
			return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InstagramPostDetailView(APIView):
	"""
	GET: Fetch IG post detail by post_id.
	Returns: id, caption, media_url, media_type, thumbnail_url, timestamp, permalink,
	like_count, comments_count, insights (impressions, reach, saved), and comments.
	"""
	def get(self, request, post_id):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		# Find mapping with IG account containing this post (brute force, optimize as needed)
		mapping = ClientPageMapping.objects.filter(ig_account_id__isnull=False)
		page_access_token = None
		for m in mapping:
			try:
				media = meta_graph_api_request(
					f"/{m.ig_account_id}/media",
					m.page_access_token,
					params={"fields": "id"}
				)
				if any(item["id"] == post_id for item in media.get("data", [])):
					page_access_token = m.page_access_token
					break
			except Exception:
				continue
		if not page_access_token:
			return Response({"detail": "Post not found or not mapped"}, status=status.HTTP_404_NOT_FOUND)
		try:
			# Fetch post details with extended fields
			post = meta_graph_api_request(
				f"/{post_id}",
				page_access_token,
				params={
					"fields": "id,caption,media_url,media_type,thumbnail_url,timestamp,permalink,like_count,comments_count,ig_id,shortcode,children{id,media_url,media_type}"
				}
			)
			
			# Fetch insights (impressions, reach, saved, etc.)
			try:
				insights = meta_graph_api_request(
					f"/{post_id}/insights",
					page_access_token,
					params={"metric": "impressions,reach,saved,engagement"}
				)
				post["insights"] = insights.get("data", [])
			except MetaGraphAPIError:
				post["insights"] = []
			
			# Fetch recent comments
			try:
				comments = meta_graph_api_request(
					f"/{post_id}/comments",
					page_access_token,
					params={"fields": "id,text,timestamp,from{id,username}", "limit": 10}
				)
				post["comments"] = comments.get("data", [])
			except MetaGraphAPIError:
				post["comments"] = []
			
			return Response({
				"success": True,
				"post": post
			})
		except MetaGraphAPIError as e:
			return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ListAllUserTokensView(APIView):
	"""
	GET: List all Meta access tokens with user info from Graph API.
	Returns tokens for all statuses; only marks a token invalid when the Graph API
	explicitly indicates the token is expired/invalid.
	"""
	def get(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		
		tokens = MetaAccessToken.objects.all().order_by('-created_at')
		token_list = []
		
		for token in tokens:
			try:
				user_name = None
				profile_picture = None
				
				# Fetch user info only for active tokens.
				if token.status == "active":
					data = meta_graph_api_request(
						"/me",
						token.access_token,
						params={"fields": "id,name,picture"}
					)
					
					user_name = data.get("name")
					profile_picture = data.get("picture", {}).get("data", {}).get("url")
					meta_user_id = data.get("id")
					
					# Update token with Meta user info if not already stored
					if meta_user_id and not token.meta_user_id:
						token.meta_user_id = meta_user_id
						# Store whatever picture we got for future fallback.
						token.profile_picture_url = profile_picture
						token.save(update_fields=["meta_user_id", "profile_picture_url"])
				
				token_list.append({
					"id": token.id,
					"account_label": token.account_label,
					"user_name": user_name or token.account_label,
					"profile_picture": profile_picture or (token.profile_picture_url or ""),
					"status": token.status,
					"expires_at": token.expires_at,
					"created_at": token.created_at,
				})
			except MetaGraphAPIError as e:
				# Mark ONLY this token invalid if the Graph API indicates auth failure.
				if token.status == "active" and getattr(e, "status_code", None) == 401:
					token.status = "invalid"
					token.save(update_fields=["status", "updated_at"])

				token_list.append({
					"id": token.id,
					"account_label": token.account_label,
					"user_name": token.account_label,
					"profile_picture": token.profile_picture_url or "",
					"status": token.status,
					"expires_at": token.expires_at,
					"created_at": token.created_at,
				})
			except Exception as e:
				# Catch any other errors and still return the token record
				token_list.append({
					"id": token.id,
					"account_label": token.account_label,
					"user_name": token.account_label,
					"profile_picture": token.profile_picture_url or "",
					"status": token.status,
					"expires_at": token.expires_at,
					"created_at": token.created_at,
				})
		
		return Response({"tokens": token_list, "total_count": len(token_list)})


class DeleteUserTokenView(APIView):
	"""
	DELETE: Remove an access token (requires OTP verification).
	"""
	def delete(self, request, token_id):
		from .otp_helpers import generate_otp, store_otp
		from core.utils import send_otp_email
		from invoice.models import BusinessInfo
		
		user_id = 1  # Default user_id for testing (no auth required)
		
		try:
			token = MetaAccessToken.objects.get(id=token_id)
		except MetaAccessToken.DoesNotExist:
			return Response({"detail": "Token not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Get business secondary email
		try:
			business_info = BusinessInfo.objects.last()
			if not business_info or not business_info.secondary_email:
				return Response({"detail": "Secondary email not configured"}, status=status.HTTP_400_BAD_REQUEST)
		except BusinessInfo.DoesNotExist:
			return Response({"detail": "Business info not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Generate OTP
		otp = generate_otp()
		store_otp(user_id, otp, timeout=900)  # 15 minutes
		
		# Store deletion token ID in cache
		from django.core.cache import cache
		cache.set(f"meta_delete_token_{user_id}", token_id, 900)
		
		# Send OTP
		try:
			send_otp_email(business_info.secondary_email, otp)
		except Exception as e:
			return Response({"detail": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
		
		return Response({
			"message": "OTP sent to secondary email for token deletion",
			"token_id": token_id
		})


class VerifyOTPAndDeleteTokenView(APIView):
	"""
	POST: { otp }
	Verify OTP and delete the pending Meta access token.
	"""
	def post(self, request):
		from .otp_helpers import verify_otp, clear_otp
		from django.core.cache import cache
		
		otp = request.data.get("otp")
		user_id = 1  # Default user_id for testing (no auth required)
		
		if not otp:
			return Response({"detail": "Missing OTP"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Verify OTP
		if not verify_otp(user_id, otp):
			return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Get token ID to delete
		token_id = cache.get(f"meta_delete_token_{user_id}")
		if not token_id:
			return Response({"detail": "No pending deletion found"}, status=status.HTTP_400_BAD_REQUEST)
		
		# Delete token
		try:
			token = MetaAccessToken.objects.get(id=token_id)
			token.delete()
		except MetaAccessToken.DoesNotExist:
			return Response({"detail": "Token not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Clear OTP and deletion cache
		clear_otp(user_id)
		cache.delete(f"meta_delete_token_{user_id}")
		
		return Response({
			"success": True,
			"message": "Access token deleted successfully"
		})


class DashboardInsightsView(APIView):
	"""
	GET: Dashboard insights for Instagram and Facebook pages
	Query params: client_id, month (optional, format: YYYY-MM)
	Returns: Page insights with impressions, reach, engagement, follower growth
	"""
	def get(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		from datetime import datetime, timedelta
		from core.models import ClientProfile
		
		client_id = request.query_params.get('client_id')
		month = request.query_params.get('month')  # Format: YYYY-MM
		
		if not client_id:
			return Response({"detail": "Missing client_id"}, status=status.HTTP_400_BAD_REQUEST)
		
		try:
			client_profile = ClientProfile.objects.get(id=client_id)
		except ClientProfile.DoesNotExist:
			return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Get page mappings for this client
		mappings = ClientPageMapping.objects.filter(client=client_profile)
		
		if not mappings.exists():
			return Response({"detail": "No pages linked for this client"}, status=status.HTTP_404_NOT_FOUND)
		
		insights_data = []
		
		# Calculate date range if month is provided
		date_range = None
		if month:
			try:
				date_obj = datetime.strptime(month, "%Y-%m")
				start_date = date_obj.strftime("%Y-%m-01")
				# Last day of month
				last_day = (date_obj.replace(day=1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
				end_date = last_day.strftime("%Y-%m-%d")
				date_range = {"start_date": start_date, "end_date": end_date}
			except ValueError:
				return Response({"detail": "Invalid month format. Use YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)
		
		seen_ig_accounts = set()
		for mapping in mappings:
			# This dashboard endpoint is Instagram-focused for now.
			ig_account_id = getattr(mapping, "ig_account_id", None)
			if not ig_account_id:
				continue
			if ig_account_id in seen_ig_accounts:
				continue
			seen_ig_accounts.add(ig_account_id)

			page_data = {}
			try:
				# Fetch a practical set of dashboard metrics (time-series) for the month.
				# Note: Several of these require metric_type=total_value.
				metrics = "reach,profile_views,website_clicks,accounts_engaged,total_interactions"
				params = {
					"metric": metrics,
					"metric_type": "total_value",
					"period": "day",
				}
				if date_range:
					params["since"] = date_range["start_date"]
					params["until"] = date_range["end_date"]

				insights = meta_graph_api_request(
					f"/{ig_account_id}/insights",
					mapping.page_access_token,
					params=params,
				)

				# Return only insight title/description/value (no extra profile info)
				simplified = []
				for item in insights.get("data", []) or []:
					value = None
					if isinstance(item, dict):
						total_value = item.get("total_value")
						if isinstance(total_value, dict):
							value = total_value.get("value")
						simplified.append({
							"title": item.get("title"),
							"description": item.get("description"),
							"value": value,
						})

				page_data = {
					"account_id": ig_account_id,
					"insights": simplified,
				}
			except MetaGraphAPIError as e:
				page_data = {"account_id": ig_account_id, "error": str(e)}

			insights_data.append(page_data)
		
		return Response({
			"success": True,
			"client_id": client_id,
			"month": month or "current",
			"pages": insights_data
		})


class TopPostsView(APIView):
	"""
	GET: Get Instagram top posts (2 most liked + 2 recent)
	Query params: client_id
	Returns: Same media item shape as /api/meta/instagram/<client_id>/ (without profile)
	"""
	def get(self, request):
		from .utils import meta_graph_api_request, MetaGraphAPIError
		from core.models import ClientProfile
		
		client_id = request.query_params.get('client_id')
		
		if not client_id:
			return Response({"detail": "Missing client_id"}, status=status.HTTP_400_BAD_REQUEST)
		
		try:
			client_profile = ClientProfile.objects.get(id=client_id)
		except ClientProfile.DoesNotExist:
			return Response({"detail": "Client not found"}, status=status.HTTP_404_NOT_FOUND)
		
		# Get page mappings for this client
		mappings = ClientPageMapping.objects.filter(client=client_profile)
		
		if not mappings.exists():
			return Response({"detail": "No pages linked for this client"}, status=status.HTTP_404_NOT_FOUND)
		
		def _process_ig_media_item(item):
			processed_item = {
				"id": item.get("id"),
				"media_url": item.get("media_url"),
				"media_type": item.get("media_type"),
				"thumbnail_url": item.get("thumbnail_url"),
				"timestamp": item.get("timestamp"),
				"permalink": item.get("permalink"),
				"like_count": item.get("like_count"),
			}
			insights = item.get("insights", {}).get("data", [])
			for insight in insights:
				if insight.get("name") == "impressions":
					processed_item["views"] = insight.get("values", [{}])[0].get("value", 0)
				elif insight.get("name") == "reach":
					processed_item["reach"] = insight.get("values", [{}])[0].get("value", 0)
			return processed_item

		seen_ig_accounts = set()
		all_media = []
		for mapping in mappings:
			ig_account_id = getattr(mapping, "ig_account_id", None)
			if not ig_account_id or ig_account_id in seen_ig_accounts:
				continue
			seen_ig_accounts.add(ig_account_id)
			try:
				media = meta_graph_api_request(
					f"/{ig_account_id}/media",
					mapping.page_access_token,
					params={
						"fields": "id,media_url,media_type,thumbnail_url,timestamp,permalink,like_count,insights.metric(impressions,reach)",
						"limit": 50,
					},
				)
				for item in media.get("data", []) or []:
					all_media.append(_process_ig_media_item(item))
			except MetaGraphAPIError:
				continue

		# Pick 2 most liked and 2 most recent, without duplicates.
		sorted_by_likes = sorted(all_media, key=lambda x: x.get("like_count") or 0, reverse=True)
		sorted_by_recent = sorted(all_media, key=lambda x: x.get("timestamp") or "", reverse=True)

		most_liked = []
		recent = []
		used_ids = set()
		for post in sorted_by_likes:
			post_id = post.get("id")
			if post_id and post_id not in used_ids:
				most_liked.append(post)
				used_ids.add(post_id)
			if len(most_liked) == 2:
				break
		for post in sorted_by_recent:
			post_id = post.get("id")
			if post_id and post_id not in used_ids:
				recent.append(post)
				used_ids.add(post_id)
			if len(recent) == 2:
				break

		# Response is similar to /api/meta/instagram/<client_id>/ but without profile
		return Response({
			"success": True,
			"client_id": client_id,
			"media": {
				"most_liked": most_liked,
				"recent": recent,
			},
		})
