from typing import Literal, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    # Aligned with main.py's 200-char hard limit
    prompt: str = Field(..., min_length=5, max_length=200)

    @field_validator("prompt")
    @classmethod
    def strip_prompt(cls, v: str) -> str:
        """Trim whitespace and enforce meaningful length."""
        stripped = v.strip()
        if len(stripped) < 5:
            raise ValueError("Prompt must be at least 5 non-whitespace characters.")
        return stripped


# ---------------------------------------------------------------------------
# Sub-models
# ---------------------------------------------------------------------------

class CreatureStats(BaseModel):
    intensity:     int = Field(..., ge=0, le=100)
    stealth:       int = Field(..., ge=0, le=100)
    rift_affinity: int = Field(..., ge=0, le=100)


class CreatureLore(BaseModel):
    title:     str
    subtitle:  Optional[str] = ""   # LLM may omit these
    backstory: Optional[str] = ""
    weakness:  Optional[str] = ""
    ability:   Optional[str] = ""
    rarity:    Literal["Common", "Rare", "Epic", "Legendary"] = "Common"


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------

class CreatureResponse(BaseModel):
    creature_id: str
    title:       str
    subtitle:    Optional[str] = ""
    backstory:   Optional[str] = ""
    weakness:    Optional[str] = ""
    ability:     Optional[str] = ""
    rarity:      Literal["Common", "Rare", "Epic", "Legendary"]
    stats:       CreatureStats
    created_at:  datetime
    prompt:      Optional[str] = ""   # useful for debugging / display

    # Image URLs served by /images/{id}/full and /images/{id}/thumb
    thumb_url: str
    full_url:  str


class CreatureListResponse(BaseModel):
    total:     int
    creatures: List[CreatureResponse]