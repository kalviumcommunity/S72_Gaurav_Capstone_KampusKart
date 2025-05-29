# KampusKart Backend

This is the backend server for KampusKart, MIT ADT University's campus portal. It provides RESTful APIs for the frontend application.

## Features

- User authentication and authorization
- Campus map data management
- Shuttle tracking system
- Mess and canteen management
- Lost and found system
- News and events management
- Feedback and complaints system

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time features

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm (v7 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## API Documentation

The API documentation is available at `/api-docs` when the server is running.

### Main Endpoints

- `/api/auth` - Authentication endpoints
- `/api/map` - Campus map data
- `/api/shuttle` - Shuttle tracking
- `/api/mess` - Mess and canteen
- `/api/lost-found` - Lost and found system
- `/api/news` - News and events
- `/api/feedback` - Feedback and complaints

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

Please read the main [CONTRIBUTING.md](../CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details. 