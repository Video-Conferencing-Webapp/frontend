import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function AuthGuard({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${pathname}`} />;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node,
}; 