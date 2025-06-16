
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType, ChildrenProps } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';
import type { Session as SupabaseSession, User as SupabaseAuthUser } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_LOAD_TIMEOUT_MS = 10000; // 10 seconds for initial load timeout

export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
  console.log('[AuthContext] AuthProvider component rendering/initializing...');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading to true

  useEffect(() => {
    setLoading(true); 
    console.log('[AuthContext] Initializing AuthProvider (useEffect), setting loading to true.');
    
    let isMounted = true;
    let initialLoadTimeoutId: number | null = null; // Changed NodeJS.Timeout to number

    const getInitialSessionAndProfile = async () => {
      try {
        console.log('[AuthContext] Attempting to get initial session.');
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error('[AuthContext] Error getting initial session:', sessionError.message);
          setCurrentUser(null); 
          setSession(null);
        } else {
          console.log('[AuthContext] Initial session fetched:', currentSession);
          setSession(currentSession);
          if (currentSession?.user) {
            console.log('[AuthContext] Initial session has user, fetching profile for:', currentSession.user.id);
            await fetchAndSetUserProfile(currentSession.user, isMounted); 
          } else {
            console.log('[AuthContext] No user in initial session.');
            setCurrentUser(null);
          }
        }
      } catch (e: any) {
        console.error('[AuthContext] Critical error during initial session/profile fetch:', e.message || e);
        if (isMounted) {
          setCurrentUser(null); 
          setSession(null);
        }
      } finally {
        if (isMounted) {
          if (initialLoadTimeoutId) {
            clearTimeout(initialLoadTimeoutId);
            initialLoadTimeoutId = null; 
            console.log('[AuthContext] Initial load completed before timeout.');
          }
          setLoading(false); 
          console.log('[AuthContext] Initial session and profile processing complete, loading set to false.');
        }
      }
    };

    getInitialSessionAndProfile();
    
    initialLoadTimeoutId = setTimeout(() => {
      if (isMounted && loading) { 
        console.warn(`[AuthContext] Initial Supabase session/profile check timed out after ${INITIAL_LOAD_TIMEOUT_MS / 1000} seconds. Forcing loading to false.`);
        setLoading(false);
      }
      initialLoadTimeoutId = null; 
    }, INITIAL_LOAD_TIMEOUT_MS) as unknown as number; // Ensure timeout ID is number for clearTimeout

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) {
          if(loading) setLoading(false);
          console.log('[AuthContext] onAuthStateChange: Component unmounted, listener processing stopped. Loading (if true) set to false.');
          return;
        }

        console.log('[AuthContext] onAuthStateChange event:', _event, 'New session:', newSession);
        setLoading(true);
        console.log('[AuthContext] onAuthStateChange: setLoading(true)');
        
        setSession(newSession); 
        
        if (newSession?.user) {
          console.log('[AuthContext] New session has user, fetching profile for:', newSession.user.id);
          await fetchAndSetUserProfile(newSession.user, isMounted); 
        } else {
          console.log('[AuthContext] No user in new session, setting currentUser to null.');
          setCurrentUser(null);
        }
        
        if (isMounted) {
            setLoading(false); 
            console.log('[AuthContext] onAuthStateChange processing complete, loading set to false.');
        }
      }
    );

    return () => {
      isMounted = false;
      if (initialLoadTimeoutId) {
        clearTimeout(initialLoadTimeoutId);
        console.log('[AuthContext] Cleanup: Cleared initial load timeout.');
      }
      console.log('[AuthContext] Unsubscribing auth listener.');
      authListener?.subscription?.unsubscribe();
    };
  }, []); 
  
  const fetchAndSetUserProfile = async (authUser: SupabaseAuthUser, isMountedArg?: boolean) => {
    // isMountedArg is for direct calls, internal useEffect uses its own isMounted
    const effectivelyMounted = typeof isMountedArg === 'boolean' ? isMountedArg : true; 

    console.log('[AuthContext] fetchAndSetUserProfile called for user:', authUser?.id);
    if (!authUser) {
        console.warn('[AuthContext] fetchAndSetUserProfile called with null authUser. Aborting.');
        if (effectivelyMounted) setCurrentUser(null); 
        return;
    }
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email, membership_tier, role, referral_code, total_commission_earned, updated_at, created_at')
      .eq('id', authUser.id)
      .single();

    if (!effectivelyMounted) return;

    if (profileError) {
      const isRelationMissingError = profileError.message.includes('relation "public.profiles" does not exist');
      const isRowNotFoundError = profileError.code === 'PGRST116'; 

      if (isRelationMissingError) {
        console.error(
            "CRITICAL: The 'profiles' table does not exist in your Supabase database. Falling back to basic user data. Please ensure it is created, and consider adding a trigger for automatic profile creation on user signup."
        );
      } else if (!isRowNotFoundError) { 
        console.error('[AuthContext] Error fetching profile:', profileError.message || profileError);
      } else {
        console.log(`[AuthContext] Profile not found for user ${authUser.id} (PGRST116). This might be temporary if a trigger is creating it. Will retry or use fallback.`);
      }
      
      const fallbackName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Pengguna Baru';
      const fallbackUser: User = {
        ...authUser, 
        id: authUser.id, // Ensure id is explicitly passed
        email: authUser.email, // Ensure email is explicitly passed
        name: fallbackName,
        membershipTier: 'free', 
        role: 'user',           
        referralCode: undefined,
        total_commission_earned: undefined,
      };
      console.log('[AuthContext] Setting fallback user:', fallbackUser);
      setCurrentUser(fallbackUser);
      return;
    }
    
    if (profileData) {
      const robustName = profileData.name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Pengguna';
      const mergedUser: User = {
        ...authUser, 
        id: authUser.id, // Ensure id from authUser is primary
        name: robustName,
        email: profileData.email || authUser.email, 
        membershipTier: profileData.membership_tier || 'free',
        role: profileData.role || 'user',
        referralCode: profileData.referral_code,
        total_commission_earned: profileData.total_commission_earned,
        created_at: profileData.created_at || authUser.created_at, 
        updated_at: profileData.updated_at || authUser.updated_at, 
      };
      console.log('[AuthContext] Setting merged user:', mergedUser);
      setCurrentUser(mergedUser);
    } else {
       console.warn(`[AuthContext] Profile data was unexpectedly null/undefined for user ${authUser.id}. Using fallback.`);
       const fallbackName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Pengguna Fallback';
       const tempUser: User = {
        ...authUser,
        id: authUser.id, // Ensure id
        email: authUser.email, // Ensure email
        name: fallbackName,
        membershipTier: 'free', 
        role: 'user',
        referralCode: undefined,
        total_commission_earned: undefined,
       };
       console.log('[AuthContext] Setting temporary user due to unexpected null profileData:', tempUser);
       setCurrentUser(tempUser);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string | null }> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) {
      console.error('Login error:', error.message);
      setLoading(false); 
      return { success: false, error: error.message };
    }
    // onAuthStateChange will handle setting user and profile
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string | null }> => {
    setLoading(true);
    // The `name` is passed in `options.data`. This data will be available in `NEW.raw_user_meta_data` 
    // in the Supabase trigger function on the `auth.users` table.
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { 
          name: name, // Pass name here for the trigger to use
          full_name: name // Supabase often picks up full_name for OAuth and display
        } 
      }
    });

    if (signUpError) {
      setLoading(false);
      console.error('Registration error:', signUpError.message);
      return { success: false, error: signUpError.message };
    }

    // Client-side profile insertion is REMOVED.
    // This will be handled by a Supabase Database Trigger on `auth.users` table.
    // The `onAuthStateChange` listener will call `fetchAndSetUserProfile`, 
    // which will fetch the profile once the trigger has created it.

    if (!authData.user) {
        console.warn('[AuthContext] Registration successful but authData.user is null/undefined. This is unexpected if signUpError is null.');
    } else {
        console.log('[AuthContext] Registration for auth.users successful for email:', email, 'User ID:', authData.user.id, '. Profile creation delegated to DB trigger.');
    }
    
    // onAuthStateChange will handle setting user, profile, and final loading state.
    return { success: true }; 
  };
  
  const signInWithGoogle = async (): Promise<void> => {
    console.log('[AuthContext] Attempting Google Sign-In.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error('Google Sign-In error:', error.message);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Attempting logout.');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
  };

  const refreshCurrentUserProfile = async () => {
    console.log('[AuthContext] refreshCurrentUserProfile called.');
    if (session?.user) {
      await fetchAndSetUserProfile(session.user, true); 
      console.log('[AuthContext] Profile refresh complete.');
    } else {
      console.warn('[AuthContext] refreshCurrentUserProfile called, but no active session or user.');
    }
  };
  
  const value: AuthContextType = {
    currentUser,
    session,
    isAuthenticated: !!session?.user,
    isAdmin: !!(currentUser?.role === 'admin'), 
    login,
    logout,
    register,
    signInWithGoogle,
    loading,
    refreshCurrentUserProfile,
  };

  if (loading && !children) { 
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-darktext">Memuat CUANLABS...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {loading && (!currentUser || !session) && (
         <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-3 text-darktext">Memuat CUANLABS...</p>
         </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};