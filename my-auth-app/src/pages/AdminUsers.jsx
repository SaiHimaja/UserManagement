import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const size = 5;

  
  // Get token from localStorage or context (adjust as needed)
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    
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

  const fetchUsers = async () => {
    const query = `
      query {
        getAllUsers(page: ${page}, size: ${size}, search: "${search}") {
          users {
            id
            name
            email
            phone 
            address
            imageUrl
          }
          totalCount
        }
      }
    `;
   
    try {
      const res = await axios.post('http://localhost:8080/graphql', { query });
      const data = res.data.data.getAllUsers;
      setUsers(data.users);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to fetch users");
    }
  };

  // Fetch user dashboard info
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/users/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(res.data);
    } catch (err) {
      console.error("Unauthorized access:", err);
      setUserInfo({ error: 'Unauthorized access' });
    }
  };



  // Fetch user info on component mount
  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, []);

  // Fetch users when page or search changes
  useEffect(() => {
    fetchUsers();
  }, [page, search]);


  const downloadImage = async (imageUrl, fileName) => {
    try {
      const response = await fetch(`http://localhost:8080${imageUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || imageUrl.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(`http://localhost:8080${imageUrl}`, '_blank');
    }
  };
  

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headingStyle}>👥 All Registered Users</h2>

        <input
          type="text"
          placeholder="🔍 Search by email"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(0);
          }}
          style={searchInputStyle}
        />

        <table style={tableStyle}>
          <thead>
            <tr style={theadRowStyle}>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Photo</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '15px' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} style={tableRowStyle}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.address}</td>
                  <td>
                  {user.imageUrl ? (
  <>
    <img 
      src={`http://localhost:8080${user.imageUrl}`} 
      alt="User" 
      style={{ width: '50px', height: '50px', borderRadius: '50%' }} 
    />
    <button 
  onClick={() => downloadImage(user.imageUrl, `user_${user.id}_photo.jpg`)}
  style={{ 
    marginLeft: '10px', 
    background: 'none', 
    border: 'none', 
    color: 'blue', 
    textDecoration: 'underline',
    cursor: 'pointer'
  }}
>
  ⬇ Download
</button>
  </>
) : (
  "No photo"
)}
</td>

                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={paginationStyle}>
          <button
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            disabled={page === 0}
            style={buttonStyle(page === 0)}
          >
            ⬅ Prev
          </button>
          <span style={{ margin: '0 15px' }}>Page {page + 1}</span>
          <button
            onClick={() => setPage(p => (p + 1) * size < totalCount ? p + 1 : p)}
            disabled={(page + 1) * size >= totalCount}
            style={buttonStyle((page + 1) * size >= totalCount)}
          >
            Next ➡
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

const containerStyle = {
  minHeight: '100vh',
  width: '100vw',
  background: 'linear-gradient(to right, #1e3c72, #2a5298)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  boxSizing: 'border-box',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '30px',
  maxWidth: '1000px',
  width: '100%',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Arial, sans-serif',
  color: '#333',
};

const headingStyle = {
  fontSize: '24px',
  marginBottom: '20px',
  textAlign: 'center',
};

const searchInputStyle = {
  padding: '10px',
  width: '100%',
  maxWidth: '300px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  marginBottom: '20px',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
};

const theadRowStyle = {
  backgroundColor: '#f0f0f0',
};

const tableRowStyle = {
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const buttonStyle = (disabled) => ({
  padding: '10px 15px',
  backgroundColor: disabled ? '#ccc' : '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: disabled ? 'default' : 'pointer',
});