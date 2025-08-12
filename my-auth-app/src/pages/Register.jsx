import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    lorem: ''
  });

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by token existence in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      toast.info('You are already logged in. Please sign out to register a new user.', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
    const query = `
    mutation {
      registerUser(
        name: "${formData.name}", 
        email: "${formData.email}", 
        password: "${formData.password}", 
        phone: "${formData.phone}",
        address: "${formData.address}"
      ) {
        id
        name
        email
      }
    }
  `;
    try {
      localStorage.removeItem("token");
      const response = await axios.post('http://localhost:8080/graphql', {
        query
      });

      if (response.data.errors && response.data.errors.length > 0) {
        toast.error(response.data.errors[0].message, {
          position: "bottom-right",
          autoClose: 3000
        });
        return;
      }
      toast.success('Registered successfully!', {
        position: "bottom-right",
        autoClose: 5000
      });
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error('Error during registration', {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  if (isLoggedIn) {
    return (
      <>
        <ToastContainer />
        <div
          style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            fontFamily: 'sans-serif',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '20px',
          }}
        >
          <div>
            <h2>You are already logged in.</h2>
            <p>Please sign out to register a new user.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '20px',
                padding: '12px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer />
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
        {/* Left Section */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#e3f2fd',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            color: '#0d47a1',
            padding: '20px',
          }}
        >
          <h1>Welcome to Our App</h1>
          <p style={{ maxWidth: '300px', textAlign: 'center' }}>
            Register to access exclusive features, manage your profile, and more!
          </p>
        </div>

        {/* Right Section (Form) */}
        <div
          style={{
            flex: 1,
            background: '#f0f2f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>

            {['name', 'email', 'password', 'phone', 'address'].map((field) => (
              <input
                key={field}
                name={field}
                type={field === 'password' ? 'password' : 'text'}
                onChange={handleChange}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              />
            ))}

            <button
              onClick={handleRegister}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
