
CREATE DATABASE airline_ticketing;
USE airline_ticketing;


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

