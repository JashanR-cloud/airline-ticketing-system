
import React from 'react';

const MainTabs = ({
  activeTab,
  setActiveTab,
  isPassenger,
  isEmployee,
  isSystemAdmin,
  loggedInUser,
  loadEmployeePortal,
  fetchReports
}) => {
  return (
    <div className="tabs">
      <button 
        className={activeTab === "search" ? "tab active" : "tab"} 
        onClick={() => setActiveTab("search")}
      >
        Search Flights
      </button>

      <button 
        className={activeTab === "manage" ? "tab active" : "tab"} 
        onClick={() => setActiveTab("manage")}
      >
        {isPassenger ? "My Bookings" : "Manage Booking"}
      </button>

      <button 
        className={activeTab === "status" ? "tab active" : "tab"} 
        onClick={() => setActiveTab("status")}
      >
        Flight Status
      </button>

      {!loggedInUser && (
        <button 
          className={activeTab === "login" ? "tab active" : "tab"} 
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
      )}

      {(isEmployee || isSystemAdmin) && (
        <button
          className={activeTab === "employee" ? "tab active" : "tab"}
          onClick={() => { setActiveTab("employee"); loadEmployeePortal(); }}
        >
          Employee Dashboard
        </button>
      )}

      {isSystemAdmin && (
        <button
          className={activeTab === "systemAdmin" ? "tab active" : "tab"}
          onClick={() => { setActiveTab("systemAdmin"); fetchReports(); }}
        >
          System Admin
        </button>
      )}
    </div>
  );
};

export default MainTabs;