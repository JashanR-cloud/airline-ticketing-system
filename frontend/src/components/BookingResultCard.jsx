
import React from 'react';

const BookingResultCard = ({
  result,
  onCancel,
  showPrefs = true,
  isEditingPrefs = false,
  setIsEditingPrefs,
  prefData = { seat_preferences: "", meal_preferences: "" },
  setPrefData,
  handleUpdatePreferences,
  actionMsg
}) => {
  const departureDate = result.date_of_departure 
    ? new Date(result.date_of_departure) 
    : new Date();

  const duration = result.estimated_time_hours 
    ? `${result.estimated_time_hours} hrs` 
    : "N/A";

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: "12px", 
      padding: "20px", 
      background: "#fff",
      marginBottom: "16px"
    }}>
      {/* Flight Info */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <strong style={{ fontSize: "18px" }}>{result.airline_name || "Flight"}</strong>
            <span style={{ marginLeft: "12px", color: "#666" }}>Booking #{result.booking_id}</span>
          </div>
          <span style={{
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            backgroundColor: result.booking_status === "Confirmed" ? "#e8f5e9" : 
                            result.booking_status === "Saved" ? "#fff3e0" : "#f1f3f5",
            color: result.booking_status === "Confirmed" ? "#1a6e3c" : "#555"
          }}>
            {result.booking_status}
          </span>
        </div>

        <p style={{ fontSize: "16px", margin: "10px 0 6px", fontWeight: "500" }}>
          {result.departure_city} ({result.departure_name}) → {result.arrival_city} ({result.arrival_name})
        </p>
        <p style={{ color: "#444" }}>
          {departureDate.toLocaleString([], { 
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
          })} • Duration {duration}
        </p>
      </div>

      {/* Passenger Info */}
      <div style={{ marginBottom: "18px" }}>
        <p><strong>Passenger:</strong> {result.first_name} {result.last_name}</p>
        <p><strong>Email:</strong> {result.email || "N/A"}</p>
        <p><strong>Phone:</strong> {result.phone_number || "N/A"}</p>
      </div>

      {/* Preferences Section */}
      {showPrefs && (
        <>
          <hr style={{ margin: "16px 0", borderTop: "1px solid #eee" }} />
          
          {isEditingPrefs ? (
            <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
              <h4 style={{ marginBottom: "12px" }}>Edit Preferences</h4>
              
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label>Seat Preference</label>
                <select 
                  value={prefData.seat_preferences || ""} 
                  onChange={(e) => setPrefData({ ...prefData, seat_preferences: e.target.value })}
                >
                  <option value="">No Preference</option>
                  <option value="Window">Window</option>
                  <option value="Aisle">Aisle</option>
                  <option value="Middle">Middle</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Meal Preference</label>
                <select 
                  value={prefData.meal_preferences || ""} 
                  onChange={(e) => setPrefData({ ...prefData, meal_preferences: e.target.value })}
                >
                  <option value="">No Preference</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button" 
                  className="primary-btn" 
                  style={{ backgroundColor: "#1a6e3c" }}
                  onClick={handleUpdatePreferences}
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="nav-edit-btn"
                  onClick={() => setIsEditingPrefs && setIsEditingPrefs(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p><strong>Seat Preference:</strong> {result.seat_preferences || "None selected"}</p>
              <p><strong>Meal Preference:</strong> {result.meal_preferences || "None selected"}</p>
            </>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
        {result.booking_status !== "Cancelled" && showPrefs && !isEditingPrefs && (
          <button 
            type="button" 
            className="primary-btn" 
            style={{ backgroundColor: "#22252b" }}
            onClick={() => setIsEditingPrefs && setIsEditingPrefs(true)}
          >
            Modify Preferences
          </button>
        )}

        {result.booking_status !== "Cancelled" && (
          <button 
            type="button" 
            className="primary-btn" 
            style={{ backgroundColor: "#b00020" }}
            onClick={() => onCancel && onCancel(result.booking_id)}
          >
            Cancel Booking
          </button>
        )}
      </div>

      {actionMsg?.text && (
        <p style={{ marginTop: "16px", fontWeight: "600", color: actionMsg.type === "success" ? "#1a6e3c" : "#b00020" }}>
          {actionMsg.text}
        </p>
      )}
    </div>
  );
};

export default BookingResultCard;