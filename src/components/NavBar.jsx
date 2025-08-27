import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className='sticky top-0 z-30 backdrop-blur bg-gray-800/90 shadow-md'>
      <div className='flex justify-between items-center text-white pt-4 pb-4'>
        <div className='flex items-center pl-10'>
          <img src="body.png" alt="" height={30} width={30}/>
          <h1 className='ml-2'>Local Lanes</h1>
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
          <Link to="/Profile" className='relative inline-block px-2 py-1 transition-all duration-200 hover:text-cyan-400 hover:-translate-y-0.5 group'>
            <img src="body.png" alt="" height={30} width={30}/>
            <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-cyan-400 transition-all duration-300 group-hover:w-full'></span>
          </Link>
          {user && (
            <button 
              onClick={handleSignOut}
              className='relative inline-block px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg transition-all duration-200 hover:-translate-y-0.5 group text-sm font-medium'
            >
              <span>Sign Out</span>
              <span className='absolute left-0 bottom-0 h-0.5 w-0 bg-white transition-all duration-300 group-hover:w-full'></span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
