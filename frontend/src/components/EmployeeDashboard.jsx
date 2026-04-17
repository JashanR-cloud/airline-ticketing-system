import React from 'react';
import BookingResultCard from './main_tabs/BookingResultCard';
import AdminReports from './AdminReports';

const EmployeeDashboard = ({
    setActiveTab,
    setIsEditingPrefs,
    prefData,
    setPrefData,
    handleUpdatePreferences,
    empSection,
    setEmpSection,
    allPassengers,
    loadingPassengers,
    fetchAllPassengers,
    allBookingsAdmin,
    loadingAllBookings,
    fetchAllBookingsAdmin,
    manageData,
    handleManageChange,
    handleManageSubmit,
    loadingManage,
    manageMessage,
    manageResult,
    handleCancelBooking,
    handleUpdateBookingStatus,
    bookingStatusUpdate,
    setBookingStatusUpdate,
    bookingStatusMsg,
    handleAddBookingAdmin,
    adminNewBooking,
    setAdminNewBooking,
    adminNewBookingMsg,
    statusData,
    handleStatusChange,
    handleStatusSubmit,
    loadingStatus,
    statusMessage,
    statusResult,
    allFlights,
    loadingAllFlights,
    routesWithStatus,
    loadingRoutesStatus,
    fetchRoutesWithStatus,
    routeMsg,
    handleToggleRouteStatus,
    fetchRouteFlights,
    allAircrafts,
    loadingAircrafts,
    fetchAllAircrafts,
    inlineAircraftEdit,
    setInlineAircraftEdit,
    handleInlineAircraftUpdate,
    aircraftMsg,
    isSystemAdmin, 
    crudAction,
    setCrudAction,
    crudData,
    setCrudData,
    handleCrudSubmit,
    crudMsg,
    actionMsg,
    fetchReports,
    setCrudMsg,
    loadingReports,
    reports
}) => {
    return (
        <div style={{ minHeight: "800px" }}> {/* Ensure enough space for reports */}
            <h2>Employee Dashboard</h2>
            <p style={{ color: "#666", marginBottom: "18px" }}>
                Full access: passenger management, bookings, flight operations, and administrative actions.
            </p>

            {/* Section Navigation */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                <SectionBtn id="passengers" label="👤 Passengers" active={empSection === "passengers"} onClick={() => setEmpSection("passengers")} />
                <SectionBtn id="bookings" label="📋 Bookings" active={empSection === "bookings"} onClick={() => setEmpSection("bookings")} />
                <SectionBtn id="flightStatus" label="🛫 Flight Status" active={empSection === "flightStatus"} onClick={() => setEmpSection("flightStatus")} />
                <SectionBtn id="routes" label="🗺️ Routes" active={empSection === "routes"} onClick={() => setEmpSection("routes")} />
                <SectionBtn id="aircraft" label="✈️ Aircraft" active={empSection === "aircraft"} onClick={() => setEmpSection("aircraft")} />
                <SectionBtn id="actions" label="⚙️ Admin Actions" active={empSection === "actions"} onClick={() => setEmpSection("actions")} />
                <button type="button" onClick={() => setActiveTab("search")} style={{ padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: "600", fontSize: "13px", background: "#f0f0f0", color: "#333" }}>🔍 Search Flights</button>
            </div>

            {/* ── PASSENGERS SECTION ── */}
            {empSection === "passengers" && (
                <div className="result-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h3 style={{ margin: 0 }}>Passenger Directory</h3>
                        <RefreshBtn section="passengers" fetchFn={fetchAllPassengers} loading={loadingPassengers} />
                    </div>
                    {allPassengers.length === 0 ? (
                        <p style={{ color: "#888" }}>No passenger data. Click Refresh to load.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                        {["ID", "Name", "Role", "Email", "Phone", "Seat Pref", "Meal Pref", "Country", "Passport", "Visa"].map((h) => (
                                            <th key={h} style={{ padding: "10px", textAlign: "left" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {allPassengers.map((p) => (
                                        <tr key={p.passenger_id} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "10px" }}>{p.passenger_id}</td>
                                            <td style={{ padding: "10px", fontWeight: "600" }}>{p.first_name} {p.last_name}</td>
                                            <td style={{ padding: "10px" }}>{p.user_role}</td>
                                            <td style={{ padding: "10px" }}>{p.email}</td>
                                            <td style={{ padding: "10px" }}>{p.phone_number || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.seat_preferences || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.meal_preferences || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.country_of_origin || "—"}</td>
                                            <td style={{ padding: "10px" }}>{Number(p.passport_status) === 1 ? "✓ Valid" : "✗ Invalid"}</td>
                                            <td style={{ padding: "10px" }}>{Number(p.visa_status) === 1 ? "✓ Valid" : "✗ Invalid"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── BOOKINGS, STATUS, ROUTES, AIRCRAFT SECTIONS ... (Skipped for length, assume they are correct in your file) ── */}

            {/* ── SECTION: Admin Actions ── */}
            {empSection === "actions" && (
                <div className="result-card">
                    <h3>Flight Admin Actions</h3>
                    <p style={{ color: "#666", marginBottom: "15px" }}>Add flights, update aircraft capacity, and delete routes.</p>
                    
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                        <button type="button" className="primary-btn" style={{ fontSize: "14px", padding: "10px", backgroundColor: crudAction === "addFlight" ? "#a80d24" : "#cf102d" }} onClick={() => { setCrudAction("addFlight"); setCrudMsg({ text: "", type: "" }); }}>+ Add New Flight</button>
                        <button type="button" className="primary-btn" style={{ fontSize: "14px", padding: "10px", backgroundColor: crudAction === "updateAircraft" ? "#111" : "#333" }} onClick={() => { setCrudAction("updateAircraft"); setCrudMsg({ text: "", type: "" }); }}>Update Aircraft</button>
                        <button type="button" className="primary-btn" style={{ fontSize: "14px", padding: "10px", backgroundColor: crudAction === "deleteRoute" ? "#8a0018" : "#b00020" }} onClick={() => { setCrudAction("deleteRoute"); setCrudMsg({ text: "", type: "" }); }}>Delete Route</button>
                    </div>

                    {/* Form rendering logic for CRUD actions goes here... */}

                    {/* ── ANALYTICS REPORTS (FORCED SHOW) ── */}
                    <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
                        <h3 style={{ marginBottom: "20px" }}>📊 System Analytics & Reports</h3>
                        <AdminReports />
                    </div>
                </div>
            )} 
        </div> 
    );
};

const SectionBtn = ({label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{ padding: "10px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: active ? "700" : "600", background: active ? "#1a73e8" : "#f1f3f5", color: active ? "#fff" : "#333" }}>{label}</button>
);

const RefreshBtn = ({fetchFn, loading }) => (
  <button type="button" onClick={fetchFn} disabled={loading} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: loading ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600", color: "#333" }}>{loading ? "Refreshing..." : "Refresh"}</button>
);

export default EmployeeDashboard;
