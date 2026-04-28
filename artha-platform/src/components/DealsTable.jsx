import { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  CheckSquare,
  Edit3,
  Search,
  Square,
  Trash2,
} from 'lucide-react';
import { calculateAIS, formatCurrency, formatNumber } from '../lib/ais.js';

const columns = [
  { key: 'club_name', label: 'Club' },
  { key: 'sponsor_name', label: 'Sponsor' },
  { key: 'deal_value', label: 'Value' },
  { key: 'duration_months', label: 'Duration' },
  { key: 'svi', label: 'SVI' },
  { key: 'mvroi', label: 'MVROI' },
];

export default function DealsTable({
  deals,
  selectedIds,
  onToggleCompare,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'svi', direction: 'desc' });

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return deals
      .map((deal) => ({ ...deal, metrics: calculateAIS(deal) }))
      .filter((deal) => {
        if (!normalizedQuery) return true;
        return `${deal.club_name} ${deal.sponsor_name}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        const direction = sort.direction === 'asc' ? 1 : -1;
        const left =
          sort.key === 'svi'
            ? a.metrics.svi
            : sort.key === 'mvroi'
              ? a.metrics.mvroi
              : a[sort.key];
        const right =
          sort.key === 'svi'
            ? b.metrics.svi
            : sort.key === 'mvroi'
              ? b.metrics.mvroi
              : b[sort.key];
        if (typeof left === 'number' && typeof right === 'number') {
          return (left - right) * direction;
        }
        return String(left).localeCompare(String(right)) * direction;
      });
  }, [deals, query, sort]);

  const updateSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <section className="panel deals-panel" id="deals">
      <div className="panel-header">
        <div>
          <p className="section-label">Deal Management</p>
          <h2>Sponsorship deals</h2>
        </div>
        <div className="table-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Filter sponsorship deals"
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Compare</th>
              {columns.map((column) => (
                <th key={column.key}>
                  <button type="button" onClick={() => updateSort(column.key)}>
                    {column.label}
                    <ArrowDownUp size={13} />
                  </button>
                </th>
              ))}
              {(canEdit || canDelete) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((deal) => {
              const selected = selectedIds.includes(deal.id);
              return (
                <tr key={deal.id}>
                  <td>
                    <button
                      className="row-icon-button"
                      type="button"
                      onClick={() => onToggleCompare(deal.id)}
                      title={selected ? 'Remove from comparison' : 'Add to comparison'}
                    >
                      {selected ? <CheckSquare size={17} /> : <Square size={17} />}
                    </button>
                  </td>
                  <td>
                    <strong>{deal.club_name}</strong>
                    <span>{formatNumber(deal.audience, { compact: true })} reach</span>
                  </td>
                  <td>{deal.sponsor_name}</td>
                  <td>{formatCurrency(deal.deal_value, { compact: true })}</td>
                  <td>{deal.duration_months} mo</td>
                  <td>
                    <span className="score-pill">{deal.metrics.svi.toFixed(1)}</span>
                  </td>
                  <td>{deal.metrics.mvroi.toFixed(2)}x</td>
                  {(canEdit || canDelete) && (
                    <td>
                      <div className="row-actions">
                        {canEdit && (
                          <button
                            className="row-icon-button"
                            type="button"
                            onClick={() => onEdit(deal)}
                            title="Edit deal"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="row-icon-button danger"
                            type="button"
                            onClick={() => onDelete(deal)}
                            title="Delete deal"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            <strong>No deals match this filter.</strong>
            <span>Clear the search field or add a new sponsorship deal.</span>
          </div>
        )}
      </div>
    </section>
  );
}
