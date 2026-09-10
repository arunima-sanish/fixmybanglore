import { Outlet } from 'react-router-dom';
import { Navbar } from '../components';
import './UserLayout.css';

function UserLayout() {
  return (
    <div className="user-layout app-bg">
      <Navbar />
      <main className="user-layout__main">
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;
