import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { Login, Register } from './pages/auth';
import { Home, ReportIssue, MyReports, IssueDetail, ReportDetail } from './pages/user';
import { Dashboard, UpdateIssue } from './pages/admin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route
              path="report"
              element={
                <ProtectedRoute>
                  <ReportIssue />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-reports"
              element={
                <ProtectedRoute>
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route path="report-detail/:id" element={<ReportDetail />} />
            <Route path="issue/:id" element={<IssueDetail />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="issue/:id" element={<UpdateIssue />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
