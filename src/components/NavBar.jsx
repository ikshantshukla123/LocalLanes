import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supaBaseClient'
import { Edit, ChevronDown, ChevronUp, Menu, X, User, Home, Plus, LogOut, Info } from 'lucide-react'

export default function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mySpots, setMySpots] = useState([]);
  const [showMySpots, setShowMySpots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchMySpots = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('id, spot_name, location, category')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMySpots(data || []);
    } catch (error) {
      console.error('Error fetching my spots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMySpots();
      
      // Subscribe to real-time updates for user's spots
      const channel = supabase
        .channel('my-spots-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'spots',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchMySpots();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleEditSpot = (spotId) => {
    navigate(`/edit-spot/${spotId}`);
    setShowMySpots(false);
    setIsMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMySpots && !event.target.closest('.my-spots-dropdown')) {
        setShowMySpots(false);
      }
      if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMySpots, isDropdownOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className='sticky top-0 z-50 backdrop-blur-md bg-gray-900/95 shadow-lg border-b border-white/10'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16 lg:h-20'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link to="/home" className="flex items-center group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <img 
                  src="localLanesLogo.png" 
                  alt="Local Lanes Logo" 
                  className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-300"
                />
              </div>
              <h1 className='ml-3 text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent'>
                Local Lanes
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center space-x-2 xl:space-x-4'>
            <Link 
              to="/home" 
              className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-cyan-400 hover:bg-white/10 group ${
                isActive('/home') ? 'text-cyan-400 bg-white/10' : 'text-white'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              <span>Home</span>
              <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
            </Link>
            
            <Link 
              to="/NotFound" 
              className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-cyan-400 hover:bg-white/10 group ${
                isActive('/NotFound') ? 'text-cyan-400 bg-white/10' : 'text-white'
              }`}
            >
              <Info className="w-4 h-4 mr-2" />
              <span>Additional</span>
              <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
            </Link>
            
            <Link 
              to="/AddSpot" 
              className={`relative inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-cyan-400 hover:bg-white/10 group ${
                isActive('/AddSpot') ? 'text-cyan-400 bg-white/10' : 'text-white'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Spot</span>
              <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
            </Link>

            {user && (
              <>
                {/* My Spots Dropdown */}
                <div className="relative my-spots-dropdown">
                  <button
                    onClick={() => setShowMySpots(!showMySpots)}
                    className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-lg transition-all duration-200 text-sm font-medium text-white"
                  >
                    <Edit className="h-4 w-4" />
                    <span>My Spots</span>
                    {showMySpots ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMySpots && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          My Spots ({mySpots.length})
                        </h3>
                        
                        {loading ? (
                          <div className="text-center py-4">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                            <p className="text-white/70 text-sm mt-2">Loading...</p>
                          </div>
                        ) : mySpots.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {mySpots.map((spot) => (
                              <div
                                key={spot.id}
                                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                                onClick={() => handleEditSpot(spot.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                                      {spot.spot_name || 'Untitled Spot'}
                                    </h4>
                                    <p className="text-white/70 text-xs truncate">
                                      {spot.location}
                                    </p>
                                    {spot.category && (
                                      <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                                        {spot.category}
                                      </span>
                                    )}
                                  </div>
                                  <Edit className="h-4 w-4 text-white/50 group-hover:text-cyan-300 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-white/70 text-sm mb-3">No spots yet</p>
                            <Link
                              to="/AddSpot"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
                              onClick={() => setShowMySpots(false)}
                            >
                              Add Your First Spot
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-white text-sm font-medium">{user?.email?.split('@')[0]}</span>
                    {isDropdownOpen ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl z-50 overflow-hidden">
                      {/* Header with gradient accent */}
                      <div className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 p-4 border-b border-gray-600/30">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full blur-sm opacity-50"></div>
                            <div className="relative w-12 h-12 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.email?.split('@')[0]}</p>
                            <p className="text-gray-300 text-xs truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu items */}
                      <div className="p-2">
                        <div className="space-y-1">
                          <Link
                            to="/Profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-200 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-indigo-500/10 transition-all duration-300 text-sm font-medium group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <div className="p-1.5 rounded-lg bg-gray-700/50 group-hover:bg-cyan-500/20 transition-all duration-300">
                              <User className="w-4 h-4" />
                            </div>
                            <span>Profile</span>
                          </Link>
                          
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-red-200 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 transition-all duration-300 text-sm font-medium w-full text-left group"
                          >
                            <div className="p-1.5 rounded-lg bg-gray-700/50 group-hover:bg-red-500/20 transition-all duration-300">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='lg:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200'
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className='lg:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-md border-t border-white/10'>
            <Link
              to="/home"
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive('/home') 
                  ? 'text-cyan-400 bg-white/10' 
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>
            
            <Link
              to="/NotFound"
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive('/NotFound') 
                  ? 'text-cyan-400 bg-white/10' 
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Info className="w-5 h-5 mr-3" />
              Additional
            </Link>
            
            <Link
              to="/AddSpot"
              className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive('/AddSpot') 
                  ? 'text-cyan-400 bg-white/10' 
                  : 'text-white hover:text-cyan-400 hover:bg-white/10'
              }`}
            >
              <Plus className="w-5 h-5 mr-3" />
              Add Spot
            </Link>

            {user && (
              <>
                <Link
                  to="/Profile"
                  className={`flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive('/Profile') 
                      ? 'text-cyan-400 bg-white/10' 
                      : 'text-white hover:text-cyan-400 hover:bg-white/10'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile
                </Link>

                {/* Mobile My Spots Section */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      My Spots ({mySpots.length})
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                      <p className="text-white/70 text-sm mt-2">Loading...</p>
                    </div>
                  ) : mySpots.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {mySpots.slice(0, 3).map((spot) => (
                        <div
                          key={spot.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                          onClick={() => handleEditSpot(spot.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">
                                {spot.spot_name || 'Untitled Spot'}
                              </h4>
                              <p className="text-white/70 text-xs truncate">
                                {spot.location}
                              </p>
                            </div>
                            <Edit className="h-4 w-4 text-white/50" />
                          </div>
                        </div>
                      ))}
                      {mySpots.length > 3 && (
                        <p className="text-white/50 text-xs text-center py-2">
                          +{mySpots.length - 3} more spots
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white/70 text-sm mb-3">No spots yet</p>
                      <Link
                        to="/AddSpot"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
                      >
                        Add Your First Spot
                      </Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSignOut}
                  className='flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-200'
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
