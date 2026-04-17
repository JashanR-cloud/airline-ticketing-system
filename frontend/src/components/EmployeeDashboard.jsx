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
    // Passengers section
    allPassengers,
    loadingPassengers,
    fetchAllPassengers,
    // Bookings section
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
    // Status section
    statusData,
    handleStatusChange,
    handleStatusSubmit,
    loadingStatus,
    statusMessage,
    statusResult,
    allFlights,
    loadingAllFlights,
    // Routes section
    routesWithStatus,
    loadingRoutesStatus,
    fetchRoutesWithStatus,
    routeMsg,
    handleToggleRouteStatus,
    fetchRouteFlights,
    // Aircraft section
    allAircrafts,
    loadingAircrafts,
    fetchAllAircrafts,
    inlineAircraftEdit,
    setInlineAircraftEdit,
    handleInlineAircraftUpdate,
    aircraftMsg,
    // Admin Actions (CRUD)
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
        <div style={{ paddingBottom: "100px" }}>
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
                        <RefreshBtn fetchFn={fetchAllPassengers} loading={loadingPassengers} />
                    </div>
                    {allPassengers.length === 0 ? <p style={{ color: "#888" }}>No passenger data. Click Refresh to load.</p> : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                        {["ID", "Name", "Role", "Email", "Phone", "Country", "Passport", "Visa"].map((h) => (
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

            {/* ── BOOKINGS SECTION ── */}
            {empSection === "bookings" && (
                <div>
                    <div className="result-card" style={{ marginBottom: "20px" }}>
                        <h3>Find Booking</h3>
                        <form onSubmit={handleManageSubmit}>
                            <div className="form-group">
                                <label>Select Booking</label>
                                <select name="bookingId" value={manageData.bookingId} onChange={handleManageChange} required>
                                    <option value="">-- Select a booking --</option>
                                    {allBookingsAdmin.map((b) => (
                                        <option key={b.booking_id} value={b.booking_id}>#{b.booking_id} — {b.first_name} {b.last_name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="primary-btn">View Details</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── FLIGHT STATUS SECTION ── */}
            {empSection === "flightStatus" && (
                <div className="result-card">
                    <h3>Check Flight Status</h3>
                    <form onSubmit={handleStatusSubmit}>
                        <div className="form-group">
                            <label>Select Flight</label>
                            <select name="flightId" value={statusData.flightId} onChange={handleStatusChange} required>
                                <option value="">-- Select a Flight --</option>
                                {allFlights.map((f) => (
                                    <option key={f.flight_id} value={f.flight_id}>#{f.flight_id} ({f.departure_airport} → {f.arrival_airport})</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="primary-btn">Check Status</button>
                    </form>
                </div>
            )}

            {/* ── ROUTES SECTION ── */}
            {empSection === "routes" && (
                <div className="result-card">
                    <h3>Route Management</h3>
                    <RefreshBtn fetchFn={fetchRoutesWithStatus} loading={loadingRoutesStatus} />
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                        <thead>
                            <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                <th>ID</th><th>Departure</th><th>Arrival</th><th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routesWithStatus.map((r) => (
                                <tr key={r.route_id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "10px" }}>{r.route_id}</td>
                                    <td>{r.departure}</td><td>{r.arrival}</td>
                                    <td>{r.is_active ? "Active" : "Inactive"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── AIRCRAFT SECTION ── */}
            {empSection === "aircraft" && (
                <div className="result-card">
                    <h3>All Aircraft</h3>
                    <RefreshBtn fetchFn={fetchAllAircrafts} loading={loadingAircrafts} />
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                        <thead>
                            <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                <th>ID</th><th>Model</th><th>Manufacturer</th><th>Capacity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAircrafts.map((a) => (
                                <tr key={a.aircraft_id} style={{ borderBottom: "1px solid #ddd" }}>
                                    <td style={{ padding: "10px" }}>{a.aircraft_id}</td>
                                    <td>{a.model}</td><td>{a.manufacturer}</td><td>{a.seating_capacity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── ADMIN ACTIONS SECTION ── */}
            {empSection === "actions" && (
                <div className="result-card">
                    <h3>Flight Admin Actions</h3>
                    <p style={{ color: "#666", marginBottom: "15px" }}>Add flights, update aircraft capacity, and delete routes.</p>
                    
                    <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
                        <button type="button" className="primary-btn" style={{ backgroundColor: crudAction === "addFlight" ? "#a80d24" : "#cf102d" }} onClick={() => setCrudAction("addFlight")}>+ Add New Flight</button>
                        <button type="button" className="primary-btn" style={{ backgroundColor: crudAction === "updateAircraft" ? "#111" : "#333" }} onClick={() => setCrudAction("updateAircraft")}>Update Aircraft</button>
                        <button type="button" className="primary-btn" style={{ backgroundColor: crudAction === "deleteRoute" ? "#8a0018" : "#b00020" }} onClick={() => setCrudAction("deleteRoute")}>Delete Route</button>
                    </div>

                    {crudAction === "addFlight" && (
                        <form onSubmit={handleCrudSubmit} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "6px" }}>
                            <h4>Create a New Flight</h4>
                            <div className="form-row">
                                <div className="form-group"><label>Route ID</label><input type="number" required value={crudData.routeId} onChange={(e) => setCrudData({ ...crudData, routeId: e.target.value })} /></div>
                                <div className="form-group"><label>Date</label><input type="datetime-local" required value={crudData.departureDate} onChange={(e) => setCrudData({ ...crudData, departureDate: e.target.value })} /></div>
                                <button type="submit" className="primary-btn">Submit</button>
                            </div>
                        </form>
                    )}

                    {/* ── REPORTS SECTION ── */}
                    <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
                        <h3>📊 System Analytics & Reports</h3>
                        <AdminReports />
                    </div>
                </div>
            )}
        </div>
    );
};

// HELPER COMPONENTS
const SectionBtn = ({ label, active, onClick }) => (
    <button type="button" onClick={onClick} style={{ padding: "10px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: active ? "700" : "600", background: active ? "#1a73e8" : "#f1f3f5", color: active ? "#fff" : "#333" }}>{label}</button>
);

const RefreshBtn = ({ fetchFn, loading }) => (
    <button type="button" onClick={fetchFn} disabled={loading} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>{loading ? "Refreshing..." : "Refresh"}</button>
);

export default EmployeeDashboard;
