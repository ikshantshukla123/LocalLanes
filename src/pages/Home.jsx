import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, Tag, Info, Calendar, Type } from "lucide-react"
import NavBar from '../components/NavBar'
import { supabase } from '../supaBaseClient'
import { SPOT_CATEGORIES } from '../utils/Category'
import { useAuth } from '../context/AuthContext'

const coerceToUrlArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
        if (typeof parsed === 'string') return [parsed]
      } catch (_) {}
    }
    if (trimmed.includes(',')) return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    return [trimmed]
  }
  return []
}

const formatDate = (ts) => {
  if (!ts) return null
  try {
    const d = new Date(ts)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return null
  }
}

const Home = () => {
  const { user } = useAuth()
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [imageIndexBySpot, setImageIndexBySpot] = useState({})

  const categories = ['All', ...SPOT_CATEGORIES]

  const fetchSpots = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')

      if (error) throw error

      const sorted = (data || []).slice().sort((a, b) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at) - new Date(a.created_at)
        }
        if (a.id && b.id) {
          return String(b.id).localeCompare(String(a.id))
        }
        return 0
      })

      const normalized = sorted.map((spot) => {
        const arr = coerceToUrlArray(spot.image_url)
        const fallback = coerceToUrlArray(spot.images)
        const images = arr.length > 0 ? arr : fallback
        return {
          ...spot,
          images,
        }
      })

      setSpots(normalized)

      const initialIdx = {}
      normalized.forEach((s) => { initialIdx[s.id] = 0 })
      setImageIndexBySpot(initialIdx)
    } catch (e) {
      setError(e.message || 'Failed to load spots')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpots()

    const channel = supabase
      .channel('spots-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'spots' }, () => {
        fetchSpots()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredSpots = useMemo(() => {
    let filtered = spots
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => (s.category || '').toLowerCase() === selectedCategory.toLowerCase())
    }
    
    return filtered
  }, [spots, selectedCategory])

  const handleNextImage = (spotId, imagesLength) => {
    setImageIndexBySpot((prev) => {
      const current = prev[spotId] || 0
      return { ...prev, [spotId]: (current + 1) % Math.max(imagesLength, 1) }
    })
  }

  const handlePrevImage = (spotId, imagesLength) => {
    setImageIndexBySpot((prev) => {
      const current = prev[spotId] || 0
      const next = (current - 1 + Math.max(imagesLength, 1)) % Math.max(imagesLength, 1)
      return { ...prev, [spotId]: next }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <NavBar/>

      <section className="relative py-16 md:py-20 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Best Spots Near Your College
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              Discover the best restaurants, cafes and bars shared by everyone in your college
            </p>
          </div>
        </div>
      </section>

      <section className="py-6 bg-black/60 sticky top-[64px] z-20 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                         {categories.map((category) => (
               <button
                 key={category}
                 onClick={() => setSelectedCategory(category)}
                 className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                   selectedCategory === category
                     ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white'
                     : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                 }`}
               >
                 {category}
               </button>
             ))}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="spinner" />
            </div>
          ) : filteredSpots.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSpots.map((spot) => {
                const images = (spot.images && spot.images.length > 0)
                  ? spot.images
                  : []
                const displayImages = images.length > 0 ? images : []
                const currentIndex = imageIndexBySpot[spot.id] || 0
                const currentImage = displayImages.length > 0
                  ? displayImages[Math.min(currentIndex, displayImages.length - 1)]
                  : null
                const addedOn = formatDate(spot.created_at)

                return (
                  <div key={spot.id} className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 transition-all duration-300 ring-1 ring-white/10 hover:ring-white/20 hover:shadow-2xl">
                    <div className="relative h-80 group overflow-hidden">
                      <div 
                        className={`absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.06] ${currentImage ? 'bg-cover' : 'bg-contain bg-no-repeat'} bg-center`}
                        style={{ backgroundImage: currentImage ? `url('${currentImage}')` : "url('/body.png')" }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0)_60%,rgba(0,0,0,0.35)_100%)]" />

                      {(displayImages.length > 1) && (
                        <>
                          <button
                            onClick={() => handlePrevImage(spot.id, displayImages.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 md:p-2 backdrop-blur border border-white/30 text-lg transition-transform hover:scale-110"
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => handleNextImage(spot.id, displayImages.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 md:p-2 backdrop-blur border border-white/30 text-lg transition-transform hover:scale-110"
                            aria-label="Next image"
                          >
                            ›
                          </button>
                        </>
                      )}

                      {displayImages.length > 0 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                          {displayImages.map((_, idx) => (
                            <span
                              key={idx}
                              className={`h-2 w-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="space-y-3 text-sm md:text-[15px]">
                      {addedOn && (
      <div className="flex items-center gap-2 text-white/70">
        <Calendar className="h-4 w-4 text-cyan-400" />
        <span>
          Added on: <span className="text-white font-medium">{addedOn}</span>
        </span>
      </div>
    )}

    {/* Spot Name */}
    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
      <Type className="h-4 w-4 text-indigo-400" />
      <span className="text-white font-semibold text-lg">{spot.spot_name || 'Untitled Spot'}</span>
    </div>

    {/* Location */}
    {spot.location && (
      <div className="flex items-center gap-2 text-cyan-300">
        <MapPin className="h-4 w-4" />
        <span className="font-medium">{spot.location}</span>
      </div>
    )}

    {/* Category */}
    {(spot.category || spot.subcategory) && (
      <div className="flex items-center gap-2 text-slate-200">
        <Tag className="h-4 w-4 text-pink-400" />
        <span>
          {spot.category}
          {spot.subcategory ? ` • ${spot.subcategory}` : ''}
        </span>
      </div>
    )}

    {/* Tips / Description */}
    {spot.description && (
      <div className="flex items-start gap-2 text-gray-300">
        <Info className="h-4 w-4 text-yellow-400 mt-0.5" />
        <p className="leading-relaxed">{spot.description}</p>
      </div>
    )}
  </div>

  {/* Bottom actions */}
  <div className="mt-6 flex justify-between items-center">
    <span className="text-xs text-white/60">Hover to zoom • Use arrows</span>
    <div className="flex items-center gap-2">
      {currentImage && (
        <a
          href={currentImage}
          target="_blank"
          rel="noreferrer"
          className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
        >
          View Image
        </a>
      )}
    </div>
  </div>
</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center text-gray-300 py-16">
              <p className="text-xl">No spots yet. Be the first to add one!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
