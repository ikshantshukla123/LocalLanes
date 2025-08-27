import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supaBaseClient";
import { useAuth } from "../../context/AuthContext.jsx";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Check if we have the necessary URL parameters for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      setErrorMessage("Invalid password reset link. Please request a new one.");
      return;
    }

    // Set the session with the tokens from the URL
    const setSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (error) {
        setErrorMessage("Invalid or expired reset link. Please request a new one.");
      }
    };

    setSession();
  }, [searchParams]);

  const handleChange = (e) => {
    setErrorMessage("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setSubmitting(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage("Password updated successfully! Redirecting to login...");
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-3xl blur-2xl"></div>
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8">
            <h1 className="text-2xl font-semibold text-white text-center mb-2">Reset Your Password</h1>
            <p className="text-slate-300 text-center mb-6">Enter your new password below</p>

            {errorMessage && (
              <div className="mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-200 text-sm mb-1">New Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-slate-200 text-sm mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-slate-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate("/")}
                className="text-cyan-300 hover:text-cyan-200 text-sm underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
