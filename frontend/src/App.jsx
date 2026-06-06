import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import StudentDashboard from './pages/StudentDashboard';
import EditRegistration from './pages/EditRegistration';
import AdminPaymentPage from './pages/AdminPaymentPage';
import Blogs from './pages/Blogs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error('App Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-dark-900 text-light flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary px-6 py-2 rounded hover:opacity-90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Redirect logged-in users away from public pages
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let role = null;
  if(userStr) {
    try { role = JSON.parse(userStr).role; } catch(e){}
  }

  if (token && role) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'athlete') return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let role = null;
  if(userStr) {
    try { role = JSON.parse(userStr).role; } catch(e){}
  }
  
  if (!token || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Student Protected Route Component
const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let role = null;
  if(userStr) {
    try { role = JSON.parse(userStr).role; } catch(e){}
  }

  if (!token || role !== 'athlete') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-dark-900 text-light font-sans">
          <ToastContainer theme="dark" />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <StudentRoute>
                    <StudentDashboard />
                  </StudentRoute>
                } 
              />
              <Route 
                path="/home" 
                element={
                  
                    <Home />
                  
                } 
              />
              <Route 
                path="/edit-registration" 
                element={
                  <StudentRoute>
                    <EditRegistration />
                  </StudentRoute>
                } 
              />
              <Route 
                path="/admin/payments" 
                element={
                  <AdminRoute>
                    <AdminPaymentPage />
                  </AdminRoute>
                } 
              />
              
              <Route path="/blogs" element={<Blogs />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
