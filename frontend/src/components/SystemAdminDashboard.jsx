
import { useState } from 'react';
import BookingResultCard from './main_tabs/BookingResultCard';
import AdminReports from './AdminReports';
import DeleteFlightModal from './DeleteFlightModal';

const SystemAdminDashboard = ({
  setActiveTab,
  setIsEditingPrefs,
  prefData,
  setPrefData,
  handleUpdatePreferences,
  airlines,
  fetchAirlines,
  airports,
  API, 
  getAuthHeaders,

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
  handleCancelBooking,

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
  reports,

  // Staff Management
  allStaff,
  fetchAllStaff,
  newStaffData,
  handleNewStaffChange,
  handleCreateStaff,
  staffManageMessage,
  handleDeleteStaff,
  loggedInUser,

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

  // Delete Flights Prompt States
  const [showDeleteFlightModal, setShowDeleteFlightModal] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

    // When user clicks "yes, Delete Flight" button
  const handleDeleteFlightClick = (flightId) => {
    setFlightToDelete(flightId);
    setShowDeleteFlightModal(true);
  };

  // When password is confirmed in the modal
  const handleConfirmDeleteFlight = async (adminPassword) => {
    if (!flightToDelete) {
      setCrudMsg({ text: "No flight selected", type: "error" });
      return;
    }

    console.log("=== DELETE ATTEMPT ===");
    console.log("Flight ID:", flightToDelete);
    console.log("Password length:", adminPassword?.length);
    console.log("getAuthHeaders prop received?", typeof getAuthHeaders);   // ← This will tell us
    console.log("API prop received?", API);

    try {
      const payload = {
        flight_id: flightToDelete,
        admin_password: adminPassword
      };

      const response = await fetch(`${API}/delete-flight`, {
        method: "DELETE",
        headers: getAuthHeaders(true),        // ← Using the prop directly
        body: JSON.stringify(payload)
      });

      console.log("Response status:", response.status);

      const data = await response.json().catch(() => ({}));
      console.log("Response data:", data);

      if (response.ok) {
        setCrudMsg({ text: `✅ Flight #${flightToDelete} has been permanently deleted.`, type: "success" });
        setShowDeleteFlightModal(false);
        setFlightToDelete(null);
        setCrudData(prev => ({ ...prev, flightId: "" }));
        if (typeof fetchReports === 'function') fetchReports();
      } else {
        setCrudMsg({ text: `❌ ${data.error || "Failed to delete flight"}`, type: "error" });
      }
    } catch (err) {
      console.error("Full delete error:", err);
      setCrudMsg({ text: "❌ Failed to connect to the server.", type: "error" });
    }
  };

  return (
    <div>
      <h2>System Admin Dashboard</h2>
      <p style={{ color: "#ffffff", marginBottom: "18px" }}>
        Full system access — passenger, booking, flight operations, and platform oversight.
      </p>

      {/* Section Navigation */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        <SectionBtn label="👤 Passengers" active={section === "passengers"} onClick={() => setSection("passengers")} />
        <SectionBtn label="📋 Bookings" active={section === "bookings"} onClick={() => setSection("bookings")} />
        <SectionBtn label="🛫 Flight Status" active={section === "flightStatus"} onClick={() => setSection("flightStatus")} />
        <SectionBtn label="🗺️ Routes" active={section === "routes"} onClick={() => setSection("routes")} />
        <SectionBtn label="✈️ Aircraft" active={section === "aircraft"} onClick={() => setSection("aircraft")} />
        <SectionBtn label="⚙️ Admin Actions" active={section === "actions"} onClick={() => setSection("actions")} />
        <SectionBtn label="👥 Manage Staff" active={section === "staff"} onClick={() => setSection("staff")} />
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
          <p style={{ color: "#b5c4ee", marginBottom: "20px" }}>
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
            <p style={{ color: "#e6e5ff", fontSize: "13px", marginBottom: "10px" }}>Click Activate or Deactivate to change a route's status. Click any row to see its scheduled flights.</p>
            {routeMsg.text && (
              <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: routeMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: routeMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                {routeMsg.text}
              </div>
            )}
            {routesWithStatus.length === 0 ? <p style={{ color: "#dde0ff" }}>No route data. Click Refresh.</p> : (
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
            <p style={{ fontSize: "12px", color: "#e3dfff", marginTop: "8px" }}>Click any row to see its flights</p>
          </div>

          {/* Route Report */}
          <div className="result-card">
            <h3>Flight Route Data Report</h3>
            <button className="nav-edit-btn" style={{ color: "#ffffff", borderColor: "#13fd1e", margin: "10px 0" }} onClick={fetchReports}>{loadingReports ? "Generating..." : "Generate Report"}</button>
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

      {/* ── AIRCRAFT SECTION ── */}
      {section === "aircraft" && (
        <div className="result-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <h3 style={{ margin: 0 }}>All Aircraft</h3>
            <RefreshBtn fetchFn={fetchAllAircrafts} loading={loadingAircrafts} />
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
                        <button type="button" onClick={() => setInlineAircraftEdit({ id: a.aircraft_id, capacity: a.seating_capacity })} style={{ background: "#333", color: "#fff", border: "none", borderRadius: "5px", padding: "5px 12px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
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

      {/* ── ADMIN ACTIONS SECTION ── */}
      {section === "actions" && (
        <div className="result-card">
          <h3>Flight Admin Actions</h3>
          <p style={{ color: "#ffffff", marginBottom: "20px" }}>Add new flights, update aircraft, or delete existing flights.</p>

          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="primary-btn"
              style={{ backgroundColor: crudAction === "addFlight" ? "#a80d24" : "#cf102d" }}
              onClick={() => { 
                setCrudAction("addFlight"); 
                setCrudMsg({ text: "", type: "" }); 
                fetchAirlines();
                fetchAllAircrafts();
              }}
            >
              + Add New Flight
            </button>
            <button
              type="button"
              className="primary-btn"
              style={{ backgroundColor: crudAction === "updateAircraft" ? "#111" : "#333" }}
              onClick={() => { setCrudAction("updateAircraft"); setCrudMsg({ text: "", type: "" }); }}
            >
              Update Aircraft Capacity
            </button>
            <button
              type="button"
              className="primary-btn"
              style={{ backgroundColor: crudAction === "deleteFlight" ? "#8a0018" : "#b00020" }}
              onClick={() => { setCrudAction("deleteFlight"); setCrudMsg({ text: "", type: "" }); }}
            >
              Delete Flight
            </button>
          </div>

          {crudMsg.text && (
            <div style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              background: crudMsg.type === "success" ? "#e8f5e9" : "#fce4ec",
              color: crudMsg.type === "success" ? "#1a6e3c" : "#b00020"
            }}>
              {crudMsg.text}
            </div>
          )}

          {/* ADD NEW FLIGHT */}
          {crudAction === "addFlight" && (
            <form onSubmit={handleCrudSubmit} style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
              <h4>Add New Flight</h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Airline</label>
                  <select 
                    value={crudData.airlineId} 
                    onChange={(e) => setCrudData({ ...crudData, airlineId: e.target.value })} 
                    required
                  >
                    <option value="">Select Airline</option>
                    {airlines && airlines.map(a => (
                      <option key={a.airline_id} value={a.airline_id}>
                        {a.airline_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Aircraft</label>
                  <select 
                    value={crudData.aircraftId} 
                    onChange={(e) => setCrudData({ ...crudData, aircraftId: e.target.value })} 
                    required
                  >
                    <option value="">Select Aircraft</option>
                    {allAircrafts && allAircrafts.map(ac => (
                      <option key={ac.aircraft_id} value={ac.aircraft_id}>
                        {ac.model} ({ac.seating_capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Departure Airport</label>
                  <select 
                    value={crudData.departureAirportId} 
                    onChange={(e) => setCrudData({ ...crudData, departureAirportId: e.target.value })} 
                    required
                  >
                    <option value="">Select Departure</option>
                    {airports && airports.map(ap => (
                      <option key={ap.airport_id} value={ap.airport_id}>
                        {ap.airport_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Arrival Airport</label>
                  <select 
                    value={crudData.arrivalAirportId} 
                    onChange={(e) => setCrudData({ ...crudData, arrivalAirportId: e.target.value })} 
                    required
                  >
                    <option value="">Select Arrival</option>
                    {airports && airports.map(ap => (
                      <option key={ap.airport_id} value={ap.airport_id}>
                        {ap.airport_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Departure Date & Time</label>
                  <input 
                    type="datetime-local" 
                    required 
                    value={crudData.departureDate} 
                    onChange={(e) => setCrudData({ ...crudData, departureDate: e.target.value })} 
                  />
                </div>
              </div>

              <button type="submit" className="primary-btn" style={{ marginTop: "20px" }}>
                Create Flight
              </button>
            </form>
          )}

          {/* UPDATE AIRCRAFT*/}
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

          {/* DELETE FLIGHT */}
          {crudAction === "deleteFlight" && (
            <div style={{ background: "#212b34", padding: "20px", borderRadius: "8px", border: "1px solid #ffcdd2" }}>
              <h4 style={{ color: "#b00020", marginBottom: "10px" }}>Delete Flight</h4>
              <p style={{ color: "#ffffff", marginBottom: "20px" }}>
                Enter the Flight ID you want to permanently delete.
              </p>

              <div className="form-group">
                <label style={{ color: "#ffffff", marginBottom: "20px" }}>Flight ID to Delete</label>
                <input
                  type="number"
                  placeholder="e.g. 12345"
                  value={crudData.flightId || ""}
                  onChange={(e) => setCrudData({ ...crudData, flightId: e.target.value })}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px" }}
                />
              </div>

              <button
                type="button"
                className="primary-btn"
                style={{ backgroundColor: "#b00020", marginTop: "12px" }}
                onClick={() => handleDeleteFlightClick(crudData.flightId)}
              >
                Delete This Flight
              </button>
            </div>
          )}

          {/* Analytics Reports */}
          <div style={{ marginTop: "40px", borderTop: "2px solid #eee", paddingTop: "20px" }}>
            <h3 style={{ marginBottom: "20px" }}>System Analytics & Reports</h3>
            <AdminReports />
          </div>
        </div>
      )}

      {/* ── MANAGE STAFF SECTION ── */}
      {section === "staff" && (
        <div className="result-card">
          <h3>Manage Staff</h3>
          <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
            Create or remove Employee and System Admin accounts.
          </p>

          <button className="nav-edit-btn" style={{ color: "#ffffff", borderColor: "#15dd8d", margin: "10px 0" }} onClick={fetchAllStaff}>
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
      )}

      <DeleteFlightModal
        isOpen={showDeleteFlightModal}
        onClose={() => {
          setShowDeleteFlightModal(false);
          setFlightToDelete(null);
        }}
        onConfirm={handleConfirmDeleteFlight}
        flightId={flightToDelete}
      />
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

export default SystemAdminDashboard;
