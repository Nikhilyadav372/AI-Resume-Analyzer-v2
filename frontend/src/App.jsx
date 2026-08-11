import ProtectedRoute from "./components/ProtectedRoute";
import AnalysisDetails from "./pages/AnalysisDetails";
import Interview from "./pages/Interview";
import JobMatch from "./pages/JobMatch";
import History from "./pages/History";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter> 
    
   <Routes>

  <Route path="/" element={<Home />} />

  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />

  <Route
    path="/history"
    element={
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/job-match"
    element={
      <ProtectedRoute>
        <JobMatch />
      </ProtectedRoute>
    }
  />

  <Route
    path="/interview"
    element={
      <ProtectedRoute>
        <Interview />
      </ProtectedRoute>
    }
  />

</Routes>
    </BrowserRouter>
  );
}

export default App;