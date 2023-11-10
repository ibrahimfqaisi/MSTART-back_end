-- Drop tables if they exist
DROP TABLE IF EXISTS ClaimedDeals;
DROP TABLE IF EXISTS Deals;
DROP TABLE IF EXISTS Users;

-- Users Table with Is_Admin column
CREATE TABLE Users (
    ID SERIAL PRIMARY KEY,
    Server_DateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateTime_UTC TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Update_DateTime_UTC TIMESTAMP,
    Last_Login_DateTime_UTC TIMESTAMP,
    Name VARCHAR(255),
    Email VARCHAR(255) UNIQUE,
    Password VARCHAR(255),
    Phone VARCHAR(15),
    Status VARCHAR(50) DEFAULT 'Active',
    Gender VARCHAR(10),
    Date_Of_Birth DATE,
    Is_Admin BOOLEAN DEFAULT FALSE
    Photo_Url VARCHAR(255) DEFAULT 'https://cdn-icons-png.flaticon.com/512/3177/3177440.png';
);


-- Modify the Deals Table to include User_ID as a foreign key
CREATE TABLE Deals (
    ID SERIAL PRIMARY KEY,
    Server_DateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateTime_UTC TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Update_DateTime_UTC TIMESTAMP,
    Name VARCHAR(255),
    Description TEXT,
    Status VARCHAR(50) DEFAULT 'Active',
    Amount DECIMAL(10, 2),
    Currency VARCHAR(3),
    User_ID INT,  -- Foreign key referencing Users table
    FOREIGN KEY (User_ID) REFERENCES Users(ID)
);

-- Claimed Deals Table
CREATE TABLE ClaimedDeals (
    ID SERIAL PRIMARY KEY,
    User_ID INT,
    Deal_ID INT,
    Server_DateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateTime_UTC TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(10, 2),
    Currency VARCHAR(3),
    FOREIGN KEY (User_ID) REFERENCES Users(ID),
    FOREIGN KEY (Deal_ID) REFERENCES Deals(ID)
);
