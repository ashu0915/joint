// import jwtDecode from 'jwt-decode';

export function getUserFromToken() {
    return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // const decoded = jwtDecode(token);
    // return { id: decoded.id, name: decoded.name };
  } catch (err) {
    console.error("Invalid token");
    return null;
  }
}
