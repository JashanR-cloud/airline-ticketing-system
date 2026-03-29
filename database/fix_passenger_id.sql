USE airline_ticketing;

-- Step 1: Drop foreign keys that reference Passenger.passenger_id so we can modify it
-- (user_account, loyalty_program, Booking_Passengers all reference it)

SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE user_account DROP FOREIGN KEY user_account_ibfk_1;
ALTER TABLE loyalty_program DROP FOREIGN KEY loyalty_program_ibfk_1;
ALTER TABLE Booking_Passengers DROP FOREIGN KEY booking_passengers_ibfk_1;

-- Step 2: Change passenger_id to AUTO_INCREMENT
ALTER TABLE Passenger MODIFY passenger_id INTEGER NOT NULL AUTO_INCREMENT;

-- Step 3: Re-add the foreign keys
ALTER TABLE user_account ADD CONSTRAINT user_account_ibfk_1
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id);

ALTER TABLE loyalty_program ADD CONSTRAINT loyalty_program_ibfk_1
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id);

ALTER TABLE Booking_Passengers ADD CONSTRAINT booking_passengers_ibfk_1
    FOREIGN KEY (passenger_id) REFERENCES Passenger(passenger_id)
    ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- Step 4: Verify it worked
SHOW CREATE TABLE Passenger;
