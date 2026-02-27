import { useState, useEffect } from 'react';
import { IssueCard } from '../../components';
import api from '../../services/api';
import './Dashboard.css';

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getIssues(), api.getUsers()])
      .then(([issuesData, usersData]) => {
        if (!cancelled) {
          setIssues(Array.isArray(issuesData) ? issuesData : []);
          setUsers(Array.isArray(usersData) ? usersData : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? 'Failed to load data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="page-error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="dashboard-intro">
        Manage and update reported issues.
      </p>

      <section className="dashboard-section">
        <h2>Users in DB (connection check)</h2>
        <p className="section-hint">Data from MongoDB <code>users</code> collection.</p>
        {users.length === 0 ? (
          <p className="no-issues">No users yet. Sign up to add one.</p>
        ) : (
          <ul className="users-list">
            {users.map((u) => (
              <li key={u.id}>
                <strong>{u.email}</strong> — {u.role}
                {u.createdAt && (
                  <span className="user-date">
                    {' '}({new Date(u.createdAt).toLocaleDateString()})
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Issues</h2>
        <div className="issues-grid">
          {issues.length === 0 ? (
            <p className="no-issues">No issues to manage.</p>
          ) : (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                showActions
                isAdmin
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
