import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './MonthlyPayment.css';  // New CSS file below

const USERS_URL = 'http://localhost:5000/users';
const PAYMENTS_URL = 'http://localhost:5000/payments';

function MonthlyPayment() {
  // States
  const [searchRegNo, setSearchRegNo] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [payments, setPayments] = useState([]); // New state for AddFunds details
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),  // Default to current year
    month: [],  // Array of selected month numbers (1-12)
    cash: 500  // Default to 500
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disabledMonths, setDisabledMonths] = useState([]); // New state for disabled months

  // Month names for display
  const monthNames = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' }
  ];

  // Helper to get month names from IDs
  const getMonthNames = (monthIds) => {
    if (!Array.isArray(monthIds) || monthIds.length === 0) return 'N/A';
    return monthIds
      .map(id => monthNames.find(m => m.id === id)?.name || id.toString())
      .join(', ');
  };

  // Compute disabled months based on current year and payments
  useEffect(() => {
    if (payments.length > 0 && formData.year) {
      const paidForYear = payments.filter(p => p.year === formData.year);
      const paidMonths = paidForYear.flatMap(p => p.month || []);
      setDisabledMonths([...new Set(paidMonths)]);
    } else {
      setDisabledMonths([]);
    }
  }, [payments, formData.year]);

  // Fetch payments for a reg_no
  const fetchPayments = async (regNo) => {
    try {
      const res = await axios.get(`${PAYMENTS_URL}/reg/${regNo}`);
      setPayments(res.data.payments || []);
      setError('');
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]);
      setError('Error loading payment history');
    }
  };

  // Search user by reg_no
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRegNo) {
      setError('Please enter a Reg. No');
      return;
    }
    try {
      const res = await axios.get(`${USERS_URL}/reg/${searchRegNo}`);
      setSelectedUser(res.data.shop);
      setError('');
      setSuccess('');
      // Fetch payments for this user
      await fetchPayments(searchRegNo);
    } catch (err) {
      setError('Shop not found');
      setSelectedUser(null);
      setPayments([]);
    }
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchRegNo('');
    setSelectedUser(null);
    setPayments([]);
    setDisabledMonths([]);
    setFormData({ year: new Date().getFullYear(), month: [], cash: 500 });
    setError('');
    setSuccess('');
  };

  // Handle year change
  const handleYearChange = (e) => {
    setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }));
  };

  // Handle month toggle (multiple select)
  const handleMonthToggle = (monthId) => {
    if (disabledMonths.includes(monthId)) return; // Prevent toggle if disabled
    setFormData(prev => ({
      ...prev,
      month: prev.month.includes(monthId)
        ? prev.month.filter(m => m !== monthId)
        : [...prev.month, monthId]
    }));
  };

  // Handle cash change
  const handleCashChange = (e) => {
    const value = parseFloat(e.target.value) || 500;
    setFormData(prev => ({ ...prev, cash: Math.max(500, value) }));  // Min 500
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      setError('Please search and select a shop first');
      return;
    }
    if (formData.month.length === 0) {
      setError('At least one month must be selected');
      return;
    }
    try {
      const res = await axios.post(PAYMENTS_URL, {
        reg_no: selectedUser.reg_no,
        year: formData.year,
        month: formData.month,
        cash: formData.cash
      });
      setSuccess('Payment added successfully!');
      setError('');
      // Reset form but keep user and refetch payments
      setFormData({ year: new Date().getFullYear(), month: [], cash: 500 });
      await fetchPayments(selectedUser.reg_no); // Refresh payments list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment');
      setSuccess('');
    }
  };

  // Years dropdown options (2020 to 2026, based on current date Nov 2025)
  const years = [];
  for (let y = 2020; y <= 2026; y++) {
    years.push(y);
  }

  // Calculate total paid
  const totalPaid = payments.reduce((sum, p) => sum + (p.cash || 0), 0).toFixed(2);

  // Helper to check if month is disabled
  const isMonthDisabled = (monthId) => disabledMonths.includes(monthId);

  return (
    <div className="monthly-payment-section" id="monthly-payment-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Add Monthly Payment</h2>
        <p className="subtitle">Manage shop funds and payments</p>
      </div>

      {/* Search Form */}
      <div className="search-container">
        <h3>🔍 Search Shop by Reg. No</h3>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="number"
            placeholder="Enter Reg. No"
            value={searchRegNo}
            onChange={(e) => setSearchRegNo(e.target.value)}
            required
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        {selectedUser && (
          <button className="clear-search-btn" onClick={handleClearSearch}>
            Clear Search
          </button>
        )}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      {/* Show Selected User Details */}
      {selectedUser && (
        <div className="user-details">
          <h3>📋 Shop Details</h3>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Reg. No:</strong> {selectedUser.reg_no}
            </div>
            <div className="detail-item">
              <strong>Shop Owner:</strong> {selectedUser.shop_owner_name}
            </div>
            <div className="detail-item">
              <strong>Shop Name:</strong> {selectedUser.shop_name}
            </div>
            <div className="detail-item">
              <strong>Phone:</strong> {selectedUser.phone_number}
            </div>
            <div className="detail-item">
              <strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {selectedUser && (
        <div className="payments-history">
          <h3>💳 Payment History</h3>
          <p><strong>Total Paid: LKR {totalPaid}</strong></p>
          {payments.length > 0 ? (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Months</th>
                  <th>Cash (LKR)</th>
                  <th>Added On</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.year}</td>
                    <td>{getMonthNames(p.month)}</td>
                    <td>{p.cash.toFixed(2)}</td>
                    <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payments added yet.</p>
          )}
        </div>
      )}

      {/* Add Payment Form */}
      {selectedUser && (
        <div className="add-payment-container">
          <h3>💰 Add Funds/Payment</h3>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select id="year" value={formData.year} onChange={handleYearChange} required>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Months (Select Multiple - Calendar View)</label>
              <div className="months-grid">
                {monthNames.map(month => (
                  <label 
                    key={month.id} 
                    className={`month-checkbox ${formData.month.includes(month.id) ? 'selected' : ''} ${isMonthDisabled(month.id) ? 'disabled' : ''}`}
                    title={isMonthDisabled(month.id) ? 'Already paid for this year' : ''}
                  >
                    <input
                      type="checkbox"
                      checked={formData.month.includes(month.id)}
                      onChange={() => handleMonthToggle(month.id)}
                      disabled={isMonthDisabled(month.id)}
                    />
                    {month.name}
                  </label>
                ))}
              </div>
              <small>
                {formData.month.length > 0 
                  ? `Selected: ${formData.month.length} months` 
                  : 'Select at least one'
                }
                {disabledMonths.length > 0 && ` (grayed out months already paid for ${formData.year})`}
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="cash">Cash Amount (Min 500)</label>
              <input
                type="number"
                id="cash"
                min="500"
                step="0.01"
                placeholder="Enter amount"
                value={formData.cash}
                onChange={handleCashChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn">Add Payment</button>
          </form>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
    </div>
  );
}

export default MonthlyPayment;