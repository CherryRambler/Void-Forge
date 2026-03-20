import base64
from io import BytesIO

try:
    from PIL import Image, UnidentifiedImageError
    HAS_PIL = True
except ImportError:
    HAS_PIL = False


# ---------------------------------------------------------------------------
# Base64 Utilities
# ---------------------------------------------------------------------------

def encode_base64(image_bytes: bytes) -> str:
    """Encode raw bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def decode_base64(b64_str: str) -> bytes:
    """Decode base64 string to raw bytes."""
    return base64.b64decode(b64_str)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def is_valid_image(image_bytes: bytes) -> bool:
    """
    Returns True if the bytes are a recognizable image format (PNG or JPEG).
    Catches the broken PNG / corrupt file errors seen in logs.
    """
    if not image_bytes or len(image_bytes) < 8:
        return False

    is_png  = image_bytes[:8] == b'\x89PNG\r\n\x1a\n'
    is_jpeg = image_bytes[:2] == b'\xff\xd8'

    return is_png or is_jpeg


# ---------------------------------------------------------------------------
# Image Processing (Optimized for Pixel Art)
# ---------------------------------------------------------------------------

def process_creature_images(raw_image_bytes: bytes) -> dict:
    """
    Processes raw image bytes and returns:
      - full_b64:  1024x1024 PNG (optimized full image)
      - thumb_b64: 512x512 PNG (thumbnail)

    Uses NEAREST scaling to preserve pixel-art sharpness.
    Falls back to original image if PIL is unavailable or bytes are corrupt.
    """

    if not raw_image_bytes:
        raise ValueError("Empty image bytes received.")

    # Validate before doing anything — catches broken PNG errors
    if not is_valid_image(raw_image_bytes):
        print("Image validation failed: not a valid PNG or JPEG. Using fallback.")
        b64 = encode_base64(raw_image_bytes)
        return {"full_b64": b64, "thumb_b64": b64}

    # If PIL is not installed → return as-is
    if not HAS_PIL:
        b64 = encode_base64(raw_image_bytes)
        return {"full_b64": b64, "thumb_b64": b64}

    try:
        img = Image.open(BytesIO(raw_image_bytes))

        # Force-load to catch truncated/corrupt files early
        img.load()

        # Ensure RGBA for consistency
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        # NEAREST resampling preserves pixel-art sharpness
        resample = Image.Resampling.NEAREST

        full_img  = img.resize((1024, 1024), resample)
        thumb_img = full_img.resize((512, 512), resample)

        buf_full  = BytesIO()
        buf_thumb = BytesIO()

        full_img.save(buf_full,   format="PNG", compress_level=1)
        thumb_img.save(buf_thumb, format="PNG", compress_level=1)

        return {
            "full_b64":  encode_base64(buf_full.getvalue()),
            "thumb_b64": encode_base64(buf_thumb.getvalue()),
        }

    except UnidentifiedImageError:
        print("PIL could not identify image format. Using fallback.")
        b64 = encode_base64(raw_image_bytes)
        return {"full_b64": b64, "thumb_b64": b64}

    except Exception as e:
        print(f"Image processing failed: {e}")
        b64 = encode_base64(raw_image_bytes)
        return {"full_b64": b64, "thumb_b64": b64}