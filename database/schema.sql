-- Macy's code!!
CREATE DATABASE airline_ticketing;
USE airline_ticketing;

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

-- Airport Object
CREATE TABLE Airport (
    airport_id   INTEGER PRIMARY KEY NOT NULL,
    airport_code   VARCHAR(10),
    airport_name   VARCHAR(60),
    country_id   INTEGER NOT NULL,
    city_id   INTEGER NOT NULL,
    timezone   VARCHAR(30),
    number_of_terminals   INTEGER,
    FOREIGN KEY (country_id) REFERENCES Country(country_id),
    FOREIGN KEY (city_id)    REFERENCES City(city_id)
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

-- Country Object
CREATE TABLE Country (
    country_id   INTEGER PRIMARY KEY,
    country_name   VARCHAR(60) NOT NULL
);




-- Eman's Code!
CREATE TABLE Flights (
    flight_id INT PRIMARY KEY,
    aircraft_id INT,
    route_id INT,
    airline_id INT,
    date_of_departure DATETIME NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats > 0),
    seats_available INT NOT NULL CHECK (seats_available >= 0),
    staff_size INT NOT NULL CHECK (staff_size >= 4),
    baggage_capacity INT CHECK (baggage_capacity >= 0),
    baggage_availability INT CHECK (baggage_availability >= 0),

    CHECK (seats_available <= total_seats)
);


CREATE TABLE Bookings (
    booking_id INT PRIMARY KEY,
    ticket_number VARCHAR(30) UNIQUE,
    flight_id INT NOT NULL,
    issue_date DATE,
    ticket_status ENUM('Issued','Refunded','Cancelled') NOT NULL,
    baggage INT CHECK (baggage >= 0),
    num_of_seats_booked INT NOT NULL CHECK (num_of_seats_booked BETWEEN 1 AND 9),
    payment_id INT,

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
    payment_status ENUM('Successful','Unsuccessful','Pending'),
    class_fare DECIMAL(5,2) CHECK (class_fare >= 0),
    base_fare DECIMAL(7,2) CHECK (base_fare >= 0),
    taxes DECIMAL(5,2) CHECK (taxes >= 0),

    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);


CREATE TABLE Booking_Passengers (
    passenger_id INT NOT NULL,
    booking_id INT NOT NULL,

    PRIMARY KEY (passenger_id, booking_id),

    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);





-- Jashan’s code
-- Aircraft:
CREATE TABLE Aircraft (
    aircraft_id INT PRIMARY KEY,
    model VARCHAR(30) NOT NULL,
    manufacturer VARCHAR(30) NOT NULL,
    seating_capacity INT NOT NULL CHECK (seating_capacity > 0),
    max_baggage_capacity INT CHECK (max_baggage_capacity >= 0)
);

-- Refund table:
CREATE TABLE Refund (
    refund_id INT PRIMARY KEY,
    response_of_refund VARCHAR(120),
    refund_status ENUM('Pending','Approved','Rejected','Processed') NOT NULL,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    card_number VARCHAR(30),
    card_expiration_date DATE,
    card_security_code VARCHAR(10),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

-- Insurance policy:
CREATE TABLE Insurance_Policy (
    insurance_id INT PRIMARY KEY,
    booking_id INT NOT NULL,
    provider_name ENUM('Allianz','Global Travel','Safe Trip','Other') NOT NULL,
    coverage_amount DECIMAL(7,2) NOT NULL CHECK (coverage_amount >= 0),
    insurance_fee DECIMAL(5,2) NOT NULL CHECK (insurance_fee >= 0),
    coverage_type ENUM('Trip Cancellation','Medical','Baggage','Full Coverage') NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);



