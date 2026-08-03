# KrishiGyaan

KrishiGyaan is a standalone final-year BCA project that brings farmer registration, weather-based field planning, agricultural scheme assistance, crop and plant health analysis, soil guidance, multilingual interaction, and an AI farming assistant into one web application.

The project is designed for Indian farmers who need practical information in a simple interface without moving between separate weather, crop-health, government-scheme, and advisory services.

## Project Objectives

- Maintain a reusable farmer profile containing crop, land, location, and access details.
- Present short-term weather information as clear farm actions.
- Help farmers identify relevant government support schemes and prepare application drafts.
- Analyse crop, plant, and soil images with external agricultural APIs and AI-assisted guidance.
- Provide multilingual text, speech input, and text-to-speech support.
- Preserve the farmer's latest dashboard analysis across refreshes.
- Give an authorised administrator controlled access to registered-user and dashboard records.

## Main Features

### Farmer account management

- Multi-step registration with field validation.
- Mobile-number and password login.
- PBKDF2 password hashing with unique salts.
- MongoDB-backed farmer profiles.

### Farmer dashboard

- Profile-aware crop advisory and field-action planning.
- Ten-day Open-Meteo forecast with temperature, rainfall, and wind presentation.
- Longer-term crop-planning trend where forecast data is available.
- Crop Kindwise crop-disease identification.
- Plant.id plant-health assessment.
- Cloudinary storage for uploaded crop, plant, and soil photographs.
- Soil-health score and improvement guidance.
- Government-scheme matching and multilingual application drafting.
- KrishiBaba farming assistant powered by Groq.
- Saved dashboard analysis restored from MongoDB after refresh.

### Accessibility and language support

- Interface translations for English and major Indian languages.
- Language-controlled AI responses.
- Browser text-to-speech and speech-to-text support.
- Responsive layouts for desktop and mobile screens.

### Administration

- Separate token-protected administrator login.
- Farmer search and record inspection.
- Create, read, update, and delete operations for farmer profiles.
- Edit or delete saved dashboard analysis.
- Rename, classify, open, and delete uploaded Cloudinary images.
- Cascading cleanup of related MongoDB records when a farmer is deleted.

## Technology Stack

| Layer | Technology |
| --- | --- |
| User interface | HTML5, CSS3, vanilla JavaScript |
| Serverless backend | Node.js functions on Vercel |
| Local development server | Node.js HTTP server |
| Database | MongoDB Atlas |
| AI assistant | Groq API |
| Crop analysis | Crop Kindwise API |
| Plant analysis | Plant.id API |
| Weather | Open-Meteo API |
| Image storage | Cloudinary |
| Deployment | Vercel |

## Architecture

```text
Browser
  |
  |-- Static HTML, CSS and JavaScript
  |
  |-- /api/auth/* ------------ MongoDB Atlas
  |-- /api/dashboard-analysis  MongoDB Atlas
  |-- /api/dashboard-upload --- Cloudinary + MongoDB Atlas
  |-- /api/ai ----------------- Groq
  |-- /api/crop-health -------- Crop Kindwise
  |-- /api/plant-health ------- Plant.id
  `-- Open-Meteo requests ------ Weather and geocoding data
```

## Project Structure

```text
final-year-project/
├── api/
│   ├── auth/
│   │   ├── _mongo.js
│   │   ├── register.js
│   │   ├── login.js
│   │   └── forgot-password.js
│   ├── _utils.js
│   ├── admin.js
│   ├── ai.js
│   ├── dashboard-analysis.js
│   ├── dashboard-upload.js
│   └── health.js
├── backend/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── app.js
│   ├── shared.js
│   ├── dashboard.js
│   ├── admin.js
│   ├── locales.js
│   ├── styles.css
│   ├── refresh.css
│   ├── manifest.webmanifest
│   └── sw.js
├── env.example
├── package.json
└── vercel.json
```

## Environment Variables

Copy `env.example` to `.env` for local development. Never commit real credentials.

```env
PORT=5173
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=krishigyaan

GROQ_API_KEY=your_primary_groq_key
GROQ_API_KEY2=your_fallback_groq_key
GROQ_MODEL=your_supported_groq_model

CROP_KINDWISE_API_KEY=your_crop_kindwise_key
PLANT_ID_API_KEY=your_plant_id_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
# Or: CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_a_secure_password
ADMIN_SESSION_SECRET=replace_with_a_long_random_secret
```

The same server-side values must be configured in Vercel for Production, Preview, and Development environments before redeployment.

## Local Setup

```bash
git clone https://github.com/PiyushN17/final-year-project.git
cd final-year-project
npm install
cp env.example .env
npm start
```

Open `http://127.0.0.1:5173`.

## Available Pages

| Path | Purpose |
| --- | --- |
| `/` | Public project introduction |
| `/login.html` | Farmer login |
| `/register.html` | Farmer registration |
| `/dashboard.html` | Protected farmer services |
| `/admin-login.html` | Administrator login |
| `/admin-dashboard.html` | Administrator data centre |

## API Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/auth/register` | POST | Create a farmer account |
| `/api/auth/login` | POST | Authenticate a farmer |
| `/api/auth/forgot-password` | POST | Prototype account lookup |
| `/api/ai` | POST | Generate KrishiBaba responses |
| `/api/dashboard-analysis` | POST | Save or load dashboard analysis |
| `/api/dashboard-upload` | POST | Upload and record dashboard images |
| `/api/crop-health` | POST | Proxy crop identification requests |
| `/api/plant-health` | POST | Proxy plant-health requests |
| `/api/admin` | POST | Authenticated administrator operations |

The two health paths are preserved by explicit Vercel rewrites and are internally handled by `api/health.js`.

## Database Collections

- `farmers`: registration profile, password hash, timestamps, and login information.
- `dashboard_analyses`: one latest saved dashboard-analysis document per farmer.
- `dashboard_uploads`: Cloudinary metadata and image links associated with farmers.

## Verification

Run the repository syntax checks:

```bash
npm run check
```

Before a production release, verify registration, login, dashboard restoration, weather data, AI requests, image upload, disease-analysis providers, administrator CRUD actions, and mobile layouts.

## Security Notes

- API credentials remain on the server and are loaded from environment variables.
- Farmer passwords are salted and hashed before storage.
- Administrator operations require a signed, expiring bearer token.
- Uploaded-image links are restricted to valid Cloudinary URLs in the admin interface.
- Saved HTML is sanitised before display in the administrator view.
- Production deployments should replace the example administrator credentials and rotate exposed secrets.

## Documentation

Phase 1 documentation covers requirements, analysis, design, database structure, diagrams, testing, security, deployment, and interface documentation. Phase 2 is reserved for organised source-code listings and code-level explanation.

## Project Status

KrishiGyaan is a working final-year project deployed as a Vercel-compatible web application with MongoDB persistence and integrations for AI, weather, crop analysis, plant analysis, and cloud image storage.
