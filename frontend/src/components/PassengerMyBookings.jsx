import React, {useState} from 'react';
import BookingResultCard from './BookingResultCard';

const PassengerMyBookings = ({
  bookings = [],
  loading,
  onSearchFlights,
  onCancelBooking,
  isEditingPrefs,
  setIsEditingPrefs,
  prefData,
  setPrefData,
  handleUpdatePreferences,
  actionMsg
}) => {
  const [activeCategory, setActiveCategory] = useState("Booked");

  console.log("=== PassengerMyBookings Debug ===");
  console.log("Total bookings received:", bookings.length);
  console.log("Bookings data:", bookings);

  const now = new Date();

  const categorized = {
    Booked: bookings.filter(b => {
      const flightDate = new Date(b.date_of_departure);
      const isConfirmed = b.booking_status === "Confirmed" || b.booking_status === "Booked";
      const isFuture = flightDate >= now;
      console.log(`Booking ${b.booking_id}: status="${b.booking_status}", date=${b.date_of_departure}, isFuture=${isFuture}`);
      return isConfirmed && isFuture;
    }),
    Saved: bookings.filter(b => b.booking_status === "Saved"),
    Past: bookings.filter(b => 
      b.booking_status === "Past" || new Date(b.date_of_departure) < now
    )
  };

  console.log("Categorized counts:", {
    Booked: categorized.Booked.length,
    Saved: categorized.Saved.length,
    Past: categorized.Past.length
  });

  const currentBookings = categorized[activeCategory] || [];

  return (
    <div>
      <h2>My Bookings</h2>

      {/* Category Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "24px", 
        flexWrap: "wrap" 
      }}>
        {["Booked", "Saved", "Past"].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: "12px 24px",
              fontWeight: activeCategory === category ? "700" : "600",
              backgroundColor: activeCategory === category ? "#1a73e8" : "#f8f9fa",
              color: activeCategory === category ? "#fff" : "#333",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {category} ({categorized[category].length})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading your bookings...</p>
      ) : currentBookings.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px", 
          background: "#f9f9f9", 
          borderRadius: "12px" 
        }}>
          <p style={{ fontSize: "18px", color: "#555", marginBottom: "20px" }}>
            Nothing here yet
          </p>
          <button 
            className="primary-btn" 
            onClick={onSearchFlights}
            style={{ marginTop: "20px", padding: "14px 32px" }}
          >
            Search Flights
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {currentBookings.map((booking) => (
            <BookingResultCard
              key={booking.booking_id}
              result={booking}
              onCancel={onCancelBooking}
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
  );
};

export default PassengerMyBookings;