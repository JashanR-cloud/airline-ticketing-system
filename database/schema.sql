CREATE DATABASE airline_ticketing;
USE airline_ticketing;

-- Country Object
CREATE TABLE Country (
    country_id   INTEGER PRIMARY KEY,
    country_name   VARCHAR(60) NOT NULL
);

CREATE TABLE city (
    city_id INTEGER PRIMARY KEY,
    city_name VARCHAR(60),
    country_id INTEGER NOT NULL,
    FOREIGN KEY(country_id) REFERENCES Country(country_id)
);

CREATE TABLE airline (
    airline_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    airline_name VARCHAR(60) NOT NULL,
    airline_code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE Airport (
    airport_id   INTEGER PRIMARY KEY NOT NULL,
    airport_code   VARCHAR(10),
    airport_name   VARCHAR(60),
    city_id   INTEGER NOT NULL,
    timezone   VARCHAR(30),
    number_of_terminals   INTEGER,
    FOREIGN KEY (city_id)    REFERENCES city(city_id)
);

CREATE TABLE gates (
    gate_id INT PRIMARY KEY,
    airport_id INT,
    gate_name VARCHAR(10),
    FOREIGN KEY (airport_id)
        REFERENCES Airport(airport_id)
);

-- Aircraft:
CREATE TABLE Aircraft (
    aircraft_id INT PRIMARY KEY,
    model VARCHAR(30) NOT NULL,
    manufacturer VARCHAR(30) NOT NULL,
    seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
    max_baggage_capacity INT CHECK (max_baggage_capacity >= 0)
);

CREATE TABLE routes(
	route_id INTEGER PRIMARY KEY AUTO_INCREMENT, 
	departure_airport_id INTEGER,
	destination_airport_id INTEGER,
	demand ENUM ('Low', 'Medium', 'High'),
	FOREIGN KEY (departure_airport_id) 
		REFERENCES Airport (airport_id),
	FOREIGN KEY (destination_airport_id) 
		REFERENCES Airport (airport_id),
    CHECK (departure_airport_id <> destination_airport_id),
	UNIQUE KEY unique_route (departure_airport_id, destination_airport_id)
);

CREATE TABLE Flights (
    flight_id INT PRIMARY KEY,
    aircraft_id INT,
    route_id INT,
    airline_id INT,
    date_of_departure DATETIME NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats > 0),
    seats_available INT NOT NULL CHECK (seats_available >= 0),
    staff_size INT NOT NULL CHECK (staff_size >= 4),
    baggage_availability INT CHECK (baggage_availability >= 0),
    FOREIGN KEY (aircraft_id) REFERENCES Aircraft(aircraft_id),
    FOREIGN KEY (route_id) REFERENCES routes(route_id),
    FOREIGN KEY (airline_id) REFERENCES airline(airline_id),

    CHECK (seats_available <= total_seats)
);

-- passenger object
CREATE TABLE Passenger (
    passenger_id   INTEGER PRIMARY KEY NOT NULL,
    first_name   VARCHAR(60) NOT NULL,
    last_name   VARCHAR(60),
    date_of_birth   DATE,
    email   VARCHAR(120),
    phone_number   VARCHAR(30),
    address   VARCHAR(120),
    id_number   VARCHAR(30) UNIQUE,
    passport_status   BOOLEAN,
    visa_status   BOOLEAN,
    country_of_origin   INTEGER,
    seat_preferences   ENUM('Window', 'Middle', 'Aisle'),
    meal_preferences   VARCHAR(60),
    special_needs      VARCHAR(120),
    FOREIGN KEY (country_of_origin) REFERENCES Country(country_id)
);

-- Employee Object
CREATE TABLE Employee (
    id_number   VARCHAR(30) PRIMARY KEY NOT NULL,
    first_name   VARCHAR(60) NOT NULL,
    last_name   VARCHAR(60),
    date_of_birth   DATE,
    email   VARCHAR(120) UNIQUE,
    phone_number   VARCHAR(30) UNIQUE,
    address   VARCHAR(120),
    card_number   VARCHAR(30),
    card_expiration_date   VARCHAR(30),
    card_security_code   VARCHAR(30),
    passport_status   BOOLEAN,
    visa_status   BOOLEAN,
    country_of_origin   INTEGER,
    seat_preferences   VARCHAR(30),
    meal_preferences   VARCHAR(60),
    special_needs   VARCHAR(120),
    department   VARCHAR(60),
    airport_id   INTEGER,
    position   VARCHAR(60),
    hire_date   DATE,
    position_permission   VARCHAR(60),
    access_level   VARCHAR(30),
    FOREIGN KEY (country_of_origin) REFERENCES Country(country_id),
    FOREIGN KEY (airport_id)  REFERENCES Airport(airport_id)
);

CREATE TABLE user_account (
    user_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    passenger_id INTEGER UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL,
    card_number VARCHAR(30),
    card_expiration_date DATE,
    card_security_code VARCHAR(10),
    role ENUM('Passenger', 'Employee') NOT NULL,
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id)
);

CREATE TABLE loyalty_program (
    loyalty_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    passenger_id INTEGER NOT NULL UNIQUE,
    membership_number VARCHAR(30) NOT NULL,
    tier ENUM('Silver', 'Gold', 'Platinum'),
    miles_balance INTEGER DEFAULT 0,
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id)
);

CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY,
    ticket_number VARCHAR(30) UNIQUE,
    flight_id INT NOT NULL,
    issue_date DATE,
    baggage INT CHECK (baggage >= 0),
    payment_id INT,
	-- new code to fit professors sugestion
	ticket_status ENUM('Issued', 'Refunded', 'Cancelled', 'Reserved') NOT NULL,
	reservation_expiry DATETIME DEFAULT NULL,
	-- end of new code
    FOREIGN KEY (flight_id) REFERENCES Flights(flight_id)
);

CREATE TABLE Payment (
    payment_id INT PRIMARY KEY,
    booking_id INT NOT NULL,
    payment_method VARCHAR(30),
    amount DECIMAL(7,2) CHECK (amount >= 0),
    users_currency VARCHAR(30),
    original_currency VARCHAR(30),
    transaction_date DATE,
    refunded BOOLEAN,
    payment_status ENUM('Successful','Unsuccessful','Pending'),
    class_fare DECIMAL(5,2) CHECK (class_fare >= 0),
    base_fare DECIMAL(7,2) CHECK (base_fare >= 0),
    taxes DECIMAL(5,2) CHECK (taxes >= 0),

    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

CREATE TABLE boardingpass(
	boarding_pass_id INTEGER PRIMARY KEY,
	airport_id INTEGER,
	gate_id INTEGER,
	flight_id INTEGER,
	airline_id INTEGER,
	customer_support_phone VARCHAR(30),
	seat_number VARCHAR(10),
	boarding_group ENUM ('first', 'business', 'economy'),
	arrival_time DATETIME,
	departure_time DATETIME,
	FOREIGN KEY (airport_id) 
		REFERENCES Airport (airport_id),
	FOREIGN KEY (gate_id) 
		REFERENCES gates (gate_id),
	FOREIGN KEY (flight_id) 
		REFERENCES Flights (flight_id),
	FOREIGN KEY (airline_id) 
		REFERENCES airline (airline_id)
);

CREATE TABLE Insurance_Policy (
    insurance_id INT PRIMARY KEY,
    booking_id INT NOT NULL,
    provider_name ENUM('Allianz','Global Travel','Safe Trip','Other') NOT NULL,
    coverage_amount DECIMAL(7,2) NOT NULL CHECK (coverage_amount >= 0),
    insurance_fee DECIMAL(5,2) NOT NULL CHECK (insurance_fee >= 0),
    coverage_type ENUM('Trip Cancellation','Medical','Baggage','Full Coverage') NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);

CREATE TABLE Booking_Passengers (
    passenger_id INT NOT NULL,
    booking_id INT NOT NULL,

    PRIMARY KEY (passenger_id, booking_id),

    FOREIGN KEY (passenger_id) 
        REFERENCES Passenger(passenger_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (booking_id) 
        REFERENCES Bookings(booking_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE

);

CREATE TABLE inflight_entertainment (
    entertainment_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    type ENUM('Movie', 'TV Series', 'Music/Live Concerts', 'Audio Book/Podcasts') NOT NULL,
    wifi_options ENUM('No Access', 'Basic Messaging', 'Surf & Stream',
                      'Surf & Stream Per-Hour', 'Surf & Stream Full-Flight'),
    meal_options ENUM('Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Other'),
    title_of_type VARCHAR(60) NOT NULL,
    description_of_type VARCHAR(120)
);

-- QUERIES-- 
-- Shows all flights that still have available seats --
SELECT flight_id, route_id, date_of_departure, seats_available
FROM Flights
WHERE seats_available > 0;

-- Retrieves all passengers booked on a given flight 
SELECT p.passenger_id, p.first_name, p.last_name, b.flight_id
FROM Passenger p
JOIN Booking_Passengers bp ON p.passenger_id = bp.passenger_id
JOIN Bookings b ON bp.booking_id = b.booking_id
WHERE b.flight_id = 101;

-- Calculates total revenue generated by each flight (only successful payments)
SELECT b.flight_id, SUM(p.amount) AS total_revenue
FROM Payment p
JOIN Bookings b ON p.booking_id = b.booking_id
WHERE p.payment_status = 'Successful'
GROUP BY b.flight_id;

-- Counts how many bookings exist for each flight
SELECT flight_id, COUNT(*) AS total_bookings
FROM Bookings
GROUP BY flight_id;


--TRIGGERS

DELIMITER //

CREATE TRIGGER update_seats_after_booking
AFTER INSERT ON Booking_Passengers
FOR EACH ROW
BEGIN
    UPDATE Flights
    SET seats_available = seats_available - 1
    WHERE flight_id = (
        SELECT flight_id
        FROM bookings
        WHERE booking_id = NEW.booking_id
    );
END//

CREATE TRIGGER update_seats_after_cancellation
AFTER DELETE ON Booking_Passengers
FOR EACH ROW
BEGIN
    UPDATE Flights
    SET seats_available = seats_available + 1
    WHERE flight_id = (
	SELECT flight_id
	FROM bookings
	WHERE booking_id = OLD.booking_id
    );
END//

DELIMITER ;

