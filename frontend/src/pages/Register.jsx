import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    console.log({
      name,
      email,
      password,
    });

    try {
      const response = await api.post("/register", {
        full_name: name,
        email: email,
        password: password,
      });

      console.log(response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      alert(response.data.message);

      navigate("/login");
    } catch (error) {
      console.log("Full Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);

        alert(
          error.response.data.message || "Registration failed"
        );
      } else if (error.request) {
        alert("No response from server");
      } else {
        alert("Server Error");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>🤖 AI Resume Analyzer</h1>

        <p>Create your account</p>

        <form onSubmit={handleSubmit}>

          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">
            Create Account
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;