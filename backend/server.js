const http = require("http");
const mysql = require("mysql2");

// ── Database Connection ──
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to database.");

  // Auto-add is_active column to routes if it doesn't exist yet
  db.query(`
    ALTER TABLE routes ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1
  `, (alterErr) => {
    if (alterErr) {
      // MySQL < 8 doesn't support IF NOT EXISTS on ALTER — try the safe fallback
      db.query(`
        SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'routes' AND COLUMN_NAME = 'is_active'
      `, (checkErr, rows) => {
        if (!checkErr && rows[0].cnt === 0) {
          db.query(`ALTER TABLE routes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`, (addErr) => {
            if (addErr) console.error("Could not add is_active column:", addErr.message);
            else console.log("Added is_active column to routes table.");
          });
        }
      });
    } else {
      console.log("routes.is_active column ready.");
    }
  });

  // Auto-create booking_packages table if it doesn't exist
  db.query(`
    CREATE TABLE IF NOT EXISTS booking_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      package_id VARCHAR(100) NOT NULL,
      package_name VARCHAR(255) NOT NULL,
      package_category VARCHAR(100),
      package_price DECIMAL(10,2) NOT NULL,
      destination VARCHAR(255),
      duration_days INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (tblErr) => {
    if (tblErr) console.error("Could not create booking_packages table:", tblErr.message);
    else console.log("booking_packages table ready.");
  });
});

// ── Helpers ──
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
}

function getRequestUser(req) {
  return {
    userId: Number(req.headers["x-user-id"] || 0),
    role: req.headers["x-user-role"] || "",
  };
}

function hasRole(role, allowedRoles) {
  return allowedRoles.includes(role);
}

// Now only 3 roles: Passenger, Employee, System Admin
// Employee = merged Flight Admin + Booking Admin + Operations Admin + Employee
function isStaff(role) {
  return ["Employee", "System Admin"].includes(role);
}

function deny(res) {
  sendJson(res, 403, { error: "Access denied." });
}

const ROLE_OPTIONS = ["Passenger", "Employee", "System Admin"];

// ── Server & Routes ──
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id, x-user-role");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /airports → public
  if (req.url === "/airports" && req.method === "GET") {
    const sql = `SELECT airport_id, airport_name FROM Airport ORDER BY airport_name ASC`;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /cities → public (for city-based flight search)
  if (req.url === "/cities" && req.method === "GET") {
    const sql = `SELECT c.city_id, c.city_name, co.country_name FROM city c JOIN Country co ON c.country_id = co.country_id ORDER BY c.city_name ASC`;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /destinations → public
  if (req.url === "/destinations" && req.method === "GET") {
    const sql = `
      SELECT 
        dep.airport_id AS dep_id, dep.airport_name AS departure,
        arr.airport_id AS arr_id, arr.airport_name AS arrival,
        r.route_id, COUNT(f.flight_id) AS total_flights
      FROM routes r
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN Flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, dep.airport_id, dep.airport_name, arr.airport_id, arr.airport_name
      ORDER BY dep.airport_name, arr.airport_name
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /users → System Admin only
  if (req.url === "/users" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!hasRole(requester.role, ["System Admin"])) return deny(res);
    const sql = `
      SELECT ua.user_id, ua.passenger_id, ua.email, ua.role, p.first_name, p.last_name
      FROM user_account ua
      LEFT JOIN Passenger p ON ua.passenger_id = p.passenger_id
      ORDER BY ua.user_id ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /all-passengers → Employee, System Admin — Passenger + Employee roles (excludes System Admin)
  if (req.url === "/all-passengers" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT p.passenger_id, p.first_name, p.last_name, p.email, p.phone_number,
        p.seat_preferences, p.meal_preferences, p.passport_status, p.visa_status,
        p.country_of_origin, ua.role AS user_role, ua.user_id
      FROM Passenger p
      INNER JOIN user_account ua ON ua.passenger_id = p.passenger_id
      WHERE ua.role IN ('Passenger', 'Employee')
      ORDER BY p.last_name ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /all-flights → Employee, System Admin (for dropdown)
  if (req.url === "/all-flights" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT f.flight_id, f.date_of_departure, f.seats_available,
        dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
      FROM Flights f
      JOIN routes r ON f.route_id = r.route_id
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      ORDER BY f.date_of_departure DESC
      LIMIT 200
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /all-bookings → Employee, System Admin
  if (req.url === "/all-bookings" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT b.booking_id, b.user_id, b.booking_date, b.booking_status,
        p.passenger_id, p.first_name, p.last_name, p.email, p.phone_number,
        p.seat_preferences, p.meal_preferences
      FROM Bookings b
      JOIN Booking_Passengers bp ON b.booking_id = bp.booking_id
      JOIN Passenger p ON bp.passenger_id = p.passenger_id
      ORDER BY b.booking_id DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /aircrafts → Employee, System Admin
  if (req.url === "/aircrafts" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT aircraft_id, model, manufacturer, seating_capacity, max_baggage_capacity
      FROM Aircraft ORDER BY aircraft_id ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /routes-with-status → Employee, System Admin
  if (req.url === "/routes-with-status" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT r.route_id, dep.airport_name AS departure, arr.airport_name AS arrival,
        COALESCE(r.is_active, 1) AS is_active, COUNT(f.flight_id) AS total_flights
      FROM routes r
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN Flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, dep.airport_name, arr.airport_name, r.is_active
      ORDER BY r.route_id
    `;
    db.query(sql, (err, results) => {
      if (err) {
        const fallback = `
          SELECT r.route_id, dep.airport_name AS departure, arr.airport_name AS arrival,
            1 AS is_active, COUNT(f.flight_id) AS total_flights
          FROM routes r
          JOIN Airport dep ON r.departure_airport_id = dep.airport_id
          JOIN Airport arr ON r.destination_airport_id = arr.airport_id
          LEFT JOIN Flights f ON r.route_id = f.route_id
          GROUP BY r.route_id, dep.airport_name, arr.airport_name
          ORDER BY r.route_id
        `;
        db.query(fallback, (err2, fallbackResults) => {
          if (err2) return sendJson(res, 500, { error: err2.message });
          sendJson(res, 200, fallbackResults);
        });
        return;
      }
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /experience-ratings → public
  if (req.url === "/experience-ratings" && req.method === "GET") {
    const sql = `
      SELECT r.route_id,
        r.departure_airport_id AS dep_id, r.destination_airport_id AS arr_id,
        dep.airport_name AS departure, arr.airport_name AS arrival,
        COUNT(DISTINCT f.flight_id) AS total_flights,
        COALESCE(SUM(f.seats_available), 0) AS total_seats
      FROM routes r
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN Flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, r.departure_airport_id, r.destination_airport_id, dep.airport_name, arr.airport_name
      ORDER BY total_flights DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });

      // Generate realistic, varied scores per route using route_id + airport IDs as seeds
      const rated = results.map((r) => {
        const s1 = (r.route_id * 31 + r.dep_id * 13 + r.arr_id * 7) % 100;
        const s2 = (r.route_id * 17 + r.arr_id * 19) % 100;
        const s3 = (r.route_id * 43 + r.dep_id * 11) % 100;
        const s4 = (r.route_id * 23 + r.arr_id * 29 + r.dep_id * 3) % 100;
        const s5 = (r.route_id * 37 + r.dep_id * 17) % 100;

        const overallScore  = (3.5 + (s1 % 15) / 10).toFixed(1);   // 3.5 – 5.0
        const onTimeNum     = 70 + (s2 % 28);                        // 70 – 97%
        const comfortScore  = (3.2 + (s3 % 18) / 10).toFixed(1);    // 3.2 – 5.0
        const valueScore    = (3.0 + (s4 % 20) / 10).toFixed(1);    // 3.0 – 5.0
        const serviceScore  = (3.3 + (s5 % 17) / 10).toFixed(1);    // 3.3 – 5.0

        const popularity = r.total_flights > 50 ? "High" : r.total_flights > 10 ? "Medium" : "Low";
        const onTimeLabel = onTimeNum >= 90 ? "Excellent" : onTimeNum >= 80 ? "Good" : "Fair";

        return {
          ...r,
          experience_score: overallScore,
          on_time_rate: onTimeNum + "%",
          on_time_num: onTimeNum,
          on_time_label: onTimeLabel,
          comfort_score: comfortScore,
          value_score: valueScore,
          service_score: serviceScore,
          popularity,
        };
      });

      sendJson(res, 200, rated);
    });
    return;
  }

  // GET /my-bookings/:userId → own user or Employee/System Admin
  const bookingsMatch = req.url.match(/^\/my-bookings\/(\d+)$/);
  if (bookingsMatch && req.method === "GET") {
    const requestedUserId = Number(bookingsMatch[1]);
    const requester = getRequestUser(req);
    if (requester.userId !== requestedUserId && !isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT b.booking_id, b.user_id, b.booking_date, b.booking_status,
        p.passenger_id, p.first_name, p.last_name, p.email, p.phone_number,
        p.seat_preferences, p.meal_preferences
      FROM Bookings b
      JOIN Booking_Passengers bp ON b.booking_id = bp.booking_id
      JOIN Passenger p ON bp.passenger_id = p.passenger_id
      WHERE b.user_id = ? ORDER BY b.booking_id DESC
    `;
    db.query(sql, [requestedUserId], (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /route-flights/:routeId → Employee, System Admin
  const routeFlightsMatch = req.url.match(/^\/route-flights\/(\d+)$/);
  if (routeFlightsMatch && req.method === "GET") {
    const routeId = Number(routeFlightsMatch[1]);
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT f.flight_id, f.date_of_departure, f.seats_available,
        dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
      FROM Flights f
      JOIN routes r ON f.route_id = r.route_id
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      WHERE f.route_id = ? ORDER BY f.date_of_departure ASC
    `;
    db.query(sql, [routeId], (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /loyalty-balance/:userId
  const loyaltyMatch = req.url.match(/^\/loyalty-balance\/(\d+)$/);
  if (loyaltyMatch && req.method === "GET") {
    const requestedUserId = Number(loyaltyMatch[1]);
    const requester = getRequestUser(req);
    if (requester.userId !== requestedUserId && !isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT miles_balance, tier FROM loyalty_program
      WHERE passenger_id = (SELECT passenger_id FROM user_account WHERE user_id = ?)
    `;
    db.query(sql, [requestedUserId], (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      if (results.length > 0) {
        sendJson(res, 200, { miles: results[0].miles_balance, tier: results[0].tier });
      } else {
        sendJson(res, 200, { miles: 0, tier: "Silver" });
      }
    });
    return;
  }

  // GET /reports → Employee, System Admin
  if (req.url === "/reports" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT r.route_id, dep.airport_name AS departure, arr.airport_name AS arrival,
        COUNT(f.flight_id) AS total_flights
      FROM routes r
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN Flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, dep.airport_name, arr.airport_name
      ORDER BY r.route_id
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // POST /register → public, Passenger only
  if (req.url === "/register" && req.method === "POST") {
    parseBody(req).then((body) => {
      const {
        email, password, first_name, last_name, date_of_birth, phone_number,
        address, id_number, passport_status, visa_status, country_of_origin,
        seat_preferences, meal_preferences, special_needs,
      } = body;
      const role = "Passenger";
      db.query("SELECT user_id FROM user_account WHERE email = ?", [email], (err, rows) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (rows.length > 0) return sendJson(res, 409, { error: "An account with this email already exists." });
        db.query("SELECT COALESCE(MAX(passenger_id), 0) + 1 AS nextId FROM Passenger", (idErr, idRows) => {
          if (idErr) return sendJson(res, 500, { error: idErr.message });
          const newPassengerId = idRows[0].nextId;
          const pSql = `
            INSERT INTO Passenger (passenger_id, first_name, last_name, date_of_birth, email, phone_number,
              address, id_number, passport_status, visa_status, country_of_origin,
              seat_preferences, meal_preferences, special_needs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          const pVals = [
            newPassengerId, first_name?.trim(), last_name?.trim() || null, date_of_birth || null,
            email?.trim(), phone_number?.trim() || null, address?.trim() || null, id_number?.trim() || null,
            passport_status ? 1 : 0, visa_status ? 1 : 0, country_of_origin || null,
            seat_preferences || null, meal_preferences || null, special_needs || null,
          ];
          db.query(pSql, pVals, (pErr) => {
            if (pErr) return sendJson(res, 500, { error: pErr.message });
            db.query(
              "INSERT INTO user_account (passenger_id, email, password, role) VALUES (?, ?, ?, ?)",
              [newPassengerId, email?.trim(), password, role],
              (uErr, result) => {
                if (uErr) return sendJson(res, 500, { error: uErr.message });
                db.query(
                  "INSERT INTO loyalty_program (passenger_id, membership_number, tier, miles_balance) VALUES (?, ?, 'Silver', 0)",
                  [newPassengerId, "MEM-" + newPassengerId], () => {}
                );
                sendJson(res, 201, { message: "Account created successfully.", user_id: result.insertId, passenger_id: newPassengerId, role });
              }
            );
          });
        });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /login
  if (req.url === "/login" && req.method === "POST") {
    parseBody(req).then((body) => {
      const email = body.email?.trim();
      const password = body.password?.trim();
      const role = body.role?.trim();
      if (!ROLE_OPTIONS.includes(role)) return sendJson(res, 400, { error: "Invalid role selected." });
      const sql = `
        SELECT ua.user_id, ua.email, ua.role, ua.passenger_id,
          p.first_name, p.last_name, p.date_of_birth, p.phone_number, p.address, p.id_number,
          p.passport_status, p.visa_status, p.country_of_origin, p.seat_preferences, p.meal_preferences, p.special_needs
        FROM user_account ua
        LEFT JOIN Passenger p ON ua.passenger_id = p.passenger_id
        WHERE ua.email = ? AND ua.password = ? AND ua.role = ? LIMIT 1
      `;
      db.query(sql, [email, password, role], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 401, { error: "Invalid credentials." });
        sendJson(res, 200, { message: "Login successful.", user: results[0] });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /search-flights → public (searches by city — finds all airports in each city)
  if (req.url === "/search-flights" && req.method === "POST") {
    parseBody(req).then((body) => {
      const sql = `
        SELECT f.flight_id, f.route_id, f.date_of_departure, f.seats_available,
          dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
        FROM Flights f
        JOIN routes r ON f.route_id = r.route_id
        JOIN Airport dep ON r.departure_airport_id = dep.airport_id
        JOIN Airport arr ON r.destination_airport_id = arr.airport_id
        WHERE (? IS NULL OR dep.city_id = ?) AND (? IS NULL OR arr.city_id = ?)
        ORDER BY f.date_of_departure ASC LIMIT 10
      `;
      const depCityId = body.departureCityId || null;
      const arrCityId = body.arrivalCityId || null;
      db.query(sql, [depCityId, depCityId, arrCityId, arrCityId], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        // Assign consistent price per flight based on route + flight id
        const priced = results.map((f) => ({
          ...f,
          price: Math.floor(((f.route_id || 1) * 53 + f.flight_id * 17) % 500) + 149,
        }));
        sendJson(res, 200, priced);
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /book-flight → Passenger, Employee, System Admin
  if (req.url === "/book-flight" && req.method === "POST") {
  console.log("\n=== BOOK-FLIGHT HIT ===");

  parseBody(req)
    .then((body) => {
      console.log("[1] Body received:", body);

      let requester;
      try {
        requester = getRequestUser(req);
        console.log("[2] Requester:", requester);
      } catch (authErr) {
        console.error("[AUTH PARSE ERROR]", authErr);
        return sendJson(res, 500, { error: "Auth parsing failed" });
      }

      if (!requester) {
        console.log("[AUTH FAIL] No requester found");
        return deny(res);
      }

      if (
        !hasRole(requester.role, ["Passenger", "Employee", "System Admin"])
      ) {
        console.log("[AUTH FAIL] Role not allowed:", requester.role);
        return deny(res);
      }

      const { userId, passengerId, flightId } = body;

      console.log("[3] Extracted fields:", {
        userId,
        passengerId,
        flightId,
      });

      if (!flightId || !passengerId) {
        console.log("[VALIDATION FAIL] Missing flightId or passengerId");
        return sendJson(res, 400, {
          error: "flightId and passengerId are required",
        });
      }

      if (
        requester.role === "Passenger" &&
        requester.userId !== Number(userId)
      ) {
        console.log("[AUTH FAIL] Passenger mismatch");
        return deny(res);
      }

      console.log("[4] Inserting booking...");

      const insertBookingSQL = `
        INSERT INTO Bookings 
        (flight_id, issue_date, baggage, payment_id, ticket_status)
        VALUES (?, CURDATE(), 0, NULL, 'Reserved')
      `;

      db.query(insertBookingSQL, [flightId], (err, result) => {
        if (err) {
          console.error("=== BOOKING INSERT FAILED ===");
          console.error("Code:", err.code);
          console.error("Message:", err.message);
          console.error("SQL:", err.sql);

          return sendJson(res, 500, {
            error: err.message,
            code: err.code,
          });
        }

        const bookingId = result.insertId;
        console.log("[5] Booking created:", bookingId);

        console.log("[6] Linking passenger...");

        db.query(
          "INSERT INTO Booking_Passengers (booking_id, passenger_id) VALUES (?, ?)",
          [bookingId, passengerId],
          (err2) => {
            if (err2) {
              console.error("=== BOOKING_PASSENGERS FAILED ===");
              console.error("Code:", err2.code);
              console.error("Message:", err2.message);

              return sendJson(res, 500, {
                error: err2.message,
                code: err2.code,
              });
            }

            console.log("[7] Passenger linked");

            console.log("[8] Fetching loyalty info...");

            db.query(
              "SELECT miles_balance, tier FROM loyalty_program WHERE passenger_id = ?",
              [passengerId],
              (loyErr, loyRows) => {
                if (loyErr) {
                  console.error("=== LOYALTY SELECT FAILED ===");
                  console.error(loyErr);

                  return sendJson(res, 500, {
                    error: loyErr.message,
                  });
                }

                let newMiles = 0;
                let newTier = "Silver";
                let milestone = null;

                if (loyRows.length > 0) {
                  const oldMiles = loyRows[0].miles_balance || 0;
                  newMiles = oldMiles + 500;

                  if (newMiles >= 10000) newTier = "Diamond";
                  else if (newMiles >= 5000) newTier = "Platinum";
                  else if (newMiles >= 1000) newTier = "Gold";
                  else newTier = loyRows[0].tier;

                  db.query(
                    "UPDATE loyalty_program SET miles_balance = ?, tier = ? WHERE passenger_id = ?",
                    [newMiles, newTier, passengerId],
                    (updErr) => {
                      if (updErr) {
                        console.error("=== LOYALTY UPDATE FAILED ===");
                        console.error(updErr);
                      }
                    }
                  );

                  if (oldMiles < 1000 && newMiles >= 1000)
                    milestone = { tier: "Gold", miles: newMiles };

                  if (oldMiles < 5000 && newMiles >= 5000)
                    milestone = { tier: "Platinum", miles: newMiles };

                  if (oldMiles < 10000 && newMiles >= 10000)
                    milestone = { tier: "Diamond", miles: newMiles };
                }

                console.log("[9] SUCCESS RESPONSE SENT");

                return sendJson(res, 201, {
                  message: "Booked!",
                  booking_id: bookingId,
                  miles_earned: 500,
                  new_miles: newMiles,
                  new_tier: newTier,
                  milestone,
                });
              }
            );
          }
        );
      });
    })
    .catch((err) => {
      console.error("=== PARSE BODY FAILED ===");
      console.error(err);

      return sendJson(res, 400, {
        error: "Invalid JSON body",
        details: err.message,
      });
    });

  return;
}

  // POST /manage-booking
  if (req.url === "/manage-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      let sql = `
        SELECT b.booking_id, b.user_id, b.booking_status, b.booking_date,
          p.passenger_id, p.first_name, p.last_name, p.email, p.phone_number,
          p.seat_preferences, p.meal_preferences
        FROM Bookings b
        JOIN Booking_Passengers bp ON b.booking_id = bp.booking_id
        JOIN Passenger p ON bp.passenger_id = p.passenger_id
        WHERE b.booking_id = ?
      `;
      const params = [body.bookingId];
      if (requester.role === "Passenger") { sql += " AND b.user_id = ? "; params.push(requester.userId); }
      sql += " LIMIT 1";
      db.query(sql, params, (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 404, { error: "Booking not found." });
        sendJson(res, 200, results[0]);
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /cancel-booking → Passenger (own), Employee, System Admin
  if (req.url === "/cancel-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      const bookingId = body.bookingId;
      db.query("SELECT user_id FROM Bookings WHERE booking_id = ? LIMIT 1", [bookingId], (checkErr, rows) => {
        if (checkErr) return sendJson(res, 500, { error: checkErr.message });
        if (rows.length === 0) return sendJson(res, 404, { error: "Booking not found." });
        const bookingOwnerId = Number(rows[0].user_id);
        const canCancel = isStaff(requester.role) || (requester.role === "Passenger" && requester.userId === bookingOwnerId);
        if (!canCancel) return deny(res);
        db.query("UPDATE Bookings SET booking_status = 'Cancelled' WHERE booking_id = ?", [bookingId], (err) => {
          if (err) return sendJson(res, 500, { error: err.message });
          sendJson(res, 200, { message: "Cancelled." });
        });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // PUT /update-preferences → Passenger (own), Employee, System Admin
  if (req.url === "/update-preferences" && req.method === "PUT") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      const passengerId = Number(body.passengerId);
      db.query(
        "SELECT passenger_id FROM user_account WHERE user_id = ? LIMIT 1",
        [requester.userId], (ownerErr, ownerRows) => {
          if (ownerErr) return sendJson(res, 500, { error: ownerErr.message });
          const requesterPassengerId = ownerRows.length ? Number(ownerRows[0].passenger_id) : 0;
          const canUpdate = isStaff(requester.role) || (requester.role === "Passenger" && requesterPassengerId === passengerId);
          if (!canUpdate) return deny(res);
          db.query(
            "UPDATE Passenger SET seat_preferences = ?, meal_preferences = ? WHERE passenger_id = ?",
            [body.seatPreferences, body.mealPreferences, passengerId], (err) => {
              if (err) return sendJson(res, 500, { error: err.message });
              sendJson(res, 200, { message: "Updated." });
            }
          );
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /add-flight → Employee, System Admin
  if (req.url === "/add-flight" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);
      db.query(
        "INSERT INTO Flights (route_id, date_of_departure, seats_available) VALUES (?, ?, ?)",
        [body.routeId, body.departureDate, body.seats], (err) => {
          if (err) return sendJson(res, 500, { error: err.message });
          sendJson(res, 201, { message: "Flight added." });
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // PUT /update-aircraft → Employee, System Admin
  if (req.url === "/update-aircraft" && req.method === "PUT") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);
      db.query(
        "UPDATE Aircraft SET seating_capacity = ? WHERE aircraft_id = ?",
        [body.capacity, body.aircraftId], (err) => {
          if (err) return sendJson(res, 500, { error: err.message });
          sendJson(res, 200, { message: "Aircraft updated." });
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // DELETE /delete-route → Employee, System Admin
  if (req.url === "/delete-route" && req.method === "DELETE") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);
      db.query("DELETE FROM routes WHERE route_id = ?", [body.routeId], (err) => {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, { message: "Route deleted." });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /toggle-route-status → Employee, System Admin
  if (req.url === "/toggle-route-status" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);

      const doToggle = () => {
        db.query(
          "UPDATE routes SET is_active = NOT COALESCE(is_active, 1) WHERE route_id = ?",
          [body.routeId], (err) => {
            if (err) return sendJson(res, 500, { error: err.message });
            sendJson(res, 200, { message: "Route status updated." });
          }
        );
      };

      // Try the toggle; if is_active column is missing, add it then retry once
      db.query(
        "UPDATE routes SET is_active = NOT COALESCE(is_active, 1) WHERE route_id = ?",
        [body.routeId], (err) => {
          if (err && err.code === "ER_BAD_FIELD_ERROR") {
            // Column missing — add it with default 1, then toggle this route to 0
            db.query(
              "ALTER TABLE routes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",
              (alterErr) => {
                if (alterErr) return sendJson(res, 500, { error: alterErr.message });
                // After adding column all routes default to 1 (active), now deactivate this one
                db.query(
                  "UPDATE routes SET is_active = 0 WHERE route_id = ?",
                  [body.routeId], (err2) => {
                    if (err2) return sendJson(res, 500, { error: err2.message });
                    sendJson(res, 200, { message: "Route status updated." });
                  }
                );
              }
            );
          } else if (err) {
            return sendJson(res, 500, { error: err.message });
          } else {
            sendJson(res, 200, { message: "Route status updated." });
          }
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /add-booking-admin → Employee, System Admin
  if (req.url === "/add-booking-admin" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);
      const { userId, passengerId } = body;
      if (!userId || !passengerId) return sendJson(res, 400, { error: "userId and passengerId are required." });
      db.query(
        "INSERT INTO Bookings (user_id, booking_date, booking_status) VALUES (?, NOW(), 'Confirmed')",
        [userId], (err, result) => {
          if (err) return sendJson(res, 500, { error: err.message });
          const bookingId = result.insertId;
          db.query(
            "INSERT INTO Booking_Passengers (booking_id, passenger_id) VALUES (?, ?)",
            [bookingId, passengerId], (err2) => {
              if (err2) return sendJson(res, 500, { error: err2.message });
              sendJson(res, 201, { message: "Booking created successfully.", booking_id: bookingId });
            }
          );
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // PUT /update-booking-status → Employee, System Admin
  if (req.url === "/update-booking-status" && req.method === "PUT") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!isStaff(requester.role)) return deny(res);
      const validStatuses = ["Confirmed", "Cancelled", "Pending", "Completed"];
      if (!validStatuses.includes(body.status)) return sendJson(res, 400, { error: "Invalid status." });
      db.query(
        "UPDATE Bookings SET booking_status = ? WHERE booking_id = ?",
        [body.status, body.bookingId], (err, result) => {
          if (err) return sendJson(res, 500, { error: err.message });
          if (result.affectedRows === 0) return sendJson(res, 404, { error: "Booking not found." });
          sendJson(res, 200, { message: "Booking status updated to " + body.status + "." });
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /flight-status → public
  if (req.url === "/flight-status" && req.method === "POST") {
    parseBody(req).then((body) => {
      const sql = `
        SELECT f.flight_id, f.date_of_departure, f.seats_available,
          dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
        FROM Flights f
        JOIN routes r ON f.route_id = r.route_id
        JOIN Airport dep ON r.departure_airport_id = dep.airport_id
        JOIN Airport arr ON r.destination_airport_id = arr.airport_id
        WHERE f.flight_id = ? LIMIT 1
      `;
      db.query(sql, [body.flightId], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 404, { error: "Flight not found." });
        sendJson(res, 200, results[0]);
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // GET /passenger-users → Employee, System Admin — only users with role='Passenger'
  if (req.url === "/passenger-users" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT p.passenger_id, p.first_name, p.last_name, p.email,
        p.phone_number, p.seat_preferences, p.meal_preferences
      FROM Passenger p
      INNER JOIN user_account ua ON ua.passenger_id = p.passenger_id
      WHERE ua.role = 'Passenger'
      ORDER BY p.last_name ASC, p.first_name ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // GET /all-flights → Employee, System Admin — all flights with route info for dropdown
  if (req.url === "/all-flights" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT f.flight_id, f.date_of_departure, f.seats_available,
        dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
      FROM Flights f
      JOIN routes r ON f.route_id = r.route_id
      JOIN Airport dep ON r.departure_airport_id = dep.airport_id
      JOIN Airport arr ON r.destination_airport_id = arr.airport_id
      ORDER BY f.date_of_departure ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }

  // POST /redeem-flight → Passenger, Employee, System Admin — deducts 1000 miles, books a free flight
  if (req.url === "/redeem-flight" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["Passenger", "Employee", "System Admin"])) return deny(res);

      const { userId, passengerId, flightId } = body;
      const REDEMPTION_COST = 1000;

      // Check miles balance
      db.query(
        "SELECT miles_balance, tier FROM loyalty_program WHERE passenger_id = ?",
        [passengerId], (loyErr, loyRows) => {
          if (loyErr) return sendJson(res, 500, { error: loyErr.message });
          if (loyRows.length === 0) return sendJson(res, 400, { error: "No loyalty account found." });

          const currentMiles = loyRows[0].miles_balance;
          if (currentMiles < REDEMPTION_COST) {
            return sendJson(res, 400, { error: `Not enough miles. You need ${REDEMPTION_COST} miles to redeem a free flight.` });
          }

          const newMiles = currentMiles - REDEMPTION_COST;
          let newTier = loyRows[0].tier;
          if (newMiles < 1000) newTier = "Silver";
          else if (newMiles < 5000) newTier = "Gold";
          else if (newMiles < 10000) newTier = "Platinum";
          else newTier = "Diamond";

          // Create the booking
          db.query(
            "INSERT INTO Bookings (user_id, booking_date, booking_status) VALUES (?, NOW(), 'Confirmed')",
            [userId], (err, result) => {
              if (err) return sendJson(res, 500, { error: err.message });
              const bookingId = result.insertId;

              db.query(
                "INSERT INTO Booking_Passengers (booking_id, passenger_id) VALUES (?, ?)",
                [bookingId, passengerId], (err2) => {
                  if (err2) return sendJson(res, 500, { error: err2.message });

                  // Deduct the miles
                  db.query(
                    "UPDATE loyalty_program SET miles_balance = ?, tier = ? WHERE passenger_id = ?",
                    [newMiles, newTier, passengerId], () => {}
                  );

                  sendJson(res, 201, {
                    message: "Free flight booked!",
                    booking_id: bookingId,
                    miles_used: REDEMPTION_COST,
                    remaining_miles: newMiles,
                    new_tier: newTier,
                  });
                }
              );
            }
          );
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // POST /save-package-booking → attaches a vacation package to an existing booking
  if (req.url === "/save-package-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["Passenger", "Employee", "System Admin"])) return deny(res);
      const { bookingId, packageId, packageName, packageCategory, packagePrice, destination, durationDays } = body;
      if (!bookingId || !packageId) return sendJson(res, 400, { error: "bookingId and packageId are required." });

      // Remove any existing package for this booking first (allow re-selection)
      db.query("DELETE FROM booking_packages WHERE booking_id = ?", [bookingId], (delErr) => {
        if (delErr) return sendJson(res, 500, { error: delErr.message });
        db.query(
          "INSERT INTO booking_packages (booking_id, package_id, package_name, package_category, package_price, destination, duration_days) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [bookingId, packageId, packageName, packageCategory || "", packagePrice || 0, destination || "", durationDays || 0],
          (insErr) => {
            if (insErr) return sendJson(res, 500, { error: insErr.message });
            sendJson(res, 201, { message: "Package added to booking." });
          }
        );
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

  // GET /booking-package/:bookingId → returns the package attached to a booking if any
  const bookingPkgMatch = req.url.match(/^\/booking-package\/(\d+)$/);
  if (bookingPkgMatch && req.method === "GET") {
    const bookingId = Number(bookingPkgMatch[1]);
    db.query(
      "SELECT * FROM booking_packages WHERE booking_id = ? LIMIT 1",
      [bookingId], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, results.length > 0 ? results[0] : null);
      }
    );
    return;
  }

  sendJson(res, 404, { message: "Route not found" });
});

const PORT = 8000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });