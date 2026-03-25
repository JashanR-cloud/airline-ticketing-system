const http = require("http");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Houston2026!.",
  database: "airline_system",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET airports
  if (req.url === "/airports" && req.method === "GET") {
    const sql = `
      SELECT airport_id, airport_name
      FROM Airport
      ORDER BY airport_name ASC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Airports query error:", err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(results));
    });
    return;
  }

  // GET users
  if (req.url === "/users" && req.method === "GET") {
    const sql = `
      SELECT user_id, email, role
      FROM user_account
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.error("Users query error:", err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
        return;
      }

      res.writeHead(200);
      res.end(JSON.stringify(results));
    });
    return;
  }

  // POST login
  if (req.url === "/login" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const email = parsedData.email?.trim();
        const password = parsedData.password?.trim();
        const role = parsedData.role?.trim();

        if (!email || !password || !role) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Email, password, and role are required." }));
          return;
        }

        const sql = `
          SELECT user_id, email, role
          FROM user_account
          WHERE email = ?
            AND password = ?
            AND role = ?
          LIMIT 1
        `;

        db.query(sql, [email, password, role], (err, results) => {
          if (err) {
            console.error("Login query error:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          if (results.length === 0) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: "Invalid email, password, or role." }));
            return;
          }

          res.writeHead(200);
          res.end(JSON.stringify({
            message: "Login successful.",
            user: results[0],
          }));
        });
      } catch (error) {
        console.error("Login body parse error:", error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
      }
    });

    return;
  }

  // POST search flights
  if (req.url === "/search-flights" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const departureAirportId = Number(parsedData.departureAirportId);
        const arrivalAirportId = Number(parsedData.arrivalAirportId);
        const departureDate = parsedData.departureDate;
        const passengers = Number(parsedData.passengers);

        if (!departureAirportId || !arrivalAirportId || !departureDate || !passengers) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "All flight search fields are required." }));
          return;
        }

        if (departureAirportId === arrivalAirportId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Departure and arrival airports cannot be the same." }));
          return;
        }

        const sql = `
          SELECT
            f.flight_id,
            f.date_of_departure,
            f.seats_available,
            dep.airport_name AS departure_airport,
            arr.airport_name AS arrival_airport
          FROM Flights f
          JOIN routes r
            ON f.route_id = r.route_id
          JOIN Airport dep
            ON r.departure_airport_id = dep.airport_id
          JOIN Airport arr
            ON r.destination_airport_id = arr.airport_id
          WHERE r.departure_airport_id = ?
            AND r.destination_airport_id = ?
            AND DATE(f.date_of_departure) = ?
            AND f.seats_available >= ?
          ORDER BY f.date_of_departure ASC
        `;

        db.query(
          sql,
          [departureAirportId, arrivalAirportId, departureDate, passengers],
          (err, results) => {
            if (err) {
              console.error("Search flights SQL error:", err);
              res.writeHead(500);
              res.end(JSON.stringify({ error: err.message }));
              return;
            }

            res.writeHead(200);
            res.end(JSON.stringify(results));
          }
        );
      } catch (error) {
        console.error("Flight search body parse error:", error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
      }
    });

    return;
  }

  // POST manage booking
  if (req.url === "/manage-booking" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const bookingId = parsedData.bookingId?.trim();
        const lastName = parsedData.lastName?.trim();

        if (!bookingId || !lastName) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Booking ID and last name are required." }));
          return;
        }

        const sql = `
          SELECT
            b.booking_id,
            p.passenger_id,
            p.first_name,
            p.last_name,
            p.email,
            p.phone_number,
            p.seat_preferences,
            p.meal_preferences
          FROM Bookings b
          JOIN Booking_Passengers bp
            ON b.booking_id = bp.booking_id
          JOIN Passenger p
            ON bp.passenger_id = p.passenger_id
          WHERE b.booking_id = ?
            AND p.last_name = ?
          LIMIT 1
        `;

        db.query(sql, [bookingId, lastName], (err, results) => {
          if (err) {
            console.error("Manage booking SQL error:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          if (results.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Booking not found." }));
            return;
          }

          res.writeHead(200);
          res.end(JSON.stringify(results[0]));
        });
      } catch (error) {
        console.error("Manage booking body parse error:", error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
      }
    });

    return;
  }

  // POST flight status
  if (req.url === "/flight-status" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const parsedData = JSON.parse(body);

        const flightId = Number(parsedData.flightId);

        if (!flightId) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Flight ID is required." }));
          return;
        }

        const sql = `
          SELECT
            f.flight_id,
            f.date_of_departure,
            f.seats_available,
            dep.airport_name AS departure_airport,
            arr.airport_name AS arrival_airport
          FROM Flights f
          JOIN routes r
            ON f.route_id = r.route_id
          JOIN Airport dep
            ON r.departure_airport_id = dep.airport_id
          JOIN Airport arr
            ON r.destination_airport_id = arr.airport_id
          WHERE f.flight_id = ?
          LIMIT 1
        `;

        db.query(sql, [flightId], (err, results) => {
          if (err) {
            console.error("Flight status SQL error:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          if (results.length === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Flight not found." }));
            return;
          }

          res.writeHead(200);
          res.end(JSON.stringify(results[0]));
        });
      } catch (error) {
        console.error("Flight status body parse error:", error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found" }));
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});