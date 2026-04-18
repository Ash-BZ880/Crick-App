import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import './LoginSignUp.css';

const LoginSignup = ({ isAdmin, setIsAdmin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    if (!username || !password) {
      setError("Please fill in both username and password.");
      return;
    }

    setSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Login failed.");
        return;
      }

      // Optional: Save token
      localStorage.setItem("token", data.token);

      if (setIsAdmin) setIsAdmin(true);
      navigate("/score");
    } catch (err) {
      setError("Server error. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="h6">WELCOME</Typography>
        </Toolbar>
      </AppBar>

      <div className='adjusted-container'>
        <div className="login-container">
          <div className="login-right">
            <h2 className="admin-title">ADMIN CARD</h2>
            <input
              type="text"
              placeholder="User ID"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="error-msg">{error}</p>}
            <button
              className="login-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Login"}
            </button>
            <p className="admin-access-msg">Restricted: Admin credentials required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
