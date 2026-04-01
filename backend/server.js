const http = require("http");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) { 
    console.error("Database connection failed:", err.stack); 
    return;
  }
  console.log("Connected to database.");
});

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => { 
      try { 
        resolve(JSON.parse(body)); } 
      catch (e) { 
        reject(e); 
      } 
    });
    req.on("error", reject);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
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
      SELECT a.airport_id, a.airport_name, c.city_name, co.country_name
      FROM Airport AS a
      JOIN city c AS c ON a.city_id = c.city_id
      JOIN Country AS co ON a.country_id = co.country_id
      ORDER BY co.country_name, c.city_name, a.airport_name`;

    db.query(sql, 
      (err, results) => {
        if (err) { 
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
    db.query("SELECT user_id, email, role FROM user_account", (err, results) => {
      if (err) { 
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message })); 
        return; 
      }
      res.writeHead(200); 
      res.end(JSON.stringify(results));
    });
    return;
  }

  // POST /register
  if (req.url === "/register" && req.method === "POST") {
    parseBody(req).then(body => {

      const { role, email, password, first_name, last_name, date_of_birth,
              phone_number, address, id_number, passport_status, visa_status,
              country_of_origin, seat_preferences, meal_preferences, special_needs } = body;

      if (!role || !email || !password || !first_name || !last_name ||
          !date_of_birth || !phone_number || !address || !id_number) {
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "All required fields must be filled in." })); 
        return;
      }
      if (!["Passenger", "Employee"].includes(role)) {
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "Role must be Passenger or Employee." })); 
        return;
      }

      db.query("SELECT user_id FROM user_account WHERE email = ?", [email], (err, rows) => {
        if (err) { 
          res.writeHead(500); 
          res.end(JSON.stringify({ error: err.message })); 
          return; 
        }
        if (rows.length > 0) { 
          res.writeHead(409); 
          res.end(JSON.stringify({ error: "An account with this email already exists." })); 
          return; 
        }

        // passenger_id is AUTO_INCREMENT — omit it so MySQL assigns it automatically
        const pSql = `INSERT INTO Passenger (first_name, last_name, date_of_birth, email,
          phone_number, address, id_number, passport_status, visa_status, country_of_origin,
          seat_preferences, meal_preferences, special_needs) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const pVals = [first_name.trim(), last_name.trim(), date_of_birth, email.trim(),
          phone_number.trim(), address.trim(), id_number.trim(),
          passport_status ? 1 : 0, visa_status ? 1 : 0,
          country_of_origin || null, seat_preferences || null, meal_preferences || null, special_needs || null
        ];

        db.query(pSql, pVals, (err, pResult) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") { 
              res.writeHead(409); res.end(JSON.stringify({ error: "ID number already registered." })); }
            else { 
              console.error("Passenger insert error:", err.code, err.message); 
              res.writeHead(500); res.end(JSON.stringify({ error: err.message, code: err.code })); }
            return;
          }

          const newPassengerId = pResult.insertId;
          db.query("INSERT INTO user_account (passenger_id, email, password, role) VALUES (?,?,?,?)",
            [newPassengerId, email.trim(), password, role], (err, result) => {
              if (err) {
                db.query("DELETE FROM Passenger WHERE passenger_id = ?", [newPassengerId]);
                res.writeHead(500); 
                res.end(JSON.stringify({ error: err.message })); 
                return;
              }
              res.writeHead(201);
              res.end(JSON.stringify({ 
                message: "Account created successfully.", 
                user_id: result.insertId, 
                passenger_id: newPassengerId, 
                role 
              }));
            });
        });
      });
    });
    return;
  }

  // POST /login
  if (req.url === "/login" && req.method === "POST") {
    parseBody(req).then(body => {

      const email = body.email?.trim(); 
      const password = body.password?.trim(); 
      const role = body.role?.trim();

      if (!email || !password || !role) { 
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "Email, password, and role are required." })); 
        return; 
      }

      const sql = `SELECT ua.user_id, ua.email, ua.role, ua.passenger_id,
        p.first_name, p.last_name, p.date_of_birth, p.phone_number, p.address,
        p.id_number, p.passport_status, p.visa_status, p.country_of_origin,
        p.seat_preferences, p.meal_preferences, p.special_needs
        FROM user_account ua LEFT JOIN Passenger p ON ua.passenger_id = p.passenger_id
        WHERE ua.email = ? AND ua.password = ? AND ua.role = ? LIMIT 1`;

      db.query(sql, [email, password, role], (err, results) => {
        if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
        if (results.length === 0) { 
          res.writeHead(401); 
          res.end(JSON.stringify({ error: "Invalid email, password, or role." })); 
          return; 
        }
        res.writeHead(200); 
        res.end(JSON.stringify({ message: "Login successful.", user: results[0] }));
      });
    })
    .catch(() => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
    })
    return;
  }

  // PUT /account/:userId
  const editMatch = req.url.match(/^\/account\/(\d+)$/);
  if (editMatch && req.method === "PUT") {
    const userId = editMatch[1];

    parseBody(req).then(body => {

      const { first_name, last_name, date_of_birth, phone_number, address,
              id_number, passport_status, visa_status, country_of_origin,
              seat_preferences, meal_preferences, special_needs, password } = body;

      if (!first_name || !last_name || !date_of_birth || !phone_number || !address || !id_number) {
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "All required fields must be filled in." })); 
        return;
      }

      db.query("SELECT passenger_id FROM user_account WHERE user_id = ?", [userId], (err, rows) => {
        if (err || rows.length === 0) { 
          res.writeHead(404); 
          res.end(JSON.stringify({ error: "User not found." })); 
          return; 
        }
        const pid = rows[0].passenger_id;

        const uSql = `UPDATE Passenger SET first_name=?, last_name=?, date_of_birth=?,
          phone_number=?, address=?, id_number=?, passport_status=?, visa_status=?,
          country_of_origin=?, seat_preferences=?, meal_preferences=?, special_needs=?
          WHERE passenger_id=?`;

        db.query(uSql, [first_name.trim(), last_name.trim(), date_of_birth,
          phone_number.trim(), address.trim(), id_number.trim(),
          passport_status ? 1 : 0, visa_status ? 1 : 0,
          country_of_origin || null, seat_preferences || null, meal_preferences || null, special_needs || null,
          pid], (err) => {
            if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
            if (password && password.trim() !== "") {
              db.query("UPDATE user_account SET password=? WHERE user_id=?", [password.trim(), userId], (err) => {
                if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
                res.writeHead(200); res.end(JSON.stringify({ message: "Account updated successfully." }));
              });
            } else {
              res.writeHead(200); res.end(JSON.stringify({ message: "Account updated successfully." }));
            }
          });
      });
    })
    .catch(() => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
    })
    return;
  }

  // POST /search-flights
  if (req.url === "/search-flights" && req.method === "POST") {
    parseBody(req).then(body => {

      const dep = Number(body.departureAirportId); 
      const arr = Number(body.arrivalAirportId);
      const date = body.departureDate;
      const pax = Number(body.passengers);

      if (!dep || !arr || !date || !pax) { 
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "All flight search fields are required." })); 
        return; 
      }

      if (dep === arr) { 
        res.writeHead(400); 
        res.end(JSON.stringify({ error: "Departure and arrival airports cannot be the same." })); 
        return; 
      }

      const sql = `
        SELECT 
            f.flight_id,
            f.date_of_departure,
            f.seats_available,
            f.economy_price,
            f.business_price,
            f.first_class_price,
            dep.airport_name AS departure_airport,
            dep.airport_code AS departure_airport_code,
            dep_city.city_name AS departure_city,
            dep_country.country_name AS departure_country,
            arr.airport_name AS arrival_airport,
            arr.airport_code AS arrival_airport_code,
            arr_city.city_name AS arrival_city,
            arr_country.country_name AS arrival_country,
            dep.airport_code AS departure_code,
            arr.airport_code AS arrival_code
        FROM Flights f
        JOIN Airport dep ON f.departure_airport_id = dep.airport_id
        JOIN city AS dep_city ON dep.city_id = dep_city.city_id
        JOIN Country AS dep_country ON dep.country_id = dep_country.country_id
        JOIN Airport arr ON f.destination_airport_id = arr.airport_id
        JOIN city AS arr_city ON arr.city_id = arr_city.city_id
        JOIN Country AS arr_country ON arr.country_id = arr_country.country_id
        WHERE f.departure_airport_id = ?
          AND f.destination_airport_id = ?
          AND DATE(f.date_of_departure) = ?
          AND f.seats_available >= ?
        ORDER BY f.date_of_departure ASC`;

      db.query(sql, [dep, arr, date, pax], (err, results) => {
        if (err) { 
          res.writeHead(500); 
          res.end(JSON.stringify({ error: err.message })); 
          return; 
        }
        res.writeHead(200); res.end(JSON.stringify(results));
      });
    })
    .catch(() => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
    })
    return;
  }

  // POST /manage-booking
  if (req.url === "/manage-booking" && req.method === "POST") {
    parseBody (req).then(body => {

      const bookingId = body.bookingId?.trim(), lastName = body.lastName?.trim();
      if (!bookingId || !lastName) { res.writeHead(400); res.end(JSON.stringify({ error: "Booking ID and last name are required." })); return; }

      const sql = `SELECT b.booking_id, p.passenger_id, p.first_name, p.last_name,
        p.email, p.phone_number, p.seat_preferences, p.meal_preferences
        FROM Bookings b JOIN Booking_Passengers bp ON b.booking_id = bp.booking_id
        JOIN Passenger p ON bp.passenger_id = p.passenger_id
        WHERE b.booking_id=? AND p.last_name=? LIMIT 1`;

      db.query(sql, [bookingId, lastName], (err, results) => {
        if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
        if (results.length === 0) { res.writeHead(404); res.end(JSON.stringify({ error: "Booking not found." })); return; }
        res.writeHead(200); res.end(JSON.stringify(results[0]));
      });
    })
    .catch(() => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
    })
    return;
  }

  // POST /flight-status
  if (req.url === "/flight-status" && req.method === "POST") {
    parseBody(req).then(body =>{

      const flightId = Number(body.flightId);
      if (!flightId) { res.writeHead(400); res.end(JSON.stringify({ error: "Flight ID is required." })); return; }

      const sql = `SELECT f.flight_id, f.date_of_departure, f.seats_available,
        dep.airport_name AS departure_airport, arr.airport_name AS arrival_airport
        FROM Flights f JOIN routes r ON f.route_id = r.route_id
        JOIN Airport dep ON r.departure_airport_id = dep.airport_id
        JOIN Airport arr ON r.destination_airport_id = arr.airport_id
        WHERE f.flight_id=? LIMIT 1`;

      db.query(sql, [flightId], (err, results) => {
        if (err) { res.writeHead(500); res.end(JSON.stringify({ error: err.message })); return; }
        if (results.length === 0) { res.writeHead(404); res.end(JSON.stringify({ error: "Flight not found." })); return; }
        res.writeHead(200); res.end(JSON.stringify(results[0]));
      });
    })
    .catch(() => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "Invalid request body." }));
    })
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found" }));
});

const PORT = 8000;
server.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
});

