import { createClient } from "@supabase/supabase-js";

// Retrieve keys with dynamic fallback checks to prevent Next.js static page collection failures during build
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.startsWith("http") ? rawUrl : "https://placeholder-project.supabase.co";

const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseAnonKey = rawAnonKey && rawAnonKey !== "your_supabase_anon_key_here" ? rawAnonKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseServiceKey = rawServiceKey && rawServiceKey !== "your_supabase_service_role_key_here" ? rawServiceKey : "";

// 1. PUBLIC CLIENT: Safe for both frontend client-side components and general backend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. ADMIN CLIENT: Server-side only, uses service role key to bypass RLS for administrative actions
export const supabaseAdmin = typeof window === "undefined" && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase; // Fallback on client-side or if service role is missing
