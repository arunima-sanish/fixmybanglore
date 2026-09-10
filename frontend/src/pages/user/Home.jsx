import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import './Home.css';


const AREAS = ['All', 'Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'MG Road'];
const QUOTES = [
  { text: 'A city that works is a city where citizens speak up.', author: 'Fix My Bangalore' },
  { text: 'Every reported issue is a step toward a better Bangalore.', author: 'Community' },
  { text: 'Small actions, big impact. Report. Track. Improve.', author: 'Civic responsibility' },
  { text: 'Your voice helps fix our streets, lights, and neighbourhoods.', author: 'Together we can' },
];

const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=85',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=85',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=85',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=85',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=85',
];

function Home() {
  const { user } = useAuth();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('All');

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  // Load reports whenever selectedPlace changes (you will see /api/reports?... in Network)
  useEffect(() => {
    let cancelled = false;

    const fetchReports = async () => {
      try {
        setLoading(true);
        const params =
          selectedPlace && selectedPlace !== 'All'
            ? `?place=${encodeURIComponent(selectedPlace)}`
            : '';
        const res = await fetch(`/api/reports${params}`);
        const data = await res.json();
        if (!cancelled) {
          setReports(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Failed to load community reports');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [selectedPlace]);


  // Load list of places once (from /api/places)
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await api.getPlaces();
        setPlaces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    fetchPlaces();
  }, []);


  return (
    <div className="home-page">
      <section className="home-landing">
        <div className="home-landing__overlay" />
        <div className="home-landing__content">
          <h1 className="home-landing__title">Fix My Bangalore</h1>
          <p className="home-landing__tagline">Report civic issues. See what’s been reported. Help make our city better.</p>
          <p className="home-landing__subtitle">
            Potholes, streetlights, garbage, water leaks — report them in one place and track progress.
          </p>
          {user && user.role !== 'admin' ? (
            <Link to="/report" className="home-landing__cta">
              Report an issue
            </Link>
          ) : !user ? (
            <div className="home-landing__cta-group">
              <Link to="/login" className="home-landing__cta">Log in</Link>
              <Link to="/register" className="home-landing__cta home-landing__cta--secondary">Sign up</Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="home-content">
        <div className="home-section-header">
          <h2 className="home-section-title">Community Reports</h2>
          <div className="home-filter">
            <label htmlFor="place-filter">Filter by Place:</label>
            <select
              id="place-filter"
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="home-filter__select"
            >
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="home-intro">Recent issues reported by citizens across Bangalore.</p>

        {loading ? (
          <div className="page-loading">Loading reports...</div>
        ) : error ? (
          <div className="page-error">{error}</div>
        ) : reports.length === 0 ? (
          <div className="no-issues">No issues reported yet. Be the first!</div>
        ) : (
          <div className="reports-list">
            {(selectedPlace === 'All'
              ? reports
              : reports.filter((r) =>
                  r.address?.toLowerCase().includes(selectedPlace.toLowerCase())
                )
            )
              .slice(0, 6)
              .map((report) => (
              <article key={report.id} className="report-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 className="report-card__title">{report.title}</h3>
                  <StatusBadge status={report.status || 'pending'} />
                </div>
                {report.description && (
                  <p className="report-card__desc">{report.description}</p>
                )}
                <div className="report-card__footer">
                  <p className="report-card__meta">
                    <strong>Category:</strong> {report.category || 'General'}
                  </p>
                  <p className="report-card__meta">
                    <strong>Address:</strong> {report.address || 'N/A'}
                  </p>
                  <Link to={`/issue/${report.id}`} className="my-report-card__link" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="home-carousel-wrap">
        <h2 className="home-carousel-title">Our city in focus</h2>
        <p className="home-carousel-subtitle">Every report helps make Bangalore safer and cleaner.</p>
        <div className="home-carousel">
          <div className="home-carousel__track">
            {[...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES].map((src, i) => (
              <div key={i} className="home-carousel__slide">
                <img src={src} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-quotes">
        <div className="home-quotes__container">
          {QUOTES.map((q, i) => (
            <blockquote
              key={i}
              className={`home-quotes__quote ${i === quoteIndex ? 'home-quotes__quote--active' : ''}`}
            >
              <p className="home-quotes__text">"{q.text}"</p>
              <cite className="home-quotes__author">— {q.author}</cite>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
