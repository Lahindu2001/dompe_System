import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ------------------- Import Components -------------------
import AdminPanel from "./Components/Main/Admin";
import Users from "./Components/sub2/Users";
import MonthlyPayment from "./Components/MonthlyPayment/MonthlyPayment";
import FundsManagement from "./Components/FundsManagement/FundsManagement";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to mainAdminhome */}
          <Route path="/" element={<Navigate to="/main" replace />} />

          {/* Home Page */}
          <Route path="/Main" element={<AdminPanel />} />

          {/* User Management */}
          <Route path="/sub1" element={<Users />} />

          {/* Monthly Payment Management */}
          <Route path="/MonthlyPayment" element={<MonthlyPayment />} />

  {/* Monthly Payment Management */}
          <Route path="/FundsManagement" element={<FundsManagement />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
