import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route 
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
        ></Route>

      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({children}){
  const token= localStorage.getItem("token");

  if(!token){
    return <Navigate to="/login" />
  }

  return children;
}

export default App;
