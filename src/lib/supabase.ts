import { createClient } from "@supabase/supabase-js";

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (!isDemoMode && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn(
    "Missing Supabase env vars. Set VITE_DEMO_MODE=true for demo mode, or copy .env.example to .env.local and fill in your Supabase credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
