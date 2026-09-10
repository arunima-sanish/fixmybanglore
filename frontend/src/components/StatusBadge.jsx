import './StatusBadge.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'pending' },
  in_progress: { label: 'In Progress', variant: 'in_progress' },
  resolved: { label: 'Resolved', variant: 'resolved' },
  rejected: { label: 'Rejected', variant: 'rejected' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'pending' };
  return (
    <span className={`status-badge status-badge--${config.variant}`}>
      {config.label}
    </span>
  );
}

export default StatusBadge;
