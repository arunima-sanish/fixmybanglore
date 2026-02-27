import { Outlet } from 'react-router-dom';
import { Navbar } from '../components';
import './AdminLayout.css';

function AdminLayout() {
  return (
    <div className="admin-layout app-bg">
      <Navbar />
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
