import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Redirects to the login form (on the Users page) when not signed in,
// and to the dashboard when the user's role is not allowed.
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/users" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
