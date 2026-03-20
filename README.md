# 🧬 Creature Generator

A full-stack web application that generates fantastical creatures using AI. Create unique creatures with AI-generated lore, stats, and images — each one different every time.

## ✨ Features

- **AI-Powered Lore**: Generates unique creature titles, backstories, abilities, weaknesses, and rarity via OpenRouter free LLMs
- **AI-Powered Images**: Generates pixel-art creature images via Hugging Face FLUX.1-schnell
- **Parallel Generation**: Image and lore are generated simultaneously for maximum speed
- **Creature Gallery**: Browse and explore all previously generated creatures
- **Rarity System**: Creatures are classified as Common, Rare, Epic, or Legendary
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Graceful Fallbacks**: If any API fails, the app continues working with intelligent prompt-aware fallback lore
- **RESTful API**: Full CRUD endpoints for creatures and image serving

## 🌐 Live Demo

| | URL |
|---|---|
| **Frontend** | [void-forge-zeta.vercel.app](https://void-forge-zeta.vercel.app) |
| **Backend API** | [void-forge.onrender.com](https://void-forge.onrender.com) |
| **API Docs** | [void-forge.onrender.com/docs](https://void-forge.onrender.com/docs) |

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI framework
- **Vite** — Lightning-fast build tool and dev server
- **Tailwind CSS** — Utility-first CSS framework
- **PostCSS** — CSS processing
- **ESLint** — Code quality

### Backend
- **Python 3.8+** — Core server language
- **FastAPI** — Modern async web framework
- **OpenRouter API** — LLM routing for creature lore generation (free tier)
- **Hugging Face Inference API** — Image generation via FLUX.1-schnell (free)
- **Pillow** — Image processing and resizing
- **Pydantic v2** — Data validation and models
- **Uvicorn** — ASGI server

## 📁 Project Structure

```
creature-generator/
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── api.js             # API integration layer
│   │   └── App.jsx            # Main app component
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── backend/                    # Python FastAPI backend
    ├── main.py                # FastAPI app + all endpoints
    ├── models.py              # Pydantic request/response models
    ├── generation.py          # Image + lore generation pipeline
    ├── db.py                  # In-memory mock MongoDB collection
    ├── image_utils.py         # Image validation + processing
    ├── utils.py               # DB doc → response helpers
    ├── .env                   # API keys (never commit this)
    ├── requirements.txt       # Python dependencies
    └── run_backend.bat        # One-click backend startup (Windows)
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v14+ — for frontend
- **Python** 3.8+ — for backend
- **HuggingFace API Key** — free at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- **OpenRouter API Key** — free at [openrouter.ai/keys](https://openrouter.ai/keys)

### Installation

#### Backend Setup
```bash
cd backend
python -m venv python_env
source python_env/Scripts/activate   # Windows
# or
source python_env/bin/activate       # Mac/Linux

pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### Configuration

Create a `.env` file inside the `backend/` folder:
```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxxxxxx
```

### Running the Application

#### Start Backend
```bash
cd backend
uvicorn main:app --reload
```
Backend runs on `http://localhost:8000`

#### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📦 Python Dependencies

```
fastapi
uvicorn
python-dotenv
openai          # used for OpenRouter client
httpx
pillow
pydantic
```

Install all at once:
```bash
pip install fastapi uvicorn python-dotenv openai httpx pillow
```

## 🔄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/generate` | Generate a new creature from a prompt |
| `GET` | `/creatures` | List all creatures (paginated) |
| `GET` | `/creatures/{id}` | Get a single creature by ID |
| `DELETE` | `/creatures/{id}` | Delete a creature |
| `GET` | `/images/{id}/full` | Serve full 1024×1024 creature image |
| `GET` | `/images/{id}/thumb` | Serve 512×512 thumbnail |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Interactive Swagger UI |

## 🤖 AI Models Used

| Task | Provider | Model |
|------|----------|-------|
| Lore generation | OpenRouter | `openrouter/free` → auto-selects fastest available free model |
| Image generation | Hugging Face | `black-forest-labs/FLUX.1-schnell` |

### OpenRouter Fallback Chain
If the primary model is rate-limited or unavailable, the backend automatically tries:
1. `openrouter/free` — auto-selects any working free model
2. `meta-llama/llama-3.3-70b-instruct:free`
3. `nvidia/llama-3.1-nemotron-nano-8b-instruct:free`
4. `stepfun-ai/step-3-5-flash:free`
5. `arcee-ai/arcee-blitz:free`
6. Prompt-aware local fallback (no API needed)

## 🎮 Usage

1. Open `http://localhost:5173` in your browser
2. Enter a creature description (e.g. *"shadow demon with glowing red eyes and wings"*)
3. Click **Generate** — image and lore are created in parallel
4. View the creature's stats, backstory, ability, and weakness
5. Browse your gallery to see all created creatures

## 📱 Responsive Design

- **Desktop** — Full interface with side panels and detailed creature views
- **Mobile** — Optimized carousel for easy browsing

## 📝 License

This project is provided as-is for educational and entertainment purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!