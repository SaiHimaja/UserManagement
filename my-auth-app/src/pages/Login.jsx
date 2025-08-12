import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingAuth = async () => {

      
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const res = await axios.get('http://localhost:8080/api/users/dashboard', {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('👀 Dashboard Response:', res.data);

          const role = res.data.role;

          if (role) {
            localStorage.setItem('role', role);
            toast.success('Welcome back! Redirecting...', { autoClose: 500 });

            setTimeout(() => {
              if (role === 'ROLE_ADMIN') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }, 500);
          } else {
            console.error('❌ Role not found in dashboard response');
            toast.error('Role not found. Please login again.');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          }

          return;
        } catch (error) {
          console.error('❌ Error during auto login:', error);
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }

      setLoading(false);
    };

    checkExistingAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/users/login', { email, password });
      const { token, email: userEmail, name, role } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', name);

      toast.success('Login successful! Redirecting...', { autoClose: 1500 });

      setTimeout(() => {
        if (role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      // Extract backend error message if present
      const backendMessage =
        err.response?.data?.errors?.[0]?.message || // your errors array message
        (typeof err.response?.data === 'string' ? err.response.data : null) || // string message
        'Login failed. Please try again.';

      toast.error(backendMessage);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <>
      <ToastContainer position="top-center" />

      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          fontFamily: 'sans-serif',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Left Info Panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#e3f2fd',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            color: '#0d47a1',
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Welcome Back!</h1>
          <p style={{ fontSize: '16px', textAlign: 'center', marginTop: '10px' }}>
            Log in to manage your profile, access features, and more.
          </p>
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: '#f0f2f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <form
            onSubmit={handleLogin}
            style={{
              maxWidth: '400px',
              margin: '40px auto',
              padding: '30px',
              border: '1px solid #ccc',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontFamily: 'sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <h2 style={{ textAlign: 'center' }}>Login</h2>

     
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />

            <button
              type="submit"
              style={{
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Login
            </button>

            {/* Google OAuth Button */}
            <a
              href="http://localhost:8080/oauth2/authorization/google"
              style={{ textDecoration: 'none', marginTop: '10px', display: 'block' }}
            >
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#4285F4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Login with Google
              </button>
            </a>

            {/* Register Navigation Link */}
            <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
              Don't have an account?{' '}
              <span
                onClick={() => navigate('/register')}
                style={{ color: '#0d47a1', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Register
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};


export default Login;
