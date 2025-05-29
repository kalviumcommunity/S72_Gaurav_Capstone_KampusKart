# KampusKart Frontend

This is the frontend application for KampusKart, MIT ADT University's campus portal. Built with React and modern web technologies.

## Features

- Interactive campus map with facility locations
- Real-time shuttle tracking with 3D visualization
- Mess and canteen menu management
- Lost and found portal
- News and events feed
- Feedback and complaints system
- Responsive design for all devices

## Tech Stack

- React.js with Vite
- Tailwind CSS for styling
- React Router for navigation
- Google Maps API / Mapbox GL JS
- Three.js for 3D visualization
- Axios for API communication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── assets/        # Static assets
├── components/    # Reusable components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── layouts/       # Layout components
├── pages/         # Page components
├── services/      # API services
├── styles/        # Global styles
└── utils/         # Utility functions
```

## Development Guidelines

- Follow the component structure in `src/components`
- Use Tailwind CSS for styling
- Implement responsive design
- Write clean, documented code
- Follow ESLint rules

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

Please read the main [CONTRIBUTING.md](../CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
