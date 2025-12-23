from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .viewsets import *

router = DefaultRouter()
router.register(r'brand-logos', BrandLogoViewSet)
router.register(r'home-slides', HomeSlideViewSet)
router.register(r'creative-process', CreativeProcessImageViewSet)
router.register(r'case-studies', CaseStudyImageViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'client-logos', ClientLogoViewSet)
router.register(r'footer-contact', FooterContactInfoViewSet)
router.register(r'footer-content', FooterContentViewSet)
router.register(r'footer', FooterViewSet)
router.register(r'marketing-packages', MarketingPackageViewSet)
router.register(r'socialmedia-images', SocialMediaImageViewSet)
router.register(r'socialmedia-page', SocialMediaPageViewSet)
router.register(r'portfolio-categories', PortfolioCategoryViewSet)
router.register(r'portfolio-items', PortfolioItemViewSet)
router.register(r'ecommerce-categories', EcommerceCategoryViewSet)
router.register(r'ecommerce-items', EcommerceItemViewSet)
router.register(r'ecommerce-page', EcommercePageViewSet)
router.register(r'web-design', WebDesignPageViewSet)
router.register(r'seo-items', SEOItemViewSet)
router.register(r'seo-page', SEOPageViewSet)
router.register(r'contact-page', ContactPageViewSet)
router.register(r'faqs', FAQViewSet)
router.register(r'about-page', AboutPageViewSet)
router.register(r'contact-submissions', ContactSubmissionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/home-page-full/', HomePageFullView.as_view(), name='home-page-full'),
    path('api/socialmedia-page-full/', SocialMediaPageFullView.as_view(), name='socialmedia-page-full'),
    path('api/portfolio-page-full/', PortfolioPageFullView.as_view(), name='portfolio-page-full'),
    path('api/ecommerce-page-full/', EcommercePageFullView.as_view(), name='ecommerce-page-full'),
    path('api/web-design-page-full/', WebDesignPageFullView.as_view(), name='web-design-page-full'),
    path('api/seo-page-full/', SEOPageFullView.as_view(), name='seo-page-full'),
    path('api/about-page-full/', AboutPageFullView.as_view(), name='about-page-full'),
]

