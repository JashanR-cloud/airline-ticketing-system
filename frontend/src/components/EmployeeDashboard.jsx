import { useState } from 'react';
import BookingResultCard from './main_tabs/BookingResultCard';

const EmployeeDashboard = ({
  setActiveTab,
  setIsEditingPrefs,
  prefData,
  setPrefData,
  handleUpdatePreferences,

  // Passengers section
  allPassengers,
  loadingPassengers,
  fetchAllPassengers,

  // Bookings section
  searchByUserId,
  searchByName,
  setSearchByUserId,
  setSearchByName,
  searchResults,
  handleSearchBookings,
  isEditingPrefs,
  setSelectedPassenger,
  handlePassengerSearch,
  passengerSuggestions,
  setPassengerSuggestions,
  selectedPassenger,
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
  actionMsg,

  // Flight Status
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
  fetchRouteFlights,
  fetchReports,
  loadingReports,
  reports,
}) => {
  const [section, setSection] = useState("passengers");

  const now = new Date();
  const activeBookings = searchResults.filter(b => {
    const flightDate = new Date(b.date_of_departure);
    return (b.booking_status === "Confirmed" || b.booking_status === "Booked") && flightDate >= now;
  });

  const pastBookings = searchResults.filter(b => {
    const flightDate = new Date(b.date_of_departure);
    return b.booking_status === "Past" || flightDate < now;
  });

  return (
    <div>
      <h2>Employee Dashboard</h2>
      <p style={{ color: "#666", marginBottom: "18px" }}>
        Passenger management, booking operations, and flight information.
      </p>

      {/* Section Navigation */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        <SectionBtn label="👤 Passengers" active={section === "passengers"} onClick={() => setSection("passengers")} />
        <SectionBtn label="📋 Bookings" active={section === "bookings"} onClick={() => setSection("bookings")} />
        <SectionBtn label="🛫 Flight Status" active={section === "flightStatus"} onClick={() => setSection("flightStatus")} />
        <SectionBtn label="🗺️ Routes" active={section === "routes"} onClick={() => setSection("routes")} />
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          style={{
            padding: "10px 18px",
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
      {section === "passengers" && (
        <div className="result-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0 }}>Passenger Directory</h3>
            <RefreshBtn fetchFn={fetchAllPassengers} loading={loadingPassengers} />
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
      {section === "bookings" && (
        <div>
          <h3>Find and Manage Bookings</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Search by User ID or by Passenger Name. Select a passenger to view their bookings.
          </p>

          {/* Search Controls */}
          <div className="result-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              {/* User ID Search */}
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Search by User ID</label>
                <input
                  type="number"
                  placeholder="Enter User ID"
                  value={searchByUserId}
                  onChange={(e) => {
                    setSearchByUserId(e.target.value);
                    setSearchByName("");           // clear the other field
                    setSelectedPassenger(null);
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
              </div>

              {/* Name Search with predictive dropdown */}
              <div style={{ flex: 1, position: "relative" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Search by Passenger Name</label>
                <input
                  type="text"
                  placeholder="Type passenger name..."
                  value={searchByName}
                  onChange={(e) => {
                    setSearchByName(e.target.value);
                    setSearchByUserId("");         // clear the other field
                    handlePassengerSearch(e.target.value);
                  }}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />

                {/* Predictive dropdown */}
                {passengerSuggestions.length > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginTop: "4px",
                    maxHeight: "240px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                  }}>
                    {passengerSuggestions.map(p => (
                      <div
                        key={p.passenger_id}
                        onClick={() => {
                          setSelectedPassenger(p);
                          setSearchByName(`${p.first_name} ${p.last_name}`);
                          setPassengerSuggestions([]);
                          handleSearchBookings(p.passenger_id);
                        }}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee"
                        }}
                      >
                        <strong>{p.first_name} {p.last_name}</strong>
                        <span style={{ marginLeft: "12px", color: "#666", fontSize: "13px" }}>
                          {p.email}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => handleSearchBookings()}
              className="primary-btn"
              disabled={!searchByUserId && !selectedPassenger}
            >
              Search Bookings
            </button>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div>
              {/* Active Bookings */}
              <div className="result-card" style={{ marginBottom: "24px" }}>
                <h4>Active Bookings ({activeBookings.length})</h4>
                {activeBookings.length === 0 ? (
                  <p style={{ color: "#888", padding: "20px", textAlign: "center" }}>No active bookings</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {activeBookings.map(booking => (
                      <BookingResultCard
                        key={booking.booking_id}
                        result={booking}
                        onCancel={handleCancelBooking}
                        showPrefs={true}
                        isEditingPrefs={isEditingPrefs}
                        setIsEditingPrefs={setIsEditingPrefs}
                        prefData={prefData}
                        setPrefData={setPrefData}
                        handleUpdatePreferences={handleUpdatePreferences}
                        actionMsg={actionMsg}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Past Bookings */}
              <div className="result-card">
                <h4>Past Bookings ({pastBookings.length})</h4>
                {pastBookings.length === 0 ? (
                  <p style={{ color: "#888", padding: "20px", textAlign: "center" }}>No past bookings</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {pastBookings.map(booking => (
                      <BookingResultCard
                        key={booking.booking_id}
                        result={booking}
                        onCancel={handleCancelBooking}
                        showPrefs={true}
                        isEditingPrefs={isEditingPrefs}
                        setIsEditingPrefs={setIsEditingPrefs}
                        prefData={prefData}
                        setPrefData={setPrefData}
                        handleUpdatePreferences={handleUpdatePreferences}
                        actionMsg={actionMsg}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {searchResults.length === 0 && (searchByUserId || selectedPassenger) && (
            <div className="result-card">
              <p style={{ color: "#888", textAlign: "center", padding: "40px" }}>
                No bookings found for the selected criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── FLIGHT STATUS SECTION ── */}
      {section === "flightStatus" && (
        <div className="result-card">
          <h3>Check Flight Status</h3>
          <form onSubmit={handleStatusSubmit}>
            <div className="form-group">
              <label>Select Flight</label>
              <select name="flightId" value={statusData.flightId} onChange={handleStatusChange} required disabled={loadingAllFlights}>
                <option value="">{loadingAllFlights ? "Loading flights..." : "-- Select a Flight --"}</option>
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

      {/* ── ROUTES SECTION ── */}
      {section === "routes" && (
        <div>
          <div className="result-card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Route Active / Inactive Status</h3>
              <RefreshBtn fetchFn={fetchRoutesWithStatus} loading={loadingRoutesStatus} />
            </div>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>Click any row to see its scheduled flights.</p>
            {routeMsg.text && (
              <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: routeMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: routeMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                {routeMsg.text}
              </div>
            )}
            {routesWithStatus.length === 0 ? <p style={{ color: "#888" }}>No route data. Click Refresh.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                    {["Route ID", "Departure", "Arrival", "Flights", "Status"].map((h) => (
                      <th key={h} style={{ padding: "10px", textAlign: h === "Flights" || h === "Status" ? "center" : "left" }}>{h}</th>
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
      
    
      <button 
        type="button"
        style={{
          backgroundColor: r.is_active ? "#cf102d" : "#1a6e3c",
          color: "white",
          border: "none",
          padding: "6px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "bold"
        }}
        onClick={(e) => {
          e.stopPropagation(); // Prevents the "fetchRouteFlights" row click from firing
          
          if (r.is_active) {
            // Confirm before a negative action
            const confirmed = window.confirm("Are you sure you want to deactivate this route?");
            if (confirmed) {
              handleToggleRouteStatus(r.route_id);
            }
          } else {
            // Positive action: Activate immediately
            handleToggleRouteStatus(r.route_id);
          }
        }}
      >
        {r.is_active ? "Deactivate" : "Activate"}
      </button>

    </td>
  </tr>
))}
                </tbody>
              </table>
            )}
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>Click any row to see its flights</p>
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
            <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px" }}>Click any row to view its flights</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionBtn = ({ label, active, onClick }) => (
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

const RefreshBtn = ({ fetchFn, loading }) => (
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
