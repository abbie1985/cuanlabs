
import { createClient } from '@supabase/supabase-js';

console.log('[supabaseClient.ts] Initializing Supabase client...');

// Global type declarations for import.meta.env are now in env.d.ts.
// Vite (or your build tool) is responsible for populating import.meta.env at runtime.

// Try actual import.meta.env first (standard for build tools like Vite)
const actualImportMetaEnv = (typeof import.meta !== 'undefined' && import.meta.env)
                            ? import.meta.env
                            : {} as Partial<ImportMetaEnv>;

// Fallback to window.SUBASE_ENV_FALLBACK if actual import.meta.env is not populated (for static HTML setup)
const windowSupabaseEnvFallback = (window as any).SUBASE_ENV_FALLBACK || {};

const supabaseUrlFromEnv = actualImportMetaEnv.NEXT_PUBLIC_SUPABASE_URL || windowSupabaseEnvFallback.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKeyFromEnv = actualImportMetaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || windowSupabaseEnvFallback.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const PLACEHOLDER_SUPABASE_URL = 'https://your-project-ref.supabase.co';
const PLACEHOLDER_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER';

const supabaseUrl = supabaseUrlFromEnv || PLACEHOLDER_SUPABASE_URL;
const supabaseAnonKey = supabaseAnonKeyFromEnv || PLACEHOLDER_SUPABASE_ANON_KEY;


if (supabaseUrl === PLACEHOLDER_SUPABASE_URL || supabaseAnonKey === PLACEHOLDER_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase URL/Anon Key is using placeholder values. This is not recommended for production.\n' +
    'Please ensure NEXT_PUBLIC_SUPABASE_URL (e.g., https://<your-project-ref>.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file (if using a build tool like Vite/Next.js) or defined in the fallback script in index.html for static hosting.\n' +
    'The application tried to find these in `import.meta.env` and then `window.SUBASE_ENV_FALLBACK`.\n' +
    `Currently using: URL='${supabaseUrl}', Key='${supabaseAnonKey.substring(0,10)}...' (key might be a placeholder)\n`+
    'File: services/supabaseClient.ts'
  );
} else {
    console.log('[supabaseClient.ts] Supabase client will be initialized with URL:', supabaseUrl.startsWith('https://your-project-ref') ? supabaseUrl : supabaseUrl.substring(0, supabaseUrl.indexOf('.supabase.co') + 12) + "..." );
    console.log('[supabaseClient.ts] Supabase client will be initialized with Anon Key:', supabaseAnonKey.startsWith('YOUR_SUPABASE_ANON_KEY') ? supabaseAnonKey : supabaseAnonKey.substring(0, 15) + "...");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('[supabaseClient.ts] Supabase client instance created.');
