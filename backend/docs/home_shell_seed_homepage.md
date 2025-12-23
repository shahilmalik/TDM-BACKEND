# Seeding / copying Home page content via Django shell

This project’s **home module** (`backend/home`) stores content for marketing pages (home, services, about, contact, etc.).

Editors and Superadmins can manage these via the `home` API / Django admin. To **copy existing hardcoded content** into DB instances, use the Django shell.

> Note: `ImageField` values require real files (or existing FileField paths). This script seeds text-only; upload images later via Django admin.

## Open shell

Run in repo root:

- `cd backend`
- `python manage.py shell`

## Home page seed script (matches current `frontend/pages/HomePage.tsx`)

Paste the following:

```py
from home.models import (
    BrandLogo, HomeSlide, CreativeProcessImage, CaseStudyImage,
    Testimonial, ClientLogo, FooterContactInfo, Footer
)

# -----------------
# IMPORTANT
# -----------------
# Your current HomePage.tsx contains multiple sections that are STILL hardcoded
# but are NOT represented in `home/models.py` yet, for example:
# - Hero headline/description (not in models)
# - Creative process steps 01/02/03 (not in models)
# - Case study stats cards (not in models)
# - Client marquee logos from Clearbit (not in models)
#
# With the current models, we can seed:
# BrandLogo, HomeSlide, CreativeProcessImage, CaseStudyImage, Testimonial,
# ClientLogo, FooterContactInfo, Footer.

# --- Brand logos ---
BrandLogo.objects.all().delete()
BrandLogo.objects.create(name="Tarviz Digimart")  # logo file: upload later

# --- Slides ---
# NOTE: HomePage.tsx currently renders a hardcoded hero section, not slides.
# Keeping 1 slide that mirrors the hero messaging so the backend has content.
HomeSlide.objects.all().delete()
HomeSlide.objects.create(
    tag="Digital Evolution Agency",
    title="Ignite Your #Digital Future#",
    description=(
        "We are *Tarviz Digimart*. A next-gen agency in Chennai merging creativity "
        "with AI-driven strategies to elevate your brand beyond the noise."
    ),
)

# --- Creative process (singleton enforced in save()) ---
# HomePage.tsx uses an Unsplash image + 3 hardcoded steps; models only store image+caption.
CreativeProcessImage.objects.all().delete()
CreativeProcessImage.objects.create(
    caption="Explore the creative process",
)

# --- Case studies (max 3) ---
# HomePage.tsx uses 3 hardcoded Unsplash images; models store image+caption.
CaseStudyImage.objects.all().delete()
for i in range(3):
    CaseStudyImage.objects.create(caption=f"Case Study {i+1}")

# --- Testimonials (matches HomePage.tsx) ---
Testimonial.objects.all().delete()
Testimonial.objects.bulk_create([
    Testimonial(
        client_name="Anita Raj",
        role="CEO, Glow Cosmetics",
        company="Glow Cosmetics",
        content="Tarviz Digimart completely revamped our social media strategy. Our engagement has tripled in 3 months!",
    ),
    Testimonial(
        client_name="Senthil Kumar",
        role="Founder, Green Eatz",
        company="Green Eatz",
        content="The team is incredibly creative. The branding package they delivered gave our startup a world-class look.",
    ),
    Testimonial(
        client_name="Priya Menon",
        role="Marketing Head, TechFlow",
        company="TechFlow",
        content="Professional, timely, and data-driven. Their SEO services helped us rank on the first page for our key terms.",
    ),
])

# --- Client logos ---
# HomePage.tsx uses Clearbit domains dynamically. Seed placeholders in DB.
ClientLogo.objects.all().delete()
ClientLogo.objects.bulk_create([
    ClientLogo(name="Google"),
    ClientLogo(name="Airbnb"),
    ClientLogo(name="Spotify"),
    ClientLogo(name="Stripe"),
    ClientLogo(name="Uber"),
    ClientLogo(name="Slack"),
    ClientLogo(name="Netflix"),
    ClientLogo(name="Amazon"),
])

# --- Footer contact + footer text ---
# HomePage uses the React <Footer /> component; the exact text is inside frontend.
# Seed safe placeholders here; replace with your real footer values.
FooterContactInfo.objects.all().delete()
FooterContactInfo.objects.create(location="Chennai", email="", phone="")

Footer.objects.all().delete()
Footer.objects.create(text="© Tarviz Digimart")

print("Seeded HOME database content.")
```

## Verify

```py
from home.models import HomeSlide, Testimonial
HomeSlide.objects.all().values("tag","title")
Testimonial.objects.count()
```

## Next step (so the website actually uses DB)

Right now `frontend/pages/HomePage.tsx` is hardcoded. To *use the DB instead*, you’ll need to either:

1) Serve home content from backend (you already have `HomePageFullView`) and fetch it in `HomePage.tsx`, **or**
2) Replace specific sections (Testimonials, Slides, Footer) to read from the API.

Tell me which section you want to switch first (I suggest **Testimonials** because it maps 1:1 to your `Testimonial` model).
