from django.urls import path
from .views import (
    RequestOTPForAccessTokenView,
    CreateAccessTokenView,
    FetchLinkedPagesView,
    ClientPageSyncView,
    InstagramProfileDataView,
    InstagramPostDetailView,
    ListAllUserTokensView,
    DeleteUserTokenView,
    VerifyOTPAndDeleteTokenView,
    DashboardInsightsView,
    TopPostsView,
)

urlpatterns = [
    path('request-otp/', RequestOTPForAccessTokenView.as_view(), name='request-otp'),
    path('create-token/', CreateAccessTokenView.as_view(), name='create-token'),
    path('pages/', FetchLinkedPagesView.as_view(), name='fetch-pages'),
    path('sync/', ClientPageSyncView.as_view(), name='client-page-sync'),
    path('instagram/<str:client_id>/', InstagramProfileDataView.as_view(), name='instagram-profile'),
    path('post/<str:post_id>/', InstagramPostDetailView.as_view(), name='instagram-post-detail'),
    path('tokens/', ListAllUserTokensView.as_view(), name='list-all-tokens'),
    path('tokens/<int:token_id>/delete/', DeleteUserTokenView.as_view(), name='delete-token'),
    path('tokens/delete-verify/', VerifyOTPAndDeleteTokenView.as_view(), name='verify-delete-otp'),
    path('dashboard/insights/', DashboardInsightsView.as_view(), name='dashboard-insights'),
    path('dashboard/top-posts/', TopPostsView.as_view(), name='top-posts'),
]
