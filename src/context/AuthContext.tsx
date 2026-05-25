import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

// 1 hour in milliseconds
const AUTO_LOGOUT_TIME = 60 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to reset the auto logout timer
  const resetLogoutTimer = () => {
    // Clear any existing timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    
    // Only set a new timer if the user is logged in
    if (user) {
      logoutTimerRef.current = setTimeout(() => {
        signOut();
      }, AUTO_LOGOUT_TIME);
    }
  };

  // Setup activity listeners to reset the timer
  useEffect(() => {
    if (!user) return;

    // Reset timer on user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleUserActivity = () => {
      resetLogoutTimer();
    };
    
    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Initialize the timer
    resetLogoutTimer();
    
    // Cleanup
    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

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
    
    // Start the auto-logout timer after successful login
    resetLogoutTimer();
    
    return { error: null, isUserAdmin };
  };

  const signOut = async () => {
    // Clear the auto-logout timer when signing out
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
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