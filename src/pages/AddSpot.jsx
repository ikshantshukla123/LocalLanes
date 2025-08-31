import React, { useState } from "react";
import { supabase } from "../supaBaseClient";
import { v4 as uuidv4 } from "uuid";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AddSpot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [spotName, setSpotName] = useState("");
  const [spotImage1, setSpotImage1] = useState(null);
  const [spotImage2, setSpotImage2] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Dropdown options
  const categories = {
    "Food & Drinks": [
      "Cafés",
      "Restaurants",
      "Street Food",
      "Bakeries",
      "Night Canteens",
      "Juice / Tea / Coffee Spots",
    ],
    "Hangout & Vibes": [
      "Lounges / Clubs",
      "Rooftop Cafés",
      "Gaming Zones",
      "Music / Open Mic Places",
      "Student Hangout Corners",
      "Gym/sports",
    ],
    "Shopping & Essentials": [
      "Stationery & Print Shops",
      "Grocery Stores",
      "Thrift Shops / Boutiques",
      "Tech / Mobile Repair",
      "Pharmacies",
    ],
    "Outdoor & Chill Spots": [
      "Parks / Gardens",
      "Lakesides / Riversides",
      "Street Murals / Graffiti Walls",
      "Rooftops / Scenic Views",
      "Walking / Cycling Routes",
    ],
    "Entertainment": [
      "Movie Theatres",
      "Sports Screens",
      "Cultural Spaces",
    ],
    "Travel & Access": [
      "Bus Stops",
      "Auto/Taxi/Rickshaw Stands",
      "Metro Stations",
      "Rental Bikes / EVs",
    ],
  };

  const handleSubmitSpot = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      // Ensure user is logged in (avoid RLS policy failures)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const currentUser = userData?.user;
      if (!currentUser) {
        setSubmitError("Please sign in to add a spot.");
        alert("Please sign in to add a spot.");
        return;
      }

      const id = uuidv4();

      let imageUrls = [];

      // Upload first image if selected
      if (spotImage1) {
        const { error: err1 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/1-${spotImage1.name}`, spotImage1, {
            cacheControl: "3600",
            upsert: false,
          });
        if (err1) throw err1;

        const { data: publicUrl1 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/1-${spotImage1.name}`);
        if (publicUrl1?.publicUrl) imageUrls.push(publicUrl1.publicUrl);
      }

      // Upload second image if selected
      if (spotImage2) {
        const { error: err2 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/2-${spotImage2.name}`, spotImage2, {
            cacheControl: "3600",
            upsert: false,
          });
        if (err2) throw err2;

        const { data: publicUrl2 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/2-${spotImage2.name}`);
        if (publicUrl2?.publicUrl) imageUrls.push(publicUrl2.publicUrl);
      }

      // Insert into Supabase table (include user_id for RLS)
      const { error: insertError } = await supabase.from("spots").insert([
        {
          id,
          user_id: currentUser.id,
          spot_name: spotName,
          location,
          category,
          subcategory,
          description,
          image_url: imageUrls, // array of public URLs
        },
      ]);

      if (insertError) throw insertError;

      alert("Spot submitted successfully!");
      setSpotName("");
      setSpotImage1(null);
      setSpotImage2(null);
      setLocation("");
      setCategory("");
      setSubcategory("");
      setDescription("");
    } catch (err) {
      console.error("Error submitting spot:", err);
      const message = err?.message || "Unknown error while submitting spot";
      setSubmitError(message);
      alert("Error submitting spot: " + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/addBack.png')" }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-8 md:py-12">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-white drop-shadow-lg">
              Add a New Spot
            </h2>
            {submitError && (
              <div className="mb-4 md:mb-6 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {submitError}
              </div>
            )}
            <form className="space-y-4 md:space-y-6" onSubmit={(e) => e.preventDefault()}>
              {/* Spot Name */}
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Spot Name</label>
                <input
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base"
                  placeholder="Enter spot name"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                />
              </div>

              {/* Spot Images */}
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Spot Image 1</label>
                <input
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40 cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSpotImage1(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Spot Image 2 (Optional)</label>
                <input
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm md:text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40 cursor-pointer"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSpotImage2(e.target.files?.[0] || null)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Address</label>
                <input
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base"
                  placeholder="Enter spot address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Category</label>
                <select
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory("");
                  }}
                >
                  <option className="text-black" value="">Select Category</option>
                  {Object.keys(categories).map((cat) => (
                    <option className="text-black" key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Dropdown */}
              {category && (
                <div>
                  <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Subcategory</label>
                  <select
                    className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    <option className="text-black" value="">Select Subcategory</option>
                    {categories[category].map((sub) => (
                      <option className="text-black" key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm md:text-base mb-2 font-medium">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 md:py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-base resize-none"
                  placeholder="Share tips, recommendations, or any useful information about this spot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4 md:pt-6">
                <button
                  type="button"
                  onClick={handleSubmitSpot}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full text-base md:text-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? "Submitting..." : "Submit Spot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSpot;

