import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { useLocation } from 'react-router-dom';
import ChatComponent from '../components/ChatComponent';


const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    // Step 1: Check if token exists in URL query params
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      // Step 2: Save token to localStorage
      localStorage.setItem('token', tokenFromUrl);

      // Step 3: Clean URL to remove token query param (optional)
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

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

    axios.get('http://localhost:8080/api/users/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUserInfo(res.data);
    }).catch(() => {
      setUserInfo({ error: 'Unauthorized access' });
    });
  }, []);

  const goToProfile = () => {
    navigate('/profile');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');  
    navigate('/login');               
  };
  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }}>
      {/* Left panel */}
      <div style={{
        flex: '1',
        backgroundColor: '#e3f2fd',
        padding: '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          color: '#0d47a1',
          margin: '0 0 30px 0',
          fontSize: '28px'
        }}>Dashboard</h2>
        
        <div style={{
          background: '#fff',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '320px',
          textAlign: 'left'
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            <strong>Hello:</strong> {userInfo?.name}
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            <strong>Email:</strong> {userInfo?.email}
          </p>
          <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            <strong>Phone:</strong> {userInfo?.phone}
          </p>
          <p style={{ margin: '0', fontSize: '16px' }}>
            <strong>Address:</strong> {userInfo?.address}
          </p>
        </div>

        <div style={{ 
          marginTop: '30px', 
          display: 'flex', 
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            onClick={goToProfile}
            style={{
              padding: '12px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
          >
            Go to My Profile
          </button>
          <button 
            onClick={handleSignOut}
            style={{
              padding: '12px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: '2',
        background: 'linear-gradient(135deg, #bbdefb 0%, #e3f2fd 50%, #f3e5f5 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '600px'
        }}>
          <h1 style={{ 
            color: '#0d47a1', 
            fontSize: '42px', 
            marginBottom: '20px',
            fontWeight: '700',
            margin: '0 0 20px 0'
          }}>
            Welcome Back!
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#1565c0', 
            textAlign: 'center',
            lineHeight: '1.6',
            margin: '0 0 40px 0'
          }}>
            Manage your account, view your personal information, and stay up to date with new features!
          </p>
          
          {/* Dashboard illustration placeholder */}
          <div style={{
            width: '240px',
            height: '240px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            border: '3px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              fontSize: '72px',
              color: '#0d47a1',
              opacity: '0.8'
            }}>
              👤
            </div>
          </div>
          <ChatComponent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;