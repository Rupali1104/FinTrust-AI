# FinTrust-AI

A comprehensive loan application and credit scoring system that leverages AI to assess business loan applications.

## Features

- User Authentication (Login/Register)
- Role-based Access Control (Admin/User)
- Business Loan Application
- AI-powered Credit Scoring
- Real-time Application Status Tracking
- Detailed Results Dashboard
- Admin Dashboard for Application Management

## Tech Stack

### Frontend
- React.js
- Chart.js for data visualization
- GSAP for animations
- Axios for API calls
- CSS Modules for styling

### Backend
- Node.js
- Express.js
- SQLite3 for database
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/FinTrust-AI.git
cd FinTrust-AI
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

## Running the Project

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

## Project Structure

```
FinTrust-AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── server/
│   │   ├── routes/
│   │   ├── data/
│   │   ├── scripts/
│   │   └── server.js
│   └── package.json
└── README.md
```

## Database

The application uses SQLite3 for data storage. The database file (`finTrust.db`) will be automatically created when you start the server for the first time. The database is pre-seeded with:
- 1 admin user
- 15 regular users with varying credit scores
- User details and loan application data

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control
- CORS protection
- Input validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
