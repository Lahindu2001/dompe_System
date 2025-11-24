import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// ------------------- Import Components -------------------
import Users from "./Components/sub2/Users";
import AdminPanel from "./Components/Main/Admin";
import InventoryManage from "./Components/sub1/InventoryMange";
import ProductManager from "./Components/sub3/ProductManager";

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

          {/* Inventory Management */}
          <Route path="/sub2" element={<InventoryManage />} />

          {/* Product Management */}
          <Route path="/sub3" element={<ProductManager />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
