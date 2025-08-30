import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supaBaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (!isEduEmail(formData.email)) {
        setErrorMessage("Only .edu email addresses can sign up.");
        return;
      }
      
             const { data, error } = await supabase.auth.signUp({
         email: formData.email,
         password: formData.password,
         options: {
           data: { name: formData.name },
           emailRedirectTo: `${window.location.origin}/home`,
         },
       });
      
      if (error) {
        console.error("Signup error:", error);
        setErrorMessage(error.message);
        return;
      }
      
             if (data?.user && !data?.session) {
         setSuccessMessage("Check your inbox to confirm your email.");
       } else if (data?.session) {
         setSuccessMessage("Account created successfully! Redirecting...");
         setTimeout(() => navigate("/home"), 2000);
       }
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">



      <div className="text-center md:text-left space-y-6 px-4">
          <div className="flex items-center justify-center md:justify-start gap-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-lg animate-pulse"></div>
              <img 
                src="/localLanesLogo.png" 
                alt="Local-Lanes Logo" 
                className="relative w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-500"
              />
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 animate-gradient-x drop-shadow-lg">
              Local Lanes
            </h2>
          </div>
          <p className="text-slate-300 text-lg">
            Discover the <span className="text-cyan-300 font-semibold">best hangout spots</span>, gyms, restaurants, and hidden gems around your college.
          </p>
          <p className="text-slate-200/90 text-base leading-relaxed max-w-md">
            Local-Lanes helps you explore recommendations shared by seniors & friends — 
            so you never feel lost again! 🌟
          </p>
          
          {/* Feature highlights */}
          <div className="space-y-3 mt-8">
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span className="text-sm">Exclusive .edu email access</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-sm">Curated spots by college students</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm">Real photos and honest reviews</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="text-sm">Community-driven recommendations</span>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 rounded-3xl blur-2xl"></div>
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 animate-fade-in">
            <h1 className="text-2xl font-semibold text-white text-center">Create account</h1>
            <p className="text-slate-300 text-center mt-1">Sign up with your .edu email</p>
            
            {/* Decorative element */}
            <div className="flex justify-center mt-4">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
            </div>

            {errorMessage && (
              <div className="mt-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mt-4 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSignup} className="mt-6 flex flex-col gap-4">
              <div className="space-y-1">
                <label className="block text-slate-200 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-200 text-sm font-medium">College Email (.edu)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300"
                  required
                />
                <p className="text-xs text-slate-400">Only .edu email addresses are allowed</p>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-200 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all duration-300"
                  required
                />
                <p className="text-xs text-slate-400">Minimum 6 characters</p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 inline-flex justify-center items-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <p className="text-slate-300 text-sm text-center mt-6">
              Already have an account? {" "}
              <Link to="/" className="text-emerald-300 hover:text-emerald-200 underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
