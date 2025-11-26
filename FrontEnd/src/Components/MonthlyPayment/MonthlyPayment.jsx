import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
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
import './MonthlyPayment.css';

const USERS_URL = 'http://localhost:5000/users';
const PAYMENTS_URL = 'http://localhost:5000/payments';

function MonthlyPayment() {
  // States
  const [searchRegNo, setSearchRegNo] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedFilterYear, setSelectedFilterYear] = useState('all');
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: [],
    cash: 500
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [disabledMonths, setDisabledMonths] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState(['all']);
  const [regNoRange, setRegNoRange] = useState({ first: null, last: null });
  // Edit states
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    year: '',
    month: [],
    cash: ''
  });

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

  // Fetch Reg No Range
  useEffect(() => {
    const fetchRegNoRange = async () => {
      try {
        const res = await axios.get(USERS_URL);
        const shops = res.data.shops || [];
        if (shops.length > 0) {
          const regNumbers = shops
            .map(shop => parseInt(shop.reg_no))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);
          if (regNumbers.length > 0) {
            setRegNoRange({
              first: regNumbers[0],
              last: regNumbers[regNumbers.length - 1]
            });
          }
        }
      } catch (err) {
        console.error('Error fetching reg_no range:', err);
      }
    };
    
    fetchRegNoRange();
  }, []);

  // Compute disabled months based on current year and payments
  useEffect(() => {
    if (payments.length > 0) {
      const currentYear = editingPaymentId ? editFormData.year : formData.year;
      if (currentYear) {
        let paidForYear = payments.filter(p => p.year === currentYear);
        if (editingPaymentId) {
          // Exclude current editing payment
          paidForYear = paidForYear.filter(p => p._id !== editingPaymentId);
        }
        const paidMonths = paidForYear.flatMap(p => p.month || []);
        setDisabledMonths([...new Set(paidMonths)]);
      }
    } else {
      setDisabledMonths([]);
    }
  }, [payments, formData.year, editFormData.year, editingPaymentId]);

  // Compute monthly chart data for selected filter year
  useEffect(() => {
    if (payments.length > 0 && selectedFilterYear !== 'all') {
      const filterYear = parseInt(selectedFilterYear);
      const monthlyTotals = Array(12).fill(0);
      payments
        .filter(p => p.year === filterYear)
        .forEach(p => {
          p.month.forEach(m => {
            if (m >= 1 && m <= 12) {
              monthlyTotals[m - 1] += p.cash || 0;
            }
          });
        });
      const chartData = monthNames.map((month, idx) => ({
        month: month.name.substring(0, 3),
        total: monthlyTotals[idx].toFixed(2)
      }));
      setMonthlyChartData(chartData);
    } else {
      setMonthlyChartData([]);
    }
  }, [payments, selectedFilterYear]);

  // Update available years and set default selected year when payments change
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (payments.length > 0) {
      let uniqueYears = [...new Set(payments.map(p => p.year))];
      if (!uniqueYears.includes(currentYear)) {
        uniqueYears.push(currentYear);
      }
      uniqueYears = uniqueYears.sort((a, b) => b - a);
      setAvailableYears(['all', ...uniqueYears]);
      if (selectedFilterYear === 'all' || !uniqueYears.includes(parseInt(selectedFilterYear))) {
        setSelectedFilterYear(currentYear.toString());
      }
    } else {
      setAvailableYears(['all', currentYear.toString()]);
      setSelectedFilterYear(currentYear.toString());
    }
  }, [payments]);

  // Filter payments based on selectedFilterYear
  useEffect(() => {
    if (payments.length === 0) {
      setFilteredPayments([]);
      return;
    }
    let filtered = payments;
    if (selectedFilterYear !== 'all') {
      filtered = payments.filter(p => p.year === parseInt(selectedFilterYear));
    }
    setFilteredPayments(filtered);
  }, [payments, selectedFilterYear]);

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

  // Handle filter year change
  const handleFilterYearChange = (e) => {
    setSelectedFilterYear(e.target.value);
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
    setFilteredPayments([]);
    setDisabledMonths([]);
    setMonthlyChartData([]);
    const currentYear = new Date().getFullYear();
    setAvailableYears(['all', currentYear.toString()]);
    setSelectedFilterYear(currentYear.toString());
    setFormData({ year: new Date().getFullYear(), month: [], cash: 500 });
    setEditingPaymentId(null);
    setEditFormData({ year: '', month: [], cash: '' });
    setError('');
    setSuccess('');
  };

  // Handle year change
  const handleYearChange = (e) => {
    setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }));
  };

  // Handle month toggle (multiple select) for add
  const handleMonthToggle = (monthId) => {
    if (disabledMonths.includes(monthId)) return;
    setFormData(prev => ({
      ...prev,
      month: prev.month.includes(monthId)
        ? prev.month.filter(m => m !== monthId)
        : [...prev.month, monthId]
    }));
  };

  // Handle cash change - for add
  const handleCashChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, cash: value === '' ? 500 : parseFloat(value) || 500 }));
  };

  const handleCashBlur = (e) => {
    let value = parseFloat(e.target.value) || 500;
    value = Math.max(500, value);
    setFormData(prev => ({ ...prev, cash: value }));
  };

  // Submit payment - add
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
    let cashValue = parseFloat(formData.cash);
    if (isNaN(cashValue) || cashValue < 500) {
      setError('Cash amount must be at least 500');
      return;
    }
    try {
      const res = await axios.post(PAYMENTS_URL, {
        reg_no: selectedUser.reg_no,
        year: formData.year,
        month: formData.month,
        cash: cashValue
      });
      setSuccess('Payment added successfully!');
      setError('');
      setFormData({ year: new Date().getFullYear(), month: [], cash: 500 });
      await fetchPayments(selectedUser.reg_no);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add payment');
      setSuccess('');
    }
  };

  // Edit functions
  const startEdit = (payment) => {
    setEditingPaymentId(payment._id);
    setEditFormData({
      year: payment.year,
      month: [...payment.month],
      cash: payment.cash
    });
  };

  const handleEditYearChange = (e) => {
    setEditFormData(prev => ({ ...prev, year: parseInt(e.target.value) }));
  };

  const handleEditMonthToggle = (monthId) => {
    // For edit, allow all, no disable
    setEditFormData(prev => ({
      ...prev,
      month: prev.month.includes(monthId)
        ? prev.month.filter(m => m !== monthId)
        : [...prev.month, monthId]
    }));
  };

  const handleEditCashChange = (e) => {
    const value = e.target.value;
    setEditFormData(prev => ({ ...prev, cash: value === '' ? payment.cash : parseFloat(value) || payment.cash }));
  };

  const handleEditCashBlur = (e) => {
    let value = parseFloat(e.target.value) || 500;
    value = Math.max(500, value);
    setEditFormData(prev => ({ ...prev, cash: value }));
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (editFormData.month.length === 0) {
      setError('At least one month must be selected');
      return;
    }
    let cashValue = parseFloat(editFormData.cash);
    if (isNaN(cashValue) || cashValue < 500) {
      setError('Cash amount must be at least 500');
      return;
    }
    try {
      await axios.put(`${PAYMENTS_URL}/${editingPaymentId}`, {
        year: editFormData.year,
        month: editFormData.month,
        cash: cashValue
      });
      setSuccess('Payment updated successfully!');
      setError('');
      setEditingPaymentId(null);
      setEditFormData({ year: '', month: [], cash: '' });
      await fetchPayments(selectedUser.reg_no);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment');
      setSuccess('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPaymentId(null);
    setEditFormData({ year: '', month: [], cash: '' });
  };

  const handleDeletePayment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await axios.delete(`${PAYMENTS_URL}/${id}`);
      setSuccess('Payment deleted successfully!');
      setError('');
      await fetchPayments(selectedUser.reg_no);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete payment');
      setSuccess('');
    }
  };

  // Years dropdown options
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y <= currentYear + 5; y++) {
    years.push(y);
  }

  // Calculate total paid - cash * month count per payment
  const totalPaid = filteredPayments.reduce((sum, p) => sum + ((p.cash || 0) * (p.month ? p.month.length : 0)), 0).toFixed(2);

  // Helper to check if month is disabled - only for add
  const isMonthDisabled = (monthId) => !editingPaymentId && disabledMonths.includes(monthId);

  // Calculate total cash preview for add
  const totalCashPreview = (isNaN(parseFloat(formData.cash)) ? 500 : parseFloat(formData.cash)) * formData.month.length;

  return (
    <div className="monthly-payment-section" id="monthly-payment-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Add Monthly Payment</h2>
        <p className="subtitle">Manage shop funds and payments</p>
      </div>

      {/* Search Form with Reg No Range */}
      <div className="search-container">
        <div className="search-header">
          <h3>🔍 Search Shop by Reg. No</h3>
          {regNoRange.first !== null && regNoRange.last !== null && (
            <div className="reg-range-info">
              <span className="range-label">Available Range:</span>
              <span className="range-value">{regNoRange.first} - {regNoRange.last}</span>
            </div>
          )}
        </div>
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
         
          <div className="filter-year-container">
            <label htmlFor="filterYear">Filter by Year: </label>
            <select id="filterYear" value={selectedFilterYear} onChange={handleFilterYearChange}>
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'All Years' : year}
                </option>
              ))}
            </select>
          </div>

          {monthlyChartData.length > 0 && monthlyChartData.some(d => parseFloat(d.total) > 0) && (
            <div className="chart-section">
              <h4>Monthly Payments Overview - {selectedFilterYear === 'all' ? 'All Years' : selectedFilterYear}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`LKR ${value}`, 'Total Cash']} />
                  <Legend />
                  <Bar dataKey="total" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {filteredPayments.length > 0 ? (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Months</th>
                  <th>Cash per Month (LKR)</th>
                  <th>Total for Months (LKR)</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, idx) => (
                  <tr key={p._id || idx}>
                    {editingPaymentId === p._id ? (
                      <td colSpan="6">
                        <div className="edit-payment-container">
                          <h4>✏️ Edit Payment</h4>
                          <form onSubmit={handleUpdatePayment}>
                            <div className="edit-form-row">
                              <div className="form-group small">
                                <label htmlFor="editYear">Year</label>
                                <select 
                                  id="editYear" 
                                  value={editFormData.year} 
                                  onChange={handleEditYearChange} 
                                  required
                                >
                                  {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group small">
                                <label htmlFor="editCash">Cash per Month (Min 500)</label>
                                <input
                                  type="number"
                                  id="editCash"
                                  min="500"
                                  step="0.01"
                                  placeholder="Enter amount (min 500)"
                                  value={editFormData.cash}
                                  onChange={handleEditCashChange}
                                  onBlur={handleEditCashBlur}
                                  required
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Months (Select Multiple)</label>
                              <div className="months-grid">
                                {monthNames.map(month => (
                                  <label
                                    key={month.id}
                                    className={`month-checkbox ${editFormData.month.includes(month.id) ? 'selected' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editFormData.month.includes(month.id)}
                                      onChange={() => handleEditMonthToggle(month.id)}
                                    />
                                    {month.name}
                                  </label>
                                ))}
                              </div>
                              <small>
                                {editFormData.month.length > 0
                                  ? `Selected: ${editFormData.month.length} months`
                                  : 'Select at least one'
                                }
                              </small>
                            </div>
                            <div className="edit-buttons">
                              <button type="submit" className="update-btn">✅ Update Payment</button>
                              <button type="button" className="cancel-button" onClick={handleCancelEdit}>❌ Cancel</button>
                            </div>
                          </form>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>{p.year}</td>
                        <td>{getMonthNames(p.month)}</td>
                        <td>{p.cash ? p.cash.toFixed(2) : '0.00'}</td>
                        <td>{((p.cash || 0) * (p.month ? p.month.length : 0)).toFixed(2)}</td>
                        <td>{new Date(p.created_at).toLocaleDateString('en-GB')}</td>
                        <td className="actions-cell">
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => startEdit(p)} 
                            title="Edit Payment"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDeletePayment(p._id)} 
                            title="Delete Payment"
                          >
                            🗑️
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No payments for the selected year.</p>
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
              <label htmlFor="cash">Cash Amount per Month (Min 500)</label>
              <input
                type="number"
                id="cash"
                min="500"
                step="0.01"
                placeholder="Enter amount per month (min 500)"
                value={formData.cash}
                onChange={handleCashChange}
                onBlur={handleCashBlur}
                required
              />
            </div>

            {/* Total Cash Preview */}
            {formData.month.length > 0 && (
              <div className="total-preview">
                <strong>Total Cash: LKR {totalCashPreview.toFixed(2)}</strong>
                <small>(Cash per month × {formData.month.length} months)</small>
              </div>
            )}

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