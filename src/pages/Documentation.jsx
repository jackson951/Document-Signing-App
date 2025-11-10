import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Shield,
  Code,
  Terminal,
  Copy,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Search,
  BookOpen,
  Key,
  Users,
  Zap,
  Download,
  Github,
  ExternalLink,
} from 'lucide-react';

// Mock data based on your app.js and test flow
const API_SECTIONS = [
  {
    title: "Authentication",
    id: "auth",
    icon: Shield,
    endpoints: [
      { method: "POST", path: "/auth/login", id: "login" },
      { method: "POST", path: "/auth/register", id: "register" },
      { method: "POST", path: "/auth/api-keys", id: "create-api-key" },
      { method: "GET", path: "/auth/api-keys", id: "list-api-keys" },
      { method: "DELETE", path: "/auth/api-keys/:id", id: "revoke-api-key" },
      { method: "POST", path: "/auth/oauth-clients", id: "create-oauth-client" },
    ],
  },
  {
    title: "Documents",
    id: "documents",
    icon: FileText,
    endpoints: [
      { method: "POST", path: "/documents", id: "upload-document" },
      { method: "GET", path: "/documents", id: "list-documents" },
      { method: "GET", path: "/documents/:id", id: "get-document" },
      { method: "DELETE", path: "/documents/:id", id: "delete-document" },
    ],
  },
  {
    title: "Envelopes (Signing Requests)",
    id: "envelopes",
    icon: Users,
    endpoints: [
      { method: "POST", path: "/envelopes", id: "create-envelope" },
      { method: "GET", path: "/envelopes", id: "list-envelopes" },
      { method: "GET", path: "/envelopes/:id", id: "get-envelope" },
      { method: "POST", path: "/envelopes/:id/send", id: "send-envelope" },
      { method: "POST", path: "/envelopes/:id/cancel", id: "cancel-envelope" },
      { method: "GET", path: "/envelopes/:id/status", id: "get-envelope-status" },
    ],
  },
  {
    title: "Signature Fields",
    id: "signature-fields",
    icon: Zap,
    endpoints: [
      { method: "POST", path: "/signature-fields", id: "create-signature-field" },
      { method: "GET", path: "/signature-fields", id: "list-signature-fields" },
      { method: "DELETE", path: "/signature-fields/:id", id: "delete-signature-field" },
    ],
  },
  {
    title: "Signers",
    id: "signers",
    icon: Users,
    endpoints: [
      { method: "GET", path: "/signers/:id", id: "get-signer" },
      { method: "POST", path: "/signers/:id/decline", id: "decline-signer" },
    ],
  },
  {
    title: "External Signing",
    id: "external",
    icon: ExternalLink,
    endpoints: [
      { method: "GET", path: "/sign/:token", id: "get-sign-page" },
      { method: "POST", path: "/sign/:token", id: "submit-signature" },
    ],
  },
];

const ERROR_CODES = [
  {
    code: 400,
    title: "Bad Request",
    detail: "Invalid input (e.g., missing fields, wrong format)",
    example: {
      type: "https://api.example.com/errors/invalid-input",
      title: "Invalid Input",
      status: 400,
      detail: "Email and password are required",
    },
  },
  {
    code: 401,
    title: "Unauthorized",
    detail: "Missing or invalid credentials",
    example: {
      type: "https://api.example.com/errors/invalid-credentials",
      title: "Invalid credentials",
      status: 401,
      detail: "Incorrect password",
    },
  },
  {
    code: 403,
    title: "Forbidden",
    detail: "Valid credentials but insufficient permissions",
    example: {
      type: "https://api.example.com/errors/forbidden",
      title: "Forbidden",
      status: 403,
      detail: "Only admins can create OAuth clients",
    },
  },
  {
    code: 404,
    title: "Not Found",
    detail: "Resource does not exist",
    example: {
      type: "https://api.example.com/errors/not-found",
      title: "Not Found",
      status: 404,
      detail: "API key not found or not authorized",
    },
  },
  {
    code: 409,
    title: "Conflict",
    detail: "Resource already exists (e.g., duplicate email)",
    example: {
      type: "https://api.example.com/errors/conflict",
      title: "Conflict",
      status: 409,
      detail: "User with this email already exists",
    },
  },
  {
    code: 429,
    title: "Too Many Requests",
    detail: "Rate limit exceeded",
    headers: { "X-RateLimit-Limit": "100", "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": "1700000000" },
  },
  {
    code: 500,
    title: "Internal Server Error",
    detail: "Unexpected server failure",
    example: {
      type: "https://api.example.com/errors/internal-server-error",
      title: "Internal Server Error",
      status: 500,
      detail: "An unexpected error occurred during login",
    },
  },
];

// Example requests based on your test flow
const EXAMPLES = {
  login: {
    title: "Authenticate",
    method: "POST",
    path: "/api/v1/auth/login",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: JSON.stringify(
      {
        email: "admin@example.com",
        password: "password123",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx",
        user: {
          id: "usr_123",
          email: "admin@example.com",
          firstName: "Admin",
          lastName: "User",
          role: "ADMIN",
        },
        organization: {
          id: "org_456",
          name: "Example Org",
          domain: "example.com",
        },
      },
      null,
      2
    ),
  },
  uploadDocument: {
    title: "Upload Document",
    method: "POST",
    path: "/api/v1/documents",
    headers: [
      { key: "Authorization", value: "Bearer YOUR_JWT_TOKEN" },
      { key: "Content-Type", value: "multipart/form-data" },
    ],
    body: `# Using curl
curl -X POST 'http://localhost:3000/api/v1/documents' \\
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\
  -F 'title=Test Contract' \\
  -F 'file=@/path/to/contract.pdf'`,
    response: JSON.stringify(
      {
        id: "doc_789",
        title: "Test Contract",
        fileUrl: "/uploads/doc_789.pdf",
        status: "DRAFT",
        createdAt: "2025-11-10T10:00:00.000Z",
      },
      null,
      2
    ),
  },
  createEnvelope: {
    title: "Create Signing Envelope",
    method: "POST",
    path: "/api/v1/envelopes",
    headers: [{ key: "Authorization", value: "Bearer YOUR_JWT_TOKEN" }],
    body: JSON.stringify(
      {
        documentId: "doc_789",
        signers: [
          {
            name: "Jackson Khuto",
            email: "jackson@forensics.dev",
          },
        ],
        expiresAt: "2025-11-17T10:00:00.000Z",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        id: "env_abc",
        documentId: "doc_789",
        status: "DRAFT",
        signers: [
          {
            id: "s_1",
            name: "Jackson Khuto",
            email: "jackson@forensics.dev",
            status: "PENDING",
          },
        ],
        createdAt: "2025-11-10T10:01:00.000Z",
      },
      null,
      2
    ),
  },
  sendEnvelope: {
    title: "Send for Signature",
    method: "POST",
    path: "/api/v1/envelopes/env_abc/send",
    headers: [{ key: "Authorization", value: "Bearer YOUR_JWT_TOKEN" }],
    response: JSON.stringify(
      {
        id: "env_abc",
        status: "SENT",
        sentAt: "2025-11-10T10:02:00.000Z",
      },
      null,
      2
    ),
  },
};

function DocumentationPage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("overview");
  const [expandedSections, setExpandedSections] = useState({});
  const [copied, setCopied] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const contentRef = useRef(null);

  // Initialize expanded sections based on URL hash
  useEffect(() => {
    const initialExpanded = {};
    API_SECTIONS.forEach(section => {
      if (location.hash.includes(section.id)) {
        initialExpanded[section.id] = true;
      }
    });
    setExpandedSections(initialExpanded);
  }, [location.hash]);

  // Scroll to section on URL hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(id);
      }
    }
  }, [location]);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ [id]: true });
    setTimeout(() => setCopied({}), 2000);
  };

  const MethodBadge = ({ method }) => (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${
        method === "GET"
          ? "bg-green-900/30 text-green-400 border border-green-700"
          : method === "POST"
          ? "bg-blue-900/30 text-blue-400 border border-blue-700"
          : method === "PUT" || method === "PATCH"
          ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700"
          : "bg-red-900/30 text-red-400 border border-red-700"
      }`}
    >
      {method}
    </span>
  );

  // Filter API sections based on search query
  const filteredSections = API_SECTIONS.map(section => ({
    ...section,
    endpoints: section.endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.endpoints.length > 0 || 
                      section.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 flex">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 mr-8 hidden lg:block">
          <div className="sticky top-8 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                {[
                  { id: "overview", title: "Overview", icon: BookOpen },
                  { id: "auth-guide", title: "Authentication", icon: Key },
                  { id: "errors", title: "Error Handling", icon: AlertCircle },
                  { id: "examples", title: "Examples", icon: Code },
                  { id: "sdk", title: "SDKs & Tools", icon: Download },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-900/30 text-blue-300 border-l-2 border-blue-500"
                        : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                    }`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.title}
                  </a>
                ))}

                <div className="border-t border-gray-700 my-4"></div>

                {filteredSections.map((section) => (
                  <div key={section.id} className="mb-2">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center justify-between w-full px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="w-4 h-4" />
                        <span>{section.title}</span>
                      </div>
                      {expandedSections[section.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedSections[section.id] && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.endpoints.map((endpoint) => (
                          <a
                            key={endpoint.id}
                            href={`#${endpoint.id}`}
                            className={`block px-3 py-1.5 text-sm rounded hover:bg-gray-800/30 ${
                              activeSection === endpoint.id
                                ? "text-blue-400 font-medium"
                                : "text-gray-400 hover:text-blue-400"
                            }`}
                            onClick={() => setActiveSection(endpoint.id)}
                          >
                            <MethodBadge method={endpoint.method} />
                            <span className="ml-2">{endpoint.path}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1" ref={contentRef}>
          {/* Overview */}
          <section id="overview" className="mb-16 scroll-mt-16">
            <h1 className="text-4xl font-bold mb-4">DocuSign API Documentation</h1>
            <p className="text-xl text-gray-300 mb-6 max-w-3xl">
              Integrate secure, auditable electronic signatures into your applications.
              Built for developers, designed for scale.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Shield className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure & Compliant</h3>
                <p className="text-gray-400">
                  Enterprise-grade security with complete audit logging for legal compliance (GDPR, SOC 2, ISO 27001).
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Zap className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">API First</h3>
                <p className="text-gray-400">
                  RESTful JSON API with predictable resource-oriented URLs and HTTP response codes.
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <Users className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Multi-Signer Workflows</h3>
                <p className="text-gray-400">
                  Support for complex signing sequences with role-based access and conditional fields.
                </p>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-6 h-6" />
                Quick Start
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-300">
                <li>
                  <strong>Get API credentials</strong>: Log in to your{" "}
                  <Link to="/dashboard" className="text-blue-400 hover:underline">
                    Dashboard
                  </Link>{" "}
                  and create an API key or use JWT auth.
                </li>
                <li>
                  <strong>Upload a document</strong>: POST to <code className="bg-gray-800 px-1 rounded">/api/v1/documents</code>
                </li>
                <li>
                  <strong>Create an envelope</strong>: POST to <code className="bg-gray-800 px-1 rounded">/api/v1/envelopes</code>
                </li>
                <li>
                  <strong>Send for signature</strong>: POST to{" "}
                  <code className="bg-gray-800 px-1 rounded">/api/v1/envelopes/{`{id}`}/send</code>
                </li>
              </ol>
            </div>
          </section>

          {/* Authentication Guide */}
          <section id="auth-guide" className="mb-16 scroll-mt-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Key className="w-8 h-8 text-blue-400" />
              Authentication
            </h2>
            <p className="text-gray-300 mb-6">
              The API uses either JWT Bearer tokens (for user sessions) or API keys (for server-to-server).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  JWT Bearer Token
                </h3>
                <p className="text-gray-400 mb-4">
                  Use for interactive applications where a user is logged in.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-400">Authorization:</div>
                  <div className="text-green-400">Bearer eyJhbGciOiJIUzI1NiIs...</div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  API Key
                </h3>
                <p className="text-gray-400 mb-4">
                  Use for backend services and CI/CD pipelines.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <div className="text-gray-400">x-api-key:</div>
                  <div className="text-yellow-400">sk_live_a1b2c3d4e5f6...</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Role-Based Access</h3>
              <div className="space-y-3">
                {[
                  { role: "ADMIN", desc: "Full access: users, org settings, billing" },
                  { role: "DEVELOPER", desc: "API access: documents, envelopes, webhooks" },
                  { role: "SIGNER", desc: "Limited: only sign documents assigned to them" },
                ].map((r, i) => (
                  <div key={i} className="flex items-start">
                    <div className={`mt-1 w-3 h-3 rounded-full ${
                      r.role === "ADMIN" ? "bg-purple-500" : 
                      r.role === "DEVELOPER" ? "bg-blue-500" : "bg-green-500"
                    }`}></div>
                    <div className="ml-3">
                      <span className={`font-mono font-semibold ${
                        r.role === "ADMIN" ? "text-purple-400" : 
                        r.role === "DEVELOPER" ? "text-blue-400" : "text-green-400"
                      }`}>
                        {r.role}
                      </span>
                      <p className="text-gray-400 ml-2">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Error Handling */}
          <section id="errors" className="mb-16 scroll-mt-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-red-400" />
              Error Handling
            </h2>
            <p className="text-gray-300 mb-6">
              The API uses conventional HTTP response codes and RFC 7807 Problem Details.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Error</th>
                    <th className="text-left py-3 px-4 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {ERROR_CODES.map((error, i) => (
                    <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-red-400">{error.code}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{error.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{error.detail}</div>
                      </td>
                      <td className="py-3 px-4">
                        {error.headers && (
                          <div className="text-xs bg-gray-800 px-2 py-1 rounded inline-block">
                            Headers: X-RateLimit-*
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-4">Example Error Response</h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">HTTP/1.1 401 Unauthorized</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(ERROR_CODES[1].example, null, 2), "error-401")}
                    className="p-1 text-gray-400 hover:text-blue-400"
                  >
                    {copied["error-401"] ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  {JSON.stringify(ERROR_CODES[1].example, null, 2)}
                </pre>
              </div>
            </div>
          </section>

          {/* Examples */}
          <section id="examples" className="mb-16 scroll-mt-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-8 h-8 text-cyan-400" />
              API Examples
            </h2>
            <p className="text-gray-300 mb-6">
              Real-world examples based on your test flow — ready to copy and run.
            </p>

            {Object.entries(EXAMPLES).map(([key, example]) => (
              <div
                key={key}
                id={key}
                className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden scroll-mt-16"
              >
                <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{example.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <MethodBadge method={example.method} />
                      <code className="text-gray-400">{example.path}</code>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Request */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-blue-400" />
                        Request
                      </h4>
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            {example.headers?.[0]?.key}: {example.headers?.[0]?.value}
                          </span>
                          <button
                            onClick={() => copyToClipboard(example.body, `req-${key}`)}
                            className="p-1 text-gray-400 hover:text-blue-400"
                          >
                            {copied[`req-${key}`] ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-sm overflow-x-auto font-mono">
                          {example?.body?.includes("curl") ? (
                            example.body
                          ) : (
                            <code>{example.body}</code>
                          )}
                        </pre>
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-400" />
                        Response (200 OK)
                      </h4>
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                          <span className="text-gray-400 text-sm">application/json</span>
                          <button
                            onClick={() => copyToClipboard(example.response, `res-${key}`)}
                            className="p-1 text-gray-400 hover:text-blue-400"
                          >
                            {copied[`res-${key}`] ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <pre className="p-4 text-sm overflow-x-auto">
                          {example.response}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* SDKs */}
          <section id="sdk" className="mb-16 scroll-mt-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Download className="w-8 h-8 text-purple-400" />
              SDKs & Tools
            </h2>
            <p className="text-gray-300 mb-6">
              Official and community libraries to accelerate integration.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  name: "JavaScript/Node.js",
                  desc: "Official SDK with TypeScript support",
                  url: "https://github.com/jacksonkhuto/docusign-js",
                  lang: "JavaScript",
                },
                {
                  name: "Python",
                  desc: "Async-enabled client with Pydantic models",
                  url: "https://github.com/jacksonkhuto/docusign-py",
                  lang: "Python",
                },
                {
                  name: "Postman Collection",
                  desc: "Pre-configured API requests for testing",
                  url: "https://documenter.getpostman.com/view/12345678/docusign-api",
                  lang: "API",
                },
                {
                  name: "OpenAPI Spec",
                  desc: "Download swagger.json for codegen",
                  url: "/api/v1/docs-json",
                  lang: "OpenAPI",
                },
              ].map((sdk, i) => (
                <a
                  key={i}
                  href={sdk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-300">{sdk.lang[0]}</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg">{sdk.name}</h3>
                      <p className="text-gray-400 mt-1">{sdk.desc}</p>
                      <div className="mt-3 inline-flex items-center text-blue-400 text-sm">
                        View Docs
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-gray-800">
            <div className="text-center text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()} Document Signing API • Built by{" "}
                <span className="text-blue-400">Jackson Khuto</span>
              </p>
              <p className="mt-1">
                <Link to="/dashboard" className="text-blue-400 hover:underline">
                  Dashboard
                </Link>{" "}
                •{" "}
                <a href="#overview" className="text-blue-400 hover:underline">
                  Top
                </a>
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default DocumentationPage;