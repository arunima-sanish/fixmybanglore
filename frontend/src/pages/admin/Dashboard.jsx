import { useState, useEffect } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/StatusBadge";
import "./Dashboard.css";

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ Workflow Status Options (underscore keys match backend/status badge)
  const statusOptions = [
    "pending",
    "assigned",           // still supported but no badge config exists
    "in_progress",
    "under_review",
    "resolved",
    "rejected",
  ];

  useEffect(() => {
    let cancelled = false;

    api
      .getReports()
      .then((data) => {
        if (!cancelled) {
          setIssues(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard...</div>;
  if (error) return <div className="page-error">{error}</div>;

  // ✅ Handle Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateReport(id, { status: newStatus });

      setIssues((prev) =>
        prev.map((issue) =>
          issue._id === id ? { ...issue, status: newStatus } : issue
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="dashboard-intro">
        Manage and update reported issues.
      </p>

      <section className="dashboard-section">
        <h2>Reports</h2>

        {issues.length === 0 ? (
          <p className="no-issues">No reports to manage.</p>
        ) : (
          <div className="table-wrapper">
            <table className="issues-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Address</th>
                  <th>Reported By</th>
                  <th>Contact</th>
                  <th>Images</th>
                  <th>Created At</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td>{issue.title}</td>
                    <td>{issue.description}</td>
                    <td>{issue.category}</td>

                    {/* Status Badge */}
                    <td>
                      <StatusBadge status={issue.status || 'pending'} />
                    </td>

                    <td>{issue.severity}</td>
                    <td>{issue.location?.address || "-"}</td>
                    <td>{issue.reportedBy}</td>
                    <td>{issue.contact}</td>

                    {/* Images */}
                    <td>
                      {issue.images?.length > 0
                        ? issue.images.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt="report"
                            width="50"
                            style={{
                              marginRight: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setSelectedImage(img)
                            }
                          />
                        ))
                        : "No Images"}
                    </td>

                    <td>
                      {issue.createdAt
                        ? new Date(
                          issue.createdAt
                        ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ✅ Status Dropdown Instead of Button */}
                    <td>
                      <select
                        className={`status-select ${issue.status}`}
                        value={issue.status}
                        onChange={(e) =>
                          handleStatusChange(issue._id, e.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal">
          <span
            className="close-btn"
            onClick={() => setSelectedImage(null)}
          >
            ✖
          </span>

          <img
            src={selectedImage}
            alt="Full View"
            className="modal-image"
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;