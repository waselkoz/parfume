import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
