# 🗺️ BOCK Map App – Backend

This is the **Node.js/Express backend** for the BOCK Map App.  
It provides APIs for storing and retrieving saved locations, routes, the map data through the API, and other user data.

---

## 🌐 Features
- RESTful API endpoints for managing:
  - Saved locations
  - Routes / directions
  - Loading map
  - Creating lists
  - Contribution feature
  - User CRUD functions
- Connects to a database (PostgreSQL)
- Handles requests from **Flutter frontend** (Web, iOS, Android)

---

## 🧩 Tech Stack
- Node.js
- Express.js
- Database (postgreSQL)
- dotenv for environment variables

---

## 🧱 Folder Structure (example)
```
.
├── api_setup/
├── mapserver/
│   ├── api/
│   ├── config/
│   │   └── dbjs
│   ├── middleware/
│   │   └── auth.js
│   ├── node_modules/
│   ├── sql/
│   │   ├── contribute.js
│   │   ├── list.js
│   │   ├── storedAddress.js
│   │   └── user.js
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── nominatim_server/
├── openmaptiles/
└── osrm_server/
```

# ⚙️ Setup Instructions

## 1. Clone the repository
```
git clone https://github.com/<username>/<backend-repo>.git
cd backend
```

## 2. Install dependencies

```
npm install
```

# 3. Configure environment variables
```
Create a .env file in the root directory:
DATABASE_URL=your_database_url
JWT_SECRET_KEY="your-super-secret-auth-key"
JWT_REFRESH_SECRET_KEY="your-super-secret-refresh-key"
```

## 4. Run the server
```
npm start
```
or for development with auto-reload
```
npm run dev
```
