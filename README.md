# CareerVista Backend

This is the backend API for the CareerVista application, a career guidance platform for 10th-grade students.

## Features

- User authentication with email OTP and Google Sign-In
- User profile management
- Academic test with adaptive questions
- Stream recommendations based on test scores and interests
- College search and comparison
- Scholarship eligibility checker
- Education loan information and EMI calculator

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `GET /api/auth/google` - Google Sign-In
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### User

- `PUT /api/users/profile` - Update user profile
- `GET /api/users/test-scores` - Get user test scores
- `GET /api/users/recommended-streams` - Get user recommended streams

### Tests

- `GET /api/tests/academic` - Get questions for academic test
- `POST /api/tests/academic/submit` - Submit academic test
- `GET /api/tests/results/:testId` - Get test results

### Recommender

- `GET /api/recommender/streams` - Get stream recommendations
- `GET /api/recommender/careers/:stream` - Get career options for a stream

### Colleges

- `GET /api/colleges` - Get all colleges with filtering
- `GET /api/colleges/:id` - Get college by ID
- `GET /api/colleges/stream/:stream` - Get colleges by stream
- `GET /api/colleges/location/:state` - Get colleges by location
- `POST /api/colleges/compare` - Compare colleges

### Scholarships

- `GET /api/scholarships` - Get all scholarships with filtering
- `GET /api/scholarships/:id` - Get scholarship by ID
- `POST /api/scholarships/eligible` - Get eligible scholarships

### Loans

- `GET /api/loans` - Get all loans with filtering
- `GET /api/loans/:id` - Get loan by ID
- `POST /api/loans/eligible` - Get eligible loans
- `POST /api/loans/compare` - Compare loans
- `POST /api/loans/calculate-emi` - Calculate EMI

## Project Structure

```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API routes
├── utils/           # Utility functions
├── index.ts         # Entry point
```

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production mode
npm start

# Run linting
npm run lint
```

## License

MIT