Inventory Management System

A modern, responsive inventory management system built with React, Node.js, and MongoDB.Features role-based access control, real-time reporting, 
and comprehensive inventory tracking.

### Frontend
- **React 19** - Latest React with hooks and functional components
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express.js 5** - Latest Express web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing and encryption
- **CORS** - Cross-Origin Resource Sharing middleware
- **dotenv** - Environment variables management
- **express-async-handler** - Simplified async error handling

### Development Tools
- **Nodemon** - Automatic server restart during development
- **ESLint** - Code linting and quality
- **Vite** - Build tool and development server
- **React Scripts** - Create React App scripts


🗂️ Project Structure


Inventory-Management-System/

├── backend/

│  ├── controllers/ # Route controllers

│  ├── models/ # MongoDB models and schemas

│ ├── routes/ # API route definitions

│ ├── middleware/ # Authentication & validation middleware

│ ├── config/ # Database and app configuration

│ ├── scripts/ # Setup and utility scripts

│ ├── tests/ # Backend test files

│ └── server.js # Main server entry point
├── frontend/

│ ├── src/

│ │ ├── assets/ 

│ │ ├── components/ # Reusable UI components

│ │ ├── context/ # React contexts (Auth, )

│ │ ├── hooks/ # Custom React hooks

│ │ ├── mocks/ # Mock data for testing/development

│ │ ├── pages/ # Page-level components

│ │ ├── services/ # API service functions

│ │ ├── utils/ # Utility functions and helpers

│ │ ├── App.jsx # Main App component

│ │ ├── App.css # App-specific styles

│ │ ├── index.css # Global styles and Tailwind imports

│ │ ├── main.jsx # Application entry point

│ │ ├── setupTests.js # Test configuration

│ │ └── test-utils.js # Testing utilities

│ ├── public/ # Static public files

│ │ └── index.html # HTML template

│ ├── package.json # Frontend dependencies and scripts

│ ├── eslint.config.js # ESLint configuration

│ └── .env # Frontend environment variables

├── node_modules/ # Project dependencies (ignored in git)

└── README.md # Project documentation



A, Quick Start

1, Prerequisites

      Node.js 16+

      MongoDB 4.4+

      npm 


2, Installation

    git clone https://github.com/ABEL-1010/Inventory-Management-System.git

    cd Inventory-Management-System

3, Backend Setup

       cd backend

      # Installation dependencies
       npm install

      # Start development server
      npm run dev

4, Frontend Setup 

     cd frontend

     # Install dependencies
     npm install

     # Start development server
    npm run dev

5, Access the Application

    Frontend: http://localhost:5173

    Backend API: http://localhost:5000

    Default admin login: admin@inventory.com / admin123

B, API documentation

1, Authentication Endpoints

  Login     
          
            POST /api/auth/login
            Content-Type: application/json
             {
            "email": "user@example.com",
            "password": "password123"
            }
  Response: 
  
            {
            "token": "jwt_token_here",
            "user": {
            "id": "507f1f77bcf86cd799439011",
            "name": "John Doe",
            "email": "user@example.com",
           "role": "admin"
            }
            }

  Get/Update profile: 

             GET /api/auth/profile
             PUT /api/auth/profile
             Authorization: Bearer <token>


2, Items Management 

Get All Items : 

              GET /api/items
              Authorization: Bearer <token>
              
Create Item( Admin Only):  

          POST /api/items
          Authorization: Bearer <token>
          Content-Type: application/json

            {
           "name": "Product Name",
           "description": "Product description",
           "price": 29.99,
           "quantity": 100,
            "category": "category_id"
            }
Update Item( Admin Only): 

             PUT /api/items/:id
             Authorization: Bearer <token>
             Content-Type: application/json

             {
             "quantity": 50,
             "price": 24.99
             }

Get Items by Category:

             GET /api/items/category/:categoryId
             Authorization: Bearer <token>  
             
3, Sales Endpoints: 

Create Sale: 

             POST /api/sales
             Authorization: Bearer <token>
             Content-Type: application/json

            {
            "items": [
                {
                 "itemId": "item_id",
                 "quantity": 2,
                 "price": 29.99
                 }
              ],
             "total_amount": 59.98
            }

Get sale : 

          GET /api/sales
          Authorization: Bearer <token>
            
Get Sales by Date Range: 

                GET /api/sales/date-range
                Authorization: Bearer <token>

4, Reports Endpoints   

 Dashboard Statistics
                
               GET /api/-stats
               Authorization: Bearer <token>

 Sales Reports: 

             GET /api/reports/sales-by-item
             GET /api/reports/dashboard-stats
             GET /api/reports/sales-by-date
             GET /api/reports/sales-by-category
            Authorization: Bearer <token> 

5, Categories Management

 Get Categories: 

                GET /api/categories

 Create Category: 

                POST /api/categories
                Authorization: Bearer <token>
                
Update Category: 

                PUT /api/categories/:id
                Authorization: Bearer <token>

Delete Category: 

                DELETE /api/categories/:id
                Authorization: Bearer <token>
                
6, user management( Admin only )

Get All Users: 

                 GET /api/admin/users
                 
Create User 
       
                  POST /api/admin/users
                  Authorization: Bearer <token>
                  Content-Type: application/json
                 
                   {
                 "name": "New User",
                 "email": "newuser@example.com",
                 "password": "password123",
                 "role": "user"
                 }  

Update User:     

              PUT /api/admin/users/:id
              Authorization: Bearer <token>

Delete User: 

              
              DELETE /api/admin/users/:id
              Authorization: Bearer <token>

 C, User Roles & Permissions
 
    # Administrator
    
Full access to all features

Manage users and categories

View all reports and analytics

System configuration

     #Regular User
     
View and manage items

Process sales transactions

View personal sales reports

Limited dashboard access

View personal sales reports

D, Features Implemented

  # Core Features
  
User Authentication - JWT-based login/logout

Role-Based Access Control - Admin vs User permissions

Inventory Management - CRUD operations for items, Ctegories, sales and Users

Sales Processing - Complete sales workflow

Category Management - Organized item categorization

Responsive Design - Mobile-friendly interface

   # Advanced Features
   
Real-time Dashboard - Live statistics and metrics

Advanced Reporting - Sales analytics and trends

Search & Filtering - Advanced item search capabilities

Bulk Operations - Multi-item actions

Data Export - CSV export functionality

   #  Security Features
   
Password Hashing - bcrypt encryption

SQL Injection Protection - Parameterized queries

XSS Protection - Input sanitization

CORS Configuration - Cross-origin security

Rate Limiting - API abuse prevention

D, Configuration

   # Backend (.env)

     NODE_ENV=development

     PORT=5000

     MONGODB_URI=mongodb://localhost:27017/inventory_db

     JWT_SECRET=your_super_secret_jwt_key_change_in_production

     JWT_EXPIRE=30d

  # Frontend (.env)

     VITE_API_URL=http://localhost:5000/api

     REACT_APP_NAME=Inventory Management System


🗂️ API Route Structure

        Authentication: /api/auth/*

        Items: /api/items/*

        Sales: /api/sales/*

        Reports: /api/reports/*

        Categories: /api/categories/*

        Statistics: /api/stats/*

        Admin Users: /api/admin/users/*

🔧 API Usage Notes

All endpoints (except login) require Authorization: Bearer <token> header

Admin-only routes are protected with admin middleware

Category routes have mixed public (GET) and admin-only (POST, PUT, DELETE) access

Report routes require authentication but not necessarily admin rights
         

🐛 Common Issues


CORS Errors: Ensure frontend URL is whitelisted in backend CORS configuration

Authentication: Verify JWT token is included in Authorization header

Admin Access: Some routes require admin privileges - check user role

MongoDB Connection: Ensure MongoDB is running and connection string is correct



🧪 Testing

    npx vitest run src/pages/_tests_/UsersList.test.jsx         tests UsersList.jsx
    npx vitest run src/pages/_tests_/UserForm.test.jsx
    npx vitest run src/pages/_tests_/SalesList.test.jsx
    npx vitest run src/pages/_tests_/Dashboard.test.jsx
    npx vitest run src/pages/_tests_/ItemsList.test.jsx
