from __future__ import annotations

from pathlib import Path
from typing import Iterable, Optional

from django.conf import settings
from django.core.exceptions import ValidationError

try:
    from PIL import Image
except Exception:  # pragma: no cover
    Image = None  # type: ignore


def validate_image_file_size(value, max_mb: Optional[int] = None) -> None:
    """Validate upload size (in MB)."""
    if not value:
        return
    max_mb = max_mb or getattr(settings, "MAX_UPLOAD_IMAGE_MB", 5)
    limit = max_mb * 1024 * 1024
    if getattr(value, "size", 0) > limit:
        raise ValidationError(f"Image too large. Max {max_mb}MB.")


def validate_image_aspect_ratio(
    value,
    *,
    allowed: Iterable[float],
    tolerance: float = 0.15,
    label: str = "image",
) -> None:
    """Validate that an image's aspect ratio is close to one of the allowed ratios.

    allowed: list of width/height ratios, e.g. [1.0] (square), [16/9].
    tolerance: +/- percentage from target ratio.
    """
    if not value:
        return
    if Image is None:
        return  # Pillow not available; skip

    try:
        value.seek(0)
        img = Image.open(value)
        w, h = img.size
        if not w or not h:
            return
        ratio = w / h

        ok = False
        for target in allowed:
            low = target * (1 - tolerance)
            high = target * (1 + tolerance)
            if low <= ratio <= high:
                ok = True
                break

        if not ok:
            allowed_str = ", ".join([f"{a:.2f}" for a in allowed])
            raise ValidationError(
                f"Invalid {label} aspect ratio. Got {ratio:.2f}. Allowed: {allowed_str} (±{int(tolerance*100)}%)."
            )
    finally:
        try:
            value.seek(0)
        except Exception:
            pass
