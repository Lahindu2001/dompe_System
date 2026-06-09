import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import "./Admin.css";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const USERS_URL = `${API}/users`;
const FUNDS_URL = `${API}/funds`;

function Admin() {
  const navigate = useNavigate();
  // States for dashboard data
  const [totalShops, setTotalShops] = useState(0);
  const [totalCash, setTotalCash] = useState(0);
  const [novemberCash, setNovemberCash] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]); // For chart: [{ month: 'Jan', total: 0 }, ...]
  const [fundsData, setFundsData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState(true);

  // Current date: November 26, 2025
  const currentYear = 2025;
  const currentMonth = 11; // November

  // Fetch raw dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch users for total shops
        const usersRes = await axios.get(USERS_URL);
        const shops = usersRes.data.shops || [];
        setTotalShops(shops.length);

        // Fetch funds data
        const fundsRes = await axios.get(FUNDS_URL);
        const fundsShops = fundsRes.data.shops || [];
        setFundsData(fundsShops);

        // Compute available years
        const uniqueYears = [...new Set(
          fundsShops.flatMap(shop => 
            shop.funds.map(fund => fund.year).filter(y => y != null)
          ).sort((a, b) => b - a)
        )];
        setAvailableYears(uniqueYears);

        // Set selected year to the latest available if different
        if (uniqueYears.length > 0 && selectedYear !== uniqueYears[0]) {
          setSelectedYear(uniqueYears[0]);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute derived data based on fundsData and selectedYear
  useEffect(() => {
    if (fundsData.length === 0) return;

    // Calculate total cash (all time)
    const total = fundsData.reduce((sum, shop) => {
      const shopTotal = shop.funds.reduce((s, fund) => s + (fund.cash || 0), 0);
      return sum + shopTotal;
    }, 0);
    setTotalCash(total.toFixed(2));

    // Calculate November cash for selected year
    const monthTotal = fundsData.reduce((sum, shop) => {
      const shopMonthTotal = shop.funds
        .filter(fund => fund.year === selectedYear && fund.month.includes(currentMonth))
        .reduce((s, fund) => s + (fund.cash || 0), 0);
      return sum + shopMonthTotal;
    }, 0);
    setNovemberCash(monthTotal.toFixed(2));

    // Prepare monthly data for selected year chart
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthlyTotals = Array(12).fill(0);
    fundsData.forEach(shop => {
      shop.funds.forEach(fund => {
        if (fund.year === selectedYear) {
          fund.month.forEach(m => {
            if (m >= 1 && m <= 12) {
              monthlyTotals[m - 1] += fund.cash || 0;
            }
          });
        }
      });
    });

    const chartData = monthNames.map((name, idx) => ({
      month: name,
      total: monthlyTotals[idx].toFixed(2)
    }));
    setMonthlyData(chartData);

  }, [fundsData, selectedYear]);

  const handleShopsClick = () => {
    navigate('/add_shop');
  };

  return (
    <div className="home-container">
      <div className="dashboard">
        <h1 className="dashboard-title">Administrator Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to Admin Panel</p>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card clickable" onClick={handleShopsClick}>
            <h3>Total Shops</h3>
            <p className="stat-value">{loading ? 'Loading...' : totalShops}</p>
          </div>
          <div className="stat-card">
            <h3>Total Cash</h3>
            <p className="stat-value">LKR {loading ? 'Loading...' : totalCash}</p>
          </div>
          
        </div>

        {/* Chart Section */}
        {!loading && availableYears.length > 0 && (
          <div className="chart-section">
            <div className="year-selector">
              <label htmlFor="year-select">Select Year:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <h3>Monthly Cash Overview - {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`LKR ${value}`, 'Total Cash']} />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Existing Navigation Cards */}
        <div className="card-grid">
          <div className="card">
            <Link to="/add_shop" className="activehome">
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