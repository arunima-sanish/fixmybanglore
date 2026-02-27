import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import api from '../../services/api';
import './ReportDetail.css';

function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getReport(id)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load report');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="page-loading">Loading report...</div>;
  if (error) return <div className="page-error">{error}</div>;
  if (!report) return <div className="page-error">Report not found</div>;

  return (
    <div className="report-detail">
      <Link to="/my-reports" className="report-detail__back">← Back to My Reports</Link>
      <article className="report-detail__card">
        <div className="report-detail__header">
          <h1 className="report-detail__title">{report.title}</h1>
          <StatusBadge status={report.status || 'pending'} />
        </div>
        {report.description && (
          <p className="report-detail__description">{report.description}</p>
        )}
        {report.address && (
          <p className="report-detail__meta"><strong>Address:</strong> {report.address}</p>
        )}
        {report.category && (
          <p className="report-detail__meta"><strong>Category:</strong> {report.category}</p>
        )}
        {report.severity && (
          <p className="report-detail__meta"><strong>Severity:</strong> {report.severity}</p>
        )}
        {report.contact && (
          <p className="report-detail__meta"><strong>Contact:</strong> {report.contact}</p>
        )}
        {report.createdAt && (
          <p className="report-detail__meta"><strong>Reported:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
        )}
        {report.images?.length > 0 && (
          <div className="report-detail__images">
            {report.images.map((url, i) => (
              <img key={i} src={url} alt="" className="report-detail__img" />
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export default ReportDetail;
