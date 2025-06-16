// This file declares global types for import.meta.env
// It ensures TypeScript recognizes the structure of environment variables.

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  // Add other custom environment variables here as needed, for example:
  // readonly VITE_ANOTHER_VAR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}