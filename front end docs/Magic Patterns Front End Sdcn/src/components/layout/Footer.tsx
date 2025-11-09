import React from 'react';
import { Link } from 'react-router-dom';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-xl font-bold text-blue-600">
              StudyGapAI
            </Link>
            <p className="mt-3 text-sm text-gray-500 max-w-md">
              AI-powered diagnostic and personalized learning platform for JAMB
              students in Nigeria. Identify learning gaps, get AI analysis, and
              follow personalized study plans.
            </p>
          </div>
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Platform
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-blue-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/progress" className="text-sm text-gray-500 hover:text-blue-600">
                  Progress
                </Link>
              </li>
              <li>
                <Link to="/resources/all" className="text-sm text-gray-500 hover:text-blue-600">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          {/* More Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-blue-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-500 hover:text-blue-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} StudyGapAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;