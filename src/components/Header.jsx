import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, Menu, X, LogIn, LogOut, User, Settings, 
  Bell, Home, FileSignature, LayoutDashboard, FolderOpen,
  Zap, ChevronDown, Sparkles, Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);

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
    setFeaturesOpen(false);
  };

  // Features dropdown items
  const featureItems = [
    {
      icon: FileSignature,
      title: 'Templates',
      description: 'Reusable document templates',
      path: '/templates',
      color: 'text-purple-400'
    },
    {
      icon: FolderOpen,
      title: 'Documents',
      description: 'Manage all your documents',
      path: '/documents',
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      title: 'API Integration',
      description: 'Developer resources',
      path: '/docs',
      color: 'text-green-400'
    },
    {
      icon: Package,
      title: 'Features',
      description: 'All platform features',
      path: '/features',
      color: 'text-orange-400'
    }
  ];

  return (
    <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 shadow-2xl shadow-black/20">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => handleNavigation('/')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <FileText className="w-8 h-8 text-white relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                SignFlow
              </span>
              <span className="text-xs text-gray-400 -mt-1">Enterprise eSign</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {!isAuthenticated ? (
              // Public Navigation
              <>
                {/* Features Dropdown */}
                <div className="relative">
                  <button 
                    onMouseEnter={() => setFeaturesOpen(true)}
                    onMouseLeave={() => setFeaturesOpen(false)}
                    className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Features</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {featuresOpen && (
                    <div 
                      className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl shadow-black/30 p-4 animate-in fade-in-0 zoom-in-95"
                      onMouseEnter={() => setFeaturesOpen(true)}
                      onMouseLeave={() => setFeaturesOpen(false)}
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {featureItems.map((item, index) => (
                          <div
                            key={item.title}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200 group hover:scale-[1.02]"
                            onClick={() => handleNavigation(item.path)}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                              <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium text-sm">{item.title}</p>
                              <p className="text-gray-400 text-xs truncate">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <a 
                  href="#pricing" 
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  Pricing
                </a>
                
                <Link 
                  to="/docs" 
                  className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  API Docs
                </Link>

                <div className="w-px h-6 bg-gray-700 mx-2"></div>

                <button 
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center gap-2 bg-transparent border border-gray-600 hover:border-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                
                <button 
                  onClick={() => handleNavigation('/register')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  Get Started Free
                </button>
              </>
            ) : (
              // Authenticated Navigation
              <>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === '/dashboard' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNavigation('/documents')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === '/documents' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileSignature className="w-4 h-4" />
                  Documents
                </button>

                <button
                  onClick={() => handleNavigation('/templates')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    location.pathname === '/templates' 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Templates
                </button>

                {/* Quick Actions */}
                <div className="w-px h-6 bg-gray-700 mx-2"></div>

                {/* Notifications */}
                <button className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 relative group">
                  <Bell className="w-5 h-5 text-gray-300 group-hover:text-white" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-900"></span>
                </button>

                {/* Settings */}
                <button 
                  onClick={() => handleNavigation('/settings')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200 group"
                >
                  <Settings className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </button>

                {/* User Profile Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl shadow-2xl shadow-black/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4 border-b border-gray-800">
                      <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                      <p className="text-blue-400 text-xs font-medium mt-1">{user?.role || 'User'}</p>
                    </div>
                    
                    <div className="p-2">
                      <button 
                        onClick={() => handleNavigation('/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                      
                      <button 
                        onClick={() => handleNavigation('/settings')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                    
                    <div className="p-2 border-t border-gray-800">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-2 pb-4 border-t border-gray-800 pt-4 animate-in slide-in-from-top duration-300">
            {!isAuthenticated ? (
              // Public Mobile Navigation
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {featureItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer transition-all hover:bg-white/10"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-white text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href="#pricing" 
                  className="block text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                
                <Link
                  to="/docs"
                  className="block text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  API Docs
                </Link>

                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <button 
                    onClick={() => handleNavigation('/login')}
                    className="w-full flex items-center justify-center gap-2 bg-transparent border border-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/register')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg transition-colors shadow-lg"
                  >
                    Get Started Free
                  </button>
                </div>
              </>
            ) : (
              // Authenticated Mobile Navigation
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 bg-white/5 px-4 py-3 rounded-lg mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <p className="text-blue-400 text-xs font-medium">{user?.role || 'User'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNavigation('/documents')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/documents' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileSignature className="w-5 h-5" />
                  Documents
                </button>

                <button
                  onClick={() => handleNavigation('/templates')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === '/templates' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FolderOpen className="w-5 h-5" />
                  Templates
                </button>

                <div className="border-t border-gray-800 pt-4 space-y-2">
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="w-full flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </button>

                  <button
                    onClick={() => handleNavigation('/settings')}
                    className="w-full flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-6 py-3 rounded-lg transition-colors mt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
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