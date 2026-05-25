# Jardin Majorelle Mobile Tourism Platform (Production MVP)

Welcome to the production-ready MVP of the **Jardin Majorelle** digital cultural companion companion. The codebase has been transitioned from a mocked prototype into a secure, stable, and highly performant platform tailored for real-world pilots.

---

## 🌟 KEY TRANSITIONS & FEATURES

1. **Hardened Security (Phase 1):**
   * **Bearer Tokens:** Refactored JWT verification in `auth.js` to strictly parse and validate `Bearer <jwt>` auth headers.
   * **Protected Mutations:** Secured all zone modifications (POST, PUT, PATCH, DELETE) and image uploads, making them exclusive to authenticated administrators.
   * **Bcrypt Password Hashing:** Replaced plaintext database comparisons with secure Bcrypt hashing (12 salt rounds) and schema hooks.
   * **Secure File Uploads:** Configured Multer-S3 to enforce a 5MB size limit, restrict files to standard images (JPEG, PNG, WEBP), reject script extensions, and generate randomized UUID keys.
   * **Middleware Protection:** Mounted `helmet` for secure headers, `compression` for smaller payloads, and `express-rate-limit` to prevent brute-force login attempts and chat flooding.
   * **Secret Hygiene:** Eliminated plaintext credential leaks in server startup logs and set up strict `.gitignore` configurations.

2. **Persistent Administrative Portal (Phase 2):**
   * **Auth Context:** Created a global React authentication provider (`AuthContext`) powered by `expo-secure-store` to keep personnel logged in across app reboots.
   * **Staff Dashboard:** Resolved runtime crashes (added missing React Native imports) and added a clean staff Logout flow.

3. **Immersive Visitor Experience (Phase 3 & 7):**
   * **Zone Detail Flow:** Created a premium details screen featuring high-resolution photography, second-tier image carousels, and geolocation tags.
   * **Native Audio Guides:** Integrated `expo-av` within a beautiful custom playback deck, streaming narration audios with precise play/pause/seek controls.
   * **Interactive Geolocation:** Refactored map pins to render correct GPS coordinates fetched dynamically from the database.
   * **Multilingual support:** Loaded `i18next` dictionary bundles for English, French, and Arabic (with standard RTL management).
   * **Offline Caching:** Used `AsyncStorage` caching to store retrieved zone coordinates locally so the app runs smoothly in poor-signal garden areas.

4. **DevOps & Performance (Phase 5 & 6):**
   * **Chat Cache:** Implemented an in-memory chatbot cache for zone records to avoid full table database scans on every message.
   * **Offset Pagination:** Added page/limit parameters, text regex searches, and sorting filters on zone query endpoints.
   * **Database Indexes:** Declared text indexes for names/descriptions and geospatial indexes on coordinates to accelerate execution.
   * **Docker Support:** Created production-grade multi-stage `Dockerfile` and `docker-compose` files.
   * **CI/CD pipeline:** Configured GitHub Actions checking lints, compilation builds, and dependency safety audits.

---

## 🚀 GETTING STARTED

### 1. Pre-configured Pilot Credentials
During server startup, the database auto-seeding migration script automatically checks if any administrator accounts are present. If none are found, it provisions the following default staff account:
* **Username/Email:** `admin@majorelle.com`
* **Password:** `adminPassword123` *(this plaintext password is automatically hashed with 12 rounds by our Mongoose pre-save hook)*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will boot on port `5000` and automatically seed the landmarks with correct coordinate pins.*
5. Verify the health status by visiting `http://localhost:5000/health`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Set up your public environment variable. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Launch the Expo bundler:
   ```bash
   npx expo start
   ```

---

## 🐳 CONTAINERIZED DEPLOYMENT (DOCKER)

To launch the entire containerized stack (Express Backend + Persistent MongoDB Database Instance) locally:
1. Ensure Docker Desktop is running.
2. In the root directory, build and run the services:
   ```bash
   docker-compose up --build -d
   ```
3. The Express API will be accessible on `http://localhost:5000` with database storage persisted inside a Docker volume.
