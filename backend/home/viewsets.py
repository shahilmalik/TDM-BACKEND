from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
from .serializers import *
from rest_framework import viewsets
from .permissions import IsSuperAdmin
from rest_framework.decorators import action

class BrandLogoViewSet(viewsets.ModelViewSet):
    queryset = BrandLogo.objects.all()
    serializer_class = BrandLogoSerializer
    permission_classes = [IsSuperAdmin]  # only superadmin can CRUD

# Repeat similarly for other models
class HomeSlideViewSet(viewsets.ModelViewSet):
    queryset = HomeSlide.objects.all()
    serializer_class = HomeSlideSerializer
    permission_classes = [IsSuperAdmin]

class CreativeProcessImageViewSet(viewsets.ModelViewSet):
    queryset = CreativeProcessImage.objects.all()
    serializer_class = CreativeProcessImageSerializer
    permission_classes = [IsSuperAdmin]

class CaseStudyImageViewSet(viewsets.ModelViewSet):
    queryset = CaseStudyImage.objects.all()
    serializer_class = CaseStudyImageSerializer
    permission_classes = [IsSuperAdmin]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [IsSuperAdmin]

class ClientLogoViewSet(viewsets.ModelViewSet):
    queryset = ClientLogo.objects.all()
    serializer_class = ClientLogoSerializer
    permission_classes = [IsSuperAdmin]

class FooterContactInfoViewSet(viewsets.ModelViewSet):
    queryset = FooterContactInfo.objects.all()
    serializer_class = FooterContactInfoSerializer
    permission_classes = [IsSuperAdmin]

class FooterViewSet(viewsets.ModelViewSet):
    queryset = Footer.objects.all()
    serializer_class = FooterSerializer
    permission_classes = [IsSuperAdmin]

class MarketingPackageViewSet(viewsets.ModelViewSet):
    queryset = MarketingPackage.objects.all()
    serializer_class = MarketingPackageSerializer
    permission_classes = [IsSuperAdmin]

class SocialMediaImageViewSet(viewsets.ModelViewSet):
    queryset = SocialMediaImage.objects.all()
    serializer_class = SocialMediaImageSerializer
    permission_classes = [IsSuperAdmin]

class SocialMediaPageViewSet(viewsets.ModelViewSet):
    queryset = SocialMediaPage.objects.all()
    serializer_class = SocialMediaPageSerializer
    permission_classes = [IsSuperAdmin]

class PortfolioCategoryViewSet(viewsets.ModelViewSet):
    queryset = PortfolioCategory.objects.all()
    serializer_class = PortfolioCategorySerializer
    permission_classes = [IsSuperAdmin]

class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all()
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsSuperAdmin]

class EcommerceCategoryViewSet(viewsets.ModelViewSet):
    queryset = EcommerceCategory.objects.all()
    serializer_class = EcommerceCategorySerializer
    permission_classes = [IsSuperAdmin]

class EcommerceItemViewSet(viewsets.ModelViewSet):
    queryset = EcommerceItem.objects.all()
    serializer_class = EcommerceItemSerializer
    permission_classes = [IsSuperAdmin]

class EcommercePageViewSet(viewsets.ModelViewSet):
    queryset = EcommercePage.objects.all()
    serializer_class = EcommercePageSerializer
    permission_classes = [IsSuperAdmin]

class WebDesignPageViewSet(viewsets.ModelViewSet):
    queryset = WebDesignPage.objects.all()
    serializer_class = WebDesignPageSerializer
    permission_classes = [IsSuperAdmin]

class SEOItemViewSet(viewsets.ModelViewSet):
    queryset = SEOItem.objects.all()
    serializer_class = SEOItemSerializer
    permission_classes = [IsSuperAdmin]

class SEOPageViewSet(viewsets.ModelViewSet):
    queryset = SEOPage.objects.all()
    serializer_class = SEOPageSerializer
    permission_classes = [IsSuperAdmin]

class AboutPageViewSet(viewsets.ModelViewSet):
    queryset = AboutPage.objects.all()
    serializer_class = AboutPageSerializer
    permission_classes = [IsSuperAdmin]

class HomePageFullView(APIView):
    def get(self, request):
        data = {
            "brand_logos": BrandLogo.objects.all(),
            "slides": HomeSlide.objects.all(),
            "creative_process": CreativeProcessImage.objects.first(),
            "case_studies": CaseStudyImage.objects.all()[:3],
            "testimonials": Testimonial.objects.all()[:3],
            "client_logos": ClientLogo.objects.all(),
            "footer_contact": FooterContactInfo.objects.first(),
            "footer": Footer.objects.first()
        }
        serializer = HomePageFullSerializer(data)
        return Response(serializer.data)

class SocialMediaPageFullView(APIView):
    def get(self, request):
        sm_page = SocialMediaPage.objects.first()
        data = {
            "page": sm_page,
            "packages": sm_page.packages.all() if sm_page else [],
            "social_media_image": SocialMediaImage.objects.first()
        }
        serializer = SocialMediaPageFullSerializer(data)
        return Response(serializer.data)

class PortfolioPageFullView(APIView):
    def get(self, request):
        categories = PortfolioCategory.objects.prefetch_related('items').all()
        serializer = PortfolioCategoryFullSerializer(categories, many=True)
        return Response(serializer.data)
    

class EcommercePageFullView(APIView):
    def get(self, request):
        page = EcommercePage.objects.first()
        categories = page.categories.prefetch_related('items').all() if page else []
        serializer = EcommerceCategorySerializer(categories, many=True)
        return Response({
            "title": page.title if page else "",
            "description": page.description if page else "",
            "button_text": page.button_text if page else "",
            "categories": serializer.data
        })
    
class WebDesignPageFullView(APIView):
    def get(self, request):
        page = WebDesignPage.objects.first()
        serializer = WebDesignPageSerializer(page)
        return Response(serializer.data)

class SEOPageFullView(APIView):
    def get(self, request):
        page = SEOPage.objects.prefetch_related('items').first()
        serializer = SEOPageSerializer(page)
        return Response(serializer.data)


class AboutPageFullView(APIView):
    def get(self, request):
        page = AboutPage.objects.first()
        serializer = AboutPageSerializer(page)
        return Response(serializer.data)

class FooterContentViewSet(viewsets.ModelViewSet):
    queryset = FooterContent.objects.all()
    serializer_class = FooterContentSerializer
    permission_classes = [IsSuperAdmin]

# ----------------------------
# ContactPage CRUD
# ----------------------------
class ContactPageViewSet(viewsets.ModelViewSet):
    queryset = ContactPage.objects.all()
    serializer_class = ContactPageSerializer
    permission_classes = [IsSuperAdmin]

# ----------------------------
# FAQ CRUD
# ----------------------------
class FAQViewSet(viewsets.ModelViewSet):
    queryset = FAQ.objects.all()
    serializer_class = FAQSerializer
    permission_classes = [IsSuperAdmin]