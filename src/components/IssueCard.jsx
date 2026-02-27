import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import './IssueCard.css';

function IssueCard({ issue, showActions = false, isAdmin = false }) {
  const { id, title, description, status, location, createdAt } = issue;

  return (
    <article className="issue-card">
      <div className="issue-card__header">
        <h3 className="issue-card__title">{title}</h3>
        <StatusBadge status={status} />
      </div>
      {description && (
        <p className="issue-card__description">{description}</p>
      )}
      {location && (
        <p className="issue-card__meta">
          <span className="issue-card__label">Location:</span> {location}
        </p>
      )}
      {createdAt && (
        <p className="issue-card__meta">
          <span className="issue-card__label">Reported:</span>{' '}
          {new Date(createdAt).toLocaleDateString()}
        </p>
      )}
      {showActions && (
        <div className="issue-card__actions">
          {isAdmin ? (
            <Link to={`/admin/issue/${id}`} className="issue-card__btn">
              Update
            </Link>
          ) : (
            <Link to={`/issue/${id}`} className="issue-card__btn">
              View
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

export default IssueCard;
