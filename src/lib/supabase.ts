import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Sanitizes environment variable values:
 * - Trims whitespace and newlines (\r, \n, \t)
 * - Strips accidental surrounding double quotes ("...") or single quotes ('...')
 *   frequently introduced when pasting values into Netlify UI or .env files.
 */
export function cleanEnvString(val: unknown): string {
  if (typeof val !== 'string') return '';
  let str = val.trim();
  if (
    (str.startsWith('"') && str.endsWith('"')) ||
    (str.startsWith("'") && str.endsWith("'"))
  ) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Normalizes URLs:
 * - Sanitizes quotes and whitespace
 * - Removes any trailing slashes to prevent malformed API endpoints
 */
export function cleanUrl(val: unknown): string {
  const str = cleanEnvString(val);
  return str.replace(/\/+$/, '');
}

// Universal env getter safe for Vite browser bundle, SSR, Netlify, and Node test environments
const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : typeof process !== 'undefined' && process.env
    ? process.env
    : {};

// Read from VITE_SUPABASE_URL and common Netlify naming fallbacks
const rawUrl =
  env.VITE_SUPABASE_URL ||
  env.VITE_PUBLIC_SUPABASE_URL ||
  env.SUPABASE_URL;

// Read from VITE_SUPABASE_ANON_KEY and common publishable key fallbacks
const rawAnonKey =
  env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_KEY ||
  env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
  env.SUPABASE_ANON_KEY;

const supabaseUrl = cleanUrl(rawUrl);
const supabaseAnonKey = cleanEnvString(rawAnonKey);

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder-project') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseAnonKey.includes('placeholder')
);

// Fallback dummy client if unconfigured to prevent module-level runtime crashes
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      'https://placeholder-project.supabase.co',
      'placeholder-anon-key-that-prevents-crash',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
