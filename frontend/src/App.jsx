import { useEffect, useState } from "react";
import "./App.css";
import { CreateAccountModal, EditAccountModal } from "./components/AccountModal";
import "./components/AccountModal.css";

const API = "http://localhost:8000";

function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [airports, setAirports] = useState([]);
  const [flightResults, setFlightResults] = useState([]);

  const [searchMessage, setSearchMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [loadingAirports, setLoadingAirports] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingManage, setLoadingManage] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [manageResult, setManageResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);

  // Modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "", role: "Passenger" });
  const [flightSearch, setFlightSearch] = useState({
    departureAirportId: "", arrivalAirportId: "", departureDate: "", returnDate: "", passengers: 1,
  });
  const [manageData, setManageData] = useState({ bookingId: "", lastName: "" });
  const [statusData, setStatusData] = useState({ flightId: "" });

  useEffect(() => { fetchAirports(); }, []);

  const fetchAirports = async () => {
    try {
      setLoadingAirports(true);
      const response = await fetch(`${API}/airports`);
      const data = await response.json();
      if (!response.ok) { setSearchMessage(data.error || "Could not load airports."); return; }
      setAirports(data);
    } catch {
      setSearchMessage("Could not connect to backend.");
    } finally {
      setLoadingAirports(false);
    }
  };

  const handleLoginChange  = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleFlightChange = (e) => setFlightSearch({ ...flightSearch, [e.target.name]: e.target.value });
  const handleManageChange = (e) => setManageData({ ...manageData, [e.target.name]: e.target.value });
  const handleStatusChange = (e) => setStatusData({ ...statusData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);
    setLoginMessage("");
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password, role: loginData.role }),
      });
      const data = await response.json();
      if (!response.ok) { setLoginMessage(data.error || "Login failed."); return; }
      setLoggedInUser(data.user);
      setLoginMessage(`Login successful. Logged in as ${data.user.role}.`);
      setActiveTab("search");
    } catch {
      setLoginMessage("Could not connect to backend.");
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginData({ email: "", password: "", role: "Passenger" });
    setLoginMessage("");
    setActiveTab("login");
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    setLoadingFlights(true);
    setSearchMessage("");
    setFlightResults([]);
    try {
      const response = await fetch(`${API}/search-flights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departureAirportId: Number(flightSearch.departureAirportId),
          arrivalAirportId: Number(flightSearch.arrivalAirportId),
          departureDate: flightSearch.departureDate,
          passengers: Number(flightSearch.passengers),
        }),
      });
      const data = await response.json();
      if (!response.ok) { setSearchMessage(data.error || "Something went wrong."); return; }
      if (data.length === 0) setSearchMessage("No flights found.");
      else setSearchMessage(`Found ${data.length} flight(s).`);
      setFlightResults(data);
    } catch {
      setSearchMessage("Could not connect to backend.");
    } finally {
      setLoadingFlights(false);
    }
  };

  const handleManageSubmit = async (e) => {
    e.preventDefault();
    setLoadingManage(true);
    setManageMessage("");
    setManageResult(null);
    try {
      const response = await fetch(`${API}/manage-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: manageData.bookingId, lastName: manageData.lastName }),
      });
      const data = await response.json();
      if (!response.ok) { setManageMessage(data.error || "Booking not found."); return; }
      setManageResult(data);
      setManageMessage("Booking found.");
    } catch {
      setManageMessage("Could not connect to backend.");
    } finally {
      setLoadingManage(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setLoadingStatus(true);
    setStatusMessage("");
    setStatusResult(null);
    try {
      const response = await fetch(`${API}/flight-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: statusData.flightId }),
      });
      const data = await response.json();
      if (!response.ok) { setStatusMessage(data.error || "Flight not found."); return; }
      setStatusResult(data);
      setStatusMessage("Flight found.");
    } catch {
      setStatusMessage("Could not connect to backend.");
    } finally {
      setLoadingStatus(false);
    }
  };

  // After successful registration, auto-login by calling the login endpoint
  const handleRegisterSuccess = async (regData) => {
    setShowCreateModal(false);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regData.email, password: regData.password, role: regData.role }),
      });
      const data = await res.json();
      if (res.ok) {
        setLoggedInUser(data.user);
        setActiveTab("search");
        return;
      }
    } catch {}
    // Fallback: send to login tab with a message
    setLoginMessage("Account created! Please log in.");
    setLoginData((prev) => ({ ...prev, role: regData.role }));
    setActiveTab("login");
  };

  // After editing account
  const handleEditSaved = (updatedUser) => {
    setLoggedInUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <div className="app">
      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRegisterSuccess}
        />
      )}
      {showEditModal && loggedInUser && (
        <EditAccountModal
          user={loggedInUser}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}

      <div className="top-alert">
        <span className="important">Important:</span> Welcome to Royal Horizon Airways — Travel Beyond the Horizon
      </div>

      <nav className="navbar">
        <div className="logo-box">
          <div className="logo">RHA</div>
          <div className="brand-text">Royal Horizon Airways</div>
        </div>

        <ul className="nav-links">
          <li>BOOK</li>
          <li>MANAGE</li>
          <li>EXPERIENCE</li>
          <li>WHERE WE FLY</li>
          <li>LOYALTY</li>
          <li>HELP</li>
        </ul>

        <div className="nav-right-group">
          {loggedInUser ? (
            <>
              <span className="nav-user-name">{loggedInUser.first_name || loggedInUser.email}</span>
              <button className="nav-edit-btn" onClick={() => setShowEditModal(true)}>Edit Account</button>
              <button className="nav-logout-btn" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <span className="nav-login-link" onClick={() => setActiveTab("login")}>LOG IN</span>
              <button className="nav-register-btn" onClick={() => setShowCreateModal(true)}>Create Account</button>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-small">Check our current</p>
            <h1>FLIGHT SCHEDULES</h1>
            <p className="hero-tagline">Travel Beyond the Horizon</p>
            <button className="hero-button">Learn More</button>
          </div>
        </div>
      </header>

      <section className="booking-panel">
        <div className="tabs">
          <button className={activeTab === "search" ? "tab active" : "tab"} onClick={() => setActiveTab("search")}>Search Flights</button>
          <button className={activeTab === "manage" ? "tab active" : "tab"} onClick={() => setActiveTab("manage")}>Manage Booking</button>
          <button className={activeTab === "status" ? "tab active" : "tab"} onClick={() => setActiveTab("status")}>Flight Status</button>
          {!loggedInUser && (
            <button className={activeTab === "login" ? "tab active" : "tab"} onClick={() => setActiveTab("login")}>Login</button>
          )}
        </div>

        <div className="panel-content">
          {/* ── Logged-in welcome banner ── */}
          {loggedInUser && (
            <div className="logged-in-banner">
              <div>
                <strong>Welcome back, {loggedInUser.first_name || loggedInUser.email}!</strong>
                <span className="banner-role">{loggedInUser.role}</span>
              </div>
              <div className="banner-actions">
                <button className="banner-edit-btn" onClick={() => setShowEditModal(true)}>✏️ Edit Account</button>
                <button className="banner-logout-btn" onClick={handleLogout}>Log Out</button>
              </div>
            </div>
          )}

          {/* ── Search tab ── */}
          {activeTab === "search" && (
            <form className="search-form" onSubmit={handleFlightSubmit}>
              <div className="trip-toggle">
                <button type="button" className="toggle-btn active-toggle">Flight</button>
                <button type="button" className="toggle-btn">Vacation Package</button>
              </div>
              <div className="advanced-search">Advanced search: multi-city, promo codes, and partner airlines</div>
              <div className="form-row">
                <div className="form-group large-group">
                  <label>Departure Airport</label>
                  <select name="departureAirportId" value={flightSearch.departureAirportId} onChange={handleFlightChange} required disabled={loadingAirports}>
                    <option value="">{loadingAirports ? "Loading airports..." : "Select departure airport"}</option>
                    {airports.map((a) => <option key={a.airport_id} value={a.airport_id}>{a.airport_name}</option>)}
                  </select>
                </div>
                <div className="form-group large-group">
                  <label>Arrival Airport</label>
                  <select name="arrivalAirportId" value={flightSearch.arrivalAirportId} onChange={handleFlightChange} required disabled={loadingAirports}>
                    <option value="">{loadingAirports ? "Loading airports..." : "Select arrival airport"}</option>
                    {airports.map((a) => <option key={a.airport_id} value={a.airport_id}>{a.airport_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Departure Date</label>
                  <input type="date" name="departureDate" value={flightSearch.departureDate} onChange={handleFlightChange} required />
                </div>
                <div className="form-group">
                  <label>Return Date</label>
                  <input type="date" name="returnDate" value={flightSearch.returnDate} onChange={handleFlightChange} />
                </div>
                <div className="form-group">
                  <label>Passengers</label>
                  <select name="passengers" value={flightSearch.passengers} onChange={handleFlightChange}>
                    {[1,2,3,4,5,6,7,8,9].map((n) => <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="primary-btn">{loadingFlights ? "Searching..." : "Continue"}</button>
              {searchMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{searchMessage}</p>}
              {flightResults.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h2>Available Flights</h2>
                  {flightResults.map((flight) => (
                    <div key={flight.flight_id} className="flight-card">
                      <p><strong>Flight ID:</strong> {flight.flight_id}</p>
                      <p><strong>Departure:</strong> {flight.departure_airport}</p>
                      <p><strong>Arrival:</strong> {flight.arrival_airport}</p>
                      <p><strong>Date:</strong> {new Date(flight.date_of_departure).toLocaleString()}</p>
                      <p><strong>Seats Available:</strong> {flight.seats_available}</p>
                      {loggedInUser && (
                        <button type="button" className="book-btn">
                          Book This Flight
                        </button>
                      )}
                      {!loggedInUser && (
                        <p className="book-hint">
                          <span onClick={() => setActiveTab("login")} className="book-hint-link">Log in</span> or{" "}
                          <span onClick={() => setShowCreateModal(true)} className="book-hint-link">create an account</span> to book.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}

          {/* ── Manage tab ── */}
          {activeTab === "manage" && (
            <form className="login-form" onSubmit={handleManageSubmit}>
              <h2>Manage Booking</h2>
              <p>Enter your booking ID and last name to find your booking.</p>
              <div className="form-group">
                <label>Booking ID</label>
                <input type="text" name="bookingId" value={manageData.bookingId} onChange={handleManageChange} placeholder="Enter booking ID" required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" value={manageData.lastName} onChange={handleManageChange} placeholder="Enter last name" required />
              </div>
              <button type="submit" className="primary-btn">{loadingManage ? "Searching..." : "Find Booking"}</button>
              {manageMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{manageMessage}</p>}
              {manageResult && (
                <div className="result-card">
                  <p><strong>Booking ID:</strong> {manageResult.booking_id}</p>
                  <p><strong>Passenger:</strong> {manageResult.first_name} {manageResult.last_name}</p>
                  <p><strong>Email:</strong> {manageResult.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {manageResult.phone_number || "N/A"}</p>
                  <p><strong>Seat Preference:</strong> {manageResult.seat_preferences || "N/A"}</p>
                  <p><strong>Meal Preference:</strong> {manageResult.meal_preferences || "N/A"}</p>
                </div>
              )}
            </form>
          )}

          {/* ── Status tab ── */}
          {activeTab === "status" && (
            <form className="login-form" onSubmit={handleStatusSubmit}>
              <h2>Flight Status</h2>
              <p>Enter a flight ID to check the flight status.</p>
              <div className="form-group">
                <label>Flight ID</label>
                <input type="text" name="flightId" value={statusData.flightId} onChange={handleStatusChange} placeholder="Enter flight ID" required />
              </div>
              <button type="submit" className="primary-btn">{loadingStatus ? "Searching..." : "Check Status"}</button>
              {statusMessage && <p style={{ marginTop: "14px", fontSize: "18px" }}>{statusMessage}</p>}
              {statusResult && (
                <div className="result-card">
                  <p><strong>Flight ID:</strong> {statusResult.flight_id}</p>
                  <p><strong>Departure Airport:</strong> {statusResult.departure_airport}</p>
                  <p><strong>Arrival Airport:</strong> {statusResult.arrival_airport}</p>
                  <p><strong>Departure Time:</strong> {new Date(statusResult.date_of_departure).toLocaleString()}</p>
                  <p><strong>Seats Available:</strong> {statusResult.seats_available}</p>
                </div>
              )}
            </form>
          )}

          {/* ── Login tab ── */}
          {activeTab === "login" && !loggedInUser && (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <h2>Royal Horizon Airways Login</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter your password" required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={loginData.role} onChange={handleLoginChange}>
                  <option value="Passenger">Passenger</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
              <button type="submit" className="primary-btn">{loadingLogin ? "Logging in..." : "Log In"}</button>
              {loginMessage && <p style={{ marginTop: "14px", fontSize: "18px", color: loginMessage.includes("successful") || loginMessage.includes("created") ? "#1a6e3c" : "#cf102d" }}>{loginMessage}</p>}
              <p style={{ marginTop: "16px", fontSize: "15px", color: "#666" }}>
                Don't have an account?{" "}
                <span style={{ color: "#cf102d", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }} onClick={() => setShowCreateModal(true)}>
                  Create one here
                </span>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;


export default App;
