import React, { useMemo, useState } from "react";
import { supabase } from "../supaBaseClient.jsx";
import { v4 as uuidv4 } from "uuid";
import NavBar from "../components/NavBar.jsx";

// Supabase client is configured in src/supaBaseClient.jsx using Vite env vars

export default function AddSpot() {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [gatePassed, setGatePassed] = useState(false);

  // Spot form fields
  const [spotName, setSpotName] = useState("");
  const [spotImage, setSpotImage] = useState(null);
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const emailFormatValid = useMemo(() => {
    if (!email) return false;
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return basicEmailRegex.test(email);
  }, [email]);

  const isUniversityEmail = useMemo(() => {
    if (!emailFormatValid) return false;
    const domain = email.split("@")[1]?.toLowerCase() || "";
    const eduPattern = /\.edu(\.[a-z]{2,})?$/i;
    const acPattern = /\.ac\.[a-z]{2,}$/i;
    return eduPattern.test(domain) || acPattern.test(domain);
  }, [email, emailFormatValid]);

  const emailError = useMemo(() => {
    if (!emailTouched) return "";
    if (!emailFormatValid) return "Enter a valid email address.";
    if (!isUniversityEmail)
      return "Use your university email (e.g., 'name@university.edu' or 'name@dept.ac.xx').";
    return "";
  }, [emailTouched, emailFormatValid, isUniversityEmail]);

  function handleSubmitGate(event) {
    event.preventDefault();
    setEmailTouched(true);
    if (emailFormatValid && isUniversityEmail) {
      setGatePassed(true);
    }
  }

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
          email,
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
      {/* Email Gate Modal */}
      {!gatePassed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white text-gray-900 w-full max-w-md rounded-lg shadow-xl p-6 mx-4">
            <h2 className="text-xl font-semibold mb-2">
              Verify University Email
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your university email to continue.
            </p>
            <form onSubmit={handleSubmitGate} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  University Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="you@university.edu"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                  required
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-cyan-600 text-white py-2 font-medium hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!emailFormatValid || !isUniversityEmail}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Add Spot Content (shown after email is validated) */}
      <NavBar />
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-4 text-white">Add a New Spot</h1>
        {gatePassed ? (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 text-gray-900">
            <p className="text-sm text-gray-600 mb-4">
              Verified as: <span className="font-medium">{email}</span>
            </p>
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
        ) : (
          <p className="text-gray-300">
            Please verify your university email to continue.
          </p>
        )}
      </div>
    </div>
  );
}
