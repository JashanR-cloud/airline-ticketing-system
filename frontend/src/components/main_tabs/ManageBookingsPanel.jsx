
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
  setActiveTab,
}) => {
  return (
    <div className="login-form">
      <h2>{isPassenger ? "My Bookings" : "Manage Booking"}</h2>

      {!loggedInUser ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p>You must be logged in to view and manage bookings.</p>
          <button 
            className="primary-btn" 
            onClick={() => setActiveTab("login")} style={{ marginTop: "15px" }} 
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
        <p><strong>USE THE DASHBOARD TO MANAGE BOOKINGS</strong></p>
      )}
    </div>
  );
};

export default ManageBookingsPanel;