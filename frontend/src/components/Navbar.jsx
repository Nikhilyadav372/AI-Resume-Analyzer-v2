import "../styles/Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {

  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);


  const logout = () => {

    localStorage.removeItem("token");

    navigate("/login");

  };


  const closeMenu = () => {
    setMenuOpen(false);
  };


  return (

    <nav className="navbar">


      <div className="logo">
        🤖 AI Resume Analyzer
      </div>


      <button 
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>



      <div className={`nav-links ${menuOpen ? "open" : ""}`}>


        <NavLink 
          to="/dashboard"
          onClick={closeMenu}
        >
          Dashboard
        </NavLink>


        <NavLink 
          to="/history"
          onClick={closeMenu}
        >
          History
        </NavLink>


        <NavLink 
          to="/profile"
          onClick={closeMenu}
        >
          Profile
        </NavLink>


        <NavLink 
          to="/job-match"
          onClick={closeMenu}
        >
          Job Match
        </NavLink>


        <NavLink 
          to="/interview"
          onClick={closeMenu}
        >
          Interview AI
        </NavLink>



        <button onClick={logout}>
          Logout
        </button>


      </div>


    </nav>

  );

}

export default Navbar;