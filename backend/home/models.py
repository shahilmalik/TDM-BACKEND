from django.db import models
from django.core.exceptions import ValidationError
from .image_validators import validate_image_file_size, validate_image_aspect_ratio

#-----Home page------
# Company Logo
class BrandLogo(models.Model):
    logo = models.ImageField(
        upload_to='logos/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0, 2.0, 3.0], label='brand logo'),
        ],
    )
    name = models.CharField(max_length=100, blank=True, null=True)

# Home Page Slide
class HomeSlide(models.Model):
    tag = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=200, blank=True, null=True) #enclose with # for gradient. for example: Ignite Your #Digital Future#
    description = models.TextField(blank=True, null=True) # enclose with * for bold. for example: We are *Tarviz Digimart*. A next-gen agency in Chennai merging creativity with AI-driven strategies to elevate your brand beyond the noise

class CreativeProcessImage(models.Model):
    image = models.ImageField(
        upload_to='creative_process/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[16/9, 4/3, 1.0], label='creative process image'),
        ],
    )
    caption = models.CharField(max_length=200, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.pk and CreativeProcessImage.objects.exists():
            # If there's already an instance, prevent creation
            raise ValidationError("Only one CreativeProcessImage instance is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Creative Process Image"
    

class CaseStudyImage(models.Model):
    image = models.ImageField(
        upload_to='case_studies/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[16/9, 4/3], label='case study image'),
        ],
    )
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
    profile_pic = models.ImageField(
        upload_to='testimonials/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0], tolerance=0.25, label='testimonial profile picture'),
        ],
    )

class ClientLogo(models.Model):
    logo = models.ImageField(
        upload_to='logos/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0, 2.0, 3.0], label='client logo'),
        ],
    )
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
    favicon = models.ImageField(
        upload_to='portfolio_category_favicons/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0], tolerance=0.25, label='portfolio category favicon'),
        ],
    )

    def __str__(self):
        return self.title or "Unnamed Category"

class PortfolioItem(models.Model):
    category = models.ForeignKey(PortfolioCategory, related_name="items", on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(
        upload_to='portfolio_items/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[4/3, 16/9, 1.0], tolerance=0.25, label='portfolio item photo'),
        ],
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

# --------------------------
# Ecommerce Management Page
# --------------------------
class EcommerceCategory(models.Model):
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    favicon = models.ImageField(
        upload_to='ecommerce_category_favicons/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0], tolerance=0.25, label='ecommerce category favicon'),
        ],
    )

class EcommerceItem(models.Model):
    category = models.ForeignKey(EcommerceCategory, related_name="items", on_delete=models.CASCADE)
    logo = models.ImageField(
        upload_to='ecommerce_items/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[1.0, 2.0, 3.0], label='ecommerce item logo'),
        ],
    )
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
    photo = models.ImageField(
        upload_to='seo_items/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[4/3, 16/9], tolerance=0.25, label='seo item photo'),
        ],
    )
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
# Contact Form Submissions
# --------------------------
class ContactSubmission(models.Model):
    name = models.CharField(max_length=200, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    whatsapp = models.BooleanField(default=False)
    subject = models.CharField(max_length=250, blank=True, null=True)
    body = models.TextField(blank=True, null=True)

    # Lead tracking
    contacted = models.BooleanField(default=False)
    contact_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.name or 'Unknown'} - {self.subject or ''}".strip()


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
    photo = models.ImageField(
        upload_to='about_page/',
        blank=True,
        null=True,
        validators=[
            validate_image_file_size,
            lambda f: validate_image_aspect_ratio(f, allowed=[4/3, 1.0], tolerance=0.25, label='about page photo'),
        ],
    )
    mission_description = models.TextField(blank=True, null=True)
    vision_description = models.TextField(blank=True, null=True)
    values_description = models.TextField(blank=True, null=True)


