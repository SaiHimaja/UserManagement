import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  
    const role = localStorage.getItem("role");
    console.log("Role from localStorage: " + role);
  
    if (role !== "ROLE_ADMIN") {
      navigate('/dashboard');
    }
  }, [navigate]);
  const handleSignOut = () => {
    localStorage.removeItem('token');  
    navigate('/login');               
  };

  const handleCleanupImages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:8080/admin/cleanup-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("Image cleanup started.");
      } else {
        toast.error("Failed to start image cleanup.");
      }
    } catch (error) {
      toast.error("Error starting cleanup.");
    }
  };

  
  return (
    <>
      <ToastContainer />
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Admin Dashboard</h1>
          <p style={subheadingStyle}>Welcome Admin, choose an action:</p>

          <ul style={listStyle}>
            <li style={listItemStyle}>
              <Link to="/admin/users" style={linkStyle}>👥 View All Users</Link>
            </li>
          </ul>

          <button onClick={handleSignOut} style={signOutButtonStyle}>
            🚪 Sign Out
          </button>

          <button onClick={handleCleanupImages} style={cleanupButtonStyle}>
  🧹 Clear Unused Images
</button>

        </div>
      </div>
    </>
  );
};
export default AdminDashboard;

// Styles
const containerStyle = {
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(to right, #43cea2, #185a9d)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  boxSizing: 'border-box'
};

const cardStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '450px',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  color: '#333'
};

const headingStyle = {
  fontSize: '28px',
  marginBottom: '10px'
};

const subheadingStyle = {
  fontSize: '16px',
  color: '#555',
  marginBottom: '20px'
};

const listStyle = {
  listStyleType: 'none',
  padding: 0,
  marginBottom: '20px'
};

const listItemStyle = {
  marginBottom: '10px'
};

const linkStyle = {
  textDecoration: 'none',
  color: '#2196F3',
  fontWeight: 'bold',
  fontSize: '16px'
};

const signOutButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#f44336',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '15px'
};

const cleanupButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '15px',
  marginLeft: '10px'
};