import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, X } from 'lucide-react';

const blankDeal = {
  club_name: '',
  sponsor_name: '',
  deal_value: 1000000,
  duration_months: 12,
  audience: 500000,
  engagement: 60000,
  media_value: 3000000,
  brand_exposure: 55,
  brand_share: 42,
};

export default function DealModal({ open, deal, seed, onClose, onSave }) {
  const [form, setForm] = useState(blankDeal);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...blankDeal, ...seed, ...deal });
      setError('');
    }
  }, [deal, open, seed]);

  const isEditing = Boolean(deal?.id);

  const title = useMemo(
    () => (isEditing ? 'Edit sponsorship deal' : 'Add sponsorship deal'),
    [isEditing],
  );

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form, deal?.id);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.form
            className="deal-modal"
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
          >
            <div className="modal-header">
              <div>
                <h2>{title}</h2>
                <p>Deal economics feed directly into AIS scoring and comparisons.</p>
              </div>
              <button className="icon-button" type="button" onClick={onClose} title="Close">
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Club name
                <input
                  name="club_name"
                  value={form.club_name}
                  onChange={update}
                  required
                  maxLength={80}
                />
              </label>
              <label>
                Sponsor name
                <input
                  name="sponsor_name"
                  value={form.sponsor_name}
                  onChange={update}
                  required
                  maxLength={80}
                />
              </label>
              <label>
                Deal value
                <input
                  name="deal_value"
                  value={form.deal_value}
                  onChange={update}
                  type="number"
                  min="1"
                  step="10000"
                  required
                />
              </label>
              <label>
                Duration
                <input
                  name="duration_months"
                  value={form.duration_months}
                  onChange={update}
                  type="number"
                  min="1"
                  max="120"
                  required
                />
              </label>
              <label>
                Audience reach
                <input
                  name="audience"
                  value={form.audience}
                  onChange={update}
                  type="number"
                  min="1"
                  step="1000"
                  required
                />
              </label>
              <label>
                Engagement
                <input
                  name="engagement"
                  value={form.engagement}
                  onChange={update}
                  type="number"
                  min="1"
                  step="1000"
                  required
                />
              </label>
              <label>
                Media value
                <input
                  name="media_value"
                  value={form.media_value}
                  onChange={update}
                  type="number"
                  min="1"
                  step="10000"
                  required
                />
              </label>
              <label>
                Brand exposure
                <input
                  name="brand_exposure"
                  value={form.brand_exposure}
                  onChange={update}
                  type="number"
                  min="0"
                  max="100"
                  required
                />
              </label>
              <label>
                Brand share
                <input
                  name="brand_share"
                  value={form.brand_share}
                  onChange={update}
                  type="number"
                  min="0"
                  max="100"
                  required
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={onClose}>
                <X size={16} />
                Cancel
              </button>
              <button className="primary-button" type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save deal'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
