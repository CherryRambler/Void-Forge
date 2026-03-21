import asyncio
import base64
import traceback
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from models import GenerateRequest, CreatureResponse, CreatureListResponse
from generation import generate_creature
from db import creatures_collection
from utils import _doc_to_response


# ---------------------------------------------------------------------------
# KEEP-ALIVE — prevents Render free tier from sleeping
# ---------------------------------------------------------------------------

async def keep_alive():
    """Pings /health every 14 minutes so Render never spins down."""
    await asyncio.sleep(60)  # wait 1 min after startup before first ping
    while True:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                await client.get("https://void-forge.onrender.com/health")
                print("Keep-alive ping sent.")
        except Exception as e:
            print(f"Keep-alive ping failed: {e}")
        await asyncio.sleep(840)  # 14 minutes


# ---------------------------------------------------------------------------
# LIFESPAN — runs on startup/shutdown
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start keep-alive task on startup
    asyncio.create_task(keep_alive())
    yield
    # Shutdown — nothing to clean up for mock DB


# ---------------------------------------------------------------------------
# APP
# ---------------------------------------------------------------------------

app = FastAPI(lifespan=lifespan)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://void-forge-zeta.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# GENERATE CREATURE
# ---------------------------------------------------------------------------
@app.post("/generate", response_model=CreatureResponse)
async def generate(request: GenerateRequest):

    prompt = (request.prompt or "").strip()

    if not prompt:
        raise HTTPException(status_code=422, detail="Prompt must not be empty.")

    if len(prompt) > 200:
        raise HTTPException(status_code=422, detail="Prompt too long (max 200 chars).")

    try:
        result = await asyncio.wait_for(generate_creature(prompt), timeout=60)

    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="Generation timed out.")

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    lore   = result.get("lore", {})
    images = result.get("images", {})

    # Reject if both images are empty
    if not images.get("full_b64") and not images.get("thumb_b64"):
        raise HTTPException(status_code=500, detail="Image generation produced no output.")

    creature_id = str(uuid.uuid4())
    now         = datetime.now(timezone.utc)
    stats       = lore.get("stats", {})

    doc = {
        "creature_id":  creature_id,
        "title":        lore.get("title", "Unknown Entity"),
        "subtitle":     lore.get("subtitle", ""),
        "backstory":    lore.get("backstory", ""),
        "weakness":     lore.get("weakness", ""),
        "ability":      lore.get("ability", ""),
        "rarity":       lore.get("rarity", "Common"),
        "stats": {
            "intensity":     int(stats.get("intensity",    50)),
            "stealth":       int(stats.get("stealth",      50)),
            "rift_affinity": int(stats.get("rift_affinity", 50)),
        },
        "full_b64":  images.get("full_b64",  ""),
        "thumb_b64": images.get("thumb_b64", ""),
        "prompt":    prompt,
        "created_at": now,
    }

    try:
        await creatures_collection.insert_one(doc)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Database insert failed.")

    return _doc_to_response(doc)


# ---------------------------------------------------------------------------
# GET ALL CREATURES
# ---------------------------------------------------------------------------
@app.get("/creatures", response_model=CreatureListResponse)
async def get_creatures(
    limit: int = Query(default=10, ge=1, le=100),
    skip:  int = Query(default=0,  ge=0),
):
    try:
        cursor = creatures_collection.find().skip(skip).limit(limit)

        creatures = []
        async for doc in cursor:
            creatures.append(_doc_to_response(doc))

        total = await creatures_collection.count_documents({})

    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch creatures.")

    return {"total": total, "creatures": creatures}


# ---------------------------------------------------------------------------
# GET SINGLE CREATURE
# ---------------------------------------------------------------------------
@app.get("/creatures/{creature_id}", response_model=CreatureResponse)
async def get_creature(creature_id: str):
    try:
        doc = await creatures_collection.find_one({"creature_id": creature_id})
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Database query failed.")

    if not doc:
        raise HTTPException(status_code=404, detail=f"Creature '{creature_id}' not found.")

    return _doc_to_response(doc)


# ---------------------------------------------------------------------------
# SERVE FULL IMAGE
# ---------------------------------------------------------------------------
@app.get("/images/{creature_id}/full")
async def get_image_full(creature_id: str):
    doc = await creatures_collection.find_one(
        {"creature_id": creature_id},
        {"full_b64": 1}
    )

    if not doc or not doc.get("full_b64"):
        raise HTTPException(status_code=404, detail="Full image not found.")

    try:
        image_bytes = base64.b64decode(doc["full_b64"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decode image.")

    return Response(content=image_bytes, media_type="image/png")


# ---------------------------------------------------------------------------
# SERVE THUMBNAIL
# ---------------------------------------------------------------------------
@app.get("/images/{creature_id}/thumb")
async def get_image_thumb(creature_id: str):
    doc = await creatures_collection.find_one(
        {"creature_id": creature_id},
        {"thumb_b64": 1}
    )

    if not doc or not doc.get("thumb_b64"):
        raise HTTPException(status_code=404, detail="Thumbnail not found.")

    try:
        image_bytes = base64.b64decode(doc["thumb_b64"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to decode image.")

    return Response(content=image_bytes, media_type="image/png")


# ---------------------------------------------------------------------------
# DELETE CREATURE
# ---------------------------------------------------------------------------
@app.delete("/creatures/{creature_id}")
async def delete_creature(creature_id: str):
    try:
        result = await creatures_collection.delete_one({"creature_id": creature_id})
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Database delete failed.")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Creature '{creature_id}' not found.")

    return {"message": f"Creature '{creature_id}' deleted successfully."}


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------
@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}