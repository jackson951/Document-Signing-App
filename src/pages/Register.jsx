import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ShieldCheck
    , Eye, EyeOff
} from 'lucide-react';

function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = org info, 2 = user info, 3 = success
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Step 1: Organization
  const [orgName, setOrgName] = useState('');
  const [domain, setDomain] = useState('');

  // Step 2: User & Auth
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Derived: auto-detect role from email domain
  const [detectedRole, setDetectedRole] = useState('DEVELOPER');
  const [isExistingOrg, setIsExistingOrg] = useState(false);

  // Detect role & org existence as user types email
  useEffect(() => {
    if (!email.includes('@')) return;

    const [, userDomain] = email.split('@');
    if (userDomain === domain) {
      setIsExistingOrg(true);
      setDetectedRole('DEVELOPER');  // internal dev
    } else {
      setIsExistingOrg(false);
      // Assume admin if creating new org, or external signer if joining?
      // In this flow, new org = admin, later signers get invited
      setDetectedRole('ADMIN');
    }
  }, [email, domain]);

  const validateStep1 = () => {
    if (!orgName.trim()) {
      setError('Organization name is required.');
      return false;
    }
    if (!domain.trim()) {
      setError('Domain (e.g., yourcompany.com) is required.');
      return false;
    }
    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      setError('Please enter a valid domain (e.g., acme.com).');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('First and last name are required.');
      return false;
    }
    if (!email.includes('@')) {
      setError('Valid email is required.');
      return false;
    }
    if (isExistingOrg && !email.endsWith(`@${domain}`)) {
      setError(`Email must belong to @${domain} to join this organization.`);
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must include uppercase, lowercase, and a number.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        organization: {
          name: orgName,
          domain: isExistingOrg ? null : domain, // only set domain if *creating* org
        },
        user: {
          firstName,
          lastName,
          email,
          password,
          role: detectedRole,
        }
      };

      const response = await fetch('http://localhost:3000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess(true);
      // Simulate email verification delay (or skip if auto-verified)
      setTimeout(() => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.organization) {
          localStorage.setItem('organization', JSON.stringify(data.organization));
        }
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FileText className="w-10 h-10 text-blue-400" />
            <span className="text-3xl font-bold text-white">SignFlow API</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === 1 ? 'Create Organization' : step === 2 ? 'Set Up Your Account' : 'Welcome!'}
          </h1>
          <p className="text-gray-400">
            {step === 1
              ? 'Start by setting up your organization.'
              : step === 2
              ? detectedRole === 'ADMIN'
                ? 'You’ll be the admin of this organization.'
                : 'Joining ' + (domain || 'your team') + ' as a developer.'
              : 'Your account is ready — redirecting to dashboard...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full ${
                  s <= step
                    ? s === step
                      ? 'bg-blue-500'
                      : 'bg-blue-400'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Success State */}
          {success && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3 text-green-300 mb-6">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Registration Successful!</p>
                <p className="text-sm mt-1">
                  ✅ Organization created<br />
                  ✅ Admin account set up<br />
                  ✅ API credentials ready<br />
                  🚀 Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3 text-red-300 mb-6">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Registration Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Organization Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-200 mb-2">
                  Organization Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Acme Inc."
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-200 mb-2">
                  Organization Domain <span className="text-gray-500">(optional for new orgs)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/^https?:\/\//, '').trim())}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="yourcompany.com"
                    disabled={isLoading}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Used to auto-verify team members. Leave blank to skip domain verification (not recommended).
                </p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: User Info */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@company.com"
                    disabled={isLoading}
                    required
                  />
                </div>
                {email && (
                  <div className={`mt-1 text-xs flex items-center ${
                    isExistingOrg ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    {isExistingOrg
                      ? `✔️ Joining @${domain}`
                      : `🆕 Creating new org — you’ll be admin`}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-1 text-xs text-gray-400 grid grid-cols-2 gap-2">
                  <span className={password.length >= 8 ? 'text-green-400' : ''}>✓ 8+ chars</span>
                  <span className={/(?=.*[A-Z])/.test(password) ? 'text-green-400' : ''}>✓ Uppercase</span>
                  <span className={/(?=.*[a-z])/.test(password) ? 'text-green-400' : ''}>✓ Lowercase</span>
                  <span className={/(?=.*\d)/.test(password) ? 'text-green-400' : ''}>✓ Number</span>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:underline">Terms of Service</a>
                  {' and '}
                  <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>
                  , including processing of personal data for audit and compliance purposes.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Divider & Login Link */}
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;