from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_historicalservice_is_pipeline_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeviceToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("archived", models.BooleanField(default=False)),
                ("token", models.TextField(unique=True)),
                (
                    "platform",
                    models.CharField(
                        choices=[
                            ("web", "Web"),
                            ("android", "Android"),
                            ("ios", "iOS"),
                            ("unknown", "Unknown"),
                        ],
                        default="unknown",
                        max_length=20,
                    ),
                ),
                ("device_id", models.CharField(blank=True, max_length=255, null=True)),
                ("last_seen_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="device_tokens",
                        to="core.customuser",
                    ),
                ),
            ],
            options={
                "indexes": [models.Index(fields=["user", "last_seen_at"], name="core_devic_user_id_7b9f45_idx")],
            },
        ),
    ]
