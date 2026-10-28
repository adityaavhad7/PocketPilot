import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | Error | null; user: User | null; session: Session | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Retrieve initial session from localStorage
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('PocketPilot Auth: Error restoring session:', error.message);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);
    });

    // Listen to real-time auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: AuthError | Error | null }> => {
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase environment variables are not configured in .env.') };
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error };
      } catch (err: any) {
        return { error: err };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: AuthError | Error | null; user: User | null; session: Session | null }> => {
      if (!isSupabaseConfigured) {
        return {
          error: new Error('Supabase environment variables are not configured in .env.'),
          user: null,
          session: null,
        };
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        return { error, user: data.user, session: data.session };
      } catch (err: any) {
        return { error: err, user: null, session: null };
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<{ error: AuthError | Error | null }> => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      }
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<{ error: AuthError | Error | null }> => {
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase environment variables are not configured in .env.') };
      }
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        return { error };
      } catch (err: any) {
        return { error: err };
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
