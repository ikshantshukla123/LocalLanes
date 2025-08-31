import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { supabase } from '../supaBaseClient'
import { useAuth } from '../context/AuthContext'

function coerceToUrlArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    const t = value.trim()
    try {
      if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('"') && t.endsWith('"'))) {
        const parsed = JSON.parse(t)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
        if (typeof parsed === 'string') return [parsed]
      }
    } catch (_) {}
    if (t.includes(',')) return t.split(',').map((s) => s.trim()).filter(Boolean)
    return [t]
  }
  return []
}

function toStorageKeysFromPublicUrls(urls) {
  const keys = []
  urls.forEach((u) => {
    if (typeof u !== 'string') return
    const marker = '/storage/v1/object/public/SpotImages/'
    const idx = u.indexOf(marker)
    if (idx !== -1) {
      const key = u.substring(idx + marker.length)
      if (key) keys.push(key)
    }
  })
  return keys
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [mySpots, setMySpots] = useState([])
  const [loadingSpots, setLoadingSpots] = useState(true)
  const [deletingId, setDeletingId] = useState("")

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
        setLoadingSpots(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
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

    const fetchMySpots = async () => {
      if (!user) return
      setLoadingSpots(true)
      try {
        const { data, error } = await supabase
          .from('spots')
          .select('*')
          .eq('user_id', user.id)

        if (error) throw error

        const sorted = (data || []).slice().sort((a, b) => {
          if (a.created_at && b.created_at) return new Date(b.created_at) - new Date(a.created_at)
          return 0
        })

        const normalized = sorted.map((s) => {
          const arr = coerceToUrlArray(s.image_url)
          const fallback = coerceToUrlArray(s.images)
          const images = arr.length ? arr : fallback
          return { ...s, images }
        })
        setMySpots(normalized)
      } catch (e) {
        console.error('Error fetching spots:', e)
      } finally {
        setLoadingSpots(false)
      }
    }

    fetchProfile()
    fetchMySpots()
  }, [user])

  const handleDeleteSpot = async (spot) => {
    if (!user || !spot?.id) return
    const confirmed = window.confirm('Delete this spot? This action cannot be undone.')
    if (!confirmed) return

    setDeletingId(spot.id)
    try {
      const keys = toStorageKeysFromPublicUrls(spot.images || [])
      if (keys.length) {
        await supabase.storage.from('SpotImages').remove(keys)
      }
      const { error } = await supabase.from('spots').delete().eq('id', spot.id)
      if (error) throw error

      setMySpots((prev) => prev.filter((s) => s.id !== spot.id))
    } catch (e) {
      alert(e.message || 'Failed to delete spot')
    } finally {
      setDeletingId("")
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setPasswordLoading(false)
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      })

      if (signInError) {
        setPasswordMessage({ type: 'error', text: 'Current password is incorrect' })
        setPasswordLoading(false)
        return
      }

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

    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetMessage({ type: 'error', text: 'New passwords do not match' })
      setResetLoading(false)
      return
    }

    if (resetData.newPassword.length < 6) {
      setResetMessage({ type: 'error', text: 'Password must be at least 6 characters long' })
      setResetLoading(false)
      return
    }

    try {
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
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">No Profile Found</h2>
            <p className="text-white/80 mb-6">You haven't created a profile yet. Create one to get started!</p>
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
      
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Main Profile Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
              {profile.full_name || 'User Profile'}
            </h1>
            <p className="text-white/80 text-lg">Student Profile</p>
          </div>

          {profile.profile_image_url && (
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="relative">
                <img 
                  src={profile.profile_image_url} 
                  alt="Profile" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20"></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white/70 text-sm font-medium mb-2">Full Name</h3>
              <p className="text-white text-lg font-semibold">
                {profile.full_name || 'Not specified'}
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white/70 text-sm font-medium mb-2">Branch</h3>
              <p className="text-white text-lg font-semibold">
                {profile.branch || 'Not specified'}
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white/70 text-sm font-medium mb-2">Year</h3>
              <p className="text-white text-lg font-semibold">
                {profile.year || 'Not specified'}
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white/70 text-sm font-medium mb-2">Username</h3>
              <p className="text-white text-lg font-semibold break-all">
                {profile.full_name || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="flex justify-center mt-6 md:mt-8 space-x-2 md:space-x-4 flex-wrap gap-2 md:gap-4">
            <a 
              href="/AddProfile"
              className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
            >
              Edit Profile
            </a>
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
            >
              Change Password
            </button>
            <button 
              onClick={() => setShowResetForm(true)}
              className="bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/90 hover:to-red-700/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
            >
              Forgot Password?
            </button>
            <a 
              href="/home"
              className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
            >
              Back to Home
            </a>
          </div>
        </div>

        {/* User Spots */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Spots</h2>
            {loadingSpots && <span className="text-white/70 text-sm">Loading...</span>}
          </div>
          {(!loadingSpots && mySpots.length === 0) ? (
            <p className="text-white/70">You haven't added any spots yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {mySpots.map((spot) => {
                const img = (spot.images && spot.images.length) ? spot.images[0] : null
                const addedOn = spot.created_at ? new Date(spot.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''
                const email = spot.user_email || user?.email || ''
                const isAdminVerified = [
                  'ikshant.2428it898@kiet.edu',
                  'harshit.2428it1394@kiet.edu'
                ].includes(email?.toLowerCase())
                return (
                  <div key={spot.id} className="bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                    <div className="h-32 md:h-40 bg-center bg-cover relative" style={{ backgroundImage: `url('${img || '/body.png'}')` }}>
                      <span className={`absolute top-2 left-2 text-[10px] tracking-wide px-2 py-1 rounded-full border ${isAdminVerified ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' : 'bg-cyan-500/20 border-cyan-400/40 text-cyan-200'}`}>
                        {isAdminVerified ? 'Verified by Admin' : 'Verified User'}
                      </span>
                    </div>
                    <div className="p-3 md:p-4 space-y-2">
                      <h3 className="text-white font-semibold text-base md:text-lg">{spot.spot_name || 'Untitled Spot'}</h3>
                      {spot.location && <p className="text-white/70 text-sm">{spot.location}</p>}
                      {addedOn && <p className="text-white/60 text-xs">Added on {addedOn}</p>}
                      <button
                        onClick={() => handleDeleteSpot(spot)}
                        disabled={deletingId === spot.id}
                        className="mt-2 w-full bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {deletingId === spot.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Password Change Form */}
        {showPasswordForm && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Change Password</h2>
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

              <div className="flex justify-center space-x-2 md:space-x-4 pt-4 flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90 text-white font-semibold py-2 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
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
                  className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-2 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reset Password Form */}
        {showResetForm && (
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Reset Your Password</h2>
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

              <div className="flex justify-center space-x-2 md:space-x-4 pt-4 flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="bg-gradient-to-r from-orange-500/80 to-red-600/80 hover:from-orange-600/90 hover:to-red-700/90 text-white font-semibold py-2 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm md:text-base"
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
                  className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-2 px-4 md:px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
