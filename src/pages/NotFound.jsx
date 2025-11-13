import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  MessageCircle, 
  ArrowLeft,
  ShieldAlert,
  Search
} from 'lucide-react';

function NotFoundPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.warn('[404] Page not found:', window.location.href);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center flex-1">
        {/* Animated 404 Header */}
        <div className="flex justify-center mb-8">
          {[4, 0, 4].map((num, i) => (
            <div 
              key={i}
              className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center text-5xl md:text-6xl font-bold bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-blue-400 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {num}
            </div>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-lg">
          <ShieldAlert className="w-5 h-5 inline-block mr-2 text-yellow-400" />
          The URL you requested doesn’t exist. You may have mistyped the address, followed a broken link, or the resource was moved.
        </p>

        {/* Suggested Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-3xl">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center justify-center p-5 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-3 group-hover:bg-blue-800/40 transition-colors">
              <Home className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-medium text-white">Dashboard</span>
            <span className="text-sm text-gray-500 mt-1">Go to your workspace</span>
          </button>

          <button
      onClick={() => navigate("/docs")}
      className="flex flex-col items-center justify-center p-5 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-700 transition-all group"
    >
      <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center mb-3 group-hover:bg-cyan-800/40 transition-colors">
        <FileText className="w-6 h-6 text-cyan-400" />
      </div>
      <span className="font-medium text-white">API Docs</span>
      <span className="text-sm text-gray-500 mt-1">Reference & guides</span>
    </button>

          <button
            onClick={() => window.open('https://support.sigflow.dev', '_blank')}
            className="flex flex-col items-center justify-center p-5 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-700 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-900/30 flex items-center justify-center mb-3 group-hover:bg-purple-800/40 transition-colors">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
            <span className="font-medium text-white">Support</span>
            <span className="text-sm text-gray-500 mt-1">Get help from our team</span>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-medium transition-colors border border-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        {/* Search Suggestion */}
        <div className="mt-4 p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 max-w-lg text-center">
          <div className="flex items-center justify-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 text-sm">
              Try searching for what you need in the <strong>Dashboard</strong> or <strong>Documentation</strong>.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800/50">
        <p>
          © {new Date().getFullYear()} Document Signing API •{' '}
          <button 
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
          >
            Return to Home
          </button>
        </p>
      </footer>

      {/* SEO: Prevent indexing */}
      <meta name="robots" content="noindex" />
    </div>
  );
}

export default NotFoundPage;
