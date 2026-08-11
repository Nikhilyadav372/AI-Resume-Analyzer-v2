import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/login",
      {
        email: email,
        password: password,
      }
    );
   

    console.log("Response:", response.data);
    localStorage.setItem("token", response.data.token);

navigate("/dashboard");
  } catch (error) {
    console.log("Full Error:", error);

    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    } else if (error.request) {
      console.log("No Response Received");
    } else {
      console.log("Error Message:", error.message);
    }
  }
};
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AI Resume Analyzer</h1>

        <p>Login to your account</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">
            Login
          </button>
        </form>

        <p>
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;