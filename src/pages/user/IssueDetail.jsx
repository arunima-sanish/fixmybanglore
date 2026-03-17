import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import './IssueDetail.css';

function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getReport(id)
      .then((data) => {
        if (!cancelled) setIssue(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load issue');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="page-loading">Loading issue...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!issue) return <div className="page-error">Issue not found</div>;

  return (
    <div className="issue-detail">
      <Link to="/" className="issue-detail__back">← Back to Home</Link>
      <article className="issue-detail__card">
        <div className="issue-detail__header">
          <h1 className="issue-detail__title">{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>
        {issue.description && (
          <p className="issue-detail__description">{issue.description}</p>
        )}
        {issue.location && (
          <p className="issue-detail__meta"><strong>Location:</strong> {issue.location}</p>
        )}
        {issue.createdAt && (
          <p className="issue-detail__meta"><strong>Reported:</strong> {new Date(issue.createdAt).toLocaleDateString()}</p>
        )}
        {issue.adminNotes && (
          <p className="issue-detail__meta issue-detail__admin-notes"><strong>Admin notes:</strong> {issue.adminNotes}</p>
        )}
      </article>
    </div>
  );
}

export default IssueDetail;
