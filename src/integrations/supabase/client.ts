// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ecwpsbvkpivkxeyrrojs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjd3BzYnZrcGl2a3hleXJyb2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNDg3MjgsImV4cCI6MjA2MzkyNDcyOH0.fAUPskA6DkSWssmFpHsZQ1Rhf-hAbz9FgiCzzmTJgts";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);