import React, { useEffect, useState } from "react";
import { supabase } from "../supaBaseClient.jsx";
import { v4 as uuidv4 } from "uuid";
import NavBar from "../components/NavBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

// Supabase client is configured in src/supaBaseClient.jsx using Vite env vars

export default function AddSpot() {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  // Spot form fields
  const [spotName, setSpotName] = useState("");
  const [spotImage, setSpotImage] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadProfileName() {
      try {
        if (!user?.email) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("email", user.email)
          .single();
        if (!isMounted) return;
        if (error) {
          console.error("Failed to fetch profile name:", error.message);
          setProfileName("");
        } else {
          setProfileName(data?.full_name || "");
        }
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    }
    loadProfileName();
    return () => { isMounted = false; };
  }, [user]);

  async function handleSubmitSpot() {
    if (!spotName || !spotImage) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const id = uuidv4();

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from("SpotImages")
        .upload(`${id}/${spotImage.name}`, spotImage, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("SpotImages")
        .getPublicUrl(`${id}/${spotImage.name}`);

      const imageUrl = publicUrlData.publicUrl;

      // Insert into DB
      const { error: insertError } = await supabase.from("spots").insert([
        {
          id,
          email: user?.email || "",
          spot_name: spotName,
          image_url: imageUrl,
          location,
          category,
          description,
        },
      ]);

      if (insertError) throw insertError;

      alert("Spot submitted successfully!");
      // reset form
      setSpotName("");
      setSpotImage(null);
      setLocation("");
      setCategory("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Error submitting spot.");
    } finally {
      setLoading(false);
    }
  }

  

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Add a New Spot</h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 text-gray-900">
            {!profileLoading && (
              <p className="text-sm text-gray-600 mb-4">
                Posting as: <span className="font-medium">{profileName || user?.email || 'Unknown User'}</span>
              </p>
            )}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Spot Name
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter spot name"
                  value={spotName}
                  onChange={(e) => setSpotName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Spot Image
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  type="file"
                  onChange={(e) => setSpotImage(e.target.files[0])}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter spot location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., Club, Fest, Facility"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleSubmitSpot}
                disabled={loading}
                className="rounded-md bg-cyan-600 text-white px-4 py-2 font-medium hover:bg-cyan-700 active:bg-cyan-800 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Spot"}
              </button>
            </form>
          </div>
      </div>
    </div>
  );
}
