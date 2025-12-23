from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0003_merge_20251223_1452"),
    ]

    operations = [
        # Remove read/unread flag
        migrations.RemoveField(
            model_name="contactsubmission",
            name="is_read",
        ),
        # Add lead tracking fields
        migrations.AddField(
            model_name="contactsubmission",
            name="contacted",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="contactsubmission",
            name="contact_notes",
            field=models.TextField(blank=True, null=True),
        ),
    ]
