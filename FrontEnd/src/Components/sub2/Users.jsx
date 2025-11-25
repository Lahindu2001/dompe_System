import React, { useState, useEffect } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import jsPDF from 'jspdf';
import './Users.css';

const URL = 'http://localhost:5000/users';


function Users() {
  // ------------------- STATES -------------------
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    reg_no: true,
    shop_owner_name: true,
    shop_name: true,
    phone_number: true,
    created_at: true
  });
  const [inputs, setInputs] = useState({
    reg_no: '', shop_owner_name: '', shop_name: '',
    phone_number: ''
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editInputs, setEditInputs] = useState({
    reg_no: '', shop_owner_name: '', shop_name: '',
    phone_number: ''
  });
  // ------------------- COMPANY INFORMATION -------------------
  const companyInfo = {
    name: 'Dompe',
    tagline: 'Dompe',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 000 000 0000',
    email: 'test@gmail.com',
    website: 'www.test.com'
  };
  // ------------------- FETCH USERS -------------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get(URL);
      setUsers(res.data.shops || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  // ------------------- LOGO CONVERSION -------------------
  const getLogoAsBase64 = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = () => {
        console.warn('Could not load logo, proceeding without it');
        resolve(null);
      };
      // Update this path to match your logo location
      img.src = '/logo192.png';
    });
  };
  // ------------------- PROFESSIONAL PDF GENERATION -------------------
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No users to download!');
  
    try {
      // Get logo as base64
      const logoBase64 = await getLogoAsBase64();
    
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
    
      // Function to add professional letterhead
      const addLetterhead = () => {
        // Add logo if available
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30);
        }
      
        // Company name with professional styling
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.setTextColor(0, 0, 139); // Dark blue color
        doc.text(companyInfo.name, logoBase64 ? 55 : pageWidth / 2, 25, { align: logoBase64 ? 'left' : 'center' });
      
        // Tagline
        doc.setFontSize(12);
        doc.setTextColor(0, 128, 255); // Blue color
        doc.text(companyInfo.tagline, logoBase64 ? 55 : pageWidth / 2, 35, { align: logoBase64 ? 'left' : 'center' });
      
        // Contact details section
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
      
        // Address (Left side)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139);
        doc.text('Address:', 15, 50);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        companyInfo.address.forEach((line, index) => {
          doc.text(line, 15, 57 + (index * 7));
        });
      
        // Contact info (Right side)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 139);
        doc.text('Contact Information:', pageWidth - 85, 50);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Phone: ${companyInfo.phone}`, pageWidth - 85, 57);
        doc.text(`Email: ${companyInfo.email}`, pageWidth - 85, 64);
        doc.text(`Website: ${companyInfo.website}`, pageWidth - 85, 71);
      
        // Professional separator lines
        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 139);
        doc.line(15, 80, pageWidth - 15, 80);
      
        doc.setLineWidth(0.8);
        doc.setDrawColor(0, 128, 255);
        doc.line(15, 82, pageWidth - 15, 82);
      };
    
      // Function to add footer
      const addFooter = (pageNum, totalPages) => {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
      
        // Footer separator line
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(15, pageHeight - 30, pageWidth - 15, pageHeight - 30);
      
        // Footer text
        const footerText = `This document is generated by ${companyInfo.name} User Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 22, { align: 'center' });
      
        // Page number and date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
        const genDate = new Date().toLocaleDateString('en-GB');
        const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        doc.text(`Generated: ${genDate} at ${genTime}`, 15, pageHeight - 12);
      
        // Company website in footer
        doc.setTextColor(0, 0, 139);
        doc.text(companyInfo.website, pageWidth / 2, pageHeight - 5, { align: 'center' });
      };
    
      // Calculate total pages
      let totalPages = 1;
      let tempY = 95;
      data.forEach(() => {
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let userHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
      
        if (tempY + userHeight > pageHeight - 45) {
          totalPages++;
          tempY = 95;
        }
        tempY += userHeight;
      });
    
      // Generate PDF content
      let currentPage = 1;
      let y = 95;
    
      // Add letterhead to first page
      addLetterhead();
    
      // Report title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      const titleText = title.toUpperCase();
      doc.text(titleText, pageWidth / 2, 90, { align: 'center' });
    
      // Process each user
      data.forEach((user, idx) => {
        let fieldsCount = Object.keys(selectedFields).filter(field => selectedFields[field]).length;
        let userHeight = Math.ceil(fieldsCount / 2) * 12 + 35;
      
        // Check if new page is needed
        if (y + userHeight > pageHeight - 45) {
          addFooter(currentPage, totalPages);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 95;
        }
      
        // User header with professional background
        doc.setFillColor(240, 248, 255);
        doc.rect(15, y - 3, pageWidth - 30, 18, 'F');
      
        doc.setLineWidth(0.8);
        doc.setDrawColor(0, 0, 139);
        doc.rect(15, y - 3, pageWidth - 30, 18);
      
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 139);
        doc.text(`SHOP RECORD #${String(idx + 1).padStart(3, '0')}`, 20, y + 8);
      
        // User ID on right
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text(`Reg. No: ${user.reg_no || 'N/A'}`, pageWidth - 70, y + 8);
      
        y += 25;
      
        // User details in organized format
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
      
        let leftY = y;
        let rightY = y;
        let isLeft = true;
      
        Object.keys(selectedFields).forEach(field => {
          if (selectedFields[field] && field !== 'reg_no') {
            let label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            let value = user[field] || 'N/A';
          
            if (field === 'created_at') {
              value = new Date(value).toLocaleDateString('en-GB');
            }
          
            // Handle long values
            if (typeof value === 'string' && value.length > 35) {
              value = value.substring(0, 32) + '...';
            }
          
            const x = isLeft ? 25 : pageWidth / 2 + 10;
            const currentY = isLeft ? leftY : rightY;
          
            // Field label (bold)
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 139);
            doc.text(`${label}:`, x, currentY);
          
            // Field value (normal)
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            doc.text(String(value), x + 50, currentY);
          
            if (isLeft) {
              leftY += 12;
            } else {
              rightY += 12;
            }
          
            isLeft = !isLeft;
          }
        });
      
        y = Math.max(leftY, rightY) + 15;
      
        // Separator between users
        if (idx < data.length - 1) {
          doc.setLineWidth(0.3);
          doc.setDrawColor(220, 220, 220);
          doc.line(25, y - 5, pageWidth - 25, y - 5);
          y += 15;
        }
      });
    
      // Add footer to last page
      addFooter(currentPage, totalPages);
    
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
    
      doc.save(fileName);
      alert(`Professional report "${fileName}" downloaded successfully!`);
    
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };
  // ------------------- ADD USER -------------------
  const handleChange = e => setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddUser = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(URL, { ...inputs });
      setUsers([...users, res.data]);
      setInputs({ reg_no: '', shop_owner_name: '', shop_name: '', phone_number: '' });
      setShowAddUserForm(false);
      alert('User added successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to add user!');
    }
  };
  // ------------------- EDIT / UPDATE USER -------------------
  const startEdit = user => {
    setEditingUserId(user._id);
    setEditInputs({ ...user });
  };
  const handleEditChange = e => setEditInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdateUser = async e => {
    e.preventDefault();
    try {
      const res = await axios.put(`${URL}/${editingUserId}`, { ...editInputs });
      setUsers(users.map(u => (u._id === editingUserId ? res.data : u)));
      setEditingUserId(null);
      setEditInputs({ reg_no: '', shop_owner_name: '', shop_name: '', phone_number: '' });
      alert('User updated successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user!');
    }
  };
  // ------------------- DELETE USER -------------------
  const handleDeleteUser = async id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setUsers(users.filter(u => u._id !== id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user!');
    }
  };
  // ------------------- DOWNLOAD FUNCTIONS -------------------
  const handleDownloadAll = () => generatePDF(users, 'Complete Shop Directory Report');
  const handleDownloadSingle = user => generatePDF([user], `Individual Shop Report - ${user.shop_name || user.shop_owner_name}`);
  // ------------------- FILTERED USERS -------------------
  const filteredUsers = users.filter(user =>
    (user.shop_owner_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.shop_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.phone_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.reg_no?.toString() || '').includes(searchTerm)
  );
  // ------------------- RENDER -------------------
  return (
    <div className="users-section" id="users-section">
      <Nav />
      <div className="title-container">
        <h2 className="Title">Add the shop to the Systems</h2>
        <p className="subtitle">{companyInfo.name} - {companyInfo.tagline}</p>
      </div>
      <button className="add-user-toggle" onClick={() => setShowAddUserForm(!showAddUserForm)}>
        {showAddUserForm ? '✕ Hide Add User Form' : '➕ Show Add User Form'}
      </button>
      {showAddUserForm && (
        <div className="add-user-container">
          <h3>📝 Add New User</h3>
          <form className="add-user-form" onSubmit={handleAddUser}>
            {['reg_no', 'shop_owner_name', 'shop_name', 'phone_number'].map(field => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                <input
                  type={field === 'phone_number' ? 'tel' : 'text'}
                  id={field}
                  name={field}
                  placeholder={`Enter ${field.replace('_', ' ')}`}
                  value={inputs[field]}
                  onChange={handleChange}
                  required
                  readOnly={field === 'reg_no'}
                />
              </div>
            ))}
            <button type="submit" className="submit-btn">Add User</button>
          </form>
        </div>
      )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by Shop Owner Name, Shop Name, Phone Number or Reg. No..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Enhanced Download Options */}
      <div className="download-options professional-section">
        <h3>📄 Professional Report Generation</h3>
        <p>Select the fields to include in your professional letterhead report:</p>
        <div className="field-checkboxes">
          {Object.keys(selectedFields).map(field => (
            <label key={field} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedFields[field]}
                onChange={() => setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }))}
              />
              <span>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </label>
          ))}
        </div>
        <div className="download-buttons">
          <button className="download-all-btn" onClick={handleDownloadAll}>
            📊 Download Complete Directory ({users.length} users)
          </button>
          <p className="download-note">
            Reports include professional letterhead with {companyInfo.name} logo, contact details, and formatted layouts.
          </p>
        </div>
      </div>
      {/* Users Table */}
      <div className="users-table-container">
        <div className="table-header">
          <span className="table-user-count">👥 Total Users: {users.length}</span>
          <span className="filtered-count">
            {searchTerm && `(Showing ${filteredUsers.length} filtered results)`}
          </span>
        </div>
        <table className="users-table">
          <thead>
            <tr>
              <th>Reg. No</th>
              <th>Shop Owner Name</th>
              <th>Shop Name</th>
              <th>Phone Number</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                {editingUserId === user._id ? (
                  <td colSpan="6">
                    <div className="update-user-container">
                      <h1>✏️ Update User Information</h1>
                      <form onSubmit={handleUpdateUser}>
                        {['reg_no', 'shop_owner_name', 'shop_name', 'phone_number'].map(field => (
                          <input
                            key={field}
                            type={field === 'phone_number' ? 'tel' : 'text'}
                            name={field}
                            placeholder={field.replace('_', ' ').toUpperCase()}
                            value={editInputs[field]}
                            onChange={handleEditChange}
                            required
                            readOnly={field === 'reg_no'}
                          />
                        ))}
                        <button type="submit">✅ Update User</button>
                        <button type="button" className="cancel-button" onClick={() => setEditingUserId(null)}>❌ Cancel</button>
                      </form>
                    </div>
                  </td>
                ) : (
                  <>
                    <td><strong>{user.reg_no}</strong></td>
                    <td>{user.shop_owner_name}</td>
                    <td>{user.shop_name}</td>
                    <td>{user.phone_number}</td>
                    <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="actions-cell">
                      <button className="action-btn edit-btn" onClick={() => startEdit(user)} title="Edit User">
                        ✏️
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteUser(user._id)} title="Delete User">
                        🗑️
                      </button>
                      <button className="action-btn download-btn" onClick={() => handleDownloadSingle(user)} title="Download User Report">
                        📄
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      
        {filteredUsers.length === 0 && (
          <div className="no-users-message">
            <p>📭 No users found matching your search criteria.</p>
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default Users;