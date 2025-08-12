import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/Completeprofile';
import AuthRedirectHandler from './pages/AuthRedirectHandler';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path = "/dashboard" element = {<Dashboard/>}/>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/auth-success" element={<AuthRedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
