import React from 'react';
import { Link } from 'react-router-dom';
import SkeletonLoader from './SkeletonLoader';

const quickActions = [
  {
    title: 'Campus Events',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-600',
    link: '/events'
  },
  {
    title: 'Study Groups',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    color: 'bg-purple-100 text-purple-600',
    link: '/study-groups'
  },
  {
    title: 'Campus Map',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    color: 'bg-green-100 text-green-600',
    link: '/map'
  },
  {
    title: 'Campus Services',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'bg-orange-100 text-orange-600',
    link: '/services'
  }
];

const upcomingEvents = [
  {
    title: 'Campus Tech Fest',
    date: '2024-03-15',
    location: 'Main Auditorium',
    type: 'event'
  },
  {
    title: 'Study Group: Advanced Mathematics',
    date: '2024-03-14',
    location: 'Library Room 302',
    type: 'study'
  },
  {
    title: 'Career Fair',
    date: '2024-03-20',
    location: 'Student Center',
    type: 'event'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Welcome Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, User!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening on campus today</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`${action.color} rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4`}>
                {action.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    event.type === 'event' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {event.type === 'event' ? 'Event' : 'Study Group'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/events" className="mt-4 text-[#00C6A7] hover:text-[#00A88F] font-medium inline-flex items-center">
            View all events
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Campus Updates */}
      <section className="max-w-7xl mx-auto px-4 py-6 pb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Campus Updates</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">New Library Hours</h3>
              <p className="text-sm text-gray-600 mt-1">The library will now be open 24/7 during exam season</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Campus WiFi Upgrade</h3>
              <p className="text-sm text-gray-600 mt-1">Faster internet speeds coming to all campus buildings</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 