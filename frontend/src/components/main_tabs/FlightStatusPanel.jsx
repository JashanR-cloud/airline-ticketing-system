
import React from 'react';

const FlightStatusPanel = ({
  statusData,
  handleStatusChange,
  handleStatusSubmit,
  loadingStatus,
  statusMessage,
  statusResult,
}) => {
  return (
    <form className="login-form" onSubmit={handleStatusSubmit}>
      <h2>Flight Status</h2>
      <p>Enter a flight ID to check the flight status.</p>

      <div className="form-group">
        <label>Flight ID</label>
        <input
          type="text"
          name="flightId"
          value={statusData.flightId}
          onChange={handleStatusChange}
          placeholder="Enter flight ID"
          required
        />
      </div>

      <button type="submit" className="primary-btn">
        {loadingStatus ? "Searching..." : "Check Status"}
      </button>

      {statusMessage && (
        <p style={{ marginTop: "14px", fontSize: "18px" }}>{statusMessage}</p>
      )}

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
  );
};

export default FlightStatusPanel;