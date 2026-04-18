/*
 *script generates 50,000 bookings with corresponding payments.
 * It randomly assigns existing passengers to existing flights.
 */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const HOW_MANY_BOOKINGS = 50000;
const CABIN_CLASSES = ["economy", "business", "first"];
const STATUSES = ["Confirmed", "Confirmed", "Confirmed", "Confirmed", "Completed", "Cancelled"];
// Weighted so most bookings are Confirmed

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random booking date between Jan 2026 and the flight's departure
function randomBookingDate(departureDateStr) {
  const departure = new Date(departureDateStr);
  const earliest = new Date("2026-01-01");
  // Book between Jan 1 2026 and 1 day before departure
  const latest = new Date(departure.getTime() - 24 * 60 * 60 * 1000);
  if (latest <= earliest) return earliest.toISOString().slice(0, 19).replace("T", " ");
  const range = latest.getTime() - earliest.getTime();
  const randomTime = earliest.getTime() + Math.random() * range;
  return new Date(randomTime).toISOString().slice(0, 19).replace("T", " ");
}

db.connect((err) => {
  if (err) { console.error("Connection failed:", err.message); process.exit(1); }
  console.log("Connected to database.");

  // Get all passengers with their user_ids
  db.query(
    "SELECT ua.user_id, ua.passenger_id FROM user_account ua WHERE ua.role = 'Passenger' AND ua.is_deleted = 0 AND ua.passenger_id IS NOT NULL",
    (err, users) => {
      if (err) { console.error("Failed to fetch users:", err.message); process.exit(1); }
      console.log(`Found ${users.length} passenger accounts.`);

      if (users.length === 0) {
        console.error("No passengers found. Run populate-passengers.js first.");
        db.end();
        return;
      }

      //get all flights with prices and seats
      db.query(
        "SELECT flight_id, date_of_departure, seats_available, economy_price, business_price, first_class_price FROM flights WHERE seats_available > 0",
        (err, flights) => {
          if (err) { console.error("Failed to fetch flights:", err.message); process.exit(1); }
          console.log(`Found ${flights.length} flights with available seats.`);

          if (flights.length === 0) {
            console.error("No flights found. Run populate-flights.js first.");
            db.end();
            return;
          }

          generateBookings(users, flights);
        }
      );
    }
  );
});

function generateBookings(users, flights) {
  console.log(`Generating ${HOW_MANY_BOOKINGS} bookings. Inserting in batches...`);

  const BATCH_SIZE = 500;
  let totalInserted = 0;

  function insertBatch(remaining) {
    if (remaining <= 0) {
      console.log(`\nDone! Inserted ${totalInserted} bookings with payments.`);
      db.end();
      return;
    }

    const batchSize = Math.min(BATCH_SIZE, remaining);
    const paymentValues = [];
    const bookingData = []; // store data to use after payment insert

    for (let i = 0; i < batchSize; i++) {
      const user = randomItem(users);
      const flight = randomItem(flights);
      const cabinClass = randomItem(CABIN_CLASSES);
      const numPassengers = randomInt(1, 3);
      const status = randomItem(STATUSES);

      let basePrice;
      if (cabinClass === "economy") basePrice = Number(flight.economy_price);
      else if (cabinClass === "business") basePrice = Number(flight.business_price);
      else basePrice = Number(flight.first_class_price);

      const baseFare = basePrice * numPassengers;
      const taxes = Math.round(baseFare * 0.12 * 100) / 100;
      const totalAmount = Math.round((baseFare + taxes) * 100) / 100;
      const paymentStatus = status === "Cancelled" ? "Refunded" : "Successful";
      const bookingDate = randomBookingDate(flight.date_of_departure);

      paymentValues.push([totalAmount, baseFare, taxes, paymentStatus, bookingDate.slice(0, 10)]);

      bookingData.push({
        user_id: user.user_id,
        passenger_id: user.passenger_id,
        flight_id: flight.flight_id,
        cabin_class: cabinClass,
        num_passengers: numPassengers,
        booking_status: status,
        booking_date: bookingDate,
      });
    }

    //Insert payments first
    const paymentSql = "INSERT INTO payment (amount, base_fare, taxes, payment_status, transaction_date) VALUES ?";

    db.query(paymentSql, [paymentValues], (err, paymentResult) => {
      if (err) {
        console.error("Payment batch error:", err.message);
        db.end();
        return;
      }

      const firstPaymentId = paymentResult.insertId;

      // Now insert bookings using the payment IDs
      const bookingValues = bookingData.map((b, i) => [
        b.user_id,
        b.flight_id,
        b.booking_status,
        b.booking_date,
        firstPaymentId + i, // corresponding payment_id
        b.cabin_class,
        b.num_passengers,
      ]);

      const bookingSql = "INSERT INTO bookings (user_id, flight_id, booking_status, booking_date, payment_id, cabin_class, num_passengers) VALUES ?";

      db.query(bookingSql, [bookingValues], (err, bookingResult) => {
        if (err) {
          console.error("Booking batch error:", err.message);
          db.end();
          return;
        }

        const firstBookingId = bookingResult.insertId;

        // Insert booking_passengers links
        const bpValues = bookingData.map((b, i) => [
          b.passenger_id,
          firstBookingId + i,
        ]);

        const bpSql = "INSERT INTO booking_passengers (passenger_id, booking_id) VALUES ?";

        db.query(bpSql, [bpValues], (err) => {
          if (err) {
            //duplicate key errors are expected if same passenger books same flight twice — skip silently
            if (!err.message.includes("Duplicate")) {
              console.error("Booking_passengers batch error:", err.message);
            }
          }

          totalInserted += batchSize;
          if (totalInserted % 5000 === 0 || remaining - batchSize <= 0) {
            console.log(`  ${totalInserted} / ${HOW_MANY_BOOKINGS} bookings inserted...`);
          }

          insertBatch(remaining - batchSize);
        });
      });
    });
  }

  insertBatch(HOW_MANY_BOOKINGS);
}
