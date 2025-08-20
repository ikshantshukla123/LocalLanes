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
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setSuccessMessage("Check your inbox to confirm your email.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">



      <div className="text-center md:text-left space-y-6 px-4">
          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-300 animate-gradient-x">
            Local-Lanes
          </h2>
          <p className="text-slate-300 text-lg">
            Discover the <span className="text-cyan-300 font-semibold">best hangout spots</span>, gyms, restaurants, and hidden gems around your college.
          </p>
          <p className="text-slate-200/90 text-base leading-relaxed max-w-md">
            Local-Lanes helps you explore recommendations shared by seniors & friends — 
            so you never feel lost again! 🌟
          </p>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-blue-500/30 rounded-3xl blur-2xl"></div>
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white text-center">Create account</h1>
            <p className="text-slate-300 text-center mt-1">Sign up with your .edu email</p>

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
              <div>
                <label className="block text-slate-200 text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-200 text-sm mb-1">College Email (.edu)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@college.edu"
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-200 text-sm mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex justify-center items-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create account"}
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
