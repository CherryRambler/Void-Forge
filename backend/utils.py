def _doc_to_response(doc):
    return {
        "creature_id": doc["creature_id"],
        "title": doc["title"],
        "subtitle": doc["subtitle"],
        "backstory": doc["backstory"],
        "weakness": doc["weakness"],
        "ability": doc["ability"],
        "rarity": doc["rarity"],
        "stats": doc["stats"],
        "created_at": doc["created_at"],
        "thumb_url": "",
        "full_url": ""
    }