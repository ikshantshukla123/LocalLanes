import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supaBaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { user, authMessage, setAuthMessage } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSentTo, setResetSentTo] = useState("");

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  const isEduEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const domain = email.split("@")[1] || "";
    return domain.toLowerCase().endsWith(".edu");
  };

  const handleChange = (e) => {
    setErrorMessage("");
    setAuthMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      if (!isEduEmail(formData.email)) {
        setErrorMessage("Only .edu email addresses can sign in.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      navigate("/home", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      if (!isEduEmail(formData.email)) {
        setErrorMessage("Only .edu email addresses can reset password.");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setResetSentTo(formData.email);
      setForgotMode(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage("");
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* LEFT SIDE - Description */}
        <div className="text-center lg:text-left space-y-4 sm:space-y-6 px-4 order-2 lg:order-1">
          <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6">
            <div className="relative group">
              <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-xl sm:blur-2xl group-hover:blur-2xl sm:group-hover:blur-3xl transition-all duration-500"></div>
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse"></div>
              <img 
                src="/localLanesLogo.png" 
                alt="Local-Lanes Logo" 
                className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-500"
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 animate-gradient-x drop-shadow-lg">
              Local Lanes
            </h2>
          </div>
          <p className="text-slate-300 text-base sm:text-lg lg:text-xl">
            Discover the <span className="text-cyan-300 font-semibold">best hangout spots</span>, gyms, restaurants, and hidden gems around your college.
          </p>
          <p className="text-slate-200/90 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
            Local-Lanes helps you explore recommendations shared by seniors & friends — 
            so you never feel lost again! 🌟
          </p>
        </div>

        {/* RIGHT SIDE - Form */}
        <div className="relative w-full max-w-md mx-auto order-1 lg:order-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl"></div>
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-white text-center">
              {forgotMode ? 'Reset password' : 'Welcome back'}
            </h1>
            <p className="text-slate-300 text-center mt-1 text-sm sm:text-base">
              {forgotMode ? 'Enter your .edu email to receive reset link' : 'Sign in to your account'}
            </p>

            {(authMessage || errorMessage) && (
              <div className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {authMessage || errorMessage}
              </div>
            )}

            {resetSentTo && (
              <div className="mt-4 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                Password reset link sent to {resetSentTo}
              </div>
            )}

            <form onSubmit={forgotMode ? handleForgot : handleLogin} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-slate-200 text-sm mb-1 font-medium">College Email (.edu)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-base"
                  required
                />
              </div>

              {!forgotMode && (
                <div>
                  <label className="block text-slate-200 text-sm mb-1 font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-base"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex justify-center items-center gap-2 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
              >
                {submitting ? (forgotMode ? 'Sending...' : 'Signing in...') : (forgotMode ? 'Send reset link' : 'Sign in')}
              </button>
            </form>

            <div className="mt-4 text-center">
              {!forgotMode ? (
                <button onClick={() => setForgotMode(true)} className="text-cyan-300 hover:text-cyan-200 text-sm underline">
                  Forgot your password?
                </button>
              ) : (
                <button onClick={() => setForgotMode(false)} className="text-cyan-300 hover:text-cyan-200 text-sm underline">
                  Back to sign in
                </button>
              )}
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-3 text-slate-300 text-sm">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="inline-flex justify-center items-center gap-3 w-full py-3 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.91 29.167 35 24 35c-6.075 0-11-4.925-11-11s4.925-11 11-11c2.803 0 5.367 1.055 7.322 2.778l5.657-5.657C33.388 7.163 28.877 5 24 5 12.954 5 4 13.954 4 25s8.954 20 20 20 20-8.954 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.305 16.108 18.82 13 24 13c2.803 0 5.367 1.055 7.322 2.778l5.657-5.657C33.388 7.163 28.877 5 24 5 16.318 5 9.68 9.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 45c5.113 0 9.79-1.953 13.305-5.152l-6.147-5.206C29.25 36.091 26.774 37 24 37c-5.135 0-9.552-3.058-11.292-7.438l-6.52 5.024C9.517 40.525 16.227 45 24 45z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.314 3.827-4.679 6.69-8.807 6.916l6.147 5.206C35.882 41.081 44 35 44 25c0-1.341-.138-2.651-.389-3.917z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-slate-300 text-sm text-center mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-cyan-300 hover:text-cyan-200 underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
