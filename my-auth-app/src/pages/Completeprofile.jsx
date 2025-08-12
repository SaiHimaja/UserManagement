import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CompleteProfile = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const email = query.get("email") || "";
  const name = query.get("name") || "";

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");  // you need password for registration
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const mutation = `
      mutation {
        registerUser(
          name: "${name}",
          email: "${email}",
          password: "${password}",
          phone: "${phone}",
          address: "${address}"
        ) {
          id
          name
          email
        }
      }
    `;

    try {
      const res = await axios.post(
        "http://localhost:8080/graphql",
        { query: mutation },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.errors) {
        setError(res.data.errors[0].message);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif", padding: 20, border: "1px solid #ddd", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Complete Your Profile</h2>

      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>Password:</label>
          <input id="password" type="password" required
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="phone" style={{ display: "block", marginBottom: 6 }}>Phone Number:</label>
          <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="address" style={{ display: "block", marginBottom: 6 }}>Address:</label>
          <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={4}
            style={{ width: "100%", padding: 8, fontSize: 14 }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, backgroundColor: "#1976D2", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Saving..." : "Save Profile"}
        </button>

        {error && <p style={{ color: "red", marginTop: 12, textAlign: "center" }}>{error}</p>}
      </form>
    </div>
  );
};

export default CompleteProfile;
