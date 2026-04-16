
import React from 'react';

const SystemAdminDashboard = ({
  setActiveTab, 
  loadEmployeePortal,
  // Reports
  reports,
  loadingReports,
  fetchReports,
  showReportRows,
  setShowReportRows,
  fetchRouteFlights,

  // Staff Management
  allStaff,
  fetchAllStaff,
  newStaffData,
  handleNewStaffChange,
  handleCreateStaff,
  staffManageMessage,
  handleDeleteStaff,
  loggedInUser
}) => {
  return (
    <div>
      <h2>System Admin Dashboard</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Full system access — passenger, booking, flight operations, and platform oversight.
      </p>

      {/* Quick Action Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[
          { icon: "👤", label: "Employee Dashboard", desc: "All staff features", tab: "employee" },
          { icon: "🔍", label: "Manage Any Booking", desc: "Look up and modify any booking", tab: "manage" },
          { icon: "🛫", label: "Flight Status", desc: "Check live flight status", tab: "status" },
          { icon: "✈️", label: "Search & Book Flights", desc: "Search flights on behalf of users", tab: "search" },
        ].map(({ icon, label, desc, tab }) => (
          <div
            key={tab}
            onClick={() => {setActiveTab(tab); if (tab === "employee") loadEmployeePortal();}}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "box-shadow 0.2s"
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>{icon}</div>
            <h4 style={{ margin: "0 0 6px", color: "#1a1a2e" }}>{label}</h4>
            <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Route Summary Report */}
      <div className="result-card">
        <h3>Route Summary Report</h3>
        <button 
          className="nav-edit-btn" 
          style={{ color: "#222", borderColor: "#222", margin: "10px 0" }} 
          onClick={fetchReports}
        >
          {loadingReports ? "Generating..." : "Generate Reports"}
        </button>

        {reports.length > 0 && (
          <button 
            className="nav-edit-btn" 
            style={{ color: "#222", borderColor: "#222", margin: "10px 0 10px 10px" }} 
            onClick={() => setShowReportRows(!showReportRows)}
          >
            {showReportRows ? `▲ Hide Reports (${reports.length})` : `▼ Show Reports (${reports.length})`}
          </button>
        )}

        {reports.length > 0 && showReportRows && (
          <table style={{ width: "100%", textAlign: "left", marginTop: "10px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                {["Route ID", "Departure", "Arrival", "Total Flights"].map((h) => (
                  <th key={h} style={{ padding: "10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr 
                  key={r.route_id} 
                  style={{ borderBottom: "1px solid #ddd", height: "40px", cursor: "pointer" }}
                  onClick={() => fetchRouteFlights(r.route_id, `${r.departure} → ${r.arrival}`)}
                >
                  <td style={{ padding: "10px" }}>{r.route_id}</td>
                  <td style={{ padding: "10px" }}>{r.departure}</td>
                  <td style={{ padding: "10px" }}>{r.arrival}</td>
                  <td style={{ padding: "10px" }}>{r.total_flights}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manage Staff */}
      <div className="result-card" style={{ marginTop: "24px" }}>
        <h3>Manage Staff</h3>
        <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
          Create or remove Employee and System Admin accounts.
        </p>

        <button className="nav-edit-btn" style={{ color: "#222", borderColor: "#222", margin: "10px 0" }} onClick={fetchAllStaff}>
          Load Staff List
        </button>

        <form onSubmit={handleCreateStaff} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "16px", padding: "16px", background: "#f9f9f9", borderRadius: "8px" }}>
          <input name="first_name" value={newStaffData.first_name} onChange={handleNewStaffChange} placeholder="First Name *" required />
          <input name="last_name" value={newStaffData.last_name} onChange={handleNewStaffChange} placeholder="Last Name" />
          <input name="email" type="email" value={newStaffData.email} onChange={handleNewStaffChange} placeholder="Email *" required />
          <input name="password" value={newStaffData.password} onChange={handleNewStaffChange} placeholder="Password *" required />
          <input name="department" value={newStaffData.department} onChange={handleNewStaffChange} placeholder="Department" />
          <input name="position" value={newStaffData.position} onChange={handleNewStaffChange} placeholder="Position" />
          <select name="role" value={newStaffData.role} onChange={handleNewStaffChange}>
            <option value="Employee">Employee</option>
            <option value="System Admin">System Admin</option>
          </select>
          <button type="submit" className="primary-btn">Create Staff Account</button>
        </form>

        {staffManageMessage && (
          <p style={{ marginTop: "12px", fontSize: "15px", color: staffManageMessage.toLowerCase().includes("created") || staffManageMessage.toLowerCase().includes("deleted") ? "#1a6e3c" : "#cf102d" }}>
            {staffManageMessage}
          </p>
        )}

        {allStaff.length > 0 && (
          <table style={{ width: "100%", textAlign: "left", marginTop: "16px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                {["ID", "Name", "Email", "Role", "Department", "Position", ""].map((h) => (
                  <th key={h} style={{ padding: "10px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allStaff.map((s) => (
                <tr key={s.user_id} style={{ borderBottom: "1px solid #ddd", height: "40px" }}>
                  <td style={{ padding: "10px" }}>{s.employee_id}</td>
                  <td style={{ padding: "10px" }}>{s.first_name} {s.last_name || ""}</td>
                  <td style={{ padding: "10px" }}>{s.email}</td>
                  <td style={{ padding: "10px" }}>{s.role}</td>
                  <td style={{ padding: "10px" }}>{s.department || "—"}</td>
                  <td style={{ padding: "10px" }}>{s.position || "—"}</td>
                  <td style={{ padding: "10px" }}>
                    {s.user_id !== loggedInUser?.user_id ? (
                        <button className="nav-logout-btn" onClick={() => handleDeleteStaff(s.user_id, `${s.first_name} ${s.last_name || ""}`)}>Delete</button>
                    ) : (
                        <span style={{ color: "#999", fontSize: "13px" }}>(you)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SystemAdminDashboard;