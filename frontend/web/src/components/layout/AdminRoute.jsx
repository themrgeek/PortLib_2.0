import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function AdminRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin or librarian
  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;

