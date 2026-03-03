-- Macy's code!!
CREATE DATABASE airline_ticketing;
USE airline_ticketing;

-- passenger object
CREATE TABLE Passenger (
    passenger_id     INTEGER PRIMARY KEY NOT NULL,
    first_name       VARCHAR(60) NOT NULL,
    last_name        VARCHAR(60),
    date_of_birth    DATE,
    email            VARCHAR(120),
    phone_number     VARCHAR(30),
    address          VARCHAR(120),
    id_number        VARCHAR(30) UNIQUE,
    passport_status  BOOLEAN,
    visa_status      BOOLEAN,
    country_of_origin INTEGER,
    seat_preferences ENUM('Window', 'Middle', 'Aisle'),
    meal_preferences VARCHAR(60),
    special_needs    VARCHAR(120),
    FOREIGN KEY (country_of_origin) REFERENCES Country(country_id)
);

-- Airport Object
CREATE TABLE Airport (
    airport_id           INTEGER PRIMARY KEY NOT NULL,
    airport_code         VARCHAR(10),
    airport_name         VARCHAR(60),
    country_id           INTEGER NOT NULL,
    city_id              INTEGER NOT NULL,
    timezone             VARCHAR(30),
    number_of_terminals  INTEGER,
   -- when other objects are added, put in these attributes
    FOREIGN KEY (country_id) REFERENCES Country(country_id)
    -- ,FOREIGN KEY (city_id)    REFERENCES City(city_id)
);

-- Employee Object
CREATE TABLE Employee (
    id_number           VARCHAR(30) PRIMARY KEY NOT NULL,
    first_name          VARCHAR(60) NOT NULL,
    last_name           VARCHAR(60),
    date_of_birth       DATE,
    email               VARCHAR(120) UNIQUE,
    phone_number        VARCHAR(30) UNIQUE,
    address             VARCHAR(120),
    card_number         VARCHAR(30),
    card_expiration_date VARCHAR(30),
    card_security_code  VARCHAR(30),
    passport_status     BOOLEAN,
    visa_status         BOOLEAN,
    country_of_origin   INTEGER,
    seat_preferences    VARCHAR(30),
    meal_preferences    VARCHAR(60),
    special_needs       VARCHAR(120),
    department          VARCHAR(60),
    airport_id          INTEGER,
    position            VARCHAR(60),
    hire_date           DATE,
    position_permission VARCHAR(60),
    access_level        VARCHAR(30),
    FOREIGN KEY (country_of_origin) REFERENCES Country(country_id),
    FOREIGN KEY (airport_id)        REFERENCES Airport(airport_id)
);

-- Country Object
CREATE TABLE Country (
    country_id   INTEGER PRIMARY KEY,
    country_name VARCHAR(60) NOT NULL
);

