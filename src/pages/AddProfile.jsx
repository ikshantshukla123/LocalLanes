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
      profileImageUrl =
        "https://your-default-image-url.com/default.png"; // replace with your default image URL
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
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cover bg-top bg-no-repeat" style={{ backgroundImage: "url('/addProfile.webp')" }}>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 text-white"
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-white drop-shadow-lg">
              Create Profile
            </h2>

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border  border-white/30 rounded-xl text-white hover:text-black placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-s-zinc-700 transition-all duration-300 backdrop-blur-sm"
                    required
                >
                    <option value="" disabled>
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
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhoto(e.target.files[0])}
                  placeholder="Choose Profile Photo"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                type="submit"
                disabled={loading}
                className="w-40 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>

            
              <button
                onClick={() => navigate("/Profile")}
                type="button"
                className="w-40 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-600/90 hover:to-purple-700/90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
