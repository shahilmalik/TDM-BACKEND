from rest_framework import serializers
from .models import *

# Nested serializers
class BrandLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandLogo
        fields = ['id', 'name', 'logo']

class HomeSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeSlide
        fields = ['id', 'tag', 'title', 'description']

class CreativeProcessImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreativeProcessImage
        fields = ['id', 'image', 'caption']

class CaseStudyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseStudyImage
        fields = ['id', 'image', 'caption']

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'client_name', 'role', 'company', 'content']

class ClientLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientLogo
        fields = ['id', 'name', 'logo']

class FooterContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterContactInfo
        fields = ['location', 'email', 'phone']

class FooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Footer
        fields = ['text']

# Main serializer combining everything for Home Page
class HomePageFullSerializer(serializers.Serializer):
    brand_logos = BrandLogoSerializer(many=True)
    slides = HomeSlideSerializer(many=True)
    creative_process = CreativeProcessImageSerializer()
    case_studies = CaseStudyImageSerializer(many=True)
    testimonials = TestimonialSerializer(many=True)
    client_logos = ClientLogoSerializer(many=True)
    footer_contact = FooterContactInfoSerializer()
    footer = FooterSerializer()


class MarketingPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketingPackage
        fields = ['id','title','description','bullet_points']

class SocialMediaImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialMediaImage
        fields = ['id','image']

class SocialMediaPageFullSerializer(serializers.Serializer):
    page = serializers.SerializerMethodField()
    packages = MarketingPackageSerializer(many=True)
    social_media_image = SocialMediaImageSerializer()

    def get_page(self, obj):
        sm_page = SocialMediaPage.objects.first()
        return {
            "title": sm_page.title,
            "description": sm_page.description
        }

class PortfolioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioItem
        fields = ['id','title','description','photo','price']

class PortfolioCategoryFullSerializer(serializers.ModelSerializer):
    items = PortfolioItemSerializer(many=True, read_only=True)
    class Meta:
        model = PortfolioCategory
        fields = ['id','title','description','included_in_full_branding','favicon','items']

class EcommerceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcommerceItem
        fields = ['id','logo','company_name','short_description','is_available_in_india']

class EcommerceCategorySerializer(serializers.ModelSerializer):
    items = EcommerceItemSerializer(many=True, read_only=True)
    class Meta:
        model = EcommerceCategory
        fields = ['id','title','description','favicon','items']


class WebDesignPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebDesignPage
        fields = ['id', 'title', 'description']

class SEOItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOItem
        fields = ['id', 'title', 'description', 'photo', 'button_text']

class SEOPageSerializer(serializers.ModelSerializer):
    items = SEOItemSerializer(many=True, read_only=True)

    class Meta:
        model = SEOPage
        fields = ['id', 'title', 'items']

class AboutPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPage
        fields = [
            'id', 'title', 'paragraph', 'photo',
            'mission_description', 'vision_description', 'values_description'
        ]

class EcommercePageSerializer(serializers.ModelSerializer):
    categories = EcommerceCategorySerializer(many=True, read_only=True)

    class Meta:
        model = EcommercePage
        fields = ['id', 'title', 'description', 'button_text', 'categories']

class PortfolioCategorySerializer(serializers.ModelSerializer):
    items = PortfolioItemSerializer(many=True, read_only=True)

    class Meta:
        model = PortfolioCategory
        fields = ['id', 'title', 'description', 'included_in_full_branding', 'favicon', 'items']

class SocialMediaPageSerializer(serializers.ModelSerializer):
    packages = MarketingPackageSerializer(many=True, read_only=True)
    social_media_image = SocialMediaImageSerializer(source='socialmediaimage', read_only=True)

    class Meta:
        model = SocialMediaPage
        fields = ['id', 'title', 'description', 'packages', 'social_media_image']
    
class FooterContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterContent
        fields = ['id', 'title', 'description']

class ContactPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPage
        fields = ['id', 'address', 'email1', 'email2', 'phone']

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer']