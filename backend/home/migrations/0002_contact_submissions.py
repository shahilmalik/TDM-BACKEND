from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, max_length=200, null=True)),
                ("organization", models.CharField(blank=True, max_length=200, null=True)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("phone", models.CharField(blank=True, max_length=50, null=True)),
                ("whatsapp", models.BooleanField(default=False)),
                ("subject", models.CharField(blank=True, max_length=250, null=True)),
                ("body", models.TextField(blank=True, null=True)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        )
    ]
