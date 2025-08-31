import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supaBaseClient";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

// Helper function to safely convert image_url to array
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

const EditSpot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [spotName, setSpotName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [newImage1, setNewImage1] = useState(null);
  const [newImage2, setNewImage2] = useState(null);

  // Categories (same as AddSpot)
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
      "Gym/Sports",
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

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const fetchSpot = async () => {
    try {
      const { data, error } = await supabase
        .from('spots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Check if user owns this spot
      if (data.user_id !== user?.id) {
        setError("You don't have permission to edit this spot.");
        return;
      }

      setSpot(data);
      setSpotName(data.spot_name || "");
      setLocation(data.location || "");
      setCategory(data.category || "");
      setSubcategory(data.subcategory || "");
      setDescription(data.description || "");
    } catch (err) {
      console.error("Error fetching spot:", err);
      setError(err.message || "Failed to load spot");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let imageUrls = coerceToUrlArray(spot?.image_url);

      // Handle new image uploads
      if (newImage1) {
        const { error: err1 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/1-${newImage1.name}`, newImage1, {
            cacheControl: "3600",
            upsert: true,
          });
        if (err1) throw err1;

        const { data: publicUrl1 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/1-${newImage1.name}`);
        if (publicUrl1?.publicUrl) {
          imageUrls[0] = publicUrl1.publicUrl;
        }
      }

      if (newImage2) {
        const { error: err2 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/2-${newImage2.name}`, newImage2, {
            cacheControl: "3600",
            upsert: true,
          });
        if (err2) throw err2;

        const { data: publicUrl2 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/2-${newImage2.name}`);
        if (publicUrl2?.publicUrl) {
          imageUrls[1] = publicUrl2.publicUrl;
        }
      }

      // Update spot in database
      const { error: updateError } = await supabase
        .from('spots')
        .update({
          spot_name: spotName,
          location,
          category,
          subcategory,
          description,
          image_url: imageUrls,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess("Spot updated successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Error updating spot:", err);
      setError(err.message || "Failed to update spot");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this spot? This action cannot be undone.")) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('spots')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSuccess("Spot deleted successfully!");
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      console.error("Error deleting spot:", err);
      setError(err.message || "Failed to delete spot");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && error.includes("permission")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button
              onClick={() => navigate("/home")}
              className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-indigo-600 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/addBack.png')" }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div className="w-full max-w-2xl">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/home")}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </button>
                <h2 className="text-2xl font-bold text-white">Edit Spot</h2>
              </div>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-600/90 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 text-sm text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2">
                {success}
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Spot Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Spot Name</label>
                <input
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter spot name"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                />
              </div>

              {/* Current Images Display */}
              {(() => {
                const imageUrls = coerceToUrlArray(spot?.image_url);
                return imageUrls.length > 0 ? (
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Current Images</label>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Current image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-white/20"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            Image {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* New Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Replace Image 1</label>
                  <input
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage1(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm mb-2">Replace Image 2</label>
                  <input
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage2(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Location</label>
                <input
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter spot location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
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
                  <label className="block text-white/80 text-sm mb-2">Subcategory</label>
                  <select
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
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
                <label className="block text-white/80 text-sm mb-2">Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Tip for visiting"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/80 to-cyan-600/80 hover:from-emerald-600/90 hover:to-cyan-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSpot;
