import httpx
import asyncio

async def ping():
    while True:
        try:
            async with httpx.AsyncClient() as client:
                await client.get("https://void-forge.onrender.com/health")
                print("Ping sent")
        except:
            pass
        await asyncio.sleep(840)  # ping every 14 minutes