import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supaBaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const isEduEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    const domain = email.split("@")[1] || "";
    return domain.toLowerCase().endsWith(".edu");
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthMessage("");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(async ({ data }) => {
      const currentUser = data?.user ?? null;
      if (currentUser && !isEduEmail(currentUser.email)) {
        setAuthMessage("Only .edu email addresses are allowed.");
        await supabase.auth.signOut();
        setUser(null);
        return;
      }
      setUser(currentUser);
    });

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        const sessionUser = session?.user ?? null;
        if (sessionUser && !isEduEmail(sessionUser.email)) {
          setAuthMessage("Only .edu email addresses are allowed.");
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        setUser(sessionUser);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authMessage, setAuthMessage, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
