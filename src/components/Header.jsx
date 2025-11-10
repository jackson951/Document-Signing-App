import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, Menu, X, LogIn, LogOut, User, Settings, 
  Bell, Home, FileSignature, LayoutDashboard 
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setIsAuthenticated(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer" 
            onClick={() => handleNavigation('/')}
          >
            <FileText className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">DocuSign API</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              // Public Navigation
              <>
                <a 
                  href="#features" 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Features
                </a>
                <Link 
                   to="/docs" 
                   className="text-gray-300 hover:text-blue-400 transition-colors"
               >
                   API Docs
               </Link>
                <a 
                  href="#pricing" 
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Pricing
                </a>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center gap-2 bg-transparent border border-blue-400 hover:bg-blue-400/10 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>
            ) : (
              // Authenticated Navigation
              <>
                <button
                  onClick={() => handleNavigation('/')}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation('/documents')}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <FileSignature className="w-4 h-4" />
                  Documents
                </button>
                
                {/* Notifications */}
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4 border-t border-white/10 pt-4">
            {!isAuthenticated ? (
              // Public Mobile Navigation
              <>
                <a 
                  href="#features" 
                  className="block text-gray-300 hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <Link
                  to="/docs"
                  className="block text-gray-300 hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                API Docs
               </Link>
                <a 
                  href="#pricing" 
                  className="block text-gray-300 hover:text-blue-400 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-transparent border border-blue-400 hover:bg-blue-400/10 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>
            ) : (
              // Authenticated Mobile Navigation
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg">
                  <User className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigation('/')}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>

                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNavigation('/documents')}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                  <FileSignature className="w-5 h-5" />
                  Documents
                </button>

                <button
                  onClick={() => handleNavigation('/settings')}
                  className="w-full flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>

                <div className="border-t border-white/10 pt-4">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;