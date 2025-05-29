# 🧭 KampusKart – Your Toolkit for College

KampusKart is a dynamic web portal designed to centralize all essential campus information for students, faculty, and visitors of MIT ADT University. From interactive maps and shuttle tracking to mess menus and lost & found, KampusKart is your all-in-one campus companion.

---

## 🚀 Features

### 🗺️ Interactive Campus Map
- Locate hostels, messes, canteens, libraries, and other key facilities
- View operating hours and facility details
- Clickable markers and real-time data

### 🚌 3D Shuttle Model (Beta)
- Animated shuttle overlay on the campus map
- Preset routes with expected arrival times
- Powered by Three.js and Google Maps API / Mapbox GL

### 🍽️ Mess & Canteen System
- Daily food menus and timings
- Facility ratings and availability

### 🏢 Hostel & Facility Information
- Hostel rules, contact details, and amenities
- Opening hours of libraries, labs, and other academic zones

### 📢 Campus News & Events (New!)
- Stay updated with the latest university happenings
- Filter by department or interest

### 📬 Feedback & Complaints
- Submit grievances and improvement suggestions
- Admin dashboard for managing responses (WIP)

### 🎒 Lost & Found Portal
- Upload lost item details and search found listings
- Contact finder anonymously

### 🧠 Fun Daily Features (Coming Soon)
- Word of the Day / Fun Fact of the Day
- Quiz or mini-games to boost engagement

---

## ⚙️ Tech Stack

### Frontend
- **React.js** – SPA architecture
- **Tailwind CSS** – Responsive and modern UI
- **React Router** – Smooth page navigation
- **Google Maps API / Mapbox GL JS** – Map integration
- **Three.js** – 3D shuttle rendering
- **React Context API** – State management

### Backend
- **Node.js** with **Express.js** – API and server logic
- **MongoDB** (or Firebase) – Database and user data
- **JWT** – Secure authentication
- **Socket.io** – (Future) real-time updates

### DevOps & Tools
- **Vercel / Netlify** – Frontend deployment
- **Render / AWS** – Backend deployment
- **Git & GitHub** – Version control and issue tracking
- **Jest** – Unit testing

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (v4.4 or higher)
- Git

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server:
   ```bash
   npm start
   ```

## 🤝 Contributing

We welcome contributions to KampusKart! Here's how you can help:

1. Fork the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request

### Code Style
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Write tests for new features
- Update documentation as needed

### Pull Request Process
1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. The PR will be merged once you have the sign-off of at least one other developer

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- MIT ADT University for their support
- All contributors who have helped shape this project

