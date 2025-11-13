import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FileText, Users, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check localStorage token to determine login status
  useEffect(() => {
    const token = localStorage.getItem('token'); // replace 'token' with your key if different
    setIsLoggedIn(!!token);
  }, []);

  const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Management",
      description: "Upload, organize, and manage multiple documents with version control and audit trails."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multi-Signer Support",
      description: "Add multiple signers to documents with role-based access and signing workflows."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with complete audit logging for legal compliance."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "API First",
      description: "Integrate seamlessly with your existing systems using our robust RESTful API."
    }
  ];

  const signatureTypes = [
    "Click to Sign",
    "Draw Signature",
    "Type Signature",
    "Upload Image",
    "Initial Fields",
    "Date Fields"
  ];

  const handleGetStarted = () => {
    navigate(isLoggedIn ? '/dashboard' : '/login'); // redirect to dashboard if logged in
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Document Signing API
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Integrate secure, auditable electronic signatures into your applications. 
          Built for developers, designed for scale.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isLoggedIn && (
            <button 
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => navigate('/docs')}
            className="bg-transparent border-2 border-blue-400 hover:bg-blue-400/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
          >
            View Documentation
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">99.9%</div>
            <div className="text-gray-400">Uptime SLA</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">1M+</div>
            <div className="text-gray-400">Documents Signed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-gray-400">API Integrations</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-blue-400/50 transition-all transform hover:scale-105"
            >
              <div className="text-blue-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signature Types */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-12 border border-blue-400/30">
          <h2 className="text-4xl font-bold text-center mb-4">
            Multiple Signature Types
          </h2>
          <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            Support for various signature methods to meet all your document signing needs
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {signatureTypes.map((type, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
              >
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-sm md:text-base">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section id="api" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Simple Integration
        </h2>
        <div className="max-w-4xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <pre className="text-sm md:text-base overflow-x-auto">
            <code className="text-blue-300">{`// Create a signing request
const response = await fetch('/signing-requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    documentId: 'doc_123',
    signers: [
      { email: 'signer@example.com', role: 'Signer' }
    ]
  })
});

const signingRequest = await response.json();
console.log(signingRequest);`}</code>
          </pre>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join hundreds of developers building secure document signing workflows
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
            >
              Start Building Now
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold">SigFlow API</span>
            </div>
            <p className="text-gray-400 text-sm">
              Secure document signing for modern applications
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#features" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li>
           <Link to="/docs" className="hover:text-blue-400 transition-colors">
            API Docs
           </Link>
            </li>
              <li><a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Document Signing API. Built by Jackson Khuto.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
