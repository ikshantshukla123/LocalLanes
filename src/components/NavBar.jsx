import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supaBaseClient'
import { Edit, ChevronDown, ChevronUp } from 'lucide-react'

export default function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mySpots, setMySpots] = useState([]);
  const [showMySpots, setShowMySpots] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
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

  const handleEditSpot = (spotId) => {
    navigate(`/edit-spot/${spotId}`);
    setShowMySpots(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMySpots && !event.target.closest('.my-spots-dropdown')) {
        setShowMySpots(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMySpots]);

  return (
    <div className='sticky top-0 z-30 backdrop-blur bg-gray-800/90 shadow-md'>
      <div className='flex justify-between items-center text-white pt-4 pb-4'>
        <div className='flex items-center pl-10'>
          <div className="relative group">
            <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <img 
              src="localLanesLogo.png" 
              alt="Local Lanes Logo" 
              className="relative w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-2xl group-hover:scale-110 transition-all duration-300"
            />
          </div>
          <h1 className='ml-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent'>Local Lanes</h1>
        </div>
        <div className='flex justify-evenly items-center w-1/2 pr-2'>
          <Link to="/home" className='relative inline-block px-2 py-1 transition-all duration-200 hover:text-cyan-400 hover:-translate-y-0.5 group'>
            <span>Home</span>
            <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          
          
          <Link to="/NotFound" className='relative inline-block px-2 py-1 transition-all duration-200 hover:text-cyan-400 hover:-translate-y-0.5 group'>
            <span>Additional</span>
            <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          <Link to="/AddSpot" className='relative inline-block px-2 py-1 transition-all duration-200 hover:text-cyan-400 hover:-translate-y-0.5 group'>
            <span>Add-Spot</span>
            <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          <Link to="/Profile" className='relative inline-flex items-center gap-2 px-2 py-2 transition-all duration-200 hover:text-cyan-400 hover:-translate-y-0.5 group bg-transparent hover:bg-white/20 hover:border-cyan-400/50 hover:border rounded-full'>
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
        
            <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          {user && (
            <>
              <button 
                onClick={handleSignOut}
                className='relative inline-block px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-all duration-200 hover:-translate-y-0.5 group text-sm font-medium'
              >
                <span>Sign Out</span>
                <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full'></span>
              </button>
              
              {/* My Spots Dropdown */}
              <div className="relative my-spots-dropdown">
                <button
                  onClick={() => setShowMySpots(!showMySpots)}
                  className="relative inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 rounded-lg transition-all duration-200 hover:-translate-y-0.5 group text-sm font-medium text-white"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
