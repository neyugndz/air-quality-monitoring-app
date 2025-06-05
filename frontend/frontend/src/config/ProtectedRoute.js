import { Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';


const ProtectedRoute = ({element}) =>  {
    const token = sessionStorage.getItem("jwt_token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

     // Decode the JWT to check its expiry time
  try {
    const decodedToken = jwtDecode(token);
    const expiryTime = decodedToken.exp * 1000; // exp is in seconds, convert to ms
    const currentTime = Date.now();

    if (currentTime > expiryTime) {
      sessionStorage.removeItem('jwt_token');
      return <Navigate to="/login" replace />;
    }

    } 
  catch (error) {
    sessionStorage.removeItem('jwt_token');
    return <Navigate to="/login" replace />;
  }

    return element;
}

export default ProtectedRoute;