from django.contrib import admin

from home.models import (
	BrandLogo,
	HomeSlide,
	CreativeProcessImage,
	CaseStudyImage,
	Testimonial,
	ClientLogo,
	FooterContactInfo,
	FooterContent,
	Footer,
	MarketingPackage,
	SocialMediaImage,
	SocialMediaPage,
	PortfolioCategory,
	PortfolioItem,
	EcommerceCategory,
	EcommerceItem,
	EcommercePage,
	WebDesignPage,
	SEOItem,
	SEOPage,
	ContactPage,
	FAQ,
	AboutPage,
)


# Brand & Homepage
@admin.register(BrandLogo)
class BrandLogoAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


@admin.register(HomeSlide)
class HomeSlideAdmin(admin.ModelAdmin):
    list_display = ("id", "tag", "title")
    search_fields = ("tag", "title")


@admin.register(CreativeProcessImage)
class CreativeProcessImageAdmin(admin.ModelAdmin):
    list_display = ("id", "caption")
    search_fields = ("caption",)


@admin.register(CaseStudyImage)
class CaseStudyImageAdmin(admin.ModelAdmin):
    list_display = ("id", "caption")
    search_fields = ("caption",)


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("id", "client_name", "company", "role")
    search_fields = ("client_name", "company")


@admin.register(ClientLogo)
class ClientLogoAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)


# Footer
@admin.register(FooterContactInfo)
class FooterContactInfoAdmin(admin.ModelAdmin):
    list_display = ("id", "location", "email", "phone")
    search_fields = ("location", "email")


@admin.register(FooterContent)
class FooterContentAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


@admin.register(Footer)
class FooterAdmin(admin.ModelAdmin):
    list_display = ("id", "text")


# Social Media Marketing
@admin.register(MarketingPackage)
class MarketingPackageAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


@admin.register(SocialMediaImage)
class SocialMediaImageAdmin(admin.ModelAdmin):
    list_display = ("id",)


@admin.register(SocialMediaPage)
class SocialMediaPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)
    filter_horizontal = ("packages",)


# Portfolio / Graphic Design
@admin.register(PortfolioCategory)
class PortfolioCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "included_in_full_branding")
    search_fields = ("title",)
    list_filter = ("included_in_full_branding",)


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "category", "price")
    search_fields = ("title", "category__title")
    list_filter = ("category",)


# Ecommerce Management
@admin.register(EcommerceCategory)
class EcommerceCategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


@admin.register(EcommerceItem)
class EcommerceItemAdmin(admin.ModelAdmin):
    list_display = ("id", "company_name", "category", "is_available_in_india")
    search_fields = ("company_name", "category__title")
    list_filter = ("category", "is_available_in_india")


@admin.register(EcommercePage)
class EcommercePageAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "button_text")
    search_fields = ("title",)
    filter_horizontal = ("categories",)


# Web Design & Development
@admin.register(WebDesignPage)
class WebDesignPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


# SEO
@admin.register(SEOItem)
class SEOItemAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "button_text")
    search_fields = ("title",)


@admin.register(SEOPage)
class SEOPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)
    filter_horizontal = ("items",)


# Contact Page
@admin.register(ContactPage)
class ContactPageAdmin(admin.ModelAdmin):
    list_display = ("id", "email1", "phone")
    search_fields = ("email1", "email2", "phone")


# FAQ
@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("id", "question")
    search_fields = ("question",)


# About Page
@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)



