import React from "react";
import { Link } from 'react-router-dom';
import "./Admin.css";


function Admin() {
  return (
    <div className="home-container">

      <div className="dashboard">
        <h1 className="dashboard-title">Administrator Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to Solar ERP Admin Panel</p>

        <div className="card-grid">
          <div className="card">
          <Link to="/sub1" className="activehome">
            <h2>Add the Shop to the System</h2>
            <p>add the detail</p>
          </Link>
          </div>
          <div className="card">
          <Link to="/MonthlyPayment" className="activehome">
            <h2>add the monthly payment</h2>
            <p>Track and update</p>
            </Link>
          </div>
          <div className="card">
           <Link to="/FundsManagement" className="activehome">
              <h2>Monthly Payment</h2>
              <p>show all</p>
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Admin;
