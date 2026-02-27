import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import './UpdateIssue.css';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

function UpdateIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getIssue(id)
      .then((data) => {
        if (!cancelled) {
          setIssue(data);
          setStatus(data.status ?? 'pending');
          setAdminNotes(data.adminNotes ?? '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load issue');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.updateIssue(id, { status, adminNotes });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message ?? 'Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Loading issue...</div>;
  if (error && !issue) return <div className="page-error">{error}</div>;
  if (!issue) return null;

  return (
    <div className="update-issue-page">
      <h1>Update Issue</h1>
      <div className="update-issue-current">
        <h2>{issue.title}</h2>
        <StatusBadge status={issue.status} />
        {issue.description && <p>{issue.description}</p>}
        {issue.location && <p><strong>Location:</strong> {issue.location}</p>}
      </div>
      {error && <div className="update-error">{error}</div>}
      <form onSubmit={handleSubmit} className="update-form">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label htmlFor="adminNotes">Admin notes</label>
        <textarea
          id="adminNotes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes (optional)"
        />
        <div className="update-actions">
          <button
            type="button"
            className="update-btn-cancel"
            onClick={() => navigate('/admin/dashboard')}
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="update-btn-submit">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateIssue;
