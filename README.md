# KrishiGyaan

KrishiGyaan is an AI-powered agriculture support platform built for Indian farmers. It brings crop advisory, weather-aware planning, government scheme discovery, crop and plant disease scanning, soil guidance, multilingual voice support, and secure farmer registration into one web dashboard.

This project was created for a hackathon by **Team KrishiYoddha** with the goal of making digital agriculture guidance more accessible, local-language friendly, and practical for real farmers. KrishiGyaan won **1st position at the HyperVerge Academy Launchpad Hackathon 2026**.

## Problem Statement

Farmers often need to move between many disconnected sources for weather, crop disease help, government schemes, soil advice, and expert guidance. This creates delays, confusion, and missed benefits, especially for farmers who prefer local languages or voice-based interaction.

KrishiGyaan solves this by giving farmers a single AI-assisted dashboard that understands their profile, crop, land, location, and language preference.

## Key Features

- **Farmer Registration and Login**
  - Secure farmer profile creation with MongoDB storage.
  - Phone number and password based login.
  - Form validation for mobile number, age, land size, Aadhaar last digits, password, and required profile fields.

- **KrishiBaba AI Assistant**
  - Uses Groq as the primary AI provider.
  - Supports a fallback Groq key to reduce presentation/demo failure risk.
  - Answers farming, schemes, crop, soil, weather, and advisory questions.

- **Government Scheme Support**
  - Matches farmer profile data with relevant schemes.
  - Generates scheme-specific application letters, forms, affidavits, checklists, grievance letters, and follow-up letters.
  - Supports draft language selection.

- **Crop and Plant Disease Detection**
  - Crop disease scanning through Crop Kindwise API.
  - Plant health assessment through Plant.id API.
  - KrishiBaba provides farmer-friendly low-cost treatment guidance.

- **Weather and Crop Advisory**
  - Uses Open-Meteo forecast data.
  - Provides short-term sowing, irrigation, spraying, and harvest guidance.
  - Includes 30-day crop growth outlook where seasonal data is available.

- **Soil Health Guidance**
  - Uses farmer profile and optional soil photo signals.
  - Produces soil score, improvement advice, and crop suitability guidance.

- **Multilingual Experience**
  - Supports English, Hindi, Bhojpuri, Gujarati, Marathi, Kannada, Tamil, Telugu, Punjabi, and Haryanvi.
  - Uses predefined local language translations for static and dashboard UI.
  - Location-based language detection and manual language selection.

- **Voice Accessibility**
  - Text-to-speech for clicked lines/headings/content.
  - Speech-to-text microphone support for AI chat and scheme doubt input.
  - Global mute/unmute audio control.

- **Vercel Deployment Ready**
  - Static frontend served from `frontend/`.
  - Serverless API routes served from `api/`.
  - `vercel.json` rewrites configured for production.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend API | Node.js serverless functions |
| Local Dev Server | Node.js HTTP server |
| Database | MongoDB Atlas |
| AI | Groq API |
| Crop Disease API | Crop Kindwise |
| Plant Health API | Plant.id |
| Weather Data | Open-Meteo |
| Deployment | Vercel |

## Project Structure

```text
KrishiGyaan/
├── api/
│   ├── ai.js
│   ├── health.js
│   ├── _utils.js
│   └── auth/
│       ├── _mongo.js
│       ├── register.js
│       ├── login.js
│       └── forgot-password.js
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── dashboard.html
│   ├── app.js
│   ├── dashboard.js
│   ├── shared.js
│   ├── locales.js
│   └── styles.css
├── env.example
├── package.json
├── package-lock.json
└── vercel.json
```

## Environment Variables

Create a local `.env` file based on `env.example`.

```env
PORT=5173
GROQ_API_KEY=your_primary_groq_api_key
GROQ_API_KEY2=your_fallback_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
CROP_KINDWISE_API_KEY=your_crop_kindwise_api_key
PLANT_ID_API_KEY=your_plant_id_api_key
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=krishigyaan
```

Important: `.env` is intentionally ignored by Git. Do not commit real API keys.

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/PiyushN17/KrishiGyaan.git
cd KrishiGyaan
```

2. Install dependencies.

```bash
npm install
```

3. Create `.env`.

```bash
cp env.example .env
```

Then add your actual API keys and MongoDB URI.

4. Start the local server.

```bash
npm start
```

5. Open the app.

```text
http://127.0.0.1:5173
```

## Verification

Run syntax checks for all backend, API, and frontend JavaScript files:

```bash
npm run check
```

Recommended production smoke tests:

- Open `/`, `/login.html`, `/register.html`, and `/dashboard.html`.
- Test `/api/ai` with a small prompt.
- Register a farmer and confirm login.
- Upload a valid crop or plant image for health scanning.
- Confirm Vercel environment variables are configured before demo.

## Vercel Deployment

The project is ready for Vercel deployment.

Required Vercel environment variables:

```text
GROQ_API_KEY
GROQ_API_KEY2
GROQ_MODEL
CROP_KINDWISE_API_KEY
PLANT_ID_API_KEY
MONGODB_URI
MONGODB_DB
```

After updating environment variables in Vercel, redeploy the project so serverless functions receive the latest values.

## Main API Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/ai` | POST | KrishiBaba AI responses |
| `/api/auth/register` | POST | Farmer registration |
| `/api/auth/login` | POST | Farmer login |
| `/api/auth/forgot-password` | POST | Prototype account lookup |
| `/api/crop-health` | POST | Crop Kindwise disease detection proxy |
| `/api/plant-health` | POST | Plant.id health assessment proxy |

## Security Notes

- Passwords are hashed with PBKDF2 before storing in MongoDB.
- Real API keys are loaded only from environment variables.
- `.env`, `node_modules`, and Vercel local files are excluded from Git.
- API provider keys are never exposed to frontend JavaScript.

## Hackathon Impact

KrishiGyaan is designed to help farmers:

- Reduce crop loss through early disease detection.
- Understand government scheme eligibility faster.
- Receive local-language, voice-friendly farming support.
- Make better sowing, irrigation, fertilizer, and harvest decisions.
- Access digital agriculture guidance from one simple dashboard.

## Team

**Team KrishiYoddha**

- Piyush Nath (Lead)
- Preeti Gorwade
- Abhay
- Bhagyalakshmi Siddavatam

## Status

Production-ready hackathon prototype with working Vercel deployment, MongoDB-backed authentication, AI advisory, multilingual UI, and third-party crop/plant health API integrations.
