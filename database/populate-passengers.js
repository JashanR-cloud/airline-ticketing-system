/*
 * This script creates 4000 passenger accounts with corresponding user_accounts.
 * Names are randomly generated strings — no hardcoded name lists needed.
 *
 * Uses environment variables for DB connection (same as populate-flights.js).
 * Run: node populate-passengers.js
 */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const SEAT_PREFS = ["Window", "Middle", "Aisle"];
const MEAL_PREFS = ["No preference", "Vegetarian", "Vegan", "Kosher", "Halal", "Gluten-free"];

const HOW_MANY_PASSENGERS = 4000;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generates a random name like "Kavel" or "Brento"
function randomName(minLen, maxLen) {
  const consonants = "bcdfghjklmnprstvwz";
  const vowels = "aeiou";
  const len = randomInt(minLen, maxLen);
  let name = "";
  for (let i = 0; i < len; i++) {
    name += i % 2 === 0 ? randomItem(consonants.split("")) : randomItem(vowels.split(""));
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function randomDate(startYear, endYear) {
  const year = randomInt(startYear, endYear);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function generatePhone() {
  return `${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

db.connect((err) => {
  if (err) { console.error("Connection failed:", err.message); process.exit(1); }
  console.log("Connected to database.");

  // Get existing country IDs
  db.query("SELECT country_id FROM country", (err, countries) => {
    if (err) { console.error("Failed to fetch countries:", err.message); process.exit(1); }
    const countryIds = countries.map(c => c.country_id);
    console.log(`Found ${countryIds.length} countries.`);

    // Get current max passenger_id
    db.query("SELECT COALESCE(MAX(passenger_id), 0) AS max_id FROM passenger", (err, rows) => {
      if (err) { console.error(err.message); process.exit(1); }
      let nextId = rows[0].max_id + 1;
      console.log(`Starting passenger IDs from ${nextId}.`);

      const passengers = [];
      const usedEmails = new Set();

      for (let i = 0; i < HOW_MANY_PASSENGERS; i++) {
        const firstName = randomName(4, 7);
        const lastName = randomName(4, 8);
        const id = nextId + i;

        // Generate a unique email
        let email;
        let attempt = 0;
        do {
          const suffix = attempt === 0 ? "" : attempt;
          email = `${firstName.toLowerCase()}${lastName.toLowerCase()}${suffix}@email.com`;
          attempt++;
        } while (usedEmails.has(email));
        usedEmails.add(email);

        passengers.push({
          passenger_id: id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: randomDate(1955, 2005),
          email: email,
          phone_number: generatePhone(),
          address: `${randomInt(100, 9999)} ${randomName(4, 7)} ${randomItem(["St", "Ave", "Blvd", "Dr", "Ln", "Rd"])}`,
          id_number: `ID${String(id).padStart(6, "0")}`,
          passport_status: Math.random() < 0.85 ? 1 : 0,
          visa_status: Math.random() < 0.80 ? 1 : 0,
          country_of_origin: randomItem(countryIds),
          seat_preferences: randomItem(SEAT_PREFS),
          meal_preferences: randomItem(MEAL_PREFS),
          special_needs: Math.random() < 0.1 ? randomItem(["Wheelchair assistance", "Visual impairment", "Hearing impairment", "Service animal"]) : null,
        });
      }

      console.log(`Generated ${passengers.length} passengers. Inserting...`);

      const BATCH_SIZE = 500;
      let inserted = 0;

      function insertPassengerBatch(index) {
        if (index >= passengers.length) {
          console.log(`Done! Inserted ${inserted} passengers.`);
          console.log(`Now creating user accounts...`);
          createUserAccounts(passengers);
          return;
        }

        const batch = passengers.slice(index, index + BATCH_SIZE);
        const values = batch.map(p => [
          p.passenger_id, p.first_name, p.last_name, p.date_of_birth,
          p.email, p.phone_number, p.address, p.id_number,
          p.passport_status, p.visa_status, p.country_of_origin,
          p.seat_preferences, p.meal_preferences, p.special_needs
        ]);

        const sql = `INSERT INTO passenger (passenger_id, first_name, last_name, date_of_birth,
          email, phone_number, address, id_number, passport_status, visa_status,
          country_of_origin, seat_preferences, meal_preferences, special_needs) VALUES ?`;

        db.query(sql, [values], (err) => {
          if (err) {
            console.error(`Batch error at index ${index}:`, err.message);
            db.end();
            return;
          }
          inserted += batch.length;
          console.log(`  ${inserted} / ${passengers.length} passengers inserted...`);
          insertPassengerBatch(index + BATCH_SIZE);
        });
      }

      function createUserAccounts(passengers) {
        let accountsInserted = 0;

        function insertAccountBatch(index) {
          if (index >= passengers.length) {
            console.log(`Done! Created ${accountsInserted} user accounts.`);
            console.log(`\nYour database now has ${nextId - 1 + passengers.length} total passengers.`);
            db.end();
            return;
          }

          const batch = passengers.slice(index, index + BATCH_SIZE);
          const values = batch.map(p => [
            p.passenger_id,
            null,
            p.email,
            "password123",
            null,
            null,
            null,
            "Passenger",
            0,
            null
          ]);

          const sql = `INSERT INTO user_account (passenger_id, employee_id, email, password,
            card_number, card_expiration_date, card_security_code, role, is_deleted, card_name) VALUES ?`;

          db.query(sql, [values], (err) => {
            if (err) {
              console.error(`Account batch error at index ${index}:`, err.message);
              db.end();
              return;
            }
            accountsInserted += batch.length;
            console.log(`  ${accountsInserted} / ${passengers.length} accounts created...`);
            insertAccountBatch(index + BATCH_SIZE);
          });
        }

        insertAccountBatch(0);
      }

      insertPassengerBatch(0);
    });
  });
});
