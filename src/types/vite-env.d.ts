/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVICE_ID: string;
    readonly VITE_TEMPLATE_ID: string;
    readonly VITE_USER_ID: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    // Add other environment variables here if needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }