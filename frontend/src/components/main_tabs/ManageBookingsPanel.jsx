
import React from 'react';
import PassengerMyBookings from './PassengerMyBookings';
import BookingResultCard from './BookingResultCard';

const ManageBookingsPanel = ({
  // Shared
  isPassenger,
  loggedInUser,

  // Passenger-specific
  userBookings,
  loadingUserBookings,
  onSearchFlights,
  onCancelBooking,

  // Editing state (used by both passenger and admin)
  isEditingPrefs,
  setIsEditingPrefs,
  prefData,
  setPrefData,
  handleUpdatePreferences,
  actionMsg,

  // Admin-specific (dropdown + search)
  manageData,
  handleManageChange,
  handleManageSubmit,
  loadingAllBookings,
  allBookingsAdmin,
  manageMessage,
  manageResult,
  loadingManage,
}) => {
  return (
    <div className="login-form">
      <h2>{isPassenger ? "My Bookings" : "Manage Booking"}</h2>

      {!loggedInUser ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>You must be logged in to view and manage bookings.</p>
          <button 
            className="primary-btn" 
            onClick={() => {/* You'll pass setActiveTab or a callback */}} 
            style={{ marginTop: "15px" }}
          >
            Log In Now
          </button>
        </div>
      ) : isPassenger ? (
        /* Passenger */
        <PassengerMyBookings
          bookings={userBookings}
          loading={loadingUserBookings}
          onSearchFlights={onSearchFlights}
          onCancelBooking={onCancelBooking}
          isEditingPrefs={isEditingPrefs}
          setIsEditingPrefs={setIsEditingPrefs}
          prefData={prefData}
          setPrefData={setPrefData}
          handleUpdatePreferences={handleUpdatePreferences}
          actionMsg={actionMsg}
        />
      ) : (
        /* EMPLOYEE / SYSTEM ADMIN: Dropdown view */
        <form onSubmit={handleManageSubmit}>
          <div className="form-group">
            <label>Select Booking</label>
            <select 
              name="bookingId" 
              value={manageData.bookingId} 
              onChange={handleManageChange} 
              required 
              disabled={loadingAllBookings}
            >
              <option value="">
                {loadingAllBookings ? "Loading bookings..." : "-- Select a Booking --"}
              </option>
              {allBookingsAdmin.map((b) => (
                <option key={b.booking_id} value={b.booking_id}>
                  #{b.booking_id} — {b.first_name} {b.last_name} ({b.booking_status})
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="primary-btn" 
            disabled={!manageData.bookingId}
          >
            {loadingManage ? "Searching..." : "View Details"}
          </button>

          {manageMessage && (
            <p style={{ marginTop: "14px", fontSize: "18px" }}>{manageMessage}</p>
          )}

          {manageResult && (
            <BookingResultCard
              result={manageResult}
              onCancel={onCancelBooking}
              showPrefs={true}
              isEditingPrefs={isEditingPrefs}
              setIsEditingPrefs={setIsEditingPrefs}
              prefData={prefData}
              setPrefData={setPrefData}
              handleUpdatePreferences={handleUpdatePreferences}
              actionMsg={actionMsg}
            />
          )}
        </form>
      )}
    </div>
  );
};

export default ManageBookingsPanel;