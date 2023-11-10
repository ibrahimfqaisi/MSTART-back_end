'use strict';
const express = require('express');
const { hashPassword } = require('./utils');
const bcrypt = require('bcrypt');
const { Client } = require('pg');
const app = express();
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 3003;
const client = new Client(process.env.DATABASE);
client.connect();
app.use(express.json());
app.use(cors());


// Function handlers

async function addNewUser(req, res) {
    try {
      // Extract user data from request body
      const { name, email, phone, gender, dateOfBirth, password, is_Admin ,photo_url } = req.body;
  
      // Hash the password before storing it in the database
      const hashedPassword = await hashPassword(password);
  
      // Insert the new user into the database
    //   console.log('Query:', 'INSERT INTO Users (Name, Email, Phone, Gender, Date_Of_Birth, Password, Is_Admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [name, email, phone, gender, dateOfBirth, hashedPassword, is_Admin || false]);
    const result = await client.query(
        'INSERT INTO Users (Name, Email, Phone, Gender, Date_Of_Birth, Password, Is_Admin, Photo_Url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [name, email, phone, gender, dateOfBirth, hashedPassword, is_Admin || false, photo_url || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"]
      );
      // Send the newly created user as a response
      res.status(201).json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation (duplicate email)
        res.status(400).json({ error: 'Email address already exists' });
      } else {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    }
  }
  

async function addNewDeal(req, res) {
    try {
      // Extract deal data from request body
      const { name, description,  amount, currency, user_id } = req.body;
  
      // Insert the new deal into the database
      const result = await client.query(
        'INSERT INTO Deals (Name, Description,  Amount, Currency, User_ID) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description,  amount, currency, user_id]
      );
  
      // Send the newly created deal as a response
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
async function loginHandler(req, res) {
    try {
      const { email, password } = req.body;
  
      // Retrieve user information from the database
      const result = await client.query('SELECT * FROM Users WHERE Email = $1', [email]);
      const user = result.rows[0];
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Update last_login_datetime_utc with the current timestamp
      await client.query(
        'UPDATE Users SET last_login_datetime_utc = CURRENT_TIMESTAMP WHERE ID = $1',
        [user.id]
      );
  
      res.json({ message: 'Login successful', user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

async function ChangeDealStatusHandler(req, res) {
    try {
      const { dealId, newStatus, userId } = req.body;
  
      // Check if the user owns the deal
      const ownershipCheck = await client.query(
        'SELECT * FROM Deals WHERE ID = $1 AND User_ID = $2',
        [dealId, userId]
      );
  
      if (ownershipCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized - You do not own this deal' });
      }
  
      // Update the status and update_datetime_utc of the specified deal in the database
      const result = await client.query(
        'UPDATE Deals SET Status = $1, Update_DateTime_UTC = CURRENT_TIMESTAMP WHERE ID = $2 RETURNING *',
        [newStatus, dealId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }
  
      // Send the updated deal as a response
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  async function getDealsHandler(req, res) {
    try {
        const { userId } = req.query;

        // Get all active deals except those created by the specified user
        const result = await client.query(
            'SELECT d.* FROM Deals d LEFT JOIN Users u ON d.User_ID = u.ID WHERE (u.ID <> $1 OR u.ID IS NULL) AND d.Status = $2',
            [userId, 'Active']
        );

        // Send the list of deals as a response
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function claimDealsHandler(req, res) {
    try {
      // Extract information from the request body
      const { dealId, userId } = req.body;
  
      // Check if the deal exists
      const dealResult = await client.query('SELECT * FROM Deals WHERE ID = $1', [dealId]);
  
      if (dealResult.rows.length === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }
  
      // Extract amount and currency from the deal
      const { amount, currency } = dealResult.rows[0];
  
      // Insert a new record into ClaimedDeals
      const claimedDealResult = await client.query(
        'INSERT INTO ClaimedDeals (User_ID, Deal_ID, Amount, Currency) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, dealId, amount, currency]
      );
  
      // Send the claimed deal as a response
      res.status(201).json(claimedDealResult.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }

async function usersHandler(req, res) {
    try {
      const { userId } = req.query;
  
      // Check if the user making the request is an admin
      const isAdminQuery = await client.query('SELECT Is_Admin FROM Users WHERE ID = $1', [userId]);
      const isAdmin = isAdminQuery.rows[0].is_admin;
  
      // If the user is not an admin, return a 403 Forbidden response
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: 'Access forbidden. Only admin users can retrieve all users.' });
      }
  
      const pageSize = 10; // Number of records per page
      const page = req.query.page || 1; // Get the page number from the request
  
      // Calculate the offset based on the page number
      const offset = (page - 1) * pageSize;
  
      // Query to get users for the specified page
      const result = await client.query(
        'SELECT * FROM Users WHERE ID <> $1 ORDER BY ID LIMIT $2 OFFSET $3',
        [userId, pageSize, offset]
      );
  
      // Query to get the total number of users
      const totalCountQuery = await client.query('SELECT COUNT(*) FROM Users WHERE ID <> $1', [
        userId,
      ]);
      const totalCount = parseInt(totalCountQuery.rows[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);
  
      // Send the list of users along with total pages information as a response
      res.json({ users: result.rows, totalPages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  async function dealsHandler(req, res) {
    try {
      const { userId } = req.query;
  
      // Check if the user making the request is an admin
      const isAdminQuery = await client.query('SELECT Is_Admin FROM Users WHERE ID = $1', [userId]);
      const isAdmin = isAdminQuery.rows[0].is_admin;
  
      // If the user is not an admin, return a 403 Forbidden response
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: 'Access forbidden. Only admin users can retrieve all deals.' });
      }
  
      const pageSize = 10; // Number of records per page
      const page = req.query.page || 1; // Get the page number from the request
  
      // Calculate the offset based on the page number
      const offset = (page - 1) * pageSize;
  
      // Query to get deals for the specified page
      const result = await client.query(
        'SELECT * FROM Deals ORDER BY ID LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );
  
      // Query to get the total number of deals
      const totalCountQuery = await client.query('SELECT COUNT(*) FROM Deals');
      const totalCount = parseInt(totalCountQuery.rows[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);
  
      // Send the list of deals along with total pages information as a response
      res.json({ deals: result.rows, totalPages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  async function claimedDealsHandler(req, res) {
    try {
      const { userId, searchUserId } = req.query;
  
      // Check if the user making the request is an admin
      const isAdminQuery = await client.query('SELECT Is_Admin FROM Users WHERE ID = $1', [userId]);
      const isAdmin = isAdminQuery.rows[0].is_admin;
  
      // If the user is not an admin, return a 403 Forbidden response
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: 'Access forbidden. Only admin users can retrieve all claimed deals.' });
      }
  
      const pageSize = 10; // Number of records per page
      const page = req.query.page || 1; // Get the page number from the request
  
      // Calculate the offset based on the page number
      const offset = (page - 1) * pageSize;
  
      // Query to get claimed deals for the specified page and search user ID
      let query = 'SELECT * FROM ClaimedDeals';
      const params = [];
  
      if (searchUserId) {
        query += ' WHERE User_ID = $1';
        params.push(searchUserId);
      }
  
      query += ` ORDER BY ID LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  
      const result = await client.query(query, [...params, pageSize, offset]);
  
      // Query to get the total number of claimed deals
      const totalCountQuery = await client.query('SELECT COUNT(*) FROM ClaimedDeals');
      const totalCount = parseInt(totalCountQuery.rows[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);
  
      // Send the list of claimed deals along with total pages information as a response
      res.json({ claimedDeals: result.rows, totalPages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
// Function handler for deleting users by ID
async function deleteUsersHandler(req, res) {
    try {
      const { userId } = req.query;
  
      // Check if the user making the request is an admin
      const isAdminQuery = await client.query('SELECT Is_Admin FROM Users WHERE ID = $1', [userId]);
      const isAdmin = isAdminQuery.rows[0].is_admin;
  
      // If the user is not an admin, return a 403 Forbidden response
      if (!isAdmin) {
        return res.status(403).json({ error: 'Access forbidden. Only admin users can delete users.' });
      }
  
      // Extract user IDs from the request body
      const { userIds } = req.body;
  
      // Delete users with the specified IDs
      const result = await client.query('DELETE FROM Users WHERE ID = ANY($1) RETURNING *', [userIds]);
  
      // Send the list of deleted users as a response
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
// Function handler for getting user profile with claimed deals information
async function getUserProfileHandler(req, res) {
    try {
      const { userId } = req.query;
  
      // Get user information
      const userResult = await client.query('SELECT * FROM Users WHERE ID = $1', [userId]);
    //   console.log(userResult)
      const user = userResult.rows[0];
  
      // Get count and total amounts of claimed deals for the user
      const claimedDealsResult = await client.query(
        'SELECT COUNT(*) AS dealCount, SUM(Amount) AS totalAmount FROM ClaimedDeals WHERE User_ID = $1',
        [userId]
      );
    //   console.log(claimedDealsResult);
      const { dealcount, totalamount } = claimedDealsResult.rows[0];
     console.log(totalamount);   
      // Include claimed deals information in the user profile response
      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        Phone: user.phone,
        Gender: user.gender,
        Date_Of_Birth : user.date_of_birth,
        photo_url : user.photo_url,
        claimedDeals: {
          dealcount,
          totalamount,
        },
      };
  
      // Send the user profile as a response
      res.json(userProfile);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
// Function handler for updating user photo URL
async function updatePhotoUrlHandler(req, res) {
    try {
      const { userId, photo_url } = req.body;
  
      // Check if the user making the request is the owner of the profile
      const isOwnerQuery = await client.query('SELECT * FROM Users WHERE ID = $1', [userId]);
  
      if (isOwnerQuery.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the photo URL in the database
      const result = await client.query(
        'UPDATE Users SET Photo_Url = $1 WHERE ID = $2 RETURNING *',
        [photo_url, userId]
      );
  
      // Send the updated user profile as a response
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
  
            
      
// Routes
app.post('/add-user', addNewUser);
app.post('/add-deal', addNewDeal);
app.post('/login', loginHandler)
app.post('/dealStatus', ChangeDealStatusHandler);
app.get('/deals', getDealsHandler);
app.post('/dealStatus', ChangeDealStatusHandler);
app.post('/claimDeal', claimDealsHandler);
app.get('/users', usersHandler);
app.get('/deals-admin', dealsHandler);
app.get('/claimedDeals', claimedDealsHandler);
app.delete('/users', deleteUsersHandler);
app.get('/userProfile', getUserProfileHandler);
app.post('/update-photo-url', updatePhotoUrlHandler);


  
// Close the database connection when the application shuts down
process.on('SIGINT', async () => {
  await client.end();
  process.exit();
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
