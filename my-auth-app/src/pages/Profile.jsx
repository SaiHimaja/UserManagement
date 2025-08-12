import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editableName, setEditableName] = useState('');
  const [editablePhoneNum, setEditablePhoneNum]= useState('')
  const [editableAddress, setEditableAddress]=useState('')
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const[previewFile, setPreviewFile] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:8080/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setEditableName(res.data.name);
        setEditablePhoneNum(res.data.phone);
        setEditableAddress(res.data.address);
      } catch {
        toast.error("User is logged out. Please login to view profile");
        setIsLoggedOut(true);
      }
    };
    fetchUser();
  }, []);

  const handleDashboard = () => navigate('/dashboard');
  const handleChangePassword = () => setIsEditingPassword(true);
  const handleClickUpdate = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditableName('');
    setEditablePhoneNum('');
    setEditableAddress('');
    setIsEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setImageFile(null);
    setPreviewFile(null)
  };
  const getProfileImageSrc =() =>{
    if (previewFile) return previewFile;
  if (!user?.imageUrl || user.imageUrl.trim() === '') return '/default-avatar.jpg';


  return `http://localhost:8080${user.imageUrl}`;
  }

  console.log("user.imageUrl:", user?.imageUrl);
 console.log("Resolved image path:", getProfileImageSrc());

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');

    if (isEditingPassword && (!currentPassword || !newPassword)) {
      alert("Please enter both current and new password.");
      return;
    }

    try {
      const formData = new FormData();

      if (isEditingPassword) {
        formData.append("currentPassword", currentPassword);
        formData.append("newPassword", newPassword);
      } else {
        formData.append("name", editableName);
        formData.append("phone", editablePhoneNum);
        formData.append("address", editableAddress);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put('http://localhost:8080/api/users/me', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(prev => ({ ...prev, 
        name: editableName,
        phone: editablePhoneNum,
        address: editableAddress,
        imageUrl: imageFile ? `/uploads/${imageFile.name}` : null
       }));
      alert("Profile updated!");
      setIsEditing(false);
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setImageFile(null);
    } catch (err) {
      alert("Update failed: " + (err.response?.data || "Unknown error"));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(to right, #1e3c72, #2a5298)', // Blue gradient
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px',
      boxSizing: 'border-box'
    }}>
    
      {user ? (
        <div style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Welcome, {user.name}</h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            Manage your profile information and password settings.
          </p>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src={getProfileImageSrc()}
              alt="Profile"
              width="140"
              height="140"
              style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #ccc' }}
            />
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label><strong>Name:</strong></label>
                <input
                  value={editableName}
                  onChange={e => setEditableName(e.target.value)}
                  style={inputStyle}
                />
                <label><strong>Phone Number:</strong></label>
                <input
                value={editablePhoneNum}
                onChange={e=>setEditablePhoneNum(e.target.value)}
                style={inputStyle}
                />

                <label><strong>Address</strong></label>
                <input
                value={editableAddress}
                onChange={e=>setEditableAddress(e.target.value)}
                style={inputStyle}
                />
              </div>

              <div>
                <label><strong>Upload New Image:</strong></label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setPreviewFile(URL.createObjectURL(file));
                    }
                  }}
                  style={inputStyle}
                />
              </div>

              {isEditingPassword && (
                <>
                  <div>
                    <label><strong>Current Password:</strong></label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label><strong>New Password:</strong></label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              {!isEditingPassword && (
                <button onClick={handleChangePassword} style={buttonStyle('#FFA000')}>
                  Change Password
                </button>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleUpdate} style={buttonStyle('#4CAF50', true)}>Update Profile</button>
                <button onClick={handleCancel} style={buttonStyle('#f44336', true)}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={handleClickUpdate} style={buttonStyle('#2196F3', true)}>
              Edit Profile
            </button>
          )}

          <button
            onClick={handleDashboard}
            style={{
              ...buttonStyle('#607D8B', true),
              marginTop: '15px'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      ) : isLoggedOut ? (<div style={{ textAlign: 'center', color: '#fff' }}>
      <h2>User is logged out</h2>
      <p>Please login to view your profile</p>
      <button
        onClick={() => navigate('/login')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '6px',
          backgroundColor: '#FF5722',
          color: '#fff',
          border: 'none'
        }}
      >
        Go to Login
      </button>
    </div>
  ) : (
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      )}
    </div>
  );
};

// Reusable input and button styles
const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginTop: '5px'
};

const buttonStyle = (bg, fullWidth = false) => ({
  padding: '10px',
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  flex: fullWidth ? 1 : undefined,
  width: fullWidth ? '100%' : undefined
});

export default Profile;
