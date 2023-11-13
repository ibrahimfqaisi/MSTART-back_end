# DealHub API

## Introduction
Welcome to DealHub API - your go-to solution for managing user accounts, deals, and their statuses. Whether you're creating, updating, or retrieving information about users and deals, DealHub has you covered. Dive into the details of the available endpoints and their functionalities below.

## Endpoints

### 1. Add User
- **Endpoint:** `POST /add-user`
- **Description:** Add a new user effortlessly.

### 2. Add Deal
- **Endpoint:** `POST /add-deal`
- **Description:** Add a new deal seamlessly.

### 3. User Login
- **Endpoint:** `POST /login`
- **Description:** Simplified user login endpoint.

### 4. Change Deal Status
- **Endpoint:** `POST /dealStatus`
- **Description:** Modify the status of a deal with ease.

### 5. Get Deals
- **Endpoint:** `GET /deals`
- **Description:** Retrieve a list of deals effortlessly.

### 6. Claim Deal
- **Endpoint:** `POST /claimDeal`
- **Description:** Claim a deal hassle-free.

### 7. Get Users
- **Endpoint:** `GET /users`
- **Description:** Retrieve a list of users effortlessly.

### 8. Get Deals for Admin
- **Endpoint:** `GET /deals-admin`
- **Handler:** `dealsHandler`
- **Description:** Fetch deals specifically for admin use.

### 9. Get Claimed Deals for Admin
- **Endpoint:** `GET /claimedDealsAdmin`
- **Description:** Retrieve claimed deals tailored for admin use.

### 10. Get Claimed Deals
- **Endpoint:** `GET /claimedDeals`
- **Description:** Retrieve claimed deals without a hitch.

### 11. Delete Users
- **Endpoint:** `DELETE /users`
- **Description:** Effortlessly delete users.

### 12. Get User Profile
- **Endpoint:** `GET /userProfile`
- **Description:** Retrieve user profiles with ease.

### 13. Update Photo URL
- **Endpoint:** `POST /update-photo-url`
- **Description:** Update user photo URLs seamlessly.

markdown
Copy code
## Installation

To get started with the DealHub API, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone git@github.com:ibrahimfqaisi/MSTART-back_end.git
2. **Install Dependencies:**
Use your preferred package manager to install the necessary dependencies. For example, with npm:

```
npm install
```
3. **Database Setup (Optional):**
If you prefer not to create your own database, you can use the provided deployed database. Set the following environment variable:

```
DATABASE=postgres://vvujhgiq:Y-FuOH_NLe7dgxcso2gLZg0wFSLSS44f@batyr.db.elephantsql.com/vvujhgiq
```
4. **Run the Application:**
Start the DealHub API by running the appropriate command. For example:

```
npm start
```
**Important Note:**

For security reasons, it is crucial to create an admin user with the appropriate privileges. The following endpoint allows you to **create an admin user** in the DealHub API.

14. **Create Admin User**
Endpoint: POST /add-admin-user

Description: Create a new admin user with the provided details.

Request URL example:

```
http://localhost:3000/add-admin-user
```
Request Method: POST

Request Body:

```
{
  "name": "ibrahim",
  "email": "ibrahim@example.com",
  "phone": "1234567890",
  "gender": "Male",
  "dateOfBirth": "1990-01-01",
  "password": "securepassword",
  "is_Admin": true
}
```
Response:

```
{
  "status": "success",
  "message": "Admin user created successfully",
  "user": {
    "id": "unique_user_id",
    "name": "ibrahim",
    "email": "ibrahim@example.com",
    "phone": "1234567890",
    "gender": "Male",
    "dateOfBirth": "1990-01-01",
    "is_Admin": true
  }
}
```
Note:

- Ensure the request body includes the necessary information for creating an admin user.
- The is_Admin field should be set to true to designate the user as an admin.
- The response will include the created user's details.
## Note
If you choose not to create your own database, you can use the provided deployed database mentioned below.
