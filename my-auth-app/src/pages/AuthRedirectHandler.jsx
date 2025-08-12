import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log(token);

    if (token) {
      localStorage.removeItem("role");  // Clear old role first
      localStorage.setItem("token", token);
      localStorage.setItem("role", "USER");  // Force USER role for now
    }

    navigate("/dashboard");
  }, [navigate]);

  return null;
}
