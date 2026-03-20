import asyncio
import json
import os
import re
import random
import base64

import httpx
from dotenv import load_dotenv
from openai import AsyncOpenAI

from image_utils import process_creature_images

# ---------------------------------------------------------------------------
# LOAD ENV
# ---------------------------------------------------------------------------

load_dotenv()

HF_API_KEY         = os.getenv("HF_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# ---------------------------------------------------------------------------
# OPENROUTER CLIENT
# ---------------------------------------------------------------------------

openrouter_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
) if OPENROUTER_API_KEY else None

RARITY_TIERS = ["Common", "Rare", "Epic", "Legendary"]


# ---------------------------------------------------------------------------
# IMAGE GENERATION — Hugging Face FLUX.1-schnell
# ---------------------------------------------------------------------------

async def generate_image_huggingface(prompt: str) -> bytes:
    """
    Generate image using HF router with FLUX.1-schnell.
    Free, Apache-2.0 licensed, only needs 4 steps.
    """
    if not HF_API_KEY:
        raise ValueError("HF_API_KEY not set in .env")

    model   = "black-forest-labs/FLUX.1-schnell"
    api_url = f"https://router.huggingface.co/hf-inference/models/{model}"

    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type":  "application/json",
    }

    full_prompt = (
        "pixel art sprite, 16-bit, retro game, sharp edges, no blur, "
        "dark fantasy creature, glowing eyes, black background, centered, "
        + prompt
    )

    payload = {
        "inputs": full_prompt,
        "parameters": {
            "num_inference_steps": 4,
            "guidance_scale": 0.0,
        }
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(api_url, headers=headers, json=payload)

        content_type = response.headers.get("content-type", "")

        if response.status_code != 200:
            raise ValueError(
                f"HuggingFace API error ({response.status_code}): {response.text[:300]}"
            )

        if "image" not in content_type:
            raise ValueError(
                f"HuggingFace returned non-image "
                f"(content-type: {content_type}): {response.text[:300]}"
            )

        content = response.content

        if not (content[:8] == b'\x89PNG\r\n\x1a\n' or content[:2] == b'\xff\xd8'):
            raise ValueError("HuggingFace response is not a valid PNG or JPEG.")

        return content


# ---------------------------------------------------------------------------
# FALLBACK IMAGE
# ---------------------------------------------------------------------------

def generate_fallback_image() -> bytes:
    """Return a simple black 64x64 PNG if image generation fails."""
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAA"
        "B0lEQVR4nGNgGAWjYBSMglEwCkYGAB0AAQABDQottAAAAABJRU5ErkJggg=="
    )


# ---------------------------------------------------------------------------
# LORE GENERATION — OpenRouter
# ---------------------------------------------------------------------------

LORE_SYSTEM_PROMPT = """You are the Dark Scribe of the Shadow Realm.

Respond ONLY with valid JSON and nothing else. No markdown, no explanation, no backticks.

{
  "title": "",
  "subtitle": "",
  "backstory": "",
  "weakness": "",
  "ability": "",
  "rarity": "Common | Rare | Epic | Legendary",
  "stats": {
    "intensity": 0,
    "stealth": 0,
    "rift_affinity": 0
  }
}

Rules:
- stats values must be integers between 0 and 100
- rarity must be exactly one of: Common, Rare, Epic, Legendary
- All fields must be filled
"""

# ✅ :nitro suffix = OpenRouter routes to FASTEST available provider
# ✅ Models confirmed working and fast as of March 2026
OPENROUTER_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:nitro",        # fastest routing, paid but very cheap
    "meta-llama/llama-3.3-70b-instruct:free",          # free fallback, same model
    "openrouter/free",                                  # auto-picks any working free model
    "stepfun-ai/step-3-5-flash:free",                  # fast MoE, only 11B active params
    "nvidia/llama-3.1-nemotron-nano-8b-instruct:free", # small = fast
]

# ✅ Per-model timeout — don't wait more than 10s on any single model
MODEL_TIMEOUT = 10.0


async def generate_lore_openrouter(prompt: str) -> dict:
    """
    Generate creature lore using OpenRouter.
    Uses :nitro for fastest routing, falls back through free models.
    Each model has a 10s timeout so slow models don't block.
    """
    if not openrouter_client:
        raise ValueError("OPENROUTER_API_KEY not set in .env")

    last_error = None

    for model in OPENROUTER_MODELS:
        try:
            print(f"  Trying model: {model}")

            # ✅ Per-model timeout — skip slow models fast
            response = await asyncio.wait_for(
                openrouter_client.chat.completions.create(
                    model=model,
                    temperature=0.8,
                    max_tokens=400,       # reduced from 600 — faster response
                    messages=[
                        {"role": "system", "content": LORE_SYSTEM_PROMPT},
                        {"role": "user",   "content": f"Generate lore for this creature: {prompt}"}
                    ],
                ),
                timeout=MODEL_TIMEOUT
            )

            text = response.choices[0].message.content.strip()

            # Strip accidental markdown fences
            text = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()

            # Extract JSON even if surrounded by extra text
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if not match:
                raise ValueError(f"No JSON found in response: {text[:200]}")

            result = json.loads(match.group())
            print(f"  Lore generated with: {model}")
            return result

        except asyncio.TimeoutError:
            print(f"  Model {model} timed out after {MODEL_TIMEOUT}s — skipping")
            last_error = TimeoutError(f"{model} timed out")
            continue

        except Exception as e:
            print(f"  Model {model} failed: {e}")
            last_error = e
            continue

    raise ValueError(f"All OpenRouter models failed. Last error: {last_error}")


# ---------------------------------------------------------------------------
# FALLBACK LORE — prompt-aware so each creature feels unique
# ---------------------------------------------------------------------------

def generate_fallback_lore(prompt: str) -> dict:
    """
    Returns unique lore based on prompt keywords.
    Each creature feels different even when all APIs fail.
    """
    words = prompt.lower().split()

    dark_words   = ["shadow", "dark", "void", "night", "black", "doom", "demon"]
    fire_words   = ["fire", "flame", "burn", "inferno", "blaze", "lava", "ember"]
    water_words  = ["water", "ocean", "sea", "tide", "wave", "aqua", "deep"]
    poison_words = ["poison", "venom", "toxic", "plague", "rot", "decay", "spore"]
    ice_words    = ["ice", "frost", "frozen", "cold", "snow", "blizzard", "glacial"]

    if any(w in words for w in dark_words):
        title    = "Shadow Wraith"
        subtitle = "Devourer of Light"
        ability  = "Umbral Strike — extinguishes all light in a 30ft radius"
        weakness = "Sunlight burns its form, forcing it to retreat"
    elif any(w in words for w in fire_words):
        title    = "Ember Fiend"
        subtitle = "Born of the Eternal Flame"
        ability  = "Inferno Breath — releases a cone of searing flame"
        weakness = "Water and ice rapidly cool its core, stunning it"
    elif any(w in words for w in water_words):
        title    = "Tide Leviathan"
        subtitle = "Lord of the Sunken Depths"
        ability  = "Abyssal Surge — summons a crushing wave of dark water"
        weakness = "Dry heat evaporates its liquid form"
    elif any(w in words for w in poison_words):
        title    = "Plague Stalker"
        subtitle = "Herald of Pestilence"
        ability  = "Toxic Miasma — releases a cloud of lethal spores"
        weakness = "Fire purifies its poisonous essence"
    elif any(w in words for w in ice_words):
        title    = "Glacial Specter"
        subtitle = "Child of the Eternal Winter"
        ability  = "Frost Nova — freezes all enemies within 20ft solid"
        weakness = "Intense heat melts its crystalline form instantly"
    else:
        titles     = ["Rift Crawler", "Chaos Specter", "Abyss Walker", "Void Sentinel", "Rune Fiend"]
        subtitles  = ["Born of Chaos", "From Beyond the Veil", "Servant of Entropy", "Fragment of Darkness", "Marked by the Rift"]
        abilities  = [
            "Rift Tear — opens a portal to drain enemy life force",
            "Chaos Bolt — fires unstable energy that warps reality",
            "Phase Shift — becomes intangible for 3 seconds",
            "Soul Drain — siphons the essence of nearby creatures",
            "Rune Burn — scorches enemies with ancient cursed glyphs",
        ]
        weaknesses = [
            "Holy light disrupts its chaotic energy",
            "Salt circles bind its movement",
            "Pure iron weakens its ethereal form",
            "Loud sound disrupts its concentration",
            "Silver reflects its curse back upon itself",
        ]
        idx      = random.randint(0, 4)
        title    = titles[idx]
        subtitle = subtitles[idx]
        ability  = abilities[idx]
        weakness = weaknesses[idx]

    backstories = [
        "Summoned from the deepest rift during the Age of Tears, this creature has haunted the realm ever since.",
        "Once a guardian spirit, corrupted beyond recognition by ancient dark magic.",
        "A fragment of a dead god, given terrible form by the despair of mortals.",
        "It does not hunt for sustenance — it hunts because destruction is its sole purpose.",
        "Forged in the space between worlds, it exists only to consume and expand the void.",
    ]

    return {
        "title":     title,
        "subtitle":  subtitle,
        "backstory": random.choice(backstories),
        "weakness":  weakness,
        "ability":   ability,
        "rarity":    random.choice(RARITY_TIERS),
        "stats": {
            "intensity":     random.randint(40, 100),
            "stealth":       random.randint(20, 100),
            "rift_affinity": random.randint(50, 100),
        }
    }


# ---------------------------------------------------------------------------
# MAIN PIPELINE
# ---------------------------------------------------------------------------

async def generate_creature(prompt: str) -> dict:
    """
    Full pipeline:
      1. Generate image via Hugging Face FLUX.1-schnell
      2. Generate lore via OpenRouter (:nitro for speed)
      3. Process image into full + thumbnail
    Runs image and lore generation in PARALLEL for speed.
    """

    # ✅ Run image and lore generation IN PARALLEL — cuts total time in half
    image_task = asyncio.create_task(_safe_generate_image(prompt))
    lore_task  = asyncio.create_task(_safe_generate_lore(prompt))

    image_bytes, lore = await asyncio.gather(image_task, lore_task)

    # --- PROCESS IMAGE ---
    try:
        images = process_creature_images(image_bytes)
    except Exception as e:
        print(f"Image processing failed: {e}")
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        images = {"full_b64": b64, "thumb_b64": b64}

    return {
        "lore":   lore,
        "images": images
    }


async def _safe_generate_image(prompt: str) -> bytes:
    try:
        print("Generating image (Hugging Face)...")
        result = await generate_image_huggingface(prompt)
        print("Image generated successfully.")
        return result
    except Exception as e:
        print(f"Image failed: {e}")
        print("Using fallback image.")
        return generate_fallback_image()


async def _safe_generate_lore(prompt: str) -> dict:
    try:
        print("Generating lore (OpenRouter)...")
        result = await generate_lore_openrouter(prompt)
        print("Lore generated successfully.")
        return result
    except Exception as e:
        print(f"Lore failed: {e}")
        print("Using fallback lore.")
        return generate_fallback_lore(prompt)


# ---------------------------------------------------------------------------
# TEST RUN
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    prompt = "shadow demon with glowing red eyes and wings"
    result = asyncio.run(generate_creature(prompt))

    print("\n=== LORE RESULT ===")
    print(json.dumps(result["lore"], indent=2))

    print("\n=== IMAGE (base64 preview, first 80 chars) ===")
    print(result["images"].get("full_b64", "")[:80], "...")