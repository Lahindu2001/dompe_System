import React, { useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './MonthlyPayment.css';

const USERS_URL = 'http://localhost:5000/users';
const PAYMENTS_URL = 'http://localhost:5000/payments';  // Ensure no trailing slash or ID

function MonthlyPayment() {
  // States
  const [searchRegNo, setSearchRegNo] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: [],
    cash: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic years (current year -5 to +1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  // Month names
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

  // Clear error/success
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Search user by reg_no
  const handleSearch = async (e) => {
    e.preventDefault();
    clearMessages();
    const regNo = parseInt(searchRegNo);
    if (!searchRegNo || isNaN(regNo) || regNo <= 0) {
      setError('Please enter a valid positive Reg. No (e.g., 1)');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${USERS_URL}/reg/${regNo}`);
      setSelectedUser(res.data.shop);
      // Reset form
      setFormData({ year: currentYear, month: [], cash: '' });
    } catch (err) {
      console.error('Search error:', err);
      const msg = err.response?.data?.message || 'Shop not found. Please check Reg. No.';
      setError(msg);
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle year change
  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    clearMessages();
    if (year < 2000) {
      setError('Year must be 2000 or later');
      return;
    }
    setFormData(prev => ({ ...prev, year }));
  };

  // Handle month toggle
  const handleMonthToggle = (monthId) => {
    clearMessages();
    setFormData(prev => ({
      ...prev,
      month: prev.month.includes(monthId)
        ? prev.month.filter(m => m !== monthId)
        : [...prev.month, monthId].sort((a, b) => a - b)
    }));
  };

  // Handle cash change
  const handleCashChange = (e) => {
    const value = e.target.value;
    clearMessages();
    const numValue = parseFloat(value);
    if (value !== '' && (isNaN(numValue) || numValue < 0)) {
      setError('Cash amount must be a valid number 0 or greater (e.g., 100.50)');
      return;
    }
    setFormData(prev => ({ ...prev, cash: value }));
  };

  // Validate form before submit
  const validateForm = () => {
    if (!selectedUser) {
      setError('Please search and select a shop first');
      return false;
    }
    if (formData.month.length === 0) {
      setError('At least one month must be selected');
      return false;
    }
    if (formData.year < 2000) {
      setError('Year must be 2000 or later');
      return false;
    }
    const cashNum = parseFloat(formData.cash);
    if (formData.cash === '' || isNaN(cashNum) || cashNum < 0) {
      setError('Cash amount must be a valid number 0 or greater');
      return false;
    }
    return true;
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!validateForm()) return;

    const cashNum = parseFloat(formData.cash);
    setLoading(true);
    try {
      console.log('Submitting to:', PAYMENTS_URL);  // Debug log
      console.log('Payload:', { reg_no: selectedUser.reg_no, year: formData.year, month: formData.month, cash: cashNum });
      const res = await axios.post(PAYMENTS_URL, {  // Ensure no /${reg_no} here
        reg_no: selectedUser.reg_no,
        year: formData.year,
        month: formData.month,
        cash: cashNum
      });
      console.log('Success response:', res.data);
      setSuccess('Payment added successfully!');
      // Reset form (keep user selected)
      setFormData({ year: formData.year, month: [], cash: '' });
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Failed to add payment. Please check inputs and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
            placeholder="Enter Reg. No (e.g., 1)"
            value={searchRegNo}
            onChange={(e) => {
              setSearchRegNo(e.target.value);
              if (error) clearMessages();
            }}
            min="1"
            disabled={loading}
            required
          />
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && !selectedUser && <p className="error-message">{error}</p>}
      </div>

      {/* Shop Details */}
      {selectedUser && (
        <div className="user-details">
          <h3>📋 Shop Details</h3>
          <div className="details-grid">
            <div className="detail-item"><strong>Reg. No:</strong> {selectedUser.reg_no}</div>
            <div className="detail-item"><strong>Shop Owner:</strong> {selectedUser.shop_owner_name}</div>
            <div className="detail-item"><strong>Shop Name:</strong> {selectedUser.shop_name}</div>
            <div className="detail-item"><strong>Phone:</strong> {selectedUser.phone_number}</div>
            <div className="detail-item"><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString('en-GB')}</div>
          </div>
          <button className="clear-search-btn" onClick={() => { setSelectedUser(null); setSearchRegNo(''); clearMessages(); }}>
            Clear Search
          </button>
        </div>
      )}

      {/* Add Payment Form */}
      {selectedUser && (
        <div className="add-payment-container">
          <h3>💰 Add Funds/Payment</h3>
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <select 
                id="year" 
                value={formData.year} 
                onChange={handleYearChange}
                required
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Months * (Select Multiple)</label>
              <div className="months-grid">
                {monthNames.map(month => (
                  <label 
                    key={month.id} 
                    className={`month-checkbox ${formData.month.includes(month.id) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.month.includes(month.id)}
                      onChange={() => handleMonthToggle(month.id)}
                    />
                    {month.name}
                  </label>
                ))}
              </div>
              <small>
                {formData.month.length > 0 
                  ? `Selected: ${formData.month.length} month(s) - ${formData.month.map(m => monthNames[m-1].name.slice(0,3)).join(', ')}` 
                  : 'Select at least one month'
                }
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="cash">Cash Amount * (Min 0)</label>
              <input
                type="number"
                id="cash"
                min="0"
                step="0.01"
                placeholder="e.g., 100.50"
                value={formData.cash}
                onChange={handleCashChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </form>
          {(error || success) && <p className={error ? "error-message" : "success-message"}>{error || success}</p>}
        </div>
      )}

      {selectedUser === null && searchRegNo && <p className="no-user">No shop found for Reg. No: {searchRegNo}</p>}
    </div>
  );
}

export default MonthlyPayment;