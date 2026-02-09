# MechEasy - Bike Mechanic Service Platform

A comprehensive bike mechanic service booking platform built with React, Node.js, Express, and Prisma.

## Features

- 🔐 User authentication with JWT
- 🏍️ Bike management (add, edit, delete bikes)
- 🛠️ Service catalog with various bike services
- 📅 Booking system with time slot management
- 🚚 Multiple service types: Pickup & Drop, Home Service, Visit Center
- 💳 Payment integration (COD + Online payment ready)
- 👤 User dashboard for managing bookings
- 👨‍💼 Admin dashboard for booking and service management
- ⭐ Rating and review system
- 📱 Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React 19
- Vite
- React Router v7
- Axios for API calls

### Backend
- Node.js
- Express.js
- Prisma ORM
- SQLite database
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads

## Project Structure

```
MechEasy/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx
│   └── package.json
├── backend/                # Node.js backend API
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── prisma/            # Prisma schema and migrations
│   ├── uploads/           # Uploaded files (bike images)
│   ├── server.js          # Express server
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. (Optional) Seed the database:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Bikes
- `POST /api/bikes` - Add new bike (protected)
- `GET /api/bikes` - Get user's bikes (protected)
- `PUT /api/bikes/:id` - Update bike (protected)
- `DELETE /api/bikes/:id` - Delete bike (protected)

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Bookings
- `POST /api/bookings` - Create booking (protected)
- `GET /api/bookings` - Get user's bookings (protected)
- `GET /api/bookings/:id` - Get booking details (protected)
- `PUT /api/bookings/:id/status` - Update booking status (admin)
- `PUT /api/bookings/:id/reschedule` - Reschedule booking (protected)

### Payments
- `POST /api/payments/create` - Create payment (protected)
- `POST /api/payments/verify` - Verify payment (protected)
- `GET /api/payments/:bookingId` - Get payment details (protected)

### Admin
- `GET /api/admin/bookings` - Get all bookings (admin)
- `GET /api/admin/stats` - Get dashboard stats (admin)
- `PUT /api/admin/bookings/:id/assign` - Assign mechanic (admin)

## Database Schema

### User
- Authentication and profile information
- Roles: user, admin, mechanic

### Bike
- User's bike details
- Brand, model, number plate
- Optional image

### Service
- Service catalog
- Categories: repair, wash, maintenance, package
- Pricing and duration

### Booking
- Service bookings
- Time slot management
- Service types: pickup, home, visit
- Status tracking: pending, confirmed, in_progress, completed, cancelled

### Payment
- Payment records
- Methods: COD, online, card, UPI
- Status: pending, completed, failed, refunded

### Review
- Ratings and reviews for completed services
- 1-5 star rating system

## Development

### Running Prisma Studio
```bash
cd backend
npm run prisma:studio
```

### Database Migrations
```bash
cd backend
npm run prisma:migrate
```

## Deployment

### Backend (Render/Railway)
1. Create a new web service
2. Connect to GitHub repository
3. Set build command: `cd backend && npm install && npx prisma generate`
4. Set start command: `cd backend && npm start`
5. Add environment variables (JWT_SECRET, DATABASE_URL)

### Frontend (Vercel/Netlify)
1. Create a new project
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=<backend-url>`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Create atomic commits with clear messages
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
