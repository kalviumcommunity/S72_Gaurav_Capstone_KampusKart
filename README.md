# ULife – The Ultimate Campus Hub

## Overview
ULife is an interactive web portal designed to revolutionize campus life at MIT ADT by providing a centralized platform where students, faculty, and visitors can seamlessly access essential campus services and information. The platform combines intuitive navigation, real-time updates, and user engagement tools to enhance the overall campus experience.

## Purpose & Goals
1. **Centralize Campus Information**  
   Consolidate all critical information, including:  
   - Campus maps with detailed building information  
   - Shuttle schedules with expected timings  
   - Mess and canteen menus with ratings and operating hours  
   - Hostel and facility information with contact details  

2. **Enhance Campus Navigation**  
   Provide an interactive campus map integrated with:  
   - 3D shuttle model displaying expected shuttle timings  
   - Clickable markers for key locations, showing additional details  

3. **Improve Daily Life**  
   Offer quick access to:  
   - Mess and canteen menus  
   - Hostel and facility details  

4. **Engage the Community**  
   Include tools to promote interaction:  
   - Feedback & Complaints System  
   - Lost & Found Portal  

## Target Audience
- **Students**: Need real-time information on shuttle timings, dining options, and campus facilities.  
- **Faculty & Staff**: Require quick access to facility schedules and contact information for administrative support.  
- **Visitors**: Explore campus layouts and view facility operating hours.  

## Unique Value Proposition (UVP)
ULife stands out by combining real-time campus navigation with interactive 3D visualization of shuttle routes, while integrating essential campus services such as mess menus, facility timings, feedback mechanisms, and lost & found services — all within a single intuitive platform.

## Key Features
1. **Interactive Campus Map**  
   Displays campus buildings, hostels, messes, libraries, and key facilities with:  
   - Clickable markers providing facility operating hours, contact details, and more.  
   - Integration with Google Maps API/Mapbox GL JS for seamless navigation.  

2. **3D Shuttle Model with Expected Timings**  
   Uses Three.js to render a 3D shuttle model that:  
   - Animates shuttle along preset routes, displaying expected timings.  

3. **Mess & Canteen System**  
   Displays:  
   - Daily menus for mess and canteen facilities.  
   - Ratings and reviews from students.  
   - Operating hours for each facility.  

4. **Hostel & Facility Information**  
   Lists:  
   - Room availability and contact information for hostels.  
   - Operating hours for key campus facilities (e.g., libraries, labs).  

5. **User Engagement Tools**  
   - **Feedback & Complaints**: Form submission for raising concerns, with an admin panel to manage responses.  
   - **Lost & Found Portal**: Allows users to report and search for lost items with file upload support.  

## Future Expansion (Optional)
- **Cycle Rental System**: Allows students to locate and rent cycles on campus, providing details on availability and pricing.

## Technical Stack

### Frontend
- **React.js**: Used to build the interactive, single-page application.
- **Tailwind CSS**: Ensures a modern, responsive design with utility-first styling.
- **React Router**: Manages client-side routing, allowing seamless transitions between pages without full-page reloads.
- **Google Maps API / Mapbox GL JS**: Integrates an interactive map for campus navigation.
- **Three.js**: Renders a 3D shuttle model overlayed on the campus map.
- **React Context API**: Handles global state management.

### Backend
- **Node.js**: Powers the backend and handles all server-side logic.
- **Express.js**: Builds RESTful API endpoints for CRUD operations.
- **MongoDB**: Stores user data, shuttle schedule details, mess and facility information, feedback, and complaints.
- **JWT (JSON Web Tokens)**: Provides secure user authentication.
- **WebSockets (Socket.io)**: Enables real-time updates if required in future versions.

### Deployment & Tooling
- **Vercel / Netlify**: Hosts and deploys the frontend.
- **Render / AWS**: Hosts the backend.
- **Git & GitHub**: Manages version control and tracks development progress.
- **Jest**: Provides testing for frontend components and backend API endpoints.

## Development Roadmap
### Week 1: Foundations & Setup
- Research & Planning: Learn about React.js, Node.js, Express.js, MongoDB, JWT, and Tailwind CSS.
- Create wireframes and a GitHub repo with setup for issues, tasks, and milestones.
- Low-Fidelity and High-Fidelity Design using Figma.
- Set up frontend with React.js and Tailwind CSS.

### Week 2: Backend Development & APIs
- Initialize backend with Node.js and Express.js.
- Design database schema with MongoDB.
- Build and test CRUD APIs.
- Deploy backend on Render/AWS.
- Implement JWT-based authentication and 3rd party login via Google OAuth.
- Connect frontend to backend APIs.

### Week 3: Feature Development & UI/UX Implementation
- Integrate Google Maps API or Mapbox GL JS for interactive campus map.
- Implement 3D shuttle model using Three.js.
- Build mess and canteen system.
- Develop the lost & found portal with file upload support.
- Implement feedback and complaints system.

### Week 4: Advanced Concepts, Testing & Deployment
- Unit testing with Jest.
- Docker support for the application.
- Contribute to open-source projects.
- Integrate AI-autocomplete functionality.
- Gather active users and deploy the final version of ULife.

## Font Analysis: Work Sans
- **Legibility**: Optimized for both small body text and large display headers.
- **Versatility**: Performs consistently across screen sizes and devices.
- **Professional & Friendly**: Geometric structure provides a modern aesthetic with a welcoming feel.

## Color Theme Analysis
1. **#180161 (Deep Purple)** – Elegance & Sophistication  
   - Usage: Backgrounds, headers, or call-to-action buttons.
   
2. **#4F1787 (Royal Purple)** – Creativity & Mystery  
   - Usage: Highlighting key information and interactive elements.

3. **#EB3678 (Hot Pink)** – Energy & Excitement  
   - Usage: CTAs, interactive elements, and notifications.

4. **#ECB629 (Goldenrod)** – Optimism & Warmth  
   - Usage: Success messages, menu highlights, and positive feedback.

5. **#FB773C (Coral Orange)** – Creativity & Urgency  
   - Usage: Buttons, warnings, and notifications requiring immediate attention.

## Impact & Benefits
- **Enhanced Efficiency**: Centralizes campus-related information, saving time.
- **Improved Communication**: Real-time feedback and reporting systems.
- **Scalability**: Can be adapted for other campuses with minimal changes.
- **Engagement**: Encourages regular use through a clean and engaging interface.


