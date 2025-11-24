import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';

function Nav() {
  return (
    <div>
      <ul className="home-ul">
        <li className="home-li">
          <NavLink
            to="/Main"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Admin Home</h1>
          </NavLink>
        </li>
        <li className="home-li">
          <NavLink
            to="/sub1"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Add the new One</h1>
          </NavLink>
        </li>
        <li className="home-li">
          <NavLink
            to="/sub2"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            <h1>Inventory Management</h1>
          </NavLink>
        </li>
        <li className="home-li">
          <NavLink
            to="/sub3"
            className={({ isActive }) => `home-a ${isActive ? 'active' : ''}`}
          >
            
            <h1>Product Management</h1>
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Nav;