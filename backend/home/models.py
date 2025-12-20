from django.db import models
from django.core.exceptions import ValidationError
#-----Home page------
# Company Logo
class BrandLogo(models.Model):
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)

# Home Page Slide
class HomeSlide(models.Model):
    tag = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True) #enclose with # for gradient. for example: Ignite Your #Digital Future#
    description = models.TextField(blank=True, null=True) # enclose with * for bold. for example: We are *Tarviz Digimart*. A next-gen agency in Chennai merging creativity with AI-driven strategies to elevate your brand beyond the noise

class CreativeProcessImage(models.Model):
    image = models.ImageField(upload_to='creative_process/', blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and CreativeProcessImage.objects.exists():
            # If there's already an instance, prevent creation
            raise ValidationError("Only one CreativeProcessImage instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Creative Process Image"
    

class CaseStudyImage(models.Model):
    image = models.ImageField(upload_to='case_studies/', blank=True, null=True)
    caption = models.CharField(max_length=200, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and CaseStudyImage.objects.count() >= 3:
            raise ValidationError("You can only create up to 3 CaseStudyImage instances.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Case Study Image {self.pk or ''}"

# Testimonials
class Testimonial(models.Model):
    client_name = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=100, blank=True, null=True)
    company = models.CharField(max_length=100, blank=True, null=True)
    content = models.TextField(blank=True, null=True)

class ClientLogo(models.Model):
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    name = models.CharField(max_length=100, blank=True, null=True)

#-------Footer--------
class FooterContactInfo(models.Model):
    location = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

class FooterContent(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

class Footer(models.Model):
    text = models.CharField(max_length=200, blank=True, null=True)

# Social Media Marketing Page
class MarketingPackage(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    bullet_points = models.JSONField(blank=True, null=True)  # store list of bullets


class SocialMediaImage(models.Model):
    image = models.ImageField(upload_to='social_media/', blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and SocialMediaImage.objects.exists():
            # If there's already an instance, prevent creation
            raise ValidationError("Only one SocialMediaImage instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Social Media Image"
    
class SocialMediaPage(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    packages = models.ManyToManyField(MarketingPackage, blank=True)

# Graphic Designing Page
class PortfolioCategory(models.Model):
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    included_in_full_branding = models.BooleanField(default=False)
    favicon = models.ImageField(upload_to='portfolio_category_favicons/', blank=True, null=True)

    def __str__(self):
        return self.title or "Unnamed Category"

class PortfolioItem(models.Model):
    category = models.ForeignKey(PortfolioCategory, related_name="items", on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='portfolio_items/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

# --------------------------
# Ecommerce Management Page
# --------------------------
class EcommerceCategory(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    favicon = models.ImageField(upload_to='ecommerce_category_favicons/', blank=True, null=True)

class EcommerceItem(models.Model):
    category = models.ForeignKey(EcommerceCategory, related_name="items", on_delete=models.CASCADE)
    logo = models.ImageField(upload_to='ecommerce_items/', blank=True, null=True)
    company_name = models.CharField(max_length=200, blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    is_available_in_india = models.BooleanField(default=False)

class EcommercePage(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    categories = models.ManyToManyField(EcommerceCategory, blank=True)
    button_text = models.CharField(max_length=100, blank=True, null=True)


# --------------------------
# Web Design & Development Page
# --------------------------
class WebDesignPage(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)


# --------------------------
# SEO Page
# --------------------------
class SEOItem(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='seo_items/', blank=True, null=True)
    button_text = models.CharField(max_length=100, blank=True, null=True)

class SEOPage(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    items = models.ManyToManyField(SEOItem, blank=True)  # fixed 5 items can be enforced in admin/frontend


# --------------------------
# Contact Page
# --------------------------
class ContactPage(models.Model):
    address = models.CharField(max_length=300, blank=True, null=True)
    email1 = models.EmailField(blank=True, null=True)
    email2 = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)


# --------------------------
# FAQ Page
# --------------------------
class FAQ(models.Model):
    question = models.CharField(max_length=300, blank=True, null=True)
    answer = models.TextField(blank=True, null=True)


# --------------------------
# About Page
# --------------------------
class AboutPage(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    paragraph = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='about_page/', blank=True, null=True)
    mission_description = models.TextField(blank=True, null=True)
    vision_description = models.TextField(blank=True, null=True)
    values_description = models.TextField(blank=True, null=True)


