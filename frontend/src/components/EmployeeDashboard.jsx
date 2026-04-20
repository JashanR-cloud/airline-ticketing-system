import { useState, useEffect } from 'react';
import BookingResultCard from './main_tabs/BookingResultCard';
import PassengerMyBookings from './main_tabs/PassengerMyBookings';

const EmployeeDashboard = ({
  setActiveTab,
  setIsEditingPrefs,
  prefData,
  setPrefData,
  handleUpdatePreferences,

  // Passengers section
  flightManifestSearch,
  setFlightManifestSearch,
  flightManifest,
  loadingFlightManifest,
  flightManifestMsg,
  handleFlightManifestSearch,

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
  actionMsg,

  // Routes section
  routesWithStatus,
  loadingRoutesStatus,
  fetchRoutesWithStatus,
  routeMsg,
  handleToggleRouteStatus,
  fetchRouteFlights,
  fetchReports,
  loadingReports,
  reports,

  // My Bookings section
  userBookings,
  loadingUserBookings,
  fetchUserBookings,
}) => {
  const [section, setSection] = useState("passengers");

  useEffect(() => {
    if (section === "myBookings" && typeof fetchUserBookings === "function") {
      fetchUserBookings();
    }
  }, [section]);

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
      <p style={{ color: "#d9dcff", marginBottom: "18px" }}>
        Passenger management, booking operations, and flight information.
      </p>

      {/* Section Navigation */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        <SectionBtn label="🧾 Flight Passengers" active={section === "flightManifest"} onClick={() => setSection("flightManifest")} />
        <SectionBtn label="📋 Bookings" active={section === "bookings"} onClick={() => setSection("bookings")} />
        <SectionBtn label="🗺️ Routes" active={section === "routes"} onClick={() => setSection("routes")} />
        <SectionBtn label="✈️ My Bookings" active={section === "myBookings"} onClick={() => setSection("myBookings")} />
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

      {/* Flight Passengers SEction */}
      {section === "flightManifest" && (
        <div>
          <div className="result-card" style={{ marginBottom: "24px" }}>
            <h3>Flight Manifest Lookup</h3>
            <p style={{ color: "#dfe2ff", marginBottom: "18px" }}>
              Enter a flight ID to view the passengers booked on that flight, along with the number of seats booked.
            </p>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>
                  Flight ID
                </label>
                <input
                  type="number"
                  placeholder="Enter flight ID"
                  value={flightManifestSearch}
                  onChange={(e) => setFlightManifestSearch(e.target.value)}
                  style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd" }}
                />
              </div>

              <button
                type="button"
                className="primary-btn"
                onClick={handleFlightManifestSearch}
                disabled={!flightManifestSearch}
              >
                {loadingFlightManifest ? "Searching..." : "Search Flight"}
              </button>
            </div>

            {flightManifestMsg && (
              <p style={{ marginTop: "14px", color: "#d9dcff" }}>
                {flightManifestMsg}
              </p>
            )}
          </div>

          {flightManifest?.flight && (
            <div className="result-card" style={{ marginBottom: "24px" }}>
              <h4 style={{ marginBottom: "12px" }}>Flight Information</h4>
              <p><strong>Flight ID:</strong> {flightManifest.flight.flight_id}</p>
              <p>
                <strong>Route:</strong> {flightManifest.flight.departure_airport} ({flightManifest.flight.departure_code}) → {flightManifest.flight.arrival_airport} ({flightManifest.flight.arrival_code})
              </p>
              <p><strong>Departure Time:</strong> {new Date(flightManifest.flight.date_of_departure).toLocaleString()}</p>
              <p><strong>Seats Available:</strong> {flightManifest.flight.seats_available}</p>
              {flightManifest.flight.total_seats != null && (
                <p><strong>Total Seats:</strong> {flightManifest.flight.total_seats}</p>
              )}
            </div>
          )}

          {flightManifest && (
            <div className="result-card">
              <h4 style={{ marginBottom: "12px" }}>
                Passenger List ({flightManifest.passengers.length})
              </h4>

              {flightManifest.passengers.length === 0 ? (
                <p style={{ color: "#d9dcff" }}>No passengers found for this flight.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                        {[
                          "Passenger ID",
                          "Name",
                          "Email",
                          "Phone",
                          "Seats Booked",
                          "Booking Status",
                          "Cabin Class",
                          "Seat Pref",
                          "Meal Pref",
                          "Passport",
                          "Visa"
                        ].map((h) => (
                          <th key={h} style={{ padding: "10px", textAlign: "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {flightManifest.passengers.map((p) => (
                        <tr key={`${p.booking_id}-${p.passenger_id}`} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "10px" }}>{p.passenger_id}</td>
                          <td style={{ padding: "10px", fontWeight: "600" }}>
                            {p.first_name} {p.last_name}
                          </td>
                          <td style={{ padding: "10px" }}>{p.email || "—"}</td>
                          <td style={{ padding: "10px" }}>{p.phone_number || "—"}</td>
                          <td style={{ padding: "10px", fontWeight: "700" }}>{p.seats_booked ?? "—"}</td>
                          <td style={{ padding: "10px" }}>{p.booking_status || "—"}</td>
                          <td style={{ padding: "10px" }}>{p.cabin_class || "—"}</td>
                          <td style={{ padding: "10px" }}>{p.seat_preferences || "—"}</td>
                          <td style={{ padding: "10px" }}>{p.meal_preferences || "—"}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ color: Number(p.passport_status) === 1 ? "#7dffb1" : "#b00020", fontWeight: "600" }}>
                              {Number(p.passport_status) === 1 ? "✓ Valid" : "✗ Invalid"}
                            </span>
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span style={{ color: Number(p.visa_status) === 1 ? "#5fff9f" : "#b00020", fontWeight: "600" }}>
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
        </div>
      )}

      {/* ── BOOKINGS SECTION ── */}
      {section === "bookings" && (
        <div>
          <h3>Find and Manage Bookings</h3>
          <p style={{ color: "#d9dcff", marginBottom: "20px" }}>
            Search by User ID or by Passenger Name. Select a passenger to view their bookings.
          </p>

          {/* Search Controls */}
          <div className="result-card" style={{ marginBottom: "24px", position: "relative", zIndex:2000 }}>
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
                    background: "#22252e",
                    border: "1px solid #ffffff",
                    borderRadius: "8px",
                    marginTop: "4px",
                    maxHeight: "240px",
                    overflowY: "auto",
                    zIndex: 99999,
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
                        <span style={{ marginLeft: "12px", color: "#d9dcff", fontSize: "13px" }}>
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
                  <p style={{ color: "#d9dcff", padding: "20px", textAlign: "center" }}>No active bookings</p>
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
                  <p style={{ color: "#d9dcff", padding: "20px", textAlign: "center" }}>No past bookings</p>
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
              <p style={{ color: "#d9dcff", textAlign: "center", padding: "40px" }}>
                No bookings found for the selected criteria.
              </p>
            </div>
          )}
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
            <p style={{ color: "#d9dcff", fontSize: "13px", marginBottom: "10px" }}>Click any row to see its scheduled flights.</p>
            {routeMsg.text && (
              <div style={{ marginBottom: "12px", padding: "10px 14px", borderRadius: "8px", fontWeight: "600", fontSize: "14px", background: routeMsg.type === "success" ? "#e8f5e9" : "#fce4ec", color: routeMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
                {routeMsg.text}
              </div>
            )}
            {routesWithStatus.length === 0 ? <p style={{ color: "#ffffff" }}>No route data. Click Refresh.</p> : (
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
        </div>
      )}

      {/* My Bookings Section */}
      {section === "myBookings" && (
        <div>
          <h3>My Bookings</h3>
          <p style={{ color: "#d9dcff", marginBottom: "20px" }}>
            Flights you've booked on your own account.
          </p>
          <PassengerMyBookings
            bookings={userBookings}
            loading={loadingUserBookings}
            onSearchFlights={() => setActiveTab("search")}
            onCancelBooking={handleCancelBooking}
            isEditingPrefs={isEditingPrefs}
            setIsEditingPrefs={setIsEditingPrefs}
            prefData={prefData}
            setPrefData={setPrefData}
            handleUpdatePreferences={handleUpdatePreferences}
            actionMsg={actionMsg}
          />
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
