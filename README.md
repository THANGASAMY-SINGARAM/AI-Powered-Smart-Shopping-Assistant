# AI-Powered Smart Shopping Assistant

A full-stack MERN shopping assistant that makes shopping-list management smarter with AI-based item categorization, voice-based item entry, purchase history tracking, personalized recommendations, and intelligent next-item prediction.

This project upgrades a basic shopping list into an AI-enabled assistant by combining a React/Redux frontend, Express and MongoDB backend, browser speech recognition, and a lightweight Python NLP model.

## Features

- Voice-based item entry using the browser Speech Recognition API
- Automatic product categorization into groups such as Groceries, Electronics, Stationery, Household, and Personal Care
- AI confidence score for categorized items
- Personalized shopping recommendations based on previous shopping history
- Intelligent next-item prediction using frequently purchased and related products
- Purchase history tracking through stored shopping items
- User authentication with JWT
- Protected add/delete item actions for logged-in users
- Responsive React UI with category badges and recommendation chips
- Python AI model with JavaScript fallback for environments where Python is not installed

## Tech Stack

**Frontend**

- React
- Redux
- Reactstrap
- Bootstrap
- Axios
- Browser Speech Recognition API

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing

**AI / ML**

- Python NLP script for item categorization and shopping suggestions
- Rule-based recommendation logic using purchase history and product pairings
- JavaScript fallback model for category prediction and recommendations

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
│       ├── reducers/
│       ├── App.js
│       └── store.js
├── config/
│   └── default.json
├── middleware/
│   └── auth.js
├── models/
│   ├── Item.js
│   └── user.js
├── routes/
│   └── api/
│       ├── auth.js
│       ├── items.js
│       └── users.js
├── server.js
├── package.json
└── README.md
```

## How It Works

1. A user signs in and adds a shopping item manually or through voice input.
2. The backend analyzes the item name using the Python NLP model when Python is available.
3. If Python is not available, the Express backend uses a built-in JavaScript fallback model.
4. The item is saved in MongoDB with category, confidence score, date, and voice-entry status.
5. The assistant reviews recent shopping history and generates predicted next items.
6. The frontend displays recommendations as clickable chips so users can quickly add suggested items.

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

## API Overview

### Items

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/api/items` | Get all shopping items | Public |
| POST | `/api/items` | Add a new shopping item with AI category metadata | Private |
| DELETE | `/api/items/:id` | Delete a shopping item | Private |
| POST | `/api/items/ai/analyze` | Analyze and categorize item text | Public |
| GET | `/api/items/ai/suggestions` | Generate shopping recommendations | Public |

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users` | Register a new user |
| POST | `/api/auth` | Login user |
| GET | `/api/auth/user` | Get authenticated user |

## AI Features

### Automatic Categorization

The assistant analyzes item text and predicts a category such as:

- Groceries
- Electronics
- Stationery
- Household
- Personal Care
- Other

Each saved item includes an AI confidence score.

### Personalized Recommendations

The recommendation engine uses previous shopping items and known product pairings. For example:

- Milk may suggest Bread, Eggs, or Cereal
- Laptop may suggest Mouse, Keyboard, or USB Cable
- Notebook may suggest Pen, Pencil, or Eraser

### Python Model Support

The file `ai/shopping_ai.py` contains the Python NLP logic. The backend automatically attempts to run it using:

- `python`
- `python3`
- `py -3`

If Python is unavailable, the app still works using the JavaScript fallback model.

## Voice Input Notes

Voice entry depends on browser support for the Speech Recognition API. It works best in Chromium-based browsers such as Google Chrome or Microsoft Edge.

## Future Improvements

- Train a machine learning model on a larger shopping dataset
- Add computer vision support for receipt scanning
- Add barcode scanning for product entry
- Add price tracking and budget prediction
- Build user-specific recommendation profiles
- Add item quantity, priority, and completed status
- Deploy backend and frontend to cloud platforms

## License

This project is licensed under the MIT License.
