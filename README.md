# React + TypeScript + Webpack + Express Monorepo

A modern frontend/backend project with:
- **Frontend**: React 18 + TypeScript + Webpack
- **Backend**: Express + TypeScript
- **Shared modules**: Type-safe shared code between frontend and backend

## Structure

```
.
├── client/             # React frontend
│   ├── src/
│   │   ├── App.tsx     # React application
│   │   └── index.tsx   # Entry point
│   ├── public/
│   │   └── index.html  # HTML template
│   └── webpack.*.config.js
├── server/              # Express backend
│   ├── src/
│   │   └── index.ts    # Express server
│   └── dist/           # Compiled output
└── shared/             # Shared types and utilities
    ├── src/            # Shared entrypoint
    │   └── index.ts 
    └── dist/           # Compiled output
```

## Getting Started

```bash
# Install dependencies and configure project
npm run prepare-dev

# Start development servers
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Available Scripts

```bash
npm run dev          # Start both dev servers
npm run build        # Build all packages
npm run build:client # Build only client
npm run build:server # Build only server
npm start            # Start production server
```

## Features

- ✅ TypeScript with strict mode
- ✅ Hot reload in development
- ✅ Webpack bundling
- ✅ Shared modules with proper dependency resolution
- ✅ Express API endpoints
- ✅ CORS enabled
- ✅ RESTful API with user CRUD operations

## API Endpoints

### Backend (http://localhost:3001)

- `GET /health` - Health check
- `GET /users` - Get all users
- `GET /users/:id` - Get single user
- `POST /users` - Create new user

## Notes

This project demonstrates:
- Modern TypeScript configuration
- Webpack development workflow
- Express REST API
- Shared code between frontend and backend
- Proper module resolution

## How to

### Add new shared folder
```json
{
  "exports": {
    ".": "./dist/index.js",
    "./constants": "./dist/constants/index.js",
    "./NEW_ENDPOINT": "./dist/NEW_ENDPOINT/index.js",
    "./package.json": "./package.json"
  }
}
```
### Create new structure
```
└── shared/              # Shared types and utilities
    ├── src/
    │   └── index.ts    
    │── NEW_ENDPOINT/
    │   └── index.ts    
    └── dist/           # Compiled output
```