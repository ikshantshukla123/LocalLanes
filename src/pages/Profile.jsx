import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { supabase } from '../supaBaseClient'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showResetForm, setShowResetForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [resetData, setResetData] = useState({ email: '', newPassword: '', confirmPassword: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error) {
          console.error('Error fetching profile:', error)
          setError('Failed to load profile')
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage({ type: '', text: '' })

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      setPasswordLoading(false)
      return
    }

    // Validate password strength
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setPasswordLoading(false)
      return
    }

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect' })
        setPasswordLoading(false)
        return
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (updateError) {
        setPasswordMessage({ type: 'error', text: updateError.message })
        setPasswordLoading(false)
        return
      }

      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      
      // Hide the form after a delay
      setTimeout(() => {
        setShowPasswordForm(false)
        setPasswordMessage({ type: '', text: '' })
      }, 2000)

    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetLoading(true)
    setResetMessage({ type: '', text: '' })

    // Validate passwords match
    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetMessage({ type: 'error', text: 'New passwords do not match' })
      setResetLoading(false)
      return
    }

    // Validate password strength
    if (resetData.newPassword.length < 6) {
      setResetMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setResetLoading(false)
      return
    }

    try {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(resetData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setResetMessage({ type: 'error', text: error.message })
        setResetLoading(false)
        return
      }

      setResetMessage({ type: 'success', text: 'Password reset link sent to your email! Check your inbox and click the link to reset your password.' })
      setResetData({ email: '', newPassword: '', confirmPassword: '' })
      
      // Hide the form after a delay
      setTimeout(() => {
        setShowResetForm(false)
        setResetMessage({ type: '', text: '' })
      }, 5000)

    } catch (error) {
      setResetMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' })
    } finally {
      setResetLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/backProfile.jpg')" }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/backProfile.jpg')" }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-white text-center">
              <p className="text-red-200 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-2 px-4 rounded-xl"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/backProfile.jpg')" }}>
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">No Profile Found</h2>
            <p className="text-white/80 mb-6">You haven't created a profile yet.</p>
            <a 
              href="/AddProfile"
              className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Create Profile
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/backProfile.jpg')" }}>
      <NavBar />
      
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Main Profile Card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                {profile.full_name || 'User Profile'}
              </h1>
              <p className="text-white/80 text-lg">Student Profile</p>
            </div>

            {/* Profile Image */}
            {profile.profile_image_url && (
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <img 
                    src={profile.profile_image_url} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20"></div>
                </div>
              </div>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username/Full Name */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white/70 text-sm font-medium mb-2">Full Name</h3>
                <p className="text-white text-lg font-semibold">
                  {profile.full_name || 'Not specified'}
                </p>
              </div>

              {/* Branch */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white/70 text-sm font-medium mb-2">Branch</h3>
                <p className="text-white text-lg font-semibold">
                  {profile.branch || 'Not specified'}
                </p>
              </div>

              {/* Year */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white/70 text-sm font-medium mb-2">Year</h3>
                <p className="text-white text-lg font-semibold">
                  {profile.year || 'Not specified'}
                </p>
              </div>

              {/* Username */}
              <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white/70 text-sm font-medium mb-2">Username</h3>
                <p className="text-white text-lg font-semibold break-all">
                  {profile.full_name || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center mt-8 space-x-4 flex-wrap gap-4">
              <a 
                href="/AddProfile"
                className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Edit Profile
              </a>
              <button 
                onClick={() => setShowPasswordForm(true)}
                className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Change Password
              </button>
              <button 
                onClick={() => setShowResetForm(true)}
                className="bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/90 hover:to-red-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Forgot Password?
              </button>
              <a 
                href="/home"
                className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
                <p className="text-white/80">Enter your current password and choose a new one</p>
              </div>

              {passwordMessage.text && (
                <div className={`mb-4 text-sm px-3 py-2 rounded-md border ${
                  passwordMessage.type === 'error' 
                    ? 'text-red-200 bg-red-500/10 border-red-500/30' 
                    : 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      setPasswordMessage({ type: '', text: '' })
                    }}
                    className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reset Password Form */}
          {showResetForm && (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Reset Your Password</h2>
                <p className="text-white/80">Enter your email and new password. A reset link will be sent to your email.</p>
              </div>

              {resetMessage.text && (
                <div className={`mb-4 text-sm px-3 py-2 rounded-md border ${
                  resetMessage.type === 'error' 
                    ? 'text-red-200 bg-red-500/10 border-red-500/30' 
                    : 'text-emerald-200 bg-emerald-500/10 border-emerald-500/30'
                }`}>
                  {resetMessage.text}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Email Address</label>
                  <input
                    type="email"
                    value={resetData.email}
                    onChange={(e) => setResetData({...resetData, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">New Password</label>
                  <input
                    type="password"
                    value={resetData.newPassword}
                    onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={resetData.confirmPassword}
                    onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex justify-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/90 hover:to-red-700/90 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false)
                      setResetData({ email: '', newPassword: '', confirmPassword: '' })
                      setResetMessage({ type: '', text: '' })
                    }}
                    className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
