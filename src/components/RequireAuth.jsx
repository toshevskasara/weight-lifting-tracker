import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import Loading from '../pages/Loading.jsx'

function RequireAuth({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/signup" replace />;

  return children;
}

export default RequireAuth