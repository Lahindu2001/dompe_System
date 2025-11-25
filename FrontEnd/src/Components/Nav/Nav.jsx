import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';

function Nav() {
  return (
    <div>
      <ul className="home-ul">
        <li className="home-li">
          <NavLink
            to="#"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Home</h1>
          </NavLink>
        </li>
        
        <li className="home-li">
          <NavLink
            to="/Main"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Home</h1>
          </NavLink>
        </li>
        
        <li className="home-li">
          <NavLink
            to="/sub1"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>add the shop</h1>
          </NavLink>
        </li>
        <li className="home-li">
          <NavLink
            to="/MonthlyPayment"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>add the monthly payment</h1>
          </NavLink>
        </li>
        <li className="home-li">
          <NavLink
            to="/FundsManagement"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            
            <h1>see all detail</h1>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Nav;