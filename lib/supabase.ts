import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a single supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables for browser client');
    throw new Error(
      'Missing required environment variables for Supabase browser client'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Create a single supabase client for server components
const createServerClient = () => {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[DEBUG] Supabase env check:', {
      SUPABASE_URL_present: Boolean(process.env.SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_URL_present: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL
      ),
      SUPABASE_SERVICE_ROLE_KEY_present: Boolean(
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
    });
    console.error('Missing Supabase environment variables for server client');
    throw new Error(
      'Missing required environment variables for Supabase server client'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
};

// Browser client singleton
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export const getBrowserClient = () => {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
};

export const getServerClient = () => {
  return createServerClient();
};
