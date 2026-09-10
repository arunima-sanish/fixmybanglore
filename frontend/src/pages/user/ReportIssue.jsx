import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ReportIssue.css';

const CATEGORIES = ['pothole', 'streetlight', 'garbage', 'water leak', 'sewage', 'footpath', 'traffic sign', 'encroachment', 'other'];
const SEVERITIES = ['low', 'medium', 'high'];

function ReportIssue() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [severity, setSeverity] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => /^image\/(jpe?g|png|gif|webp)$/i.test(f.type));
    if (valid.length !== files.length) setError('Only JPEG, PNG, GIF or WebP images are allowed.');
    else setError('');
    setSelectedFiles(valid.slice(0, 5)); // max 5
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let imageUrls = [];
      if (selectedFiles.length > 0) {
        const data = await api.uploadImages(selectedFiles);
        imageUrls = data.urls || [];
      }
      await api.createReport({
        title,
        description,
        category,
        address,
        contact,
        severity,
        images: imageUrls,
      });
      navigate('/my-reports');
    } catch (err) {
      setError(err.message ?? 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <h1>Report an Issue</h1>
      <p className="report-intro">
        Describe the issue and location so we can address it.
      </p>
      {error && <div className="report-error">{error}</div>}
      <form onSubmit={handleSubmit} className="report-form">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Pothole on Main Road"
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe the issue in detail..."
        />

        <label htmlFor="address">Address / Location</label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="e.g. MG Road, Bangalore or Koramangala 80ft Road"
        />

        <label htmlFor="severity">Severity</label>
        <select
          id="severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">Select severity (optional)</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label htmlFor="contact">Contact (optional)</label>
        <input
          id="contact"
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email or phone for follow-up"
        />

        <label htmlFor="images">Photos (optional, max 5, 5MB each)</label>
        <input
          id="images"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileChange}
          className="report-form__file"
        />
        {selectedFiles.length > 0 && (
          <p className="report-form__file-hint">
            {selectedFiles.length} file(s) selected
          </p>
        )}

        <button type="submit" disabled={loading} className="report-btn">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}

export default ReportIssue;
