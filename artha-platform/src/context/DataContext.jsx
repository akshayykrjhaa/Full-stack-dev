import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { demoAnalytics, demoDeals } from '../data/demoData.js';
import { isSupabaseConfigured, supabase } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

const localKey = (profile, entity) => `artha-${profile?.id || 'guest'}-${entity}`;

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

const normalizeDealPayload = (payload) => ({
  club_name: payload.club_name.trim(),
  sponsor_name: payload.sponsor_name.trim(),
  deal_value: Number(payload.deal_value),
  duration_months: Number(payload.duration_months),
  audience: Number(payload.audience),
  engagement: Number(payload.engagement),
  media_value: Number(payload.media_value),
  brand_exposure: Number(payload.brand_exposure),
  brand_share: Number(payload.brand_share),
});

const normalizeAnalyticsPayload = (payload) => ({
  month: payload.month.trim(),
  revenue_per_user: Number(payload.revenue_per_user),
  retention_rate: Number(payload.retention_rate),
  cac: Number(payload.cac),
});

export function DataProvider({ children }) {
  const { profile } = useAuth();
  const [deals, setDeals] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const permissions = useMemo(() => {
    const role = profile?.role || 'viewer';
    return {
      role,
      canCreate: role === 'admin' || role === 'analyst',
      canEdit: role === 'admin' || role === 'analyst',
      canDelete: role === 'admin',
      canExport: Boolean(profile),
      canManageAnalytics: role === 'admin' || role === 'analyst',
    };
  }, [profile]);

  const loadLocalData = useCallback(() => {
    const dealsKey = localKey(profile, 'deals');
    const analyticsKey = localKey(profile, 'analytics');
    const storedDeals = readJson(dealsKey, null);
    const storedAnalytics = readJson(analyticsKey, null);

    const initialDeals = storedDeals || demoDeals;
    const initialAnalytics = storedAnalytics || demoAnalytics;
    persistJson(dealsKey, initialDeals);
    persistJson(analyticsKey, initialAnalytics);
    setDeals(initialDeals);
    setAnalytics(initialAnalytics);
  }, [profile]);

  const loadSupabaseData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dealsResponse, analyticsResponse] = await Promise.all([
        supabase
          .from('sponsorship_deals')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('analytics_data')
          .select('*')
          .order('created_at', { ascending: true }),
      ]);

      if (dealsResponse.error) throw dealsResponse.error;
      if (analyticsResponse.error) throw analyticsResponse.error;

      setDeals(dealsResponse.data || []);
      setAnalytics(analyticsResponse.data || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!profile) {
      setDeals([]);
      setAnalytics([]);
      return;
    }

    if (!isSupabaseConfigured) {
      loadLocalData();
      return;
    }

    loadSupabaseData();
  }, [loadLocalData, loadSupabaseData, profile]);

  useEffect(() => {
    if (!profile || !isSupabaseConfigured) return undefined;

    const channel = supabase
      .channel(`artha-dashboard-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sponsorship_deals' },
        () => loadSupabaseData(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analytics_data' },
        () => loadSupabaseData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSupabaseData, profile]);

  const assertPermission = useCallback((allowed, message) => {
    if (!allowed) {
      setError(message);
      throw new Error(message);
    }
  }, []);

  const createDeal = useCallback(async (payload) => {
    assertPermission(
      permissions.canCreate,
      'Your current role can view and export, but cannot create deals.',
    );
    const normalized = normalizeDealPayload(payload);

    if (!isSupabaseConfigured) {
      const nextDeal = {
        ...normalized,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const nextDeals = [nextDeal, ...deals];
      setDeals(nextDeals);
      persistJson(localKey(profile, 'deals'), nextDeals);
      return nextDeal;
    }

    const { data, error: insertError } = await supabase
      .from('sponsorship_deals')
      .insert({ ...normalized, owner_id: profile.id })
      .select('*')
      .single();

    if (insertError) {
      setError(insertError.message);
      throw insertError;
    }
    setDeals((current) => [data, ...current]);
    return data;
  }, [assertPermission, deals, permissions.canCreate, profile]);

  const updateDeal = useCallback(async (id, payload) => {
    assertPermission(
      permissions.canEdit,
      'Your current role can view and export, but cannot edit deals.',
    );
    const normalized = normalizeDealPayload(payload);

    if (!isSupabaseConfigured) {
      const nextDeals = deals.map((deal) =>
        deal.id === id ? { ...deal, ...normalized, updated_at: new Date().toISOString() } : deal,
      );
      setDeals(nextDeals);
      persistJson(localKey(profile, 'deals'), nextDeals);
      return nextDeals.find((deal) => deal.id === id);
    }

    const { data, error: updateError } = await supabase
      .from('sponsorship_deals')
      .update(normalized)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }
    setDeals((current) => current.map((deal) => (deal.id === id ? data : deal)));
    return data;
  }, [assertPermission, deals, permissions.canEdit, profile]);

  const deleteDeal = useCallback(async (id) => {
    assertPermission(permissions.canDelete, 'Only admins can delete sponsorship deals.');

    if (!isSupabaseConfigured) {
      const nextDeals = deals.filter((deal) => deal.id !== id);
      setDeals(nextDeals);
      persistJson(localKey(profile, 'deals'), nextDeals);
      return;
    }

    const { error: deleteError } = await supabase
      .from('sponsorship_deals')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }
    setDeals((current) => current.filter((deal) => deal.id !== id));
  }, [assertPermission, deals, permissions.canDelete, profile]);

  const createAnalyticsPoint = useCallback(async (payload) => {
    assertPermission(
      permissions.canManageAnalytics,
      'Your current role cannot add analytics data.',
    );
    const normalized = normalizeAnalyticsPayload(payload);

    if (!isSupabaseConfigured) {
      const nextPoint = {
        ...normalized,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      const nextAnalytics = [...analytics, nextPoint];
      setAnalytics(nextAnalytics);
      persistJson(localKey(profile, 'analytics'), nextAnalytics);
      return nextPoint;
    }

    const { data, error: insertError } = await supabase
      .from('analytics_data')
      .insert({ ...normalized, owner_id: profile.id })
      .select('*')
      .single();
    if (insertError) {
      setError(insertError.message);
      throw insertError;
    }
    setAnalytics((current) => [...current, data]);
    return data;
  }, [analytics, assertPermission, permissions.canManageAnalytics, profile]);

  const resetDemoData = useCallback(() => {
    if (isSupabaseConfigured) {
      setError('Demo reset is available only when running without Supabase credentials.');
      return;
    }
    persistJson(localKey(profile, 'deals'), demoDeals);
    persistJson(localKey(profile, 'analytics'), demoAnalytics);
    setDeals(demoDeals);
    setAnalytics(demoAnalytics);
  }, [profile]);

  const value = useMemo(
    () => ({
      deals,
      analytics,
      loading,
      error,
      setError,
      permissions,
      createDeal,
      updateDeal,
      deleteDeal,
      createAnalyticsPoint,
      resetDemoData,
      refresh: isSupabaseConfigured ? loadSupabaseData : loadLocalData,
    }),
    [
      analytics,
      createAnalyticsPoint,
      createDeal,
      deals,
      deleteDeal,
      error,
      loadLocalData,
      loadSupabaseData,
      loading,
      permissions,
      resetDemoData,
      updateDeal,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useArthaData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useArthaData must be used within DataProvider');
  return context;
};
