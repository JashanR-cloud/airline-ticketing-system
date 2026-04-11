/*
 *this script fills the Flights table with realistic flight data (dates)
 *for every day from April 1, 2026 through September 30, 2026 (6 months)
 *
 * for every route in this database, it creates flights based on
 * the route's demand level:
 * - High demand routes:   1 flight per day
 * - Medium demand routes: 1 flight every 2 days
 * - Low demand routes:    1 flight every 3 days
 */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Aircraft data: aircraft_id -> { seating_capacity, max_baggage_capacity }
const AIRCRAFT = {
  1:  { seats: 162, baggage: 3200 },
  2:  { seats: 178, baggage: 3400 },
  3:  { seats: 396, baggage: 6000 },
  4:  { seats: 290, baggage: 5000 },
  5:  { seats: 180, baggage: 3100 },
  6:  { seats: 220, baggage: 3400 },
  7:  { seats: 300, baggage: 5200 },
  8:  { seats: 325, baggage: 5500 },
  9:  { seats: 76,  baggage: 1200 },
  10: { seats: 124, baggage: 1800 },
  11: { seats: 467, baggage: 6500 },
  12: { seats: 525, baggage: 7000 },
  13: { seats: 239, baggage: 2800 },
  14: { seats: 124, baggage: 2500 },
  15: { seats: 90,  baggage: 1500 },
};

const AIRCRAFT_IDS = Object.keys(AIRCRAFT).map(Number);
const AIRLINE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

//Date range for 6 months
const START_DATE = new Date("2026-04-01");
const END_DATE = new Date("2026-09-30");

//Departure hour options (realistic flight times)
const DEPARTURE_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDatetime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

db.connect((err) => {
  if (err) { console.error("Connection failed:", err.message); process.exit(1); }
  console.log("Connected to database.");

  //Get all routes with their demand level
  db.query("SELECT route_id, demand FROM routes WHERE is_active = 1", (err, routes) => {
    if (err) { console.error("Failed to fetch routes:", err.message); process.exit(1); }
    console.log(`Found ${routes.length} active routes.`);

    //get current max flight_id so we don't collide
    db.query("SELECT COALESCE(MAX(flight_id), 0) AS max_id FROM Flights", (err, rows) => {
      if (err) { console.error(err.message); process.exit(1); }
      let nextId = rows[0].max_id + 1;
      console.log(`Starting flight IDs from ${nextId}.`);

      const flights = [];

      for (const route of routes) {
        //Frequency based on demand:
        //High   = every day
        //Medium = every 2 days
        //Low    = every 3 days
        let stepDays;
        if (route.demand === "High") stepDays = 1;
        else if (route.demand === "Medium") stepDays = 2;
        else stepDays = 3;

        const current = new Date(START_DATE);
        while (current <= END_DATE) {
          const aircraftId = randomItem(AIRCRAFT_IDS);
          const aircraft = AIRCRAFT[aircraftId];
          const airlineId = randomItem(AIRLINE_IDS);

          //Random departure time on this day
          const depDate = new Date(current);
          depDate.setHours(randomItem(DEPARTURE_HOURS), randomInt(0, 59), 0, 0);

          const staffSize = randomInt(4, 16);
          const economyPrice = randomInt(80, 450);
          const businessPrice = economyPrice + randomInt(150, 400);
          const firstClassPrice = businessPrice + randomInt(300, 700);

          flights.push([
            nextId++,
            aircraftId,
            route.route_id,
            airlineId,
            formatDatetime(depDate),
            aircraft.seats,         //total_seats
            aircraft.seats,         //seats_available (all open)
            staffSize,
            aircraft.baggage,       //baggage_availability
            economyPrice.toFixed(2),
            businessPrice.toFixed(2),
            firstClassPrice.toFixed(2),
          ]);

          current.setDate(current.getDate() + stepDays);
        }
      }

      console.log(`Generated ${flights.length} new flights. Inserting in batches...`);

      //insert in batches
      const BATCH_SIZE = 500;
      let inserted = 0;

      function insertBatch(index) {
        if (index >= flights.length) {
          console.log(`Done! Inserted ${inserted} flights total.`);
          console.log(`Your database now has ${rows[0].max_id + inserted} flights.`);
          db.end();
          return;
        }

        const batch = flights.slice(index, index + BATCH_SIZE);
        const sql = `INSERT INTO Flights (flight_id, aircraft_id, route_id, airline_id, date_of_departure, total_seats, 
        seats_available, staff_size, baggage_availability, economy_price, business_price, first_class_price) VALUES ?`;

        db.query(sql, [batch], (err) => {
          if (err) {
            console.error(`Batch error at index ${index}:`, err.message);
            db.end();
            return;
          }
          inserted += batch.length;
          if (inserted % 5000 === 0 || inserted === flights.length) {
            console.log(`  ${inserted} / ${flights.length} inserted...`);
          }
          insertBatch(index + BATCH_SIZE);
        });
      }

      insertBatch(0);
    });
  });
});
