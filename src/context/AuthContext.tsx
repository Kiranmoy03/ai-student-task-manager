import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; session?: Session | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{
    error: Error | null;
    session?: Session | null;
    needsEmailConfirmation?: boolean;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let mounted = true;

    // 1. Initial session restoration
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;
        if (error) {
          // Quietly handle initial check error
          setSession(null);
          setUser(null);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      });

    // 2. Subscribe to auth changes and clean up on unmount
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error, session: null };
      }

      setSession(data.session);
      setUser(data.user);
      return { error: null, session: data.session };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error('An unexpected error occurred during sign in.'),
        session: null,
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error, session: null, needsEmailConfirmation: false };
      }

      // If Supabase returns a valid session (e.g. email confirmation disabled):
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        return { error: null, session: data.session, needsEmailConfirmation: false };
      }

      // If email confirmation is enabled and NO session returned:
      // Do not treat this as a logged-in session.
      if (data?.user && !data?.session) {
        return { error: null, session: null, needsEmailConfirmation: true };
      }

      return { error: null, session: null, needsEmailConfirmation: false };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error('An unexpected error occurred during sign up.'),
        session: null,
        needsEmailConfirmation: false,
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    } finally {
      // Explicitly clear user-specific application state on logout
      setSession(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
