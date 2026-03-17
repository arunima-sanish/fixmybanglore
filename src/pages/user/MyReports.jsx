import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import './MyReports.css';

function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyReports()
      .then((data) => {
        if (!cancelled) setReports(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load your reports');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="page-loading">Loading your reports...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="my-reports-page">
      <h1>My Reports</h1>
      <select
              id="place-filter"
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="home-filter__select"
            ></select>
      <p className="my-reports-intro">
        Issues you reported ({user?.email ?? 'you'}).
      </p>
      <div className="my-reports-grid">
        {reports.length === 0 ? (
          <p className="no-reports">You haven&apos;t reported any issues yet. Report one from the home page.</p>
        ) : (
          reports.map((report) => (
            <article key={report.id} className="my-report-card">
              <div className="my-report-card__header">
                <h3 className="my-report-card__title">{report.title}</h3>
                <StatusBadge status={report.status || 'pending'} />
              </div>
              {report.description && (
                <p className="my-report-card__desc">{report.description}</p>
              )}
              {report.address && (
                <p className="my-report-card__meta"><strong>Address:</strong> {report.address}</p>
              )}
              {report.category && (
                <p className="my-report-card__meta"><strong>Category:</strong> {report.category}</p>
              )}
              {report.severity && (
                <p className="my-report-card__meta"><strong>Severity:</strong> {report.severity}</p>
              )}
              {report.createdAt && (
                <p className="my-report-card__meta"><strong>Reported:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
              )}
              {report.images?.length > 0 && (
                <div className="my-report-card__images">
                  {report.images.slice(0, 3).map((url, i) => (
                    <img key={i} src={url} alt="" className="my-report-card__thumb" />
                  ))}
                </div>
              )}
              <Link to={`/report-detail/${report.id}`} className="my-report-card__link">View details</Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default MyReports;
