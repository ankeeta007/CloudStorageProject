import React, { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    // Demo login for submission
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("cloudStorageLoggedIn", "true");
      onLogin();
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">☁</div>

        <h1>CloudStorage</h1>
        <p className="login-subtitle">
          Secure file management
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="login-error">{error}</p>
          )}

          <button type="submit" className="login-button">
            Login
          </button>

        </form>

        <p className="login-footer">
          Cloud-based storage service
        </p>

      </div>
    </div>
  );
}

export default Login;