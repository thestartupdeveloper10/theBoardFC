import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any, isUserAdmin: boolean }>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, profileData: Record<string, any>) => Promise<{ error: any, user: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('isAdmin', isAdmin)

  console.log('session id', session?.user?.id)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkUserRole(session?.user?.id);
      setIsLoading(false);
    });
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        checkUserRole(session?.user?.id);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);


  async function checkUserRole(userId: string | undefined) {
    if (!userId) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      console.log('data from db', data)
      
      if (error) {
        console.error('Error checking user role:', error.message);
        setIsAdmin(false);
        return false;
      }
      
      if (!data) {
        console.error('No profile found for user');
        setIsAdmin(false);
        return false;
      }
      
      const isUserAdmin = data.role === 'admin';
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    } catch (err) {
      console.error('Unexpected error checking role:', err);
      setIsAdmin(false);
      return false;
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      return { error, isUserAdmin: false };
    }
    
    // Get the user ID from the session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    let isUserAdmin = false;
    
    if (userId) {
      // Check user role
      const { data, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!roleError && data) {
        isUserAdmin = data.role === 'admin';
        setIsAdmin(isUserAdmin);
      }
    }
    
    return { error: null, isUserAdmin };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signUp = async (email: string, password: string, profileData: Record<string, any> = {}) => {
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Then create their profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          player_number: profileData.player_number || null,
          position: profileData.position || null,
          role: 'player',
          created_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Optionally, you might want to delete the auth user if profile creation fails
        throw profileError;
      }
      
      return { error: null, user: data.user };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { 
        error: error instanceof Error ? error : new Error('An unknown error occurred'), 
        user: null 
      };
    }
  };

  const value = {
    session,
    user,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 