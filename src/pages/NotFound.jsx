import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from '../components/NavBar'
import { 
  Home, 
  MapPin, 
  Plus, 
  Users, 
  Star, 
  TrendingUp, 
  Award,
  ArrowRight,
  Search,
  Heart,
  Calendar,
  MessageCircle
} from 'lucide-react'

export default function NotFound() {
  const { user } = useAuth()

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Discover Hidden Gems",
      description: "Find the best local spots shared by college students"
    },
    {
      icon: <Plus className="h-6 w-6" />,
      title: "Share Your Favorites",
      description: "Add and share your favorite hangout spots"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Driven",
      description: "Real recommendations from your peers"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Curated Content",
      description: "Quality spots verified by the community"
    }
  ]

  const upcomingFeatures = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Spot Ratings & Reviews",
      description: "Rate and review your favorite spots"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: "Event Planning",
      description: "Plan meetups and events at great spots"
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "Community Chat",
      description: "Connect with other students in your area"
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Spot Challenges",
      description: "Complete challenges and earn badges"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
                     <div className="mb-8">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full mb-6">
               <Star className="h-10 w-10 text-white" />
             </div>
             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
               Welcome to Local-Lanes
             </h1>
             <p className="text-xl text-gray-300 max-w-2xl mx-auto">
               Discover amazing spots, connect with your community, and explore the best 
               hangout places around your college!
             </p>
           </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              <Home className="h-5 w-5" />
              Explore Spots
            </Link>
            {user && (
              <Link
                to="/AddSpot"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Add New Spot
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              What Makes Local-Lanes Special
            </h2>
            <p className="text-gray-300 text-lg">
              Discover why hundred of students choose Local-Lanes for their adventures
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
                 <div className="max-w-4xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center justify-items-center">
             <div className="bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-xl p-6 border border-cyan-500/30 w-full max-w-xs">
               <div className="text-3xl font-bold text-cyan-400 mb-2">20+</div>
               <div className="text-gray-300 text-sm">Spots Shared</div>
             </div>
             <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl p-6 border border-emerald-500/30 w-full max-w-xs">
               <div className="text-3xl font-bold text-emerald-400 mb-2">100+</div>
               <div className="text-gray-300 text-sm">Happy Students</div>
             </div>
             <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30 w-full max-w-xs">
               <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
               <div className="text-gray-300 text-sm">Community</div>
             </div>
           </div>
         </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-300 text-lg">
              Exciting new features we're working on for you
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Exploring?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of students discovering amazing spots near their colleges
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
              >
                Start Exploring
                <ArrowRight className="h-5 w-5" />
              </Link>
              {!user && (
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Heart className="h-5 w-5" />
                  Join Community
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Local-Lanes. Made with ❤️ for college students everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}
