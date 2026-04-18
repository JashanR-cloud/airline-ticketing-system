import React from 'react';

function findArrivalDate(date_of_departure, estimated_time_hours) {
    const departureDate = new Date(date_of_departure);

    // Convert hours (including decimals) to milliseconds
    const durationMs = estimated_time_hours * 60 * 60 * 1000;

    // Add duration to departure time
    const arrivalDate = new Date(departureDate.getTime() + durationMs);

    return arrivalDate;
}

function formatDuration(estimated_time_hours) {
    const hours = Math.floor(estimated_time_hours);
    const minutes = Math.round((estimated_time_hours - hours) * 60);

    return `${hours}h ${minutes}m`;
}

const SearchFlightsPanel = ({
  // Search form state & handlers
  flightSearch,
  handleFlightChange,
  handleFlightSubmit,
  loadingFlights,
  searchMessage,
  flightResults,
  loadingAirports,
  setActiveTab,
  setShowCreateModal,
  cities,

  // Vacation Package related
  vacationMode,
  setVacationMode,
  selectedPackage,
  setSelectedPackage,
  pkgSearch,
  setPkgSearch,
  pkgCategory,
  setPkgCategory,
  VACATION_PACKAGES,
  PACKAGE_CATEGORIES,
  CATEGORY_STYLES,

  // Flight booking related
  selectedClass,
  setSelectedClass,
  getPriceForClass,
  handleBookFlight,
  handleRedeemFlight,
  freeFlightMode,
  setFreeFlightMode,

  // Auth / Role
  loggedInUser,
  isPassenger,
  canBook,
  loyaltyDiscount = 0,
}) => {
  return (
    <>
      {/* Mode Toggle: Flight vs Vacation Package */}
      <div className="trip-toggle" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className={!vacationMode ? "toggle-btn active-toggle" : "toggle-btn"}
          onClick={() => {
            setVacationMode(false);
            setSelectedPackage(null);
          }}
        >
          ✈️ Flight Only
        </button>
        <button
          type="button"
          className={vacationMode ? "toggle-btn active-toggle" : "toggle-btn"}
          onClick={() => setVacationMode(true)}
        >
          🏖️ Vacation Package
        </button>
      </div>

      {/* ====================== VACATION PACKAGE MODE ====================== */}
      {vacationMode ? (
        <div>
          {/* Package Browser Header */}
          <div style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
            borderRadius: "12px",
            padding: "24px 28px",
            marginBottom: "20px"
          }}>
            <h3 style={{ margin: "0 0 6px", color: "#fff", fontSize: "20px", fontWeight: "800" }}>
              🏖️ Vacation Packages
            </h3>
            <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
              All-inclusive bundles with flights, hotel, car rental & activities
            </p>

            {/* Search Input */}
            <div style={{ position: "relative", marginBottom: "14px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
              <input
                type="text"
                placeholder="Search destination or package name..."
                value={pkgSearch}
                onChange={(e) => setPkgSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 36px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "14px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff"
                }}
              />
            </div>

            {/* Category Filters */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PACKAGE_CATEGORIES.map((cat) => {
                const style = cat !== "All" ? CATEGORY_STYLES[cat] : null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPkgCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "13px",
                      background: pkgCategory === cat ? "#fff" : "rgba(255,255,255,0.15)",
                      color: pkgCategory === cat ? (style?.color || "#1a1a2e") : "rgba(255,255,255,0.85)"
                    }}
                  >
                    {cat !== "All" && CATEGORY_STYLES[cat]?.icon + " "}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Package Banner */}
          {selectedPackage && (
            <div style={{
              background: "linear-gradient(135deg, #1a6e3c, #22a85a)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px"
            }}>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: "800", fontSize: "15px" }}>
                  ✅ Package Selected: {selectedPackage.name}
                </p>
                <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
                  {selectedPackage.city} · {selectedPackage.duration} nights · ${selectedPackage.price}/person
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setVacationMode(false)}
                  style={{
                    background: "#fff",
                    color: "#1a6e3c",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: "800",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  ✈️ Now Pick a Flight
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPackage(null)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Package Grid */}
          {(() => {
            const filtered = VACATION_PACKAGES.filter((pkg) => {
              const matchCat = pkgCategory === "All" || pkg.category === pkgCategory;
              const q = pkgSearch.toLowerCase();
              const matchSearch = !q ||
                pkg.city.toLowerCase().includes(q) ||
                pkg.name.toLowerCase().includes(q) ||
                pkg.category.toLowerCase().includes(q);
              return matchCat && matchSearch;
            });

            if (filtered.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                  <p style={{ fontSize: "32px" }}>🔍</p>
                  <p>No packages match your search.</p>
                  <button
                    type="button"
                    onClick={() => { setPkgSearch(""); setPkgCategory("All"); }}
                    style={{ marginTop: "8px", background: "#f0f0f0", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}
                  >
                    Clear filters
                  </button>
                </div>
              );
            }

            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filtered.map((pkg) => {
                  const catStyle = CATEGORY_STYLES[pkg.category] || {};
                  const savings = pkg.originalPrice - pkg.price;
                  const isSelected = selectedPackage?.id === pkg.id;

                  return (
                    <div key={pkg.id} style={{
                      border: `2px solid ${isSelected ? "#1a6e3c" : "#eee"}`,
                      borderRadius: "16px",
                      overflow: "hidden",
                      background: "#fff",
                      boxShadow: isSelected ? "0 0 0 3px rgba(26,110,60,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "all 0.2s"
                    }}>
                      {/* Card Header */}
                      <div style={{ background: catStyle.bg || "#f8f8f8", padding: "18px 18px 14px", position: "relative" }}>
                        <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", flexDirection: "column", alignItems: "flex-end" }}>
                          <span style={{ background: catStyle.color, color: "#fff", fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {catStyle.icon} {pkg.category}
                          </span>
                          {savings > 0 && (
                            <span style={{ background: "#cf102d", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "999px" }}>
                              Save ${savings}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "36px" }}>{pkg.flag}</span>
                          <div>
                            <p style={{ margin: "0 0 2px", fontWeight: "800", fontSize: "17px", color: "#1a1a2e" }}>{pkg.name}</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{pkg.city} · {pkg.duration} nights</p>
                          </div>
                        </div>
                      </div>

                      {/* Inclusions & Price */}
                      <div style={{ padding: "14px 18px" }}>
                              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Includes</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                                <span style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px" }}>🏨 {pkg.hotel.split(" ").slice(-1)[0]}</span>
                                {pkg.carRental && <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px" }}>🚗 {pkg.carType}</span>}
                                <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "999px" }}>🍽️ {pkg.meals.split(" ").slice(0,2).join(" ")}</span>
                              </div>
                              <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#555", fontWeight: "600" }}>Activities:</p>
                              <ul style={{ margin: "0 0 12px", paddingLeft: "16px", fontSize: "12px", color: "#666" }}>
                                {pkg.activities.slice(0, 3).map((a) => <li key={a} style={{ marginBottom: "2px" }}>{a}</li>)}
                                {pkg.activities.length > 3 && <li style={{ color: "#aaa" }}>+{pkg.activities.length - 3} more</li>}
                              </ul>
                              {pkg.highlights?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "12px" }}>
                                  {pkg.highlights.slice(0,2).map((h) => <span key={h} style={{ background: "#f9f9f9", border: "1px solid #eee", fontSize: "11px", color: "#555", padding: "2px 8px", borderRadius: "6px" }}>✓ {h}</span>)}
                                </div>
                              )}

                              {/* Price + button */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #f0f0f0" }}>
                                <div>
                                  {pkg.originalPrice > pkg.price && <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#aaa", textDecoration: "line-through" }}>${pkg.originalPrice}</p>}
                                  <p style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: catStyle.color || "#1a1a2e" }}>${pkg.price}<span style={{ fontSize: "12px", fontWeight: "400", color: "#888" }}>/person</span></p>
                                </div>
                                {loggedInUser ? (
                                  isSelected ? (
                                    <button type="button" onClick={() => setSelectedPackage(null)}
                                      style={{ background: "#1a6e3c", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                                      ✅ Selected
                                    </button>
                                  ) : (
                                    <button type="button" onClick={() => setSelectedPackage(pkg)}
                                      style={{ background: catStyle.color || "#cf102d", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                                      Select Package
                                    </button>
                                  )
                                ) : (
                                  <button type="button" onClick={() => setActiveTab("login")}
                                    style={{ background: "#f0f0f0", color: "#333", border: "none", borderRadius: "10px", padding: "10px 16px", fontWeight: "600", cursor: "pointer", fontSize: "13px" }}>
                                    Log in to Book
                                  </button>
                                )}
                              </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* ====================== REGULAR FLIGHT SEARCH ====================== */
        <form className="search-form" onSubmit={handleFlightSubmit}>
          {/* Selected Package Reminder */}
          {selectedPackage && (
            <div style={{
              background: "linear-gradient(135deg, #e8f5e9, #f1fff5)",
              border: "2px solid #1a6e3c",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: "800", color: "#1a4d2e", fontSize: "14px" }}>
                  📦 Package: {selectedPackage.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#555" }}>
                  Search flights to <strong>{selectedPackage.city}</strong> to complete your bundle
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackage(null)}
                style={{ background: "none", border: "1px solid #1a6e3c", color: "#1a6e3c", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Flight Search Form */}

          <div className="form-row">
            <div className="form-group large-group">
              <label>Leaving from?</label>
              <select name="departureCityId" value={flightSearch.departureCityId} onChange={handleFlightChange} required disabled={loadingAirports}>
                <option value="">{loadingAirports ? "Loading cities..." : "Select departure city"}</option>
                {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.city_name}, {c.country_name}</option>)}
              </select>
            </div>
            <div className="form-group large-group">
              <label>Going to?</label>
              <select name="arrivalCityId" value={flightSearch.arrivalCityId} onChange={handleFlightChange} required disabled={loadingAirports}>
                <option value="">{loadingAirports ? "Loading cities..." : "Select destination city"}</option>
                {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.city_name}, {c.country_name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Departure Date</label>
              <input type="date" name="departureDate" value={flightSearch.departureDate} onChange={handleFlightChange} required />
            </div>
            <div className="form-group">
              <label>Passengers</label>
              <select name="passengers" value={flightSearch.passengers} onChange={handleFlightChange}>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn">
            {loadingFlights ? "Searching..." : "Continue"}
          </button>

          {searchMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{searchMessage}</p>}

          {/* Free Flight Mode Banner */}
          {freeFlightMode && (
            <div style={{ marginTop: "16px", background: "linear-gradient(135deg, #1a6e3c, #22a85a)", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <p style={{ margin: 0, color: "#fff", fontWeight: "800", fontSize: "16px" }}>🎟️ Free Flight Redemption Mode</p>
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>Select any flight below to book it for free (1,000 miles)</p>
              </div>
              <button type="button" onClick={() => setFreeFlightMode(false)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                Cancel
              </button>
            </div>
          )}

          {/* Flight Results */}
          {flightResults.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h2>Available Flights</h2>
              {flightResults.map((flight) => (
                <div key={flight.flight_id} className="flight-card" style={{ position: "relative", overflow: "hidden" }}>
                    {/* Free flight badge */}
                    {freeFlightMode && (
                    <div style={{ position: "absolute", top: 0, right: 0, background: "#1a6e3c", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 12px", borderBottomLeftRadius: "8px", letterSpacing: "0.5px" }}>
                        FREE REDEMPTION
                    </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                    <div>
                        <p style={{ margin: "0 0 4px", paddingBottom: "10px" }}>
                        Fly with <strong>{flight.airline_name}</strong>
                        </p>
                        <p style={{ margin: "0 0 4px" }}><strong>Flight ID:</strong> {flight.flight_id}</p>
                        <p style={{ margin: "0 0 4px" }}><strong>Departure:</strong> {flight.departure_city}, {flight.departure_country} ({flight.departure_code})</p>
                        <p style={{ margin: "0 0 4px" }}><strong>Date of Departure:</strong> {new Date(flight.date_of_departure).toLocaleString()}</p>
                        <p style={{ margin: "0 0 4px" }}><strong>Arrival:</strong> {flight.arrival_city}, {flight.arrival_country} ({flight.arrival_code})</p>
                        <p style={{ margin: "0 0 4px" }}><strong>Date of Arrival: </strong> {new Date(findArrivalDate(flight.date_of_departure, flight.estimated_time_hours)).toLocaleString()}</p>
                        <p style={{ margin: "0 0 4px" }}><strong>Estimated Time: </strong>{formatDuration(flight.estimated_time_hours)}</p>
                        <p style={{ margin: "0 0 4px" }}>
                        <strong>Aircraft:</strong> {flight.aircraft_name}
                        </p>
                    </div>
                    

                    {/* Cabin Class Selector + Price */}
                    <div style={{ minWidth: "190px", textAlign: "center" }}>
                        <div style={{ 
                        display: "flex", 
                        background: "#f8f9fa", 
                        borderRadius: "8px", 
                        padding: "4px", 
                        marginBottom: "12px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                        }}>
                        {[
                            { key: "economy", label: "Economy", color: "#22c55e" },    
                            { key: "business", label: "Business", color: "#3b82f6" },   
                            { key: "first", label: "First", color: "#eab308" }         
                        ].map((cls) => {
                            const isSelected = (selectedClass[flight.flight_id] || "economy") === cls.key;
                            const price = getPriceForClass(flight, cls.key);

                            return (
                            <button
                                key={cls.key}
                                type="button"
                                onClick={() => setSelectedClass(prev => ({ 
                                ...prev, 
                                [flight.flight_id]: cls.key 
                                }))}
                                style={{
                                flex: 1,
                                padding: "8px 10px",
                                fontSize: "13px",
                                fontWeight: isSelected ? "700" : "600",
                                background: isSelected ? cls.color : "transparent",
                                color: isSelected ? "#fff" : "#444",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                textShadow: isSelected ? "0 1px 2px rgba(0,0,0,0.2)" : "none"
                                }}
                            >
                                {cls.label}
                            </button>
                            );
                        })}
                        </div>

                        {/* Current Price Display */}
                        <div style={{
                        background: freeFlightMode ? "#e8f5e9" : "#fff8f8",
                        border: `2px solid ${freeFlightMode ? "#1a6e3c" : "#cf102d"}`,
                        borderRadius: "12px",
                        padding: "12px 16px"
                        }}>
                        {freeFlightMode ? (
                            <>
                            <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#1a6e3c", fontWeight: "700", textTransform: "uppercase" }}>Redemption</p>
                            <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: "800", color: "#1a6e3c" }}>FREE</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>1,000 miles</p>
                            </>
                        ) : (
                            <>
                            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#888", textTransform: "uppercase" }}>
                                { (selectedClass[flight.flight_id] || "economy").toUpperCase() }
                            </p>
                            <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: "800", color: "#cf102d" }}>
                                ${getPriceForClass(flight, selectedClass[flight.flight_id] || "economy")}
                            </p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>per person</p>
                            </>
                        )}
                        </div>
                        {flightSearch.passengers > 1 && (
                          <p style={{ marginTop: 15, fontSize: "15px", fontWeight: "600" }}>
                            Total price for {flightSearch.passengers} passengers: $
                            {(getPriceForClass(flight, selectedClass[flight.flight_id] || "economy") * 
                              Number(flightSearch.passengers)).toFixed(2)}
                          </p>
                        )}
                  </div>
                    </div>

                    {loggedInUser ? (
                    canBook ? (
                        freeFlightMode && isPassenger ? (
                        <button type="button" className="book-btn" style={{ background: "#1a6e3c", marginTop: "10px" }} onClick={() => handleRedeemFlight(flight)}>
                            🎟️ Redeem Free Flight
                        </button>
                        ) : !freeFlightMode ? (
                        <>
                            {/* Show matching packages for this destination */}
                            {(() => {
                            const pkgsForDest = VACATION_PACKAGES.filter((p) => p.arrival === flight.arrival_airport);
                            if (pkgsForDest.length === 0) return null;
                            const alreadyPkg = selectedPackage && pkgsForDest.some((p) => p.id === selectedPackage.id);
                            return (
                                <div style={{ marginTop: "10px", background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: "8px", padding: "10px 14px" }}>
                                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#0369a1" }}>🏖️ {pkgsForDest.length} vacation package{pkgsForDest.length > 1 ? "s" : ""} available for {flight.arrival_airport.split(" ")[0]}</p>
                                {alreadyPkg ? (
                                    <p style={{ margin: 0, fontSize: "12px", color: "#1a6e3c", fontWeight: "600" }}>✅ {selectedPackage.name} will be added to this booking</p>
                                ) : (
                                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                    {pkgsForDest.slice(0, 3).map((p) => (
                                        <button key={p.id} type="button" onClick={() => setSelectedPackage(p)}
                                        style={{ background: "#fff", border: "1px solid #7dd3fc", color: "#0369a1", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
                                        {p.emoji} {p.category} · ${p.price}
                                        </button>
                                    ))}
                                    </div>
                                )}
                                </div>
                            );
                            })()}
                            <button 
                            type="button" 
                            className="book-btn" 
                            style={{ marginTop: "12px", width: "auto", minWidth: "280px" }} 
                            onClick={() => handleBookFlight(flight, selectedClass[flight.flight_id] || "economy", Number(flightSearch.passengers) || 1)}
                            >
                            {(() => {
                              const pricePerPerson = getPriceForClass(flight, selectedClass[flight.flight_id] || "economy");
                              const numPax = Number(flightSearch.passengers) || 1;
                              const originalTotal = (pricePerPerson * numPax).toFixed(2);
                              const discountedTotal = loyaltyDiscount > 0 ? (pricePerPerson * numPax * (1 - loyaltyDiscount)).toFixed(2) : null;
                              return (
                                <>
                                  Book This Flight — {discountedTotal ? (
                                    <><span style={{ textDecoration: "line-through", opacity: 0.7 }}>${originalTotal}</span> ${discountedTotal}</>
                                  ) : (
                                    <>${originalTotal}</>
                                  )}
                                  {selectedPackage && VACATION_PACKAGES.some((p) => p.id === selectedPackage.id && p.arrival === flight.arrival_airport) ? ` + ${selectedPackage.name}` : ""}
                                </>
                              );
                            })()}
                            </button>
                        </>
                        ) : null
                    ) : (
                        <p className="book-hint">Your current role cannot book flights from this screen.</p>
                    )
                    ) : (
                    <p className="book-hint">
                        <span onClick={() => setActiveTab("login")} className="book-hint-link">Log in</span>{" "}or{" "}
                        <span onClick={() => setShowCreateModal(true)} className="book-hint-link">create an account</span> to book.
                    </p>
                    )}
                </div>
              ))}
            </div>
          )}
        </form>
      )}
    </>
  );
};

export default SearchFlightsPanel;