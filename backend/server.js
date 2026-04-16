const http = require("http");
const mysql = require("mysql2");
 
// ── Database Connection ──
const db = mysql.createConnection({
  host: "crossover.proxy.rlwy.net",
  port: 19137,
  user: "root",
  password: "EFCyKqqRtiXPvYWdtGylKpyExyKggmFa",
  database: "airline",
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
 
  // Auto-add is_deleted column to user_account for soft-delete support
  db.query(`
    ALTER TABLE user_account ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) NOT NULL DEFAULT 0
  `, (delColErr) => {
    if (delColErr) {
      db.query(`
        SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_account' AND COLUMN_NAME = 'is_deleted'
      `, (checkErr, rows) => {
        if (!checkErr && rows[0].cnt === 0) {
          db.query(`ALTER TABLE user_account ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0`, (addErr) => {
            if (addErr) console.error("Could not add is_deleted column:", addErr.message);
            else console.log("Added is_deleted column to user_account table.");
          });
        }
      });
    } else {
      console.log("user_account.is_deleted column ready.");
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
 
  // Expand loyalty_program tier enum to include Diamond
  // The DB ships with enum('Silver','Gold','Platinum') — Diamond is needed for 10000+ miles
  db.query(
    "ALTER TABLE loyalty_program MODIFY COLUMN tier ENUM('Silver','Gold','Platinum','Diamond') NULL DEFAULT NULL",
    (tierErr) => {
      if (tierErr) console.error('Could not expand tier enum:', tierErr.message);
      else console.log('loyalty_program.tier enum — Diamond tier ready.');
    }
  );
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
    const sql = `SELECT airport_id, airport_name FROM airport ORDER BY airport_name ASC`;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // GET /cities → public (for city-based flight search)
  if (req.url === "/cities" && req.method === "GET") {
    const sql = `SELECT c.city_id, c.city_name, co.country_name FROM city c JOIN country co ON c.country_id = co.country_id ORDER BY c.city_name ASC`;
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
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN flights f ON r.route_id = f.route_id
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
      LEFT JOIN passenger p ON ua.passenger_id = p.passenger_id
      ORDER BY ua.user_id ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // GET /all-passengers → Employee, System Admin
  if (req.url === "/all-passengers" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT p.passenger_id, p.first_name, p.last_name, p.email, p.phone_number,
        p.seat_preferences, p.meal_preferences, p.passport_status, p.visa_status,
        p.country_of_origin, ua.role AS user_role, ua.user_id
      FROM passenger p
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
      FROM flights f
      JOIN routes r ON f.route_id = r.route_id
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
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
      FROM bookings b
      JOIN booking_passengers bp ON b.booking_id = bp.booking_id
      JOIN passenger p ON bp.passenger_id = p.passenger_id
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
      FROM aircraft ORDER BY aircraft_id ASC
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
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, dep.airport_name, arr.airport_name, r.is_active
      ORDER BY r.route_id
    `;
    db.query(sql, (err, results) => {
      if (err) {
        const fallback = `
          SELECT r.route_id, dep.airport_name AS departure, arr.airport_name AS arrival,
            1 AS is_active, COUNT(f.flight_id) AS total_flights
          FROM routes r
          JOIN airport dep ON r.departure_airport_id = dep.airport_id
          JOIN airport arr ON r.destination_airport_id = arr.airport_id
          LEFT JOIN flights f ON r.route_id = f.route_id
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
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, r.departure_airport_id, r.destination_airport_id, dep.airport_name, arr.airport_name
      ORDER BY total_flights DESC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      const rated = results.map((r) => {
        const s1 = (r.route_id * 31 + r.dep_id * 13 + r.arr_id * 7) % 100;
        const s2 = (r.route_id * 17 + r.arr_id * 19) % 100;
        const s3 = (r.route_id * 43 + r.dep_id * 11) % 100;
        const s4 = (r.route_id * 23 + r.arr_id * 29 + r.dep_id * 3) % 100;
        const s5 = (r.route_id * 37 + r.dep_id * 17) % 100;
        const overallScore  = (3.5 + (s1 % 15) / 10).toFixed(1);
        const onTimeNum     = 70 + (s2 % 28);
        const comfortScore  = (3.2 + (s3 % 18) / 10).toFixed(1);
        const valueScore    = (3.0 + (s4 % 20) / 10).toFixed(1);
        const serviceScore  = (3.3 + (s5 % 17) / 10).toFixed(1);
        const popularity    = r.total_flights > 50 ? "High" : r.total_flights > 10 ? "Medium" : "Low";
        const onTimeLabel   = onTimeNum >= 90 ? "Excellent" : onTimeNum >= 80 ? "Good" : "Fair";
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
      SELECT 
        b.booking_id, b.user_id, b.booking_date, b.booking_status,
        f.flight_id, f.date_of_departure, f.estimated_time_hours,
        al.airline_name,
        dep.airport_name AS departure_name,
        dep_city.city_name AS departure_city,
        dep_country.country_name AS departure_country,
        arr.airport_name AS arrival_name,
        arr_city.city_name AS arrival_city,
        arr_country.country_name AS arrival_country,
        p.passenger_id, p.first_name, p.last_name, p.email,
        p.phone_number, p.seat_preferences, p.meal_preferences
      FROM bookings b
      JOIN booking_passengers bp ON b.booking_id = bp.booking_id
      JOIN passenger p ON bp.passenger_id = p.passenger_id
      JOIN flights f ON b.flight_id = f.flight_id
      JOIN routes r ON f.route_id = r.route_id
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN city dep_city ON dep.city_id = dep_city.city_id
      JOIN country dep_country ON dep_city.country_id = dep_country.country_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      JOIN city arr_city ON arr.city_id = arr_city.city_id
      JOIN country arr_country ON arr_city.country_id = arr_country.country_id
      JOIN airline al ON f.airline_id = al.airline_id
      WHERE b.user_id = ?
      ORDER BY f.date_of_departure DESC
    `;
    db.query(sql, [requestedUserId], (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // GET /route-flights/:routeId → Employee, System Admin
  const routeflightsMatch = req.url.match(/^\/route-flights\/(\d+)$/);
  if (routeflightsMatch && req.method === "GET") {
    const routeId = Number(routeflightsMatch[1]);
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT f.flight_id, f.date_of_departure, f.seats_available,
        dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
      FROM flights f
      JOIN routes r ON f.route_id = r.route_id
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      WHERE f.route_id = ? ORDER BY f.date_of_departure ASC
    `;
    db.query(sql, [routeId], (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // ─────────────────────────────────────────────────────────────────────────
  // GET /loyalty-balance/:userId
  // CHANGED: Now returns { enrolled: false } when the passenger has not yet
  // joined the loyalty program. Returns { enrolled: true, miles, tier, ... }
  // when they are a member. This mirrors real airlines where enrollment is
  // a separate, explicit opt-in step (Delta SkyMiles, United MileagePlus, etc.)
  // ─────────────────────────────────────────────────────────────────────────
  const loyaltyMatch = req.url.match(/^\/loyalty-balance\/(\d+)$/);
  if (loyaltyMatch && req.method === 'GET') {
    const requestedUserId = Number(loyaltyMatch[1]);
    const requester = getRequestUser(req);
    if (requester.userId !== requestedUserId && !isStaff(requester.role)) return deny(res);
 
    // Try with membership_number; fall back if that column doesn't exist in this DB
    const tryQuery = (withMembership) => {
      const cols = withMembership ? 'lp.miles_balance, lp.tier, lp.membership_number' : 'lp.miles_balance, lp.tier';
      const sql = `SELECT ${cols} FROM loyalty_program lp JOIN user_account ua ON ua.passenger_id = lp.passenger_id WHERE ua.user_id = ? LIMIT 1`;
      db.query(sql, [requestedUserId], (err, results) => {
        if (err && withMembership) return tryQuery(false); // retry without membership_number
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length > 0) {
          sendJson(res, 200, {
            enrolled: true,
            miles: results[0].miles_balance,
            tier: results[0].tier,
            membership_number: results[0].membership_number || null,
          });
        } else {
          sendJson(res, 200, { enrolled: false });
        }
      });
    };
    tryQuery(true);
    return;
  }
 
  // ─────────────────────────────────────────────────────────────────────────
  // POST /join-loyalty
  // NEW: Passenger explicitly opts into the Royal Horizon Loyalty program.
  // Generates a membership number in RHA-XXXXXX format (airline-style).
  // Enrollment is free and starts at Silver tier with 0 miles.
  // ─────────────────────────────────────────────────────────────────────────
  if (req.url === "/join-loyalty" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["Passenger", "Employee", "System Admin"])) return deny(res);
      const passengerId = Number(body.passengerId);
      if (!passengerId) return sendJson(res, 400, { error: "passengerId is required." });
 
      // Check if already enrolled — use passenger_id (the UNI key), NOT loyalty_id
      db.query(
        "SELECT passenger_id FROM loyalty_program WHERE passenger_id = ? LIMIT 1",
        [passengerId], (checkErr, rows) => {
          if (checkErr) {
            console.error("join-loyalty check error:", checkErr.message);
            return sendJson(res, 500, { error: checkErr.message });
          }
          if (rows.length > 0) {
            return sendJson(res, 409, { error: "Already enrolled in the loyalty program." });
          }
 
          // membership_number is NOT NULL in the DB — use MEM-{id} format to match existing rows
          const membershipNumber = "MEM-" + passengerId;
 
          db.query(
            "INSERT INTO loyalty_program (passenger_id, membership_number, tier, miles_balance) VALUES (?, ?, 'Silver', 0)",
            [passengerId, membershipNumber], (insErr) => {
              if (insErr) {
                console.error("join-loyalty insert error:", insErr.message);
                return sendJson(res, 500, { error: insErr.message });
              }
              sendJson(res, 201, {
                message: "Successfully enrolled in Royal Horizon Loyalty!",
                membership_number: membershipNumber,
                tier: "Silver",
                miles: 0,
                enrolled: true,
              });
            }
          );
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
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
      JOIN airport dep ON r.departure_airport_id = dep.airport_id
      JOIN airport arr ON r.destination_airport_id = arr.airport_id
      LEFT JOIN flights f ON r.route_id = f.route_id
      GROUP BY r.route_id, dep.airport_name, arr.airport_name
      ORDER BY r.route_id
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // ─────────────────────────────────────────────────────────────────────────
  // POST /register → public, passenger only
  // CHANGED: Loyalty enrollment removed. Passengers must explicitly join via
  // POST /join-loyalty — exactly how real airlines work (you register for an
  // account and then separately enroll in the frequent flyer program).
  // ─────────────────────────────────────────────────────────────────────────
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
        db.query("SELECT COALESCE(MAX(passenger_id), 0) + 1 AS nextId FROM passenger", (idErr, idRows) => {
          if (idErr) return sendJson(res, 500, { error: idErr.message });
          const newPassengerId = idRows[0].nextId;
          const pSql = `
            INSERT INTO passenger (passenger_id, first_name, last_name, date_of_birth, email, phone_number,
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
                // NOTE: Loyalty enrollment intentionally NOT done here.
                // Passengers must opt-in via POST /join-loyalty.
                sendJson(res, 201, {
                  message: "Account created successfully.",
                  user_id: result.insertId,
                  passenger_id: newPassengerId,
                  role,
                });
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
        SELECT ua.user_id, ua.email, ua.role, ua.passenger_id, ua.card_number, ua.card_expiration_date,
          ua.card_security_code, ua.card_name,
          p.first_name, p.last_name, p.date_of_birth, p.phone_number, p.address, p.id_number,
          p.passport_status, p.visa_status, p.country_of_origin, p.seat_preferences, p.meal_preferences, p.special_needs
        FROM user_account ua
        LEFT JOIN passenger p ON ua.passenger_id = p.passenger_id
        WHERE ua.email = ? AND ua.password = ? AND ua.role = ? AND COALESCE(ua.is_deleted, 0) = 0 LIMIT 1
      `;
      db.query(sql, [email, password, role], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 401, { error: "Invalid credentials." });
        sendJson(res, 200, { message: "Login successful.", user: results[0] });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // GET /all-staff — System Admin only
  if (req.url === "/all-staff" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!hasRole(requester.role, ["System Admin"])) return deny(res);
    const sql = `
      SELECT ua.user_id, ua.employee_id, ua.email, ua.role,
        e.first_name, e.last_name, e.department, e.position, e.hire_date
      FROM user_account ua
      LEFT JOIN employee e ON ua.employee_id = e.id_number
      WHERE ua.role IN ('Employee', 'System Admin')
      ORDER BY ua.role DESC, e.last_name ASC
    `;
    db.query(sql, (err, results) => {
      if (err) return sendJson(res, 500, { error: err.message });
      sendJson(res, 200, results);
    });
    return;
  }
 
  // POST /create-staff — System Admin only
  if (req.url === "/create-staff" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["System Admin"])) return deny(res);
      const { email, password, first_name, last_name, department, position, role } = body;
      if (!email || !password || !first_name || !role) {
        return sendJson(res, 400, { error: "Email, password, first name, and role are required." });
      }
      if (!["Employee", "System Admin"].includes(role)) {
        return sendJson(res, 400, { error: "Role must be Employee or System Admin." });
      }
      db.query("SELECT user_id FROM user_account WHERE email = ?", [email], (err, rows) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (rows.length > 0) return sendJson(res, 409, { error: "An account with this email already exists." });
        const prefix = role === "System Admin" ? "2" : "1";
        db.query(
          "SELECT id_number FROM employee WHERE id_number LIKE ? ORDER BY CAST(id_number AS UNSIGNED) DESC LIMIT 1",
          [prefix + "%"],
          (maxErr, maxRows) => {
            if (maxErr) return sendJson(res, 500, { error: maxErr.message });
            const nextId = maxRows.length > 0 ? String(Number(maxRows[0].id_number) + 1) : prefix + "01";
            db.query(
              `INSERT INTO employee (id_number, first_name, last_name, email, department, position, hire_date)
               VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
              [nextId, first_name, last_name || null, email, department || null, position || null],
              (empErr) => {
                if (empErr) return sendJson(res, 500, { error: empErr.message });
                db.query(
                  "INSERT INTO user_account (employee_id, email, password, role) VALUES (?, ?, ?, ?)",
                  [nextId, email, password, role],
                  (uaErr, result) => {
                    if (uaErr) return sendJson(res, 500, { error: uaErr.message });
                    sendJson(res, 201, { message: "Staff account created.", user_id: result.insertId, employee_id: nextId, role });
                  }
                );
              }
            );
          }
        );
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // DELETE /delete-staff — System Admin only
  if (req.url === "/delete-staff" && req.method === "DELETE") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["System Admin"])) return deny(res);
      const userId = Number(body.userId);
      if (!userId) return sendJson(res, 400, { error: "userId is required." });
      if (userId === requester.userId) return sendJson(res, 400, { error: "You cannot delete your own account." });
      db.query(
        "SELECT employee_id, role FROM user_account WHERE user_id = ? LIMIT 1",
        [userId], (err, rows) => {
          if (err) return sendJson(res, 500, { error: err.message });
          if (rows.length === 0) return sendJson(res, 404, { error: "Account not found." });
          if (!["Employee", "System Admin"].includes(rows[0].role)) {
            return sendJson(res, 400, { error: "This endpoint only deletes staff accounts." });
          }
          const employeeId = rows[0].employee_id;
          db.query("DELETE FROM user_account WHERE user_id = ?", [userId], (delErr) => {
            if (delErr) return sendJson(res, 500, { error: delErr.message });
            if (employeeId) {
              db.query("DELETE FROM employee WHERE id_number = ?", [employeeId], () => {});
            }
            sendJson(res, 200, { message: "Staff account deleted." });
          });
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // POST /staff-login — Employee and System Admin login
  if (req.url === "/staff-login" && req.method === "POST") {
    parseBody(req).then((body) => {
      const email = body.email?.trim();
      const password = body.password?.trim();
      const sql = `
        SELECT ua.user_id, ua.email, ua.role, ua.passenger_id, ua.employee_id,
          e.first_name, e.last_name
        FROM user_account ua
        LEFT JOIN employee e ON ua.employee_id = e.id_number
        WHERE ua.email = ? AND ua.password = ? AND ua.role IN ('Employee', 'System Admin') AND COALESCE(ua.is_deleted, 0) = 0 LIMIT 1
      `;
      db.query(sql, [email, password], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 401, { error: "Invalid credentials or not a staff account." });
        sendJson(res, 200, { message: "Login successful.", user: results[0] });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // POST /search-flights → public
  if (req.url === "/search-flights" && req.method === "POST") {
    parseBody(req).then((body) => {
      const sql = `
        SELECT 
          f.flight_id, f.route_id, f.date_of_departure, f.seats_available, f.airline_id,
          f.economy_price, f.business_price, f.first_class_price, f.aircraft_id,
          ac.model AS aircraft_name,
          dep.airport_code AS departure_code, dep.city_id AS departure_city_id,
          dep_city.country_id AS departure_country_id,
          arr.airport_code AS arrival_code, arr.city_id AS arrival_city_id,
          arr_city.country_id AS arrival_country_id,
          al.airline_name,
          dep_city.city_name AS departure_city, dep_country.country_name AS departure_country,
          arr_city.city_name AS arrival_city, arr_country.country_name AS arrival_country,
          dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
        FROM flights f
        JOIN routes r ON f.route_id = r.route_id
        JOIN airport dep ON r.departure_airport_id = dep.airport_id
        JOIN airport arr ON r.destination_airport_id = arr.airport_id
        JOIN airline al ON f.airline_id = al.airline_id
        JOIN aircraft ac ON f.aircraft_id = ac.aircraft_id
        JOIN city dep_city ON dep.city_id = dep_city.city_id
        JOIN country dep_country ON dep_city.country_id = dep_country.country_id
        JOIN city arr_city ON arr.city_id = arr_city.city_id
        JOIN country arr_country ON arr_city.country_id = arr_country.country_id
        WHERE (? IS NULL OR dep.city_id = ?) 
          AND (? IS NULL OR arr.city_id = ?)
          AND f.date_of_departure >= ?
        ORDER BY f.date_of_departure ASC 
        LIMIT 10
      `;
      const depCityId = body.departureCityId || null;
      const arrCityId = body.arrivalCityId || null;
      const departureDate = body.departureDate || null;
      db.query(sql, [depCityId, depCityId, arrCityId, arrCityId, departureDate], (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        sendJson(res, 200, results || []);
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }

    // POST /process-booking
  if (req.url === "/process-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!requester) return sendJson(res, 401, { error: "Unauthorized" });

      const {
        flight_id,
        cabin_class,
        base_fare,
        taxes,
        total_amount,
        save_card = false,
        card_name,
        card_number,
        card_expiration_date,
        card_security_code,
        passenger_id
      } = body;

      // 1. Create Payment
      const paymentSql = `
        INSERT INTO payment (amount, base_fare, taxes, payment_status, transaction_date)
        VALUES (?, ?, ?, 'Successful', CURDATE())
      `;

      db.query(paymentSql, [total_amount, base_fare, taxes], (err, paymentResult) => {
        if (err) return sendJson(res, 500, { error: err.message });

        const payment_id = paymentResult.insertId;

        // 2. Create Booking
        const bookingSql = `
          INSERT INTO bookings 
            (user_id, flight_id, booking_status, booking_date, payment_id, cabin_class)
          VALUES (?, ?, 'Confirmed', NOW(), ?, ?)
        `;

        db.query(bookingSql, [requester.userId, flight_id, payment_id, cabin_class], (err2, bookingResult) => {
          if (err2) return sendJson(res, 500, { error: err2.message });

          const booking_id = bookingResult.insertId;

          const bpSql = `
            INSERT INTO booking_passengers (booking_id, passenger_id)
            VALUES (?, ?)
          `;

          db.query(bpSql, [booking_id, passenger_id || requester.userId], (err3) => {
            if (err3) {
              console.error("Failed to insert into booking_passengers:", err3.message);
            }

            //  Save card info
            if (save_card && card_name && card_number) {
              const updateCardSql = `
                UPDATE user_account 
                SET card_name = ?, card_number = ?, card_expiration_date = ?, card_security_code = ?
                WHERE user_id = ?
              `;
              db.query(updateCardSql, [
                card_name, card_number, card_expiration_date, card_security_code, requester.userId
              ]);
            }

            sendJson(res, 200, { 
              success: true, 
              booking_id,
              payment_id 
            });
          });
        });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body" }));
    return;
  }
 
  // ─────────────────────────────────────────────────────────────────────────
  // POST /book-flight
  // CHANGED: Miles are now only awarded to passengers who have enrolled in
  // the loyalty program. Non-members can still book flights successfully but
  // receive no miles. The response includes a `not_enrolled` flag so the
  // frontend can show a "Join Loyalty" nudge on the confirmation screen.
  // ─────────────────────────────────────────────────────────────────────────
  if (req.url.startsWith("/book-flight") && req.method === "POST") {
    console.log("\n=== BOOK-FLIGHT HIT ===");
    parseBody(req)
      .then((body) => {
        console.log("[1] Body:", body);
        const requester = getRequestUser(req);
        console.log("[2] Requester:", requester);
 
        if (!hasRole(requester.role, ["Passenger", "Employee", "System Admin"])) {
          console.log("[AUTH FAIL]");
          return deny(res);
        }
 
        const { userId, passengerId, flightId } = body;
 
        if (!userId || !passengerId) {
          console.log("[VALIDATION FAIL]");
          return sendJson(res, 400, { error: "userId and passengerId are required" });
        }
 
        if (requester.role === "Passenger" && requester.userId !== Number(userId)) {
          console.log("[AUTH FAIL] Passenger mismatch");
          return deny(res);
        }
 
        console.log("[3] Inserting booking...");
 
        db.query(
          `INSERT INTO bookings (user_id, booking_date, booking_status, flight_id) VALUES (?, NOW(), 'Confirmed', ?)`,
          [userId, flightId || null],
          (err, result) => {
            if (err) {
              console.error("=== BOOKING INSERT FAILED ===", err);
              return sendJson(res, 500, { error: err.message });
            }
 
            const bookingId = result.insertId;
            console.log("[4] Booking created:", bookingId);
 
            db.query(
              "INSERT INTO booking_passengers (booking_id, passenger_id) VALUES (?, ?)",
              [bookingId, passengerId],
              (err2) => {
                if (err2) {
                  console.error("=== BOOKING_PASSENGERS FAILED ===", err2);
                  return sendJson(res, 500, { error: err2.message });
                }
 
                console.log("[5] Passenger linked");
 
                // Check loyalty enrollment — only enrolled members earn miles
                db.query(
                  "SELECT miles_balance, tier FROM loyalty_program WHERE passenger_id = ?",
                  [passengerId],
                  (loyErr, loyRows) => {
                    if (loyErr) {
                      console.error("=== LOYALTY SELECT FAILED ===", loyErr);
                      return sendJson(res, 500, { error: loyErr.message });
                    }
 
                    const isEnrolled = loyRows.length > 0;
                    let newMiles = 0;
                    let newTier = null;
                    let milestone = null;
 
                    if (isEnrolled) {
                      // Loyalty member — award 500 miles per booking
                      const oldMiles = loyRows[0].miles_balance || 0;
                      const oldTier  = loyRows[0].tier;
                      newMiles = oldMiles + 500;
 
                      if (newMiles >= 10000)     newTier = "Diamond";
                      else if (newMiles >= 5000) newTier = "Platinum";
                      else if (newMiles >= 1000) newTier = "Gold";
                      else                       newTier = oldTier;
 
                      db.query(
                        "UPDATE loyalty_program SET miles_balance = ?, tier = ? WHERE passenger_id = ?",
                        [newMiles, newTier, passengerId],
                        (updErr) => { if (updErr) console.error("LOYALTY UPDATE FAILED:", updErr); }
                      );
 
                      // Detect tier crossing for the milestone celebration banner
                      if (oldTier === "Silver"   && newTier === "Gold")     milestone = { tier: "Gold",     miles: newMiles };
                      if (oldTier === "Gold"     && newTier === "Platinum") milestone = { tier: "Platinum", miles: newMiles };
                      if (oldTier === "Platinum" && newTier === "Diamond")  milestone = { tier: "Diamond",  miles: newMiles };
                    }
                    // Non-members: booking succeeds, 0 miles awarded
 
                    console.log("[6] SUCCESS — enrolled:", isEnrolled, "| miles awarded:", isEnrolled ? 500 : 0);
 
                    return sendJson(res, 201, {
                      message: "Booked!",
                      booking_id: bookingId,
                      miles_earned: isEnrolled ? 500 : 0,
                      new_miles: newMiles,
                      new_tier: newTier,
                      milestone,
                      not_enrolled: !isEnrolled, // frontend uses this to show "join loyalty" nudge
                    });
                  }
                );
              }
            );
          }
        );
      })
      .catch((err) => {
        console.error("=== PARSE BODY FAILED ===", err);
        return sendJson(res, 400, { error: "Invalid JSON body", details: err.message });
      });
    return;
  }
 
  // POST /manage-booking
  if (req.url === "/manage-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!requester) return sendJson(res, 401, { error: "Unauthorized" });
 
      let sql = `
        SELECT 
          b.booking_id, b.user_id, b.booking_date, b.booking_status,
          f.flight_id, f.date_of_departure, f.estimated_time_hours,
          al.airline_name,
          dep.airport_name AS departure_name,
          dep_city.city_name AS departure_city,
          dep_country.country_name AS departure_country,
          arr.airport_name AS arrival_name,
          arr_city.city_name AS arrival_city,
          arr_country.country_name AS arrival_country,
          p.passenger_id, p.first_name, p.last_name, p.email,
          p.phone_number, p.seat_preferences, p.meal_preferences
        FROM bookings b
        JOIN booking_passengers bp ON b.booking_id = bp.booking_id
        JOIN passenger p ON bp.passenger_id = p.passenger_id
        JOIN flights f ON b.flight_id = f.flight_id
        JOIN routes r ON f.route_id = r.route_id
        JOIN airport dep ON r.departure_airport_id = dep.airport_id
        JOIN city dep_city ON dep.city_id = dep_city.city_id
        JOIN country dep_country ON dep_city.country_id = dep_country.country_id
        JOIN airport arr ON r.destination_airport_id = arr.airport_id
        JOIN city arr_city ON arr.city_id = arr_city.city_id
        JOIN country arr_country ON arr_city.country_id = arr_country.country_id
        JOIN airline al ON f.airline_id = al.airline_id
        WHERE b.booking_id = ?
      `;
 
      let params = [body.bookingId];
      if (requester.role === "Passenger") {
        sql += " AND b.user_id = ?";
        params.push(requester.userId);
      }
 
      db.query(sql, params, (err, results) => {
        if (err) return sendJson(res, 500, { error: err.message });
        if (results.length === 0) return sendJson(res, 404, { error: "Booking not found." });
        sendJson(res, 200, results[0]);
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body" }));
    return;
  }
 
  // POST /cancel-booking → passenger (own), Employee, System Admin
  if (req.url === "/cancel-booking" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      const bookingId = body.bookingId;
      db.query("SELECT user_id FROM bookings WHERE booking_id = ? LIMIT 1", [bookingId], (checkErr, rows) => {
        if (checkErr) return sendJson(res, 500, { error: checkErr.message });
        if (rows.length === 0) return sendJson(res, 404, { error: "Booking not found." });
        const bookingOwnerId = Number(rows[0].user_id);
        const canCancel = isStaff(requester.role) || (requester.role === "Passenger" && requester.userId === bookingOwnerId);
        if (!canCancel) return deny(res);
        db.query("UPDATE bookings SET booking_status = 'Cancelled' WHERE booking_id = ?", [bookingId], (err) => {
          if (err) return sendJson(res, 500, { error: err.message });
          sendJson(res, 200, { message: "Cancelled." });
        });
      });
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // PUT /account/:userId — logged-in user updates their own profile
  const accountUpdateMatch = req.url.match(/^\/account\/(\d+)$/);
  if (accountUpdateMatch && req.method === "PUT") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      const targetUserId = Number(accountUpdateMatch[1]);
      const isSelf = requester.userId === targetUserId;
      if (!isSelf && !isStaff(requester.role)) return deny(res);
 
      const {
        first_name, last_name, date_of_birth, phone_number, address, id_number,
        passport_status, visa_status, seat_preferences, meal_preferences, special_needs, password,
      } = body;
 
      if (!first_name?.trim() || !last_name?.trim()) {
        return sendJson(res, 400, { error: "First name and last name are required." });
      }
 
      db.query(
        "SELECT role, passenger_id, employee_id FROM user_account WHERE user_id = ? AND COALESCE(is_deleted,0)=0 LIMIT 1",
        [targetUserId], (err, rows) => {
          if (err) return sendJson(res, 500, { error: err.message });
          if (rows.length === 0) return sendJson(res, 404, { error: "Account not found." });
          const { passenger_id, employee_id } = rows[0];
          const tasks = [];
 
          if (passenger_id) {
            tasks.push((cb) => db.query(
              `UPDATE passenger SET first_name=?, last_name=?, date_of_birth=?, phone_number=?,
               address=?, id_number=?, passport_status=?, visa_status=?,
               seat_preferences=?, meal_preferences=?, special_needs=? WHERE passenger_id=?`,
              [first_name.trim(), last_name.trim() || null, date_of_birth || null,
               phone_number || null, address || null, id_number || null,
               passport_status ? 1 : 0, visa_status ? 1 : 0,
               seat_preferences || null, meal_preferences || null, special_needs || null,
               passenger_id], cb
            ));
          }
 
          if (employee_id) {
            tasks.push((cb) => db.query(
              `UPDATE employee SET first_name=?, last_name=?, date_of_birth=?, phone_number=?,
               address=?, passport_status=?, visa_status=?,
               seat_preferences=?, meal_preferences=?, special_needs=? WHERE id_number=?`,
              [first_name.trim(), last_name.trim() || null, date_of_birth || null,
               phone_number || null, address || null,
               passport_status ? 1 : 0, visa_status ? 1 : 0,
               seat_preferences || null, meal_preferences || null, special_needs || null,
               employee_id], cb
            ));
          }
 
          if (password?.trim()) {
            tasks.push((cb) => db.query(
              "UPDATE user_account SET password=? WHERE user_id=?",
              [password.trim(), targetUserId], cb
            ));
          }
 
          let done = 0;
          if (tasks.length === 0) return sendJson(res, 200, { message: "Nothing to update." });
          let failed = false;
          tasks.forEach((task) => task((taskErr) => {
            if (failed) return;
            if (taskErr) { failed = true; return sendJson(res, 500, { error: taskErr.message }); }
            done++;
            if (done === tasks.length) sendJson(res, 200, { message: "Account updated successfully." });
          }));
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // DELETE /deactivate-account — soft-deletes the logged-in user's own account
  if (req.url === "/deactivate-account" && req.method === "DELETE") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!requester.userId) return deny(res);
      const { password } = body;
      if (!password?.trim()) return sendJson(res, 400, { error: "Password confirmation is required." });
      db.query(
        "SELECT user_id, password, role FROM user_account WHERE user_id = ? AND COALESCE(is_deleted,0)=0 LIMIT 1",
        [requester.userId], (err, rows) => {
          if (err) return sendJson(res, 500, { error: err.message });
          if (rows.length === 0) return sendJson(res, 404, { error: "Account not found." });
          if (rows[0].password !== password.trim()) {
            return sendJson(res, 401, { error: "Incorrect password. Account not deleted." });
          }
          const deletedAt = Date.now();
          const anonEmail = `deleted_${deletedAt}_${rows[0].user_id}@deleted.invalid`;
          db.query(
            "UPDATE user_account SET is_deleted=1, email=? WHERE user_id=?",
            [anonEmail, requester.userId], (updateErr) => {
              if (updateErr) return sendJson(res, 500, { error: updateErr.message });
              sendJson(res, 200, { message: "Account deactivated successfully." });
            }
          );
        }
      );
    }).catch((err) => sendJson(res, 400, { error: "Invalid JSON body", details: err.message }));
    return;
  }
 
  // PUT /update-preferences → passenger (own), Employee, System Admin
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
            "UPDATE passenger SET seat_preferences = ?, meal_preferences = ? WHERE passenger_id = ?",
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
        "INSERT INTO flights (route_id, date_of_departure, seats_available) VALUES (?, ?, ?)",
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
        "UPDATE aircraft SET seating_capacity = ? WHERE aircraft_id = ?",
        [body.capacity, body.aircraftId], (err) => {
          if (err) return sendJson(res, 500, { error: err.message });
          sendJson(res, 200, { message: "aircraft updated." });
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
      db.query(
        "UPDATE routes SET is_active = NOT COALESCE(is_active, 1) WHERE route_id = ?",
        [body.routeId], (err) => {
          if (err && err.code === "ER_BAD_FIELD_ERROR") {
            db.query(
              "ALTER TABLE routes ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1",
              (alterErr) => {
                if (alterErr) return sendJson(res, 500, { error: alterErr.message });
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
        "INSERT INTO bookings (user_id, booking_date, booking_status) VALUES (?, NOW(), 'Confirmed')",
        [userId], (err, result) => {
          if (err) return sendJson(res, 500, { error: err.message });
          const bookingId = result.insertId;
          db.query(
            "INSERT INTO booking_passengers (booking_id, passenger_id) VALUES (?, ?)",
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
        "UPDATE bookings SET booking_status = ? WHERE booking_id = ?",
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
        FROM flights f
        JOIN routes r ON f.route_id = r.route_id
        JOIN airport dep ON r.departure_airport_id = dep.airport_id
        JOIN airport arr ON r.destination_airport_id = arr.airport_id
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
 
  // GET /passenger-users → Employee, System Admin
  if (req.url === "/passenger-users" && req.method === "GET") {
    const requester = getRequestUser(req);
    if (!isStaff(requester.role)) return deny(res);
    const sql = `
      SELECT p.passenger_id, p.first_name, p.last_name, p.email,
        p.phone_number, p.seat_preferences, p.meal_preferences
      FROM passenger p
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
 
  // POST /redeem-flight → loyalty member redeems 1000 miles for a free flight
  if (req.url === "/redeem-flight" && req.method === "POST") {
    parseBody(req).then((body) => {
      const requester = getRequestUser(req);
      if (!hasRole(requester.role, ["Passenger", "Employee", "System Admin"])) return deny(res);
      const { userId, passengerId, flightId } = body;
      const REDEMPTION_COST = 1000;
      db.query(
        "SELECT miles_balance, tier FROM loyalty_program WHERE passenger_id = ?",
        [passengerId], (loyErr, loyRows) => {
          if (loyErr) return sendJson(res, 500, { error: loyErr.message });
          if (loyRows.length === 0) return sendJson(res, 400, { error: "No loyalty account found. Please join the Royal Horizon Loyalty program first." });
          const currentMiles = loyRows[0].miles_balance;
          if (currentMiles < REDEMPTION_COST) {
            return sendJson(res, 400, { error: `Not enough miles. You need ${REDEMPTION_COST} miles to redeem a free flight.` });
          }
          const newMiles = currentMiles - REDEMPTION_COST;
          let newTier = loyRows[0].tier;
          if (newMiles < 1000)       newTier = "Silver";
          else if (newMiles < 5000)  newTier = "Gold";
          else if (newMiles < 10000) newTier = "Platinum";
          else                       newTier = "Diamond";
          db.query(
            "INSERT INTO bookings (user_id, booking_date, booking_status) VALUES (?, NOW(), 'Confirmed')",
            [userId], (err, result) => {
              if (err) return sendJson(res, 500, { error: err.message });
              const bookingId = result.insertId;
              db.query(
                "INSERT INTO booking_passengers (booking_id, passenger_id) VALUES (?, ?)",
                [bookingId, passengerId], (err2) => {
                  if (err2) return sendJson(res, 500, { error: err2.message });
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
 //REPORTS
  // 1. REVENUE
if (req.url.startsWith("/api/reports/airport-revenue")) {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const start = urlParams.searchParams.get('start') || '2026-01-01';
    const end = urlParams.searchParams.get('end') || '2026-12-31';
    const sort = urlParams.searchParams.get('sort') === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
        SELECT 
            a.airport_name, 
            SUM(b.total_amount) AS total_revenue
        FROM airports a
        JOIN flights f ON a.airport_id = f.arrival_airport_id
        JOIN bookings b ON f.flight_id = b.flight_id
        WHERE b.booking_status = 'Confirmed'
        AND b.booking_date BETWEEN ? AND ?
        GROUP BY a.airport_id
        ORDER BY total_revenue ${sort};
    `;

    db.query(sql, [start, end], (err, results) => {
        if (err) {
            res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }
    });
    return;
}

// 2. POPULAR ROUTES 
if (req.url.startsWith("/api/reports/popular-routes")) {
    const urlParams = new URL(req.url, `http://${req.headers.host}`);
    const start = urlParams.searchParams.get('start') || '2026-01-01';
    const end = urlParams.searchParams.get('end') || '2026-12-31';
    const sort = urlParams.searchParams.get('sort') === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
        SELECT 
            CONCAT(r.origin_airport_id, ' → ', r.destination_airport_id) AS route_name,
            COUNT(b.booking_id) AS total_bookings
        FROM routes r
        JOIN flights f ON r.route_id = f.route_id
        JOIN bookings b ON f.flight_id = b.flight_id
        WHERE b.booking_date BETWEEN ? AND ?
        GROUP BY r.route_id
        ORDER BY total_bookings ${sort};
    `;

    db.query(sql, [start, end], (err, results) => {
        if (err) {
            res.writeHead(500); res.end(JSON.stringify({ error: err.message }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        }
    });
    return;
}
 
  sendJson(res, 404, { message: "Route not found" });
});
 
const PORT = 8000;
server.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
