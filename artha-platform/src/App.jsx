import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Calculator,
  DatabaseZap,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Shield,
  Sun,
  Table2,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AuthScreen from './components/AuthScreen.jsx';
import AISCalculator from './components/AISCalculator.jsx';
import DealModal from './components/DealModal.jsx';
import DealsTable from './components/DealsTable.jsx';
import MetricCard from './components/MetricCard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useArthaData } from './context/DataContext.jsx';
import {
  average,
  buildTrendData,
  calculateAIS,
  formatCurrency,
  formatNumber,
  sortBySvi,
} from './lib/ais.js';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ais', label: 'AIS Engine', icon: Calculator },
  { id: 'deals', label: 'Deals', icon: Table2 },
  { id: 'compare', label: 'Compare', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Access', icon: Shield },
];

const analyticsBlank = {
  month: '',
  revenue_per_user: 150,
  retention_rate: 88,
  cac: 32,
};

export default function App() {
  const {
    profile,
    loading: authLoading,
    signOut,
    updateRole,
    isSupabaseConfigured,
  } = useAuth();
  const {
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
    refresh,
  } = useArthaData();
  const [theme, setTheme] = useState(() => localStorage.getItem('artha-theme') || 'dark');
  const [activeNav, setActiveNav] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [seedDeal, setSeedDeal] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [analyticsForm, setAnalyticsForm] = useState(analyticsBlank);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem('artha-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!selectedIds.length && deals.length) {
      setSelectedIds(sortBySvi(deals).slice(0, 3).map((deal) => deal.id));
    }
  }, [deals, selectedIds.length]);

  const enrichedDeals = useMemo(
    () => deals.map((deal) => ({ ...deal, metrics: calculateAIS(deal) })),
    [deals],
  );

  const topDeal = useMemo(() => sortBySvi(deals)[0], [deals]);
  const averageSvi = useMemo(
    () => average(enrichedDeals.map((deal) => deal.metrics.svi)),
    [enrichedDeals],
  );
  const averageRoi = useMemo(
    () => average(enrichedDeals.map((deal) => deal.metrics.mvroi)),
    [enrichedDeals],
  );
  const trendData = useMemo(() => buildTrendData(deals), [deals]);
  const selectedDeals = useMemo(
    () => enrichedDeals.filter((deal) => selectedIds.includes(deal.id)),
    [enrichedDeals, selectedIds],
  );
  const comparisonDeals = selectedDeals.length ? selectedDeals : enrichedDeals.slice(0, 3);

  const comparisonChart = useMemo(
    () =>
      comparisonDeals.map((deal) => ({
        name: deal.club_name,
        CPA: Number(deal.metrics.cpa.toFixed(2)),
        CPE: Number(deal.metrics.cpe.toFixed(2)),
        MVROI: Number(deal.metrics.mvroi.toFixed(2)),
        SVI: Number(deal.metrics.svi.toFixed(1)),
      })),
    [comparisonDeals],
  );

  const radarData = useMemo(() => {
    const axes = ['CPA', 'CPE', 'MVROI', 'SVI'];
    return axes.map((axis) => {
      const point = { metric: axis };
      comparisonDeals.forEach((deal) => {
        if (axis === 'CPA') point[deal.club_name] = Math.max(0, 100 - deal.metrics.cpa * 80);
        if (axis === 'CPE') point[deal.club_name] = Math.max(0, 100 - deal.metrics.cpe * 800);
        if (axis === 'MVROI') point[deal.club_name] = Math.min(100, deal.metrics.mvroi * 18);
        if (axis === 'SVI') point[deal.club_name] = deal.metrics.svi;
      });
      return point;
    });
  }, [comparisonDeals]);

  const activity = useMemo(
    () =>
      enrichedDeals
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map((deal) => ({
          id: deal.id,
          title: `${deal.sponsor_name} x ${deal.club_name}`,
          meta: `SVI ${deal.metrics.svi.toFixed(1)} / MVROI ${deal.metrics.mvroi.toFixed(2)}x`,
          time: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
          }).format(new Date(deal.created_at)),
        })),
    [enrichedDeals],
  );

  if (authLoading) {
    return (
      <div className="boot-screen">
        <div className="loader" />
        <span>Loading ARTHA session</span>
      </div>
    );
  }

  if (!profile) {
    return <AuthScreen />;
  }

  const scrollTo = (id) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setSeedDeal(null);
    setModalOpen(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setSeedDeal(null);
    setModalOpen(true);
  };

  const saveDeal = async (form, id) => {
    setNotice('');
    if (id) {
      await updateDeal(id, form);
      setNotice('Deal updated.');
    } else {
      await createDeal(form);
      setNotice('Deal created.');
    }
  };

  const saveScenario = async (payload) => {
    setSeedDeal({
      ...payload,
      club_name: payload.club_name || 'AIS Scenario',
      sponsor_name: payload.sponsor_name || 'Scenario Sponsor',
    });
    setEditingDeal(null);
    setModalOpen(true);
  };

  const requestDelete = async (deal) => {
    const confirmed = window.confirm(`Delete ${deal.sponsor_name} x ${deal.club_name}?`);
    if (!confirmed) return;
    await deleteDeal(deal.id);
    setNotice('Deal deleted.');
  };

  const toggleCompare = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const pickTopThree = () => {
    setSelectedIds(sortBySvi(deals).slice(0, 3).map((deal) => deal.id));
  };

  const exportCsv = () => {
    const headers = [
      'club_name',
      'sponsor_name',
      'deal_value',
      'duration_months',
      'audience',
      'engagement',
      'media_value',
      'cpa',
      'cpe',
      'mvroi',
      'sov',
      'svi',
    ];
    const rows = enrichedDeals.map((deal) => [
      deal.club_name,
      deal.sponsor_name,
      deal.deal_value,
      deal.duration_months,
      deal.audience,
      deal.engagement,
      deal.media_value,
      deal.metrics.cpa.toFixed(4),
      deal.metrics.cpe.toFixed(4),
      deal.metrics.mvroi.toFixed(4),
      deal.metrics.sov.toFixed(2),
      deal.metrics.svi.toFixed(2),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'artha-sponsorship-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('CSV report exported.');
  };

  const exportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFillColor(11, 11, 15);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(198, 167, 94);
    doc.setFontSize(24);
    doc.text('ARTHA Sponsorship Intelligence', 18, 24);
    doc.setTextColor(245, 245, 240);
    doc.setFontSize(11);
    doc.text(`Generated for ${profile.full_name} (${permissions.role})`, 18, 34);
    doc.text(`Total deals: ${deals.length}`, 18, 46);
    doc.text(`Average SVI: ${averageSvi.toFixed(1)}`, 18, 54);
    doc.text(`Top club: ${topDeal?.club_name || 'No deals yet'}`, 18, 62);
    doc.text(`Average MVROI: ${averageRoi.toFixed(2)}x`, 18, 70);
    doc.setTextColor(198, 167, 94);
    doc.text('Top deals', 18, 88);
    doc.setTextColor(245, 245, 240);
    sortBySvi(deals)
      .slice(0, 8)
      .forEach((deal, index) => {
        const metrics = calculateAIS(deal);
        doc.text(
          `${index + 1}. ${deal.club_name} / ${deal.sponsor_name} / SVI ${metrics.svi.toFixed(
            1,
          )} / MVROI ${metrics.mvroi.toFixed(2)}x`,
          18,
          100 + index * 9,
        );
      });
    doc.save('artha-sponsorship-report.pdf');
    setNotice('PDF report exported.');
  };

  const addAnalytics = async (event) => {
    event.preventDefault();
    await createAnalyticsPoint(analyticsForm);
    setAnalyticsForm(analyticsBlank);
    setNotice('Analytics point added.');
  };

  const changeRole = async (role) => {
    try {
      await updateRole(role);
      setNotice('Role updated.');
    } catch (roleError) {
      setError(roleError.message);
    }
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-mark">
            <BarChart3 size={22} />
          </span>
          <div>
            <strong>ARTHA</strong>
            <span>AIS Platform</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeNav === item.id ? 'active' : ''}
              onClick={() => scrollTo(item.id)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-status">
          <DatabaseZap size={17} />
          <div>
            <strong>{isSupabaseConfigured ? 'Supabase live' : 'Local demo mode'}</strong>
            <span>{permissions.role} access</span>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="section-label">Sports Intelligence Platform</p>
            <h1>Commercial performance cockpit</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" onClick={refresh} title="Refresh data">
              <RefreshCw size={17} />
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className="secondary-button compact" type="button" onClick={exportCsv}>
              <Download size={15} />
              CSV
            </button>
            <button className="secondary-button compact" type="button" onClick={exportPdf}>
              <FileText size={15} />
              PDF
            </button>
            {permissions.canCreate && (
              <button className="primary-button compact" type="button" onClick={openCreateModal}>
                <Plus size={16} />
                New deal
              </button>
            )}
            <button className="icon-button" type="button" onClick={signOut} title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {!isSupabaseConfigured && (
          <div className="mode-banner">
            <DatabaseZap size={16} />
            Running with local persistence. Add Supabase credentials to `.env` to use Auth,
            database CRUD, and realtime subscriptions.
          </div>
        )}
        {(error || notice) && (
          <button
            className={error ? 'toast error' : 'toast'}
            type="button"
            onClick={() => {
              setError('');
              setNotice('');
            }}
          >
            {error || notice}
          </button>
        )}

        <section className="overview-grid" id="overview">
          <MetricCard
            icon={Users}
            label="Total Sponsorship Deals"
            value={formatNumber(deals.length)}
            delta="+ realtime"
          />
          <MetricCard
            icon={Gauge}
            label="Average SVI Score"
            value={averageSvi.toFixed(1)}
            delta="+4.8 QoQ"
            tone="teal"
          />
          <MetricCard
            icon={Target}
            label="Top Performing Club"
            value={topDeal?.club_name || 'No deals'}
            delta={topDeal ? `${calculateAIS(topDeal).svi.toFixed(1)} SVI` : 'Add data'}
            tone="green"
          />
          <MetricCard
            icon={Activity}
            label="ROI Metrics"
            value={`${averageRoi.toFixed(2)}x`}
            delta="MVROI avg"
            tone="red"
          />
        </section>

        {loading ? (
          <section className="skeleton-grid">
            <span />
            <span />
            <span />
          </section>
        ) : (
          <>
            <section className="dashboard-grid">
              <AISCalculator canCreate={permissions.canCreate} onSaveScenario={saveScenario} />

              <section className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">MVROI Trends</p>
                    <h2>Value velocity</h2>
                  </div>
                  <span className="panel-chip">Live deals</span>
                </div>
                <ResponsiveContainer width="100%" height={310}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="goldArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(245,245,240,.08)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="mvroi"
                      stroke="var(--gold)"
                      fill="url(#goldArea)"
                      strokeWidth={3}
                    />
                    <Line type="monotone" dataKey="svi" stroke="var(--teal)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </section>

              <section className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">Recent Activity</p>
                    <h2>Deal signals</h2>
                  </div>
                </div>
                <div className="activity-feed">
                  {activity.map((item) => (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <span>{item.time}</span>
                      <strong>{item.title}</strong>
                      <p>{item.meta}</p>
                    </motion.article>
                  ))}
                </div>
              </section>
            </section>

            <DealsTable
              deals={deals}
              selectedIds={selectedIds}
              onToggleCompare={toggleCompare}
              onEdit={openEditModal}
              onDelete={requestDelete}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
            />

            <section className="comparison-grid" id="compare">
              <section className="panel comparison-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">Comparative Analysis</p>
                    <h2>Side-by-side economics</h2>
                  </div>
                  <div className="panel-actions">
                    <button className="secondary-button compact" type="button" onClick={pickTopThree}>
                      Top 3
                    </button>
                    <button
                      className="secondary-button compact"
                      type="button"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={310}>
                  <BarChart data={comparisonChart}>
                    <CartesianGrid vertical={false} stroke="rgba(245,245,240,.08)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar dataKey="SVI" fill="var(--gold)" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="MVROI" fill="var(--teal)" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </section>

              <section className="panel radar-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">AIS Radar</p>
                    <h2>Weighted profile</h2>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={310}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(245,245,240,.14)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    {comparisonDeals.map((deal, index) => (
                      <Radar
                        key={deal.id}
                        dataKey={deal.club_name}
                        stroke={index % 2 ? 'var(--teal)' : 'var(--gold)'}
                        fill={index % 2 ? 'var(--teal)' : 'var(--gold)'}
                        fillOpacity={0.12}
                      />
                    ))}
                    <Legend />
                    <Tooltip content={<ChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </section>
            </section>

            <section className="analytics-grid" id="analytics">
              <section className="panel analytics-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">Analytics Dashboard</p>
                    <h2>Platform KPI tracking</h2>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={analytics}>
                    <CartesianGrid vertical={false} stroke="rgba(245,245,240,.08)" />
                    <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar dataKey="revenue_per_user" fill="var(--gold)" radius={[5, 5, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="retention_rate"
                      stroke="var(--teal)"
                      strokeWidth={3}
                    />
                    <Line type="monotone" dataKey="cac" stroke="var(--danger)" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </section>

              <section className="panel kpi-panel">
                <div className="panel-header">
                  <div>
                    <p className="section-label">KPI Input</p>
                    <h2>Add real-time data</h2>
                  </div>
                </div>
                {permissions.canManageAnalytics ? (
                  <form className="analytics-form" onSubmit={addAnalytics}>
                    <label>
                      Month
                      <input
                        value={analyticsForm.month}
                        onChange={(event) =>
                          setAnalyticsForm((current) => ({ ...current, month: event.target.value }))
                        }
                        required
                        maxLength={12}
                      />
                    </label>
                    <label>
                      Revenue per user
                      <input
                        value={analyticsForm.revenue_per_user}
                        onChange={(event) =>
                          setAnalyticsForm((current) => ({
                            ...current,
                            revenue_per_user: event.target.value,
                          }))
                        }
                        type="number"
                        min="0"
                        required
                      />
                    </label>
                    <label>
                      Retention rate
                      <input
                        value={analyticsForm.retention_rate}
                        onChange={(event) =>
                          setAnalyticsForm((current) => ({
                            ...current,
                            retention_rate: event.target.value,
                          }))
                        }
                        type="number"
                        min="0"
                        max="100"
                        required
                      />
                    </label>
                    <label>
                      CAC
                      <input
                        value={analyticsForm.cac}
                        onChange={(event) =>
                          setAnalyticsForm((current) => ({ ...current, cac: event.target.value }))
                        }
                        type="number"
                        min="0"
                        required
                      />
                    </label>
                    <button className="primary-button" type="submit">
                      <Plus size={16} />
                      Add KPI point
                    </button>
                  </form>
                ) : (
                  <div className="access-note">
                    <Shield size={20} />
                    Viewer role can inspect analytics and export reports.
                  </div>
                )}
              </section>
            </section>

            <section className="panel settings-panel" id="settings">
              <div className="panel-header">
                <div>
                  <p className="section-label">Access Control</p>
                  <h2>Session and role management</h2>
                </div>
                <span className="panel-chip">
                  <Shield size={15} />
                  {profile.role}
                </span>
              </div>
              <div className="settings-grid">
                <div>
                  <span>User</span>
                  <strong>{profile.full_name}</strong>
                  <p>{profile.email}</p>
                </div>
                <label>
                  Active role
                  <select
                    value={profile.role}
                    onChange={(event) => changeRole(event.target.value)}
                    disabled={isSupabaseConfigured}
                  >
                    <option value="admin">Admin</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {isSupabaseConfigured && <p>Managed in Supabase.</p>}
                </label>
                {!isSupabaseConfigured && (
                  <button className="secondary-button" type="button" onClick={resetDemoData}>
                    <RefreshCw size={16} />
                    Reset local data
                  </button>
                )}
                <button className="secondary-button" type="button" onClick={signOut}>
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <DealModal
        open={modalOpen}
        deal={editingDeal}
        seed={seedDeal}
        onClose={() => setModalOpen(false)}
        onSave={saveDeal}
      />
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  );
}
