import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

import StudentDashboard from './pages/StudentDashboard';
import EditRegistration from './pages/EditRegistration';
import AdminPaymentPage from './pages/AdminPaymentPage';
import OtpPage from './pages/OtpPage'
import Blogs from './pages/Blogs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from './context/theme-context';

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
        <div className="w-full h-screen bg-bg text-content flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-danger mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-primary-contrast font-semibold px-6 py-2 rounded-lg hover:bg-primary-hover transition-colors"
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
  if (userStr) {
    try { role = JSON.parse(userStr).role; } catch (e) { }
  }
  const normalizedRole = String(role || '').toUpperCase();

  if (token && normalizedRole) {
    if (normalizedRole === 'ADMIN') return <Navigate to="/admin" replace />;
    if (normalizedRole === 'ATHLETE') return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let role = null;
  if (userStr) {
    try { role = JSON.parse(userStr).role; } catch (e) { }
  }
  const normalizedRole = String(role || '').toUpperCase();

  if (!token || normalizedRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Student Protected Route Component
const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let role = null;
  if (userStr) {
    try { role = JSON.parse(userStr).role; } catch (e) { }
  }
  const normalizedRole = String(role || '').toUpperCase();

  if (!token || normalizedRole !== 'ATHLETE') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { theme } = useTheme();

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex flex-col min-h-screen bg-bg text-content font-sans">
          <ToastContainer theme={theme} />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/otp" element={<OtpPage />} />
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
