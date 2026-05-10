# Traveloop – Personalized Travel Planning Made Easy

Traveloop is a modern full-stack travel planning application built with React, Node.js, and MongoDB.

## Features
- **Dashboard**: Overview of upcoming trips and travel stats.
- **Trip Management**: Create, edit, and delete trips with custom cover images.
- **Itinerary Builder**: Add cities/stops and activities with a timeline view.
- **Budget Tracker**: Visual charts and transaction history for expense tracking.
- **Packing Checklist**: Categorized list with progress tracking.
- **User Profile**: Manage account settings and preferences.
- **Admin Dashboard**: Platform-wide analytics (users, trips, destinations).
- **Authentication**: Secure login/signup using Firebase.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB.
- **Auth**: Firebase Authentication.

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local instance.
- Firebase Project.

## Getting Started

### 1. Backend Setup
1. Navigate to `server` folder.
2. Run `npm install`.
3. Create a `.env` file based on the provided template:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```
4. Place your Firebase Service Account JSON in `server/config/`.
5. Run `npm start` (or `npm run dev` for nodemon).

### 2. Frontend Setup
1. Navigate to `client` folder.
2. Run `npm install`.
3. Update `src/utils/firebase.js` with your Firebase configuration.
4. Run `npm run dev`.

## Environment Variables
Ensure you have the following set up:
- `MONGODB_URI`: Your MongoDB connection string.
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to your Firebase service account key.
- Firebase Config in `client/src/utils/firebase.js`.

## License
MIT
