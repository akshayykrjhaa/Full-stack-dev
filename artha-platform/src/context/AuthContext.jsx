import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

const LOCAL_USERS_KEY = 'artha-local-users';
const LOCAL_SESSION_KEY = 'artha-local-session';

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const persistJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const publicProfile = (user) => ({
  id: user.id,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const loadSupabaseProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    const fallbackProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'ARTHA User',
      role: user.user_metadata?.role || 'viewer',
    };

    const resolvedProfile = data || fallbackProfile;
    setProfile(resolvedProfile);
    return resolvedProfile;
  }, []);

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      setLoading(true);
      setAuthError('');

      if (!isSupabaseConfigured) {
        const localSession = readJson(LOCAL_SESSION_KEY, null);
        if (mounted && localSession?.user) {
          setSession(localSession);
          setProfile(localSession.user);
        }
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;
        setSession(data.session);
        await loadSupabaseProfile(data.session?.user);
      } catch (error) {
        if (mounted) setAuthError(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    boot();

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false;
      };
    }

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      try {
        await loadSupabaseProfile(nextSession?.user);
      } catch (error) {
        setAuthError(error.message);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [loadSupabaseProfile]);

  const signUp = useCallback(async ({ email, password, fullName, role }) => {
    setAuthError('');

    if (!isSupabaseConfigured) {
      const users = readJson(LOCAL_USERS_KEY, []);
      if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An ARTHA account already exists for this email.');
      }

      const user = {
        id: crypto.randomUUID(),
        email,
        password,
        full_name: fullName || email.split('@')[0],
        role,
      };
      const nextUsers = [...users, user];
      persistJson(LOCAL_USERS_KEY, nextUsers);
      const nextSession = {
        access_token: `local-${user.id}`,
        user: publicProfile(user),
      };
      persistJson(LOCAL_SESSION_KEY, nextSession);
      setSession(nextSession);
      setProfile(nextSession.user);
      return nextSession;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'viewer',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'viewer',
      });
      if (profileError) throw profileError;
    }

    if (data.session?.user) {
      setSession(data.session);
      await loadSupabaseProfile(data.session.user);
    }

    return data;
  }, [loadSupabaseProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError('');

    if (!isSupabaseConfigured) {
      const users = readJson(LOCAL_USERS_KEY, []);
      const user = users.find(
        (item) =>
          item.email.toLowerCase() === email.toLowerCase() && item.password === password,
      );
      if (!user) {
        throw new Error('Invalid email or password for the local ARTHA workspace.');
      }
      const nextSession = {
        access_token: `local-${user.id}`,
        user: publicProfile(user),
      };
      persistJson(LOCAL_SESSION_KEY, nextSession);
      setSession(nextSession);
      setProfile(nextSession.user);
      return nextSession;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session);
    await loadSupabaseProfile(data.user);
    return data;
  }, [loadSupabaseProfile]);

  const signOut = useCallback(async () => {
    setAuthError('');

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }

    setSession(null);
    setProfile(null);
  }, []);

  const updateRole = useCallback(async (role) => {
    if (!profile) return;

    if (!isSupabaseConfigured) {
      const users = readJson(LOCAL_USERS_KEY, []);
      const nextUsers = users.map((user) =>
        user.id === profile.id ? { ...user, role } : user,
      );
      persistJson(LOCAL_USERS_KEY, nextUsers);
      const nextProfile = { ...profile, role };
      const nextSession = { ...session, user: nextProfile };
      persistJson(LOCAL_SESSION_KEY, nextSession);
      setProfile(nextProfile);
      setSession(nextSession);
      return;
    }

    throw new Error('Supabase roles are assigned by admins in the users table.');
  }, [profile, session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      profile,
      loading,
      authError,
      setAuthError,
      signUp,
      signIn,
      signOut,
      updateRole,
      isSupabaseConfigured,
    }),
    [authError, loading, profile, session, signIn, signOut, signUp, updateRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
