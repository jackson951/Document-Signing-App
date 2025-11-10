import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Header from "../components/Header";
import RegisterPage from "../pages/Register";
import DashboardPage from "../pages/Dashboard";
import NotFoundPage from "../pages/NotFound";
import DocumentationPage from "../pages/Documentation";
// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Layout wrapper with Header
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

function AppRoutes() {
  return (
   
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

            <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
            />

            <Route path="/docs" element={<DocumentationPage />} />
          
          {/* Protected Routes - Placeholder for future dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </Layout>
    
  );
}

export default AppRoutes;