import React, { useState, useEffect } from 'react'
import NavBar from '../components/NavBar'
import { supabase } from '../supaBaseClient'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
            <div className="flex justify-center mt-8 space-x-4">
              <a 
                href="/AddProfile"
                className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Edit Profile
              </a>
              <a 
                href="/home"
                className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 hover:from-gray-600/90 hover:to-gray-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
