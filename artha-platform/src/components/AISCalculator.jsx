import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { Calculator, Save, SlidersHorizontal } from 'lucide-react';
import {
  calculateAIS,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '../lib/ais.js';

const initialInputs = {
  club_name: 'AIS Scenario',
  sponsor_name: 'Scenario Sponsor',
  deal_value: 2500000,
  duration_months: 12,
  audience: 1200000,
  engagement: 148000,
  media_value: 9200000,
  brand_exposure: 74,
  brand_share: 56,
};

export default function AISCalculator({ canCreate, onSaveScenario }) {
  const [inputs, setInputs] = useState(initialInputs);
  const [status, setStatus] = useState('');
  const metrics = useMemo(() => calculateAIS(inputs), [inputs]);

  const chartData = useMemo(
    () => [
      { metric: 'Reach', value: Math.round(metrics.scores.reach) },
      { metric: 'Engage', value: Math.round(metrics.scores.engagement) },
      { metric: 'MVROI', value: Math.round(metrics.scores.mvroi) },
      { metric: 'Exposure', value: Math.round(metrics.scores.exposure) },
      { metric: 'SOV', value: Math.round(metrics.scores.sov) },
      { metric: 'Efficiency', value: Math.round(metrics.scores.efficiency) },
    ],
    [metrics],
  );

  const update = (event) => {
    const { name, value } = event.target;
    setInputs((current) => ({ ...current, [name]: value }));
    setStatus('');
  };

  const saveScenario = async () => {
    if (!canCreate) {
      setStatus('Viewer access can calculate AIS, but cannot save scenarios as deals.');
      return;
    }
    await onSaveScenario(inputs);
    setStatus('Scenario saved to sponsorship deals.');
  };

  return (
    <section className="panel ais-panel" id="ais">
      <div className="panel-header">
        <div>
          <p className="section-label">AIS Engine</p>
          <h2>Live SVI calculator</h2>
        </div>
        <span className="panel-chip">
          <Calculator size={15} />
          Weighted index
        </span>
      </div>

      <div className="ais-layout">
        <div className="ais-inputs">
          <label>
            Sponsorship value
            <input
              name="deal_value"
              value={inputs.deal_value}
              onChange={update}
              type="number"
              min="1"
              step="10000"
            />
          </label>
          <label>
            Audience reach
            <input
              name="audience"
              value={inputs.audience}
              onChange={update}
              type="number"
              min="1"
              step="1000"
            />
          </label>
          <label>
            Engagement
            <input
              name="engagement"
              value={inputs.engagement}
              onChange={update}
              type="number"
              min="1"
              step="1000"
            />
          </label>
          <label>
            Brand exposure
            <input
              name="brand_exposure"
              value={inputs.brand_exposure}
              onChange={update}
              type="range"
              min="0"
              max="100"
            />
            <span className="range-value">{inputs.brand_exposure}%</span>
          </label>
          <label>
            Media value
            <input
              name="media_value"
              value={inputs.media_value}
              onChange={update}
              type="number"
              min="1"
              step="10000"
            />
          </label>
          <label>
            Brand share
            <input
              name="brand_share"
              value={inputs.brand_share}
              onChange={update}
              type="range"
              min="0"
              max="100"
            />
            <span className="range-value">{inputs.brand_share}%</span>
          </label>
        </div>

        <div className="score-stage">
          <motion.div
            className="score-ring"
            style={{ '--score': `${metrics.svi * 3.6}deg` }}
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span>SVI</span>
            <strong>{metrics.svi.toFixed(1)}</strong>
          </motion.div>

          <div className="ais-metrics-grid">
            <span>
              CPA
              <strong>{formatCurrency(metrics.cpa, { maximumFractionDigits: 2 })}</strong>
            </span>
            <span>
              CPE
              <strong>{formatCurrency(metrics.cpe, { maximumFractionDigits: 2 })}</strong>
            </span>
            <span>
              MVROI
              <strong>{metrics.mvroi.toFixed(2)}x</strong>
            </span>
            <span>
              SOV
              <strong>{formatPercent(metrics.sov, 0)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="ais-charts">
        <div className="mini-chart">
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="rgba(245,245,240,.14)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="var(--gold)"
                fill="var(--gold)"
                fillOpacity={0.24}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mini-chart">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke="rgba(245,245,240,.08)" />
              <XAxis dataKey="metric" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                cursor={{ fill: 'rgba(198,167,94,.08)' }}
                contentStyle={{
                  background: 'var(--surface-strong)',
                  border: '1px solid var(--line)',
                  color: 'var(--text)',
                }}
              />
              <Bar dataKey="value" fill="var(--teal)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="calculator-footer">
        <span>
          <SlidersHorizontal size={15} />
          Audience {formatNumber(inputs.audience, { compact: true })} / Engagement{' '}
          {formatNumber(inputs.engagement, { compact: true })}
        </span>
        <button className="primary-button compact" type="button" onClick={saveScenario}>
          <Save size={15} />
          Save as deal
        </button>
      </div>
      {status && <p className="form-success inline-status">{status}</p>}
    </section>
  );
}
