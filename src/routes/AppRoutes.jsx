import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Header from "../components/Header";
import RegisterPage from "../pages/Register";
import DashboardPage from "../pages/Dashboard";
import NotFoundPage from "../pages/NotFound";
import DocumentationPage from "../pages/Documentation";
import CreateDocumentPage from "../pages/DocumentUpload";
import DocumentsPage from "../pages/DocumentsPage";
import DocumentDetailsPage from "../components/DocumentViewer";
import TemplatesPage from "../pages/Templates";
import SubscriptionPage from "../pages/Subscription";
import PaymentPage from "../pages/Payment";
import SettingsPage from "../pages/Settings";
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

          <Route
          path="/documents/create"
          element={
            <ProtectedRoute>
              <CreateDocumentPage />
            </ProtectedRoute>
          }
          />
             <Route
          path="/documents/:id/edit"
          element={
            <ProtectedRoute>
              <CreateDocumentPage />
            </ProtectedRoute>
          }
          />

          
              <Route
                path="/documents"
            element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
             }
          />

           <Route
                path="/documents/:id"
            element={
            <ProtectedRoute>
              <DocumentDetailsPage />
            </ProtectedRoute>
             }
          />

          <Route
          path="/templates"
          element={<ProtectedRoute>
              <TemplatesPage />
            </ProtectedRoute>}
          />

           <Route
          path="/subscription"
          element={<ProtectedRoute>
              <SubscriptionPage /> 
            </ProtectedRoute>}
          />
           <Route
          path="/payment"
          element={<ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>}
          />

           <Route
          path="/settings"
          element={<ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>}
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </Layout>
    
  );
}

export default AppRoutes;