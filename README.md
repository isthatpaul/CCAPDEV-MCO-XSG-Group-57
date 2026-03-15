# TaftBites

A full-stack restaurant review web application for students and food lovers near **De La Salle University — Manila**. Discover, review, and share your favorite dining spots along Taft Avenue.

## Features

- **Browse Establishments** — View restaurants, food courts, and cafes near DLSU
- **Search** — Find establishments by name, location, or description
- **User Reviews** — Write, edit, and delete reviews with star ratings
- **User Profiles** — View profiles with review history and bio
- **Authentication** — Register, login, and logout with session management
- **Admin Dashboard** — Establishment owners can edit their own listings
- **Responsive Design** — Sidebar navigation with hamburger menu toggle

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Handlebars (`.hbs`), CSS, JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Template Engine** | Express Handlebars |

## Project Structure

```
CCAPDEV-MCO-XSG-Group-57/
├── controller/
│   ├── establishmentController.js
│   ├── reviewController.js
│   └── userController.js
├── model/
│   ├── Establishment.js
│   ├── Review.js
│   └── User.js
├── routes/
│   ├── establishments.js
│   ├── reviews.js
│   └── users.js
├── views/
│   ├── layouts/
│   │   └── main.hbs
│   ├── partials/
│   │   ├── sidebar.hbs
│   │   └── footer.hbs
│   ├── establishments/
│   │   ├── index.hbs
│   │   └── show.hbs
│   ├── users/
│   │   └── show.hbs
│   ├── index.hbs
│   ├── login.hbs
│   └── register.hbs
├── public/
│   ├── css/
│   │   ├── base.css
│   │   ├── establishments.css
│   │   ├── establishment-detail.css
│   │   └── Profile.css
│   ├── js/
│   │   └── sidebar.js
│   ├── icons/
│   │   ├── house.png
│   │   ├── utensils.png
│   │   ├── user.png
│   │   ├── sign up.png
│   │   └── login.png
│   └── images/
│       ├── taft.jpg
│       ├── sample_estab1.jpg – sample_estab9.jpg
│       └── sample_profile.jpg – sample_profile5.webp
├── seed.js
├── server.js
├── package.json
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- [MongoDB Compass](https://www.mongodb.com/products/compass) (optional, for GUI)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/CCAPDEV-MCO-XSG-Group-57.git
   cd CCAPDEV-MCO-XSG-Group-57
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Cloudinary credentials:

   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   Get these from your [Cloudinary Dashboard](https://cloudinary.com/console/settings/api-keys).

4. **Make sure MongoDB is running**

   Open MongoDB Compass or run:

   ```bash
   mongod
   ```

5. **Seed the database**

   ```bash
   node seed.js
   ```

   This creates:
   - 5 regular users
   - 9 admin users (one per establishment)
   - 9 establishments
   - 15 reviews

6. **Start the server**

   ```bash
   node server.js
   ```

7. **Open in browser**

   ```
   http://localhost:3000
   ```

## 👤 Test Accounts

### Regular Users

| Name | Email | Password |
|------|-------|----------|
| Luis Harold | luis_harold@gmail.com | 1234 |
| Maria Santos | maria_santos@gmail.com | 1234 |
| Karlie Chirk | karlie_chirk@gmail.com | 1234 |
| Bob Builder | bob_builder@gmail.com | 1234 |
| John Doe | john_doe@gmail.com | 1234 |

### Admin Users (Establishment Owners)

| Name | Email | Password | Manages |
|------|-------|----------|---------|
| Ana Bloemen | ana@bloemen.com | admin123 | Bloemen Food Court |
| Carlos Agno | carlos@agno.com | admin123 | Agno Food Court |
| Diana TaftCafe | diana@taftcafe.com | admin123 | TaftCafe |
| Edward Archer | edward@archer.com | admin123 | The Archer's Kitchen |
| Fiona Breton | fiona@breton.com | admin123 | Cafe Breton |
| George IDK | george@idk.com | admin123 | IDK's Diner |
| Hannah Jollibee | hannah@jollibee.com | admin123 | Jollibee |
| Ivan Sunny | ivan@sunny.com | admin123 | Sunny Side Cafe |
| Julia Brew | julia@brew.com | admin123 | Brew & Chill |

## Testing the App

| Feature | How to Test |
|---------|-------------|
| **Home page** | Visit `http://localhost:3000` |
| **Search** | Type in the search bar on home or establishments page |
| **Login** | Click Login → use any test account above |
| **Profile** | After login → click Profile in sidebar |
| **View establishments** | Click Establishments in sidebar |
| **View detail** | Click any establishment name |
| **Write review** | Login → go to an establishment → click "Write a Review" |
| **Delete review** | On a review you wrote → click "Delete" |
| **Admin edit** | Login as admin → go to your establishment → click "Edit" |
| **Register** | Logout → click Sign Up → create new account |
| **Logout** | Click Logout in sidebar |

## Architecture

This app follows the **MVC (Model-View-Controller)** pattern:

```
Browser Request
      ↓
   server.js (Express)
      ↓
   routes/ (URL mapping)
      ↓
   controller/ (Business logic)
      ↓
   model/ (Database schema)
      ↓
   views/ (Handlebars templates)
      ↓
Browser Response (HTML)
```

### How It Works

1. **User visits** `/establishments` → Express matches the route
2. **Route** calls `establishmentController.getAll()`
3. **Controller** queries MongoDB using the `Establishment` model
4. **Controller** passes data to the `establishments/index.hbs` view
5. **Handlebars** renders HTML with the data inside `layouts/main.hbs`
6. **Browser** receives complete HTML with CSS and images

## Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `express-handlebars` | Template engine with layouts and partials |
| `mongoose` | MongoDB ODM |
| `express-session` | Session management for authentication |

## Group 57

- Paul Martin Ryan A. Crisologo
- Angelo Joaquin E. Barras
- Anton Luis B. Galido
- Jonathan R. Bueno

## Course

**CCAPDEV** — Web Application Development  
De La Salle University — Manila  
AY 2025–2026

## License

This project is for academic purposes only.