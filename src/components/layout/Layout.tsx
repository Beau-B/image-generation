import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Navbar />
      <main className="flex-grow px-6 py-12 sm:px-8 lg:px-12 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;