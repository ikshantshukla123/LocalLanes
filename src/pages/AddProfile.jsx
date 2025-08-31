import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import { supabase } from "../supaBaseClient"; 
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function AddProfile() {
  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // Fetch current logged in user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("Error fetching user:", error.message);
      else setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to create a profile.");
      return;
    }

    setLoading(true);
    let profileImageUrl = null;

    // Upload image if provided
    if (profilePhoto) {
      const fileExt = profilePhoto.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, profilePhoto);

      if (uploadError) {
        console.error(uploadError);
        setLoading(false);
        return;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("profile_images")
        .getPublicUrl(filePath);

      profileImageUrl = data.publicUrl;
    } else {
      // default image
      profileImageUrl = "/profiledefault.webp"; // replace with your default image URL
    }

    // Insert into profiles table
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, // linking profile with Supabase Auth user
      email: user.email, // 👈 store email as well
      full_name: fullName,
      branch,
      year,
      profile_image_url: profileImageUrl,
    });

    if (error) {
      console.error(error);
      alert("Error saving profile: " + error.message);
    } else {
      alert("Profile saved successfully!");
      // Redirect to Profile page after successful creation
      navigate("/Profile");
    }

    setLoading(false);
  };

  return (
  <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
  
  <div className="absolute inset-0">
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[180px] animate-pulse"></div>
    <div className="absolute top-20 -right-40 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[180px] animate-pulse delay-2000"></div>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[220px]"></div>
  </div>

  

    <NavBar />


  {/* Centered Form */}
  <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 text-white relative"
      >
        {/* Heading */}
        <h2 className="text-4xl font-extrabold mb-10 text-center text-white drop-shadow-lg">
          ✨ Create Your Profile
        </h2>

        <div className="space-y-6">
          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-300"
            required
          />

          {/* Branch Select */}
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300"
            required
          >
            <option value="" disabled className="text-gray-400">
              Select Branch
            </option>
            <option value="CSE">Computer Science Engineering (CSE)</option>
            <option value="IT">Information Technology (IT)</option>
            <option value="ECE">Electronics & Communication (ECE)</option>
            <option value="EEE">Electrical & Electronics (EEE)</option>
            <option value="ME">Mechanical (ME)</option>
            <option value="CSE-AIML">CSE-AIML (CE)</option>
            <option value="CSE-DS">CSE-Data Science (DS)</option>
            <option value="CSE-AI">CSE-AI (AI)</option>
            <option value="ELCE">ELCE (ELCE)</option>
            <option value="CSIT">CSIT (CSIT)</option>
          </select>

          {/* Year */}
          <input
            type="text"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all duration-300"
            required
          />

          {/* Profile Photo */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
              className="w-full px-5 py-3 bg-white/20 border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-cyan-500 file:text-white hover:file:opacity-80 transition-all duration-300 cursor-pointer"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-40 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

            <button
              onClick={() => navigate("/Profile")}
              type="button"
              className="w-40 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

  );
}
