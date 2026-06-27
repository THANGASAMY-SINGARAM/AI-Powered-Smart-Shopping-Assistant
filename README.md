# AI-Powered E-Commerce Platform

A full-stack MERN e-commerce platform with JWT authentication, product listings, search and filters, shopping cart, checkout, admin inventory management, and AI-powered product recommendations.

The project started as an AI smart shopping assistant and now includes a complete commerce flow while preserving the original AI shopping-list API as a legacy assistant feature.

## Features

- User registration and login with JWT authentication
- Role-based access with customer and admin users
- Product catalog with search, category filters, price filters, stock filter, and sorting
- Shopping cart with authenticated add, update, remove, and clear actions
- Checkout flow with mock Stripe-style payment references
- Order history for customers
- Admin dashboard for adding products, seeding sample inventory, updating stock, and viewing recent orders
- AI-powered product recommendations based on cart categories and featured product trends
- Responsive React UI built with Bootstrap and Reactstrap
- Legacy AI shopping-list assistant endpoints for item categorization and next-item suggestions

## Tech Stack

**Frontend**

- React
- Redux
- Reactstrap
- Bootstrap
- Axios

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing

**AI / Recommendations**

- Product recommendation API using cart context and featured product trends
- Legacy Python NLP script for shopping-list item categorization
- JavaScript fallback logic for environments where Python is unavailable

## Project Structure

```text
AI-Powered-Smart-Shopping-Assistant/
├── ai/
│   └── shopping_ai.py
├── client/
│   ├── public/
│   └── src/
│       ├── actions/
│       ├── components/
│       │   ├── auth/
│       │   └── ECommercePlatform.js
│       ├── reducers/
│       ├── App.js
│       └── store.js
├── config/
│   └── default.json
├── middleware/
│   ├── admin.js
│   └── auth.js
├── models/
│   ├── Cart.js
│   ├── Item.js
│   ├── Order.js
│   ├── Product.js
│   └── user.js
├── routes/
│   └── api/
│       ├── auth.js
│       ├── cart.js
│       ├── items.js
│       ├── orders.js
│       ├── products.js
│       └── users.js
├── server.js
├── package.json
└── README.md
```

## How It Works

1. A user registers or logs in.
2. The first registered user is automatically assigned the `admin` role for local setup.
3. Admins can seed a sample catalog or add inventory from the admin dashboard.
4. Customers browse products, search, filter, sort, and add items to the cart.
5. The recommendation strip suggests products using cart categories or featured trends.
6. Checkout creates an order, generates a mock payment reference, reduces stock, and clears the cart.
7. Customers can view order history, while admins can monitor recent orders and update inventory.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/THANGASAMY-SINGARAM/AI-Powered-Smart-Shopping-Assistant.git
cd AI-Powered-Smart-Shopping-Assistant
```

### 2. Install Backend Dependencies

```bash
npm install
```

### 3. Install Frontend Dependencies

```bash
npm run client-install
```

### 4. Configure MongoDB

Update `config/default.json` if needed:

```json
{
  "mongoURI": "mongodb://127.0.0.1:27017/mern_shopping",
  "jwtSecret": "your_jwt_secret"
}
```

Make sure MongoDB is running locally, or replace `mongoURI` with a MongoDB Atlas connection string.

### 5. Run the App

```bash
npm run dev
```

The React app runs on:

```text
http://localhost:3000
```

The Express API runs on:

```text
http://localhost:5000
```

## Admin Setup

The first user registered in a fresh database becomes an admin automatically. After logging in as that user:

1. Open the `Admin` tab.
2. Click `Seed catalog` to add sample products.
3. Add new products or update stock from the inventory panel.

Later users are registered as customers by default.

## Checkout and Payments

Checkout currently uses a mock payment provider that behaves like a Stripe integration placeholder:

- It validates cart stock.
- It creates an order.
- It stores a mock payment reference.
- It decrements product inventory.
- It clears the user's cart.

To connect real Stripe payments later, replace the mock payment section in `routes/api/orders.js` with Stripe PaymentIntent creation and webhook confirmation.

## Available Scripts

```bash
npm run dev
```

Runs backend and frontend together.

```bash
npm run server
```

Runs only the Express backend with Nodemon.

```bash
npm run client
```

Runs only the React frontend.

```bash
npm start
```

Runs the Express backend in normal Node mode.

```bash
npm run build --prefix client
```

Builds the React frontend for production.

## API Overview

### Products

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/products` | List products with search, filters, and sorting | Public |
| GET | `/api/products/meta/categories` | List product categories | Public |
| GET | `/api/products/recommendations` | Get AI-style product recommendations | Public |
| POST | `/api/products/seed` | Seed sample products | Admin |
| POST | `/api/products` | Create a product | Admin |
| PUT | `/api/products/:id` | Update a product | Admin |
| DELETE | `/api/products/:id` | Delete a product | Admin |

### Cart

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/cart` | Get the authenticated user's cart | Private |
| POST | `/api/cart/items` | Add a product to cart | Private |
| PUT | `/api/cart/items/:productId` | Update cart quantity | Private |
| DELETE | `/api/cart/items/:productId` | Remove a product from cart | Private |
| DELETE | `/api/cart` | Clear cart | Private |

### Orders

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/orders` | Get authenticated user's orders | Private |
| GET | `/api/orders/admin` | Get all recent orders | Admin |
| POST | `/api/orders/checkout` | Checkout cart and create order | Private |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users` | Register a new user |
| POST | `/api/auth` | Login user |
| GET | `/api/auth/user` | Get authenticated user |

### Legacy AI Shopping List

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/items` | Get all shopping-list items | Public |
| POST | `/api/items` | Add a shopping-list item with AI category metadata | Private |
| DELETE | `/api/items/:id` | Delete a shopping-list item | Private |
| POST | `/api/items/ai/analyze` | Analyze and categorize item text | Public |
| GET | `/api/items/ai/suggestions` | Generate shopping-list recommendations | Public |

## Future Improvements

- Replace mock checkout with a full Stripe PaymentIntent and webhook flow
- Add product reviews and ratings from real customer activity
- Add admin order status controls in the frontend
- Add user profile and saved addresses
- Add recommendation tracking from purchases and browsing events
- Add automated tests for cart, checkout, and admin routes
- Deploy backend and frontend to cloud platforms

## License

This project is licensed under the MIT License.
