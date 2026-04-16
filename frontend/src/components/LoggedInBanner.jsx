import React from 'react';

const LoggedInBanner = ({ 
  loggedInUser, 
  activeTab, 
  setActiveTab, 
  setShowEditModal, 
  handleLogout,
  isSystemAdmin,
  isEmployee 
}) => {
  return (
    <div className="logged-in-banner">
      <div>
        <strong>Welcome back, {loggedInUser.first_name || loggedInUser.email}!</strong>
        <span className="banner-role">{loggedInUser.role}</span>
      </div>
      <div className="banner-actions">
        {isSystemAdmin && activeTab !== "systemAdmin" && (
          <button className="banner-edit-btn" onClick={() => { setActiveTab("systemAdmin"); }}>← Back to Dashboard</button>
        )}
        {isEmployee && !isSystemAdmin && activeTab !== "employee" && (
          <button className="banner-edit-btn" onClick={() => { setActiveTab("employee"); }}>← Back to Dashboard</button>
        )}
        <button className="banner-edit-btn" onClick={() => setShowEditModal(true)}>✏️ Edit Account</button>
        <button className="banner-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
};

export default LoggedInBanner;