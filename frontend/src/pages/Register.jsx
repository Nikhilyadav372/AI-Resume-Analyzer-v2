import "../styles/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Register() {
  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const handleSubmit = async (e) => {
const navigate = useNavigate();
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
    const response = await axios.post(
      "http://127.0.0.1:5000/register",
     {
  full_name: name,
  email: email,
  password: password,
}
    );

    console.log(response.data);
    localStorage.setItem("token", response.data.token);

alert(response.data.message);
navigate("/login");
  } catch (error) {
    console.log(error);

    if (error.response) {
      alert(error.response.data.message);
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
        />

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

        <label>Confirm Password</label>

        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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