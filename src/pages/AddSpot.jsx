import React, { useState } from "react";
import { supabase } from "../supaBaseClient"; // adjust import as per your setup
import { v4 as uuidv4 } from "uuid";
import NavBar from "../components/NavBar";

const AddSpot = () => {
  const [spotName, setSpotName] = useState("");
  const [spotImage1, setSpotImage1] = useState(null);
  const [spotImage2, setSpotImage2] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Dropdown options
  const categories = {
    "Club": ["Cultural", "Technical", "Sports"],
    "Fest": ["Annual", "Departmental", "Cultural"],
    "Facility": ["Library", "Cafeteria", "Hostel", "Playground"],
  };

  const handleSubmitSpot = async () => {
    setLoading(true);
    try {
      const id = uuidv4();

      let imageUrls = [];

      // Upload first image if selected
      if (spotImage1) {
        const { data: img1, error: err1 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/1-${spotImage1.name}`, spotImage1, {
            cacheControl: "3600",
            upsert: false,
          });
        if (err1) throw err1;

        const { data: publicUrl1 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/1-${spotImage1.name}`);
        imageUrls.push(publicUrl1.publicUrl);
      }

      // Upload second image if selected
      if (spotImage2) {
        const { data: img2, error: err2 } = await supabase.storage
          .from("SpotImages")
          .upload(`${id}/2-${spotImage2.name}`, spotImage2, {
            cacheControl: "3600",
            upsert: false,
          });
        if (err2) throw err2;

        const { data: publicUrl2 } = supabase.storage
          .from("SpotImages")
          .getPublicUrl(`${id}/2-${spotImage2.name}`);
        imageUrls.push(publicUrl2.publicUrl);
      }

      // Insert into Supabase table
      const { error: insertError } = await supabase.from("spots").insert([
        {
          id,
          spot_name: spotName,
          location,
          category,
          subcategory,
          description,
          images: imageUrls, // store as array in Postgres
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
      console.error("Error submitting spot:", err.message);
      alert("Error submitting spot: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/addBack.png')" }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-5">
            <h2 className="text-xl font-bold mb-4 text-center text-white drop-shadow-lg">Add a New Spot</h2>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              {/* Spot Name */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Spot Name</label>
                <input
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter spot name"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                />
              </div>

              {/* Spot Images */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Spot Image 1</label>
                <input
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  type="file"
                  onChange={(e) => setSpotImage1(e.target.files[0])}
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Spot Image 2</label>
                <input
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  type="file"
                  onChange={(e) => setSpotImage2(e.target.files[0])}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Location</label>
                <input
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Enter spot location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Category</label>
                <select
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
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
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
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
                  rows={3}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  placeholder="Short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmitSpot}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full"
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

