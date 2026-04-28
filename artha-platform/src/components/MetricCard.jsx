import { motion } from 'framer-motion';

export default function MetricCard({ icon: Icon, label, value, delta, tone = 'gold' }) {
  return (
    <motion.article
      className={`metric-card tone-${tone}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="metric-card__top">
        <span className="metric-icon">{Icon && <Icon size={18} />}</span>
        <span className="metric-delta">{delta}</span>
      </div>
      <p>{label}</p>
      <strong>{value}</strong>
    </motion.article>
  );
}
