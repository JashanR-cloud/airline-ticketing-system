import React from 'react';
import BookingResultCard from './main_tabs/BookingResultCard';
//import AdminReports from './AdminReports';

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
        <div>
            <h2>Employee Dashboard</h2>
            <p style={{ color: "#666", marginBottom: "18px" }}>
                Full access: passenger management, bookings, flight operations, and administrative actions.
            </p>

            {/* Section Navigation */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                <SectionBtn
                    id="passengers"
                    label="👤 Passengers"
                    active={empSection === "passengers"}
                    onClick={() => setEmpSection("passengers")}
                />
                <SectionBtn
                    id="bookings"
                    label="📋 Bookings"
                    active={empSection === "bookings"}
                    onClick={() => setEmpSection("bookings")}
                />
                <SectionBtn
                    id="flightStatus"
                    label="🛫 Flight Status"
                    active={empSection === "flightStatus"}
                    onClick={() => setEmpSection("flightStatus")}
                />
                <SectionBtn
                    id="routes"
                    label="🗺️ Routes"
                    active={empSection === "routes"}
                    onClick={() => setEmpSection("routes")}
                />
                <SectionBtn
                    id="aircraft"
                    label="✈️ Aircraft"
                    active={empSection === "aircraft"}
                    onClick={() => setEmpSection("aircraft")}
                />
                <SectionBtn
                    id="actions"
                    label="⚙️ Admin Actions"
                    active={empSection === "actions"}
                    onClick={() => setEmpSection("actions")}
                />
                <button
                    type="button"
                    onClick={() => setActiveTab("search")}
                    style={{
                        padding: "8px 18px",
                        borderRadius: "20px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        background: "#f0f0f0",
                        color: "#333"
                    }}
                >
                    🔍 Search Flights
                </button>
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
                            <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#888" }}>
                                Showing <strong>{allPassengers.length}</strong> registered passenger{allPassengers.length !== 1 ? "s" : ""}
                            </p>

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
                                            <td style={{ padding: "10px" }}>
                                                <span style={{ background: p.user_role === "Passenger" ? "#e3f2fd" : "#e8f5e9", color: p.user_role === "Passenger" ? "#1565c0" : "#1a6e3c", fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "999px" }}>
                                                    {p.user_role}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px" }}>{p.email}</td>
                                            <td style={{ padding: "10px" }}>{p.phone_number || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.seat_preferences || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.meal_preferences || "—"}</td>
                                            <td style={{ padding: "10px" }}>{p.country_of_origin || "—"}</td>
                                            <td style={{ padding: "10px" }}>
                                                <span style={{ color: Number(p.passport_status) === 1 ? "#1a6e3c" : "#b00020", fontWeight: "600" }}>
                                                    {Number(p.passport_status) === 1 ? "✓ Valid" : "✗ Invalid"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "10px" }}>
                                                <span style={{ color: Number(p.visa_status) === 1 ? "#1a6e3c" : "#b00020", fontWeight: "600" }}>
                                                    {Number(p.visa_status) === 1 ? "✓ Valid" : "✗ Invalid"}
                                                </span>
                                            </td>
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
                    {/* Find & Modify Booking */}
                    <div className="result-card" style={{ marginBottom: "20px" }}>
                        <h3>Find Booking</h3>
                        <form onSubmit={handleManageSubmit}>
                            <div className="form-group">
                                <label>Select Booking</label>
                                <select name="bookingId" value={manageData.bookingId} onChange={handleManageChange} required disabled={loadingAllBookings}>
                                    <option value="">{loadingAllBookings ? "Loading bookings..." : "-- Select a booking --"}</option>
                                    {allBookingsAdmin.map((b) => (
                                        <option key={b.booking_id} value={b.booking_id}>
                                            #{b.booking_id} — {b.first_name} {b.last_name} ({b.booking_status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="primary-btn" disabled={!manageData.bookingId}>
                                {loadingManage ? "Searching..." : "View Details"}
                            </button>
                            {manageMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{manageMessage}</p>}
                            {manageResult && (
                                <BookingResultCard
                                    result={manageResult}
                                    onCancel={handleCancelBooking}
                                    showPrefs={true}
                                    isEditingPrefs={setIsEditingPrefs}
                                    setIsEditingPrefs={setIsEditingPrefs}
                                    prefData={prefData}
                                    setPrefData={setPrefData}
                                    handleUpdatePreferences={handleUpdatePreferences}
                                    actionMsg={actionMsg}
                                />
                            )}
                        </form>
                    </div>

                    {/* Modify Booking Status */}
                    <div className="result-card" style={{ marginBottom: "20px" }}>
                        <h3>Modify Booking Status</h3>
                        <form onSubmit={handleUpdateBookingStatus}>
                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                                <div className="form-group">
                                    <label>Select Booking</label>
                                    <select value={bookingStatusUpdate.bookingId} onChange={(e) => setBookingStatusUpdate({ ...bookingStatusUpdate, bookingId: e.target.value })} required disabled={loadingAllBookings}>
                                        <option value="">{loadingAllBookings ? "Loading..." : "-- Select a booking --"}</option>
                                        {allBookingsAdmin.map((b) => (
                                            <option key={b.booking_id} value={b.booking_id}>
                                                #{b.booking_id} — {b.first_name} {b.last_name} ({b.booking_status})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>New Status</label>
                                    <select value={bookingStatusUpdate.status} onChange={(e) => setBookingStatusUpdate({ ...bookingStatusUpdate, status: e.target.value })}>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <button type="submit" className="primary-btn" style={{ padding: "16px 20px", backgroundColor: "#333" }}>Update Status</button>
                            </div>
                            {bookingStatusMsg && <p style={{ marginTop: "12px", fontWeight: "600", color: bookingStatusMsg.startsWith("✅") ? "#1a6e3c" : "#b00020" }}>{bookingStatusMsg}</p>}
                        </form>
                    </div>

                    {/* Add New Booking */}
                    <div className="result-card" style={{ marginBottom: "20px" }}>
                        <h3>Add New Booking</h3>
                        <p style={{ color: "#666", fontSize: "14px", marginBottom: "12px" }}>Create a confirmed booking for any user by entering their User ID and Passenger ID.</p>
                        <form onSubmit={handleAddBookingAdmin}>
                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                                <div className="form-group">
                                    <label>User ID</label>
                                    <input type="number" value={adminNewBooking.userId} onChange={(e) => setAdminNewBooking({ ...adminNewBooking, userId: e.target.value })} placeholder="e.g. 5" required />
                                </div>
                                <div className="form-group">
                                    <label>Passenger ID</label>
                                    <input type="number" value={adminNewBooking.passengerId} onChange={(e) => setAdminNewBooking({ ...adminNewBooking, passengerId: e.target.value })} placeholder="e.g. 5" required />
                                </div>
                                <button type="submit" className="primary-btn" style={{ padding: "16px 20px", backgroundColor: "#1a6e3c" }}>Create Booking</button>
                            </div>
                            {adminNewBookingMsg && <p style={{ marginTop: "12px", fontWeight: "600", color: adminNewBookingMsg.startsWith("✅") ? "#1a6e3c" : "#b00020" }}>{adminNewBookingMsg}</p>}
                        </form>
                    </div>

                    {/* All Bookings Table */}
                    <div className="result-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h3 style={{ margin: 0 }}>All Bookings</h3>
                            <RefreshBtn section="allBookings" fetchFn={fetchAllBookingsAdmin} loading={loadingAllBookings} />
                        </div>
                        {allBookingsAdmin.length === 0 ? <p style={{ color: "#888" }}>No bookings loaded. Click Refresh.</p> : (
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                    <thead>
                                        <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                            {["Booking ID", "Passenger", "Email", "Phone", "Seat Pref", "Meal Pref", "Status", "Date"].map((h) => (
                                                <th key={h} style={{ padding: "10px", textAlign: "left" }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allBookingsAdmin.map((b) => (
                                            <tr key={b.booking_id} style={{ borderBottom: "1px solid #eee" }}>
                                                <td style={{ padding: "10px" }}>#{b.booking_id}</td>
                                                <td style={{ padding: "10px", fontWeight: "600" }}>{b.first_name} {b.last_name}</td>
                                                <td style={{ padding: "10px" }}>{b.email}</td>
                                                <td style={{ padding: "10px" }}>{b.phone_number || "—"}</td>
                                                <td style={{ padding: "10px" }}>{b.seat_preferences || "—"}</td>
                                                <td style={{ padding: "10px" }}>{b.meal_preferences || "—"}</td>
                                                <td style={{ padding: "10px" }}>
                                                    <span style={{ background: b.booking_status === "Confirmed" ? "#e8f5e9" : b.booking_status === "Cancelled" ? "#fce4ec" : "#fff8e1", color: b.booking_status === "Confirmed" ? "#1a6e3c" : b.booking_status === "Cancelled" ? "#b00020" : "#f57c00", padding: "3px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>{b.booking_status}</span>
                                                </td>
                                                <td style={{ padding: "10px" }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── SECTION: Flight Status ── */}
            {empSection === "flightStatus" && (
                <div className="result-card">
                    <h3>Check Flight Status</h3>
                    <form onSubmit={handleStatusSubmit}>
                        <div className="form-group">
                            <label>Select Flight</label>
                            <select
                                name="flightId"
                                value={statusData.flightId}
                                onChange={handleStatusChange}
                                required
                                disabled={loadingAllFlights}
                            >
                                <option value="">
                                    {loadingAllFlights ? "Loading flights..." : "-- Select a Flight --"}
                                </option>
                                {allFlights.map((f) => (
                                    <option key={f.flight_id} value={f.flight_id}>
                                        #{f.flight_id} — {f.departure_airport} → {f.arrival_airport} ({new Date(f.date_of_departure).toLocaleDateString()}, {f.seats_available} seats)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="primary-btn" disabled={!statusData.flightId}>{loadingStatus ? "Searching..." : "Check Status"}</button>
                        {statusMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{statusMessage}</p>}
                        {statusResult && (
                            <div className="result-card" style={{ marginTop: "14px" }}>
                                <p><strong>Flight ID:</strong> {statusResult.flight_id}</p>
                                <p><strong>Departure Airport:</strong> {statusResult.departure_airport}</p>
                                <p><strong>Arrival Airport:</strong> {statusResult.arrival_airport}</p>
                                <p><strong>Departure Time:</strong> {new Date(statusResult.date_of_departure).toLocaleString()}</p>
                                <p><strong>Seats Available:</strong> {statusResult.seats_available}</p>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* ── SECTION: Routes ── */}
            {empSection === "routes" && (
                <div>
                    {/* Route Status Table */}
                    <div className="result-card" style={{ marginBottom: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h3 style={{ margin: 0 }}>Route Active / Inactive Status</h3>
                            <RefreshBtn section="routes" fetchFn={fetchRoutesWithStatus} loading={loadingRoutesStatus} />
                        </div>
                        <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>Click Activate or Deactivate to change a route's status. Click any row to see its scheduled flights.</p>
                        {routeMsg.text && (
                            <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: routeMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: routeMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                                {routeMsg.text}
                            </div>
                        )}
                        {routesWithStatus.length === 0 ? <p style={{ color: "#888" }}>No route data. Click Refresh.</p> : (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                                <thead>
                                    <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                        {["Route ID", "Departure", "Arrival", "Flights", "Status", "Action"].map((h) => (
                                            <th key={h} style={{ padding: "10px", textAlign: h === "Flights" || h === "Status" || h === "Action" ? "center" : "left" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {routesWithStatus.map((r) => (
                                        <tr key={r.route_id} style={{ borderBottom: "1px solid #ddd", cursor: "pointer", height: "44px" }} onClick={() => fetchRouteFlights(r.route_id, `${r.departure} → ${r.arrival}`)}>
                                            <td style={{ padding: "10px" }}>{r.route_id}</td>
                                            <td style={{ padding: "10px" }}>{r.departure}</td>
                                            <td style={{ padding: "10px" }}>{r.arrival}</td>
                                            <td style={{ padding: "10px", textAlign: "center" }}>{r.total_flights}</td>
                                            <td style={{ padding: "10px", textAlign: "center" }}>
                                                <span style={{ background: r.is_active ? "#e8f5e9" : "#fce4ec", color: r.is_active ? "#1a6e3c" : "#b00020", padding: "3px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: "700" }}>{r.is_active ? "Active" : "Inactive"}</span>
                                            </td>
                                            <td style={{ padding: "10px", textAlign: "center" }}>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleRouteStatus(r.route_id); }}
                                                    style={{ background: r.is_active ? "#b00020" : "#1a6e3c", color: "#fff", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                                                    {r.is_active ? "Deactivate" : "Activate"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>💡 Click any row to see its flights</p>
                    </div>

                    {/* Route Report */}
                    <div className="result-card">
                        <h3>Flight Route Data Report</h3>
                        <button className="nav-edit-btn" style={{ color: "#222", borderColor: "#222", margin: "10px 0" }} onClick={fetchReports}>{loadingReports ? "Generating..." : "Generate Report"}</button>
                        {reports.length > 0 && (
                            <table style={{ width: "100%", textAlign: "left", marginTop: "10px", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #ddd" }}>
                                        {["Route ID", "Departure", "Arrival", "Total Flights"].map((h) => <th key={h} style={{ padding: "10px" }}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr key={r.route_id} style={{ borderBottom: "1px solid #ddd", height: "40px", cursor: "pointer" }}
                                            onClick={() => fetchRouteFlights(r.route_id, `${r.departure} → ${r.arrival}`)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                                            <td style={{ padding: "10px" }}>{r.route_id}</td>
                                            <td style={{ padding: "10px" }}>{r.departure}</td>
                                            <td style={{ padding: "10px" }}>{r.arrival}</td>
                                            <td style={{ padding: "10px" }}>
                                                <span style={{ background: "#e3f2fd", color: "#1565c0", padding: "3px 10px", borderRadius: "10px", fontWeight: "700", fontSize: "13px" }}>{r.total_flights}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>💡 Click any row to view its flights</p>
                    </div>
                </div>
            )}

            {/* ── SECTION: Aircraft ── */}
            {empSection === "aircraft" && (
                <div className="result-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <h3 style={{ margin: 0 }}>All Aircraft</h3>
                        <RefreshBtn section="aircraft" fetchFn={fetchAllAircrafts} loading={loadingAircrafts} />
                    </div>
                    {allAircrafts.length === 0 ? <p style={{ color: "#888" }}>No aircraft data. Click Refresh.</p> : (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                            <thead>
                                <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                                    {["ID", "Model", "Manufacturer", "Seating Capacity", "Baggage Capacity", "Edit"].map((h) => (
                                        <th key={h} style={{ padding: "10px", textAlign: h === "Seating Capacity" || h === "Baggage Capacity" || h === "Edit" ? "center" : "left" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {allAircrafts.map((a) => (
                                    <tr key={a.aircraft_id} style={{ borderBottom: "1px solid #ddd", height: "44px" }}>
                                        <td style={{ padding: "10px" }}>{a.aircraft_id}</td>
                                        <td style={{ padding: "10px", fontWeight: "600" }}>{a.model}</td>
                                        <td style={{ padding: "10px" }}>{a.manufacturer}</td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            {inlineAircraftEdit.id === a.aircraft_id ? (
                                                <input type="number" value={inlineAircraftEdit.capacity} onChange={(e) => setInlineAircraftEdit({ ...inlineAircraftEdit, capacity: e.target.value })}
                                                    style={{ width: "80px", padding: "4px 8px", border: "1px solid #ccc", borderRadius: "4px", textAlign: "center" }} />
                                            ) : a.seating_capacity}
                                        </td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>{a.max_baggage_capacity}</td>
                                        <td style={{ padding: "10px", textAlign: "center" }}>
                                            {inlineAircraftEdit.id === a.aircraft_id ? (
                                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                                    <button type="button" onClick={() => handleInlineAircraftUpdate(a.aircraft_id)} style={{ background: "#1a6e3c", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", fontSize: "12px" }}>Save</button>
                                                    <button type="button" onClick={() => setInlineAircraftEdit({ id: null, capacity: "" })} style={{ background: "#666", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                                                </div>
                                            ) : (
                                                <button type="button" onClick={() => setInlineAircraftEdit({ id: a.aircraft_id, capacity: a.seating_capacity })} style={{ background: "#333", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 12px", cursor: "pointer", fontSize: "12px" }}>✏️ Edit</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {aircraftMsg.text && (
                        <div style={{ marginTop: "12px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: aircraftMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: aircraftMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                            {aircraftMsg.text}
                        </div>
                    )}
                </div>
            )}

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
                    {crudMsg.text && (
                        <div style={{ marginBottom: "16px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: crudMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: crudMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                            {crudMsg.text}
                        </div>
                    )}

                    {crudAction === "addFlight" && (
                        <form onSubmit={handleCrudSubmit} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "6px" }}>
                            <h4 style={{ marginBottom: "15px" }}>Create a New Flight</h4>
                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                                <div className="form-group"><label>Route ID</label><input type="number" required value={crudData.routeId} onChange={(e) => setCrudData({ ...crudData, routeId: e.target.value })} placeholder="e.g. 1" /></div>
                                <div className="form-group"><label>Departure Date</label><input type="datetime-local" required value={crudData.departureDate} onChange={(e) => setCrudData({ ...crudData, departureDate: e.target.value })} /></div>
                                <div className="form-group"><label>Seats Available</label><input type="number" required value={crudData.seats} onChange={(e) => setCrudData({ ...crudData, seats: e.target.value })} placeholder="e.g. 150" /></div>
                                <button type="submit" className="primary-btn" style={{ padding: "16px 20px" }}>Submit</button>
                            </div>
                        </form>
                    )}

                    {crudAction === "updateAircraft" && (
                        <form onSubmit={handleCrudSubmit} style={{ background: "#f5f5f5", padding: "15px", borderRadius: "6px" }}>
                            <h4 style={{ marginBottom: "15px" }}>Update Aircraft Capacity</h4>
                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                                <div className="form-group"><label>Aircraft ID</label><input type="number" required value={crudData.aircraftId} onChange={(e) => setCrudData({ ...crudData, aircraftId: e.target.value })} placeholder="e.g. 1" /></div>
                                <div className="form-group"><label>New Capacity</label><input type="number" required value={crudData.capacity} onChange={(e) => setCrudData({ ...crudData, capacity: e.target.value })} placeholder="e.g. 200" /></div>
                                <button type="submit" className="primary-btn" style={{ padding: "16px 20px", backgroundColor: "#333" }}>Submit</button>
                            </div>
                        </form>
                    )}

                    {crudAction === "deleteRoute" && (
                        <form onSubmit={handleCrudSubmit} style={{ background: "#ffebee", padding: "15px", borderRadius: "6px", border: "1px solid #ffcdd2" }}>
                            <h4 style={{ marginBottom: "15px", color: "#b00020" }}>Delete an Existing Route</h4>
                            <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>⚠️ Warning: This permanently removes the route from the database.</p>
                            <div className="form-row" style={{ alignItems: "flex-end" }}>
                                <div className="form-group"><label>Route ID to Delete</label><input type="number" required value={crudData.routeId} onChange={(e) => setCrudData({ ...crudData, routeId: e.target.value })} placeholder="e.g. 5" /></div>
                                <button type="submit" className="primary-btn" style={{ padding: "16px 20px", backgroundColor: "#b00020" }}>Confirm Delete</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

const SectionBtn = ({label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "10px 18px",
      borderRadius: "20px",
      border: "none",
      cursor: "pointer",
      fontWeight: active ? "700" : "600",
      background: active ? "#1a73e8" : "#f1f3f5",
      color: active ? "#fff" : "#333",
    }}
  >
    {label}
  </button>
);

// Small helper: Refresh Button
const RefreshBtn = ({fetchFn, loading }) => (
  <button
    type="button"
    onClick={fetchFn}
    disabled={loading}
    style={{
      padding: "6px 14px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      background: "#fff",
      cursor: loading ? "not-allowed" : "pointer",
      fontSize: "13px",
      fontWeight: "600",
      color: "#333"
    }}
  >
    {loading ? "Refreshing..." : "Refresh"}
  </button>
);

export default EmployeeDashboard;
