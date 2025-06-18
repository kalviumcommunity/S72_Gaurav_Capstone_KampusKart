import React from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiSearch, FiCalendar, FiFileText, FiAlertCircle, FiHome, FiUsers } from 'react-icons/fi';
import { FaComments } from 'react-icons/fa';
import Navbar from './Navbar';

const features = [
  {
    name: 'Campus Map',
    description: 'Explore the campus and find locations easily.',
    icon: <FiMap className="w-8 h-8 text-[#00C6A7]" />, 
    link: '/campus-map',
  },
  {
    name: 'Lost & Found',
    description: 'Report or find lost items on campus.',
    icon: <FiSearch className="w-8 h-8 text-[#F05A25]" />, 
    link: '/lostfound',
  },
  {
    name: 'Events',
    description: 'Stay updated with campus events.',
    icon: <FiCalendar className="w-8 h-8 text-blue-500" />, 
    link: '/events',
  },
  {
    name: 'News',
    description: 'Read the latest campus news.',
    icon: <FiFileText className="w-8 h-8 text-purple-500" />, 
    link: '/news',
  },
  {
    name: 'Complaints',
    description: 'Raise and track campus complaints.',
    icon: <FiAlertCircle className="w-8 h-8 text-red-500" />, 
    link: '/complaints',
  },
  {
    name: 'Facilities',
    description: 'Discover campus facilities and services.',
    icon: <FiHome className="w-8 h-8 text-green-500" />, 
    link: '/facilities',
  },
  {
    name: 'Global Chat',
    description: 'Chat with other campus members in real-time.',
    icon: <FaComments className="w-8 h-8 text-indigo-500" />, 
    link: '/chat',
  },
  {
    name: 'Clubs Recruitment',
    description: 'Apply to join campus clubs and societies.',
    icon: <FiUsers className="w-8 h-8 text-pink-500" />, 
    link: '/clubs-recruitment',
  },
];

const socials = [
  { href: 'https://www.instagram.com/gaurav_khandelwal_/', label: 'Instagram', icon: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  ) },
  { href: 'https://www.linkedin.com/in/gaurav-khandelwal-17a127358/', label: 'LinkedIn', icon: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
  ) },
  { href: 'https://x.com/xXxGauravxXx', label: 'Twitter', icon: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
  ) },
  { href: 'https://github.com/Gaurav-205', label: 'GitHub', icon: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.237 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  ) },
];

const Home = () => {
  return (
    <div className="relative min-h-screen bg-white font-sans overflow-hidden pt-16 md:pt-24">
      <Navbar />
      {/* SVG Blobs for background */}
      <svg className="absolute left-[-120px] top-[-80px] w-[340px] h-[220px] -z-10" viewBox="0 0 340 220" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60,40 Q120,0 200,60 T340,40 Q320,120 200,180 T60,180 Q0,120 60,40Z" fill="#FFD166"/></svg>
      <svg className="absolute right-[-120px] top-20 w-[320px] h-[200px] -z-10" viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M40,60 Q100,0 180,40 T320,60 Q300,140 180,180 T40,140 Q0,100 40,60Z" fill="#F05A25"/></svg>
      <svg className="absolute left-[-100px] bottom-[-80px] w-[300px] h-[180px] -z-10" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M60,40 Q120,0 200,60 T300,40 Q280,120 200,160 T60,160 Q0,120 60,40Z" fill="#00C6A7"/></svg>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-[60vh] pt-20 md:pt-36 pb-12 md:pb-16 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mb-4 md:mb-6 leading-tight" style={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '1.05' }}>Welcome to Kampuskart</h1>
        <p className="text-base md:text-xl text-gray-700 mb-6 md:mb-8 max-w-2xl mx-auto">Your all-in-one campus companion for navigation, events, news, lost & found, complaints, and more!</p>
        <Link to="/campus-map" className="inline-block px-6 md:px-8 py-3 md:py-4 bg-[#00C6A7] text-white rounded-full font-bold text-base md:text-lg shadow hover:bg-[#009e87] hover:text-white transition">Explore Campus Map</Link>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-16 py-12 md:py-16">
        <h2 className="text-xl md:text-3xl font-bold text-gray-800 text-center mb-6 md:mb-10">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {features.map((feature) => (
            <Link to={feature.link} key={feature.name} className="bg-white rounded-xl shadow hover:shadow-lg p-8 flex flex-col items-center text-center transition group border border-gray-100">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00C6A7]">{feature.name}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm mt-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/Logo.png" alt="KampusKart Logo" className="h-8 w-8" />
          <span className="text-h5 font-extrabold text-black tracking-tight">Kampuskart</span>
        </div>
        <div className="flex justify-center gap-6 mb-4">
          {socials.map((s, i) => (
            <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-gray-400 hover:text-[#F05A25] transition-colors duration-200">
              {s.icon}
            </a>
          ))}
        </div>
        <div className="text-body">&copy; {new Date().getFullYear()} KampusKart. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Home; 