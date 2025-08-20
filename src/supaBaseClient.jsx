// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createStubSupabase() {
  const errorResult = (message) => ({ error: { message }, data: null });
  return {
    auth: {
      async getUser() {
        console.error("Supabase not configured: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
        return { data: { user: null }, error: null };
      },
      onAuthStateChange(_cb) {
        console.error("Supabase not configured: auth listener not active");
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      async signInWithPassword() { return errorResult("Supabase not configured"); },
      async signInWithOAuth() { return errorResult("Supabase not configured"); },
      async signOut() { return { error: null }; },
    },
    storage: {
      from() {
        return {
          async upload() { return errorResult("Supabase not configured"); },
          getPublicUrl() { return { data: { publicUrl: "" }, error: null }; },
        };
      },
    },
    from() {
      return {
        async insert() { return errorResult("Supabase not configured"); },
      };
    },
  };
}

let supabaseInstance;
try {
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars. Define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env");
    supabaseInstance = createStubSupabase();
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
} catch (err) {
  console.error("Failed to initialize Supabase client:", err);
  supabaseInstance = createStubSupabase();
}

export const supabase = supabaseInstance;
