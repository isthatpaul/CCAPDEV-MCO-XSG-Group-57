const mongoose = require('mongoose');
const User = require('./model/User');
const Establishment = require('./model/Establishment');
const Review = require('./model/Review');

mongoose.connect('mongodb://localhost:27017/taftbites')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

async function seed() {
    // Clear existing data
    await User.deleteMany({});
    await Establishment.deleteMany({});
    await Review.deleteMany({});

    // Create establishments
    const establishments = await Establishment.insertMany([
        { name: 'Bloemen Food Court', location: 'Taft Ave, Manila', contact: '0912 123 2367', hours: '9:00 AM - 8:00 PM', link: '#', description: 'Bloemen canteen inside DLSU', image: 'sample_estab1.jpg', rating: 4.5 },
        { name: 'Agno Food Court', location: 'Taft Ave, Manila', contact: '0912 123 2367', hours: '7:00 AM - 9:00 PM', link: '#', description: 'Agno canteen near Gokongwei Building', image: 'sample_estab2.jpg', rating: 4.0 },
        { name: 'GreenBites', location: 'Taft Ave, Manila', contact: '0912 123 2367', hours: '9:00 AM - 8:00 PM', link: '#', description: 'GreenBites where everything is green', image: 'sample_estab3.jpg', rating: 4.5 },
        { name: 'TaftCafe', location: 'Taft Ave, Manila', contact: '0924 456 7433', hours: '7:00 AM - 9:00 PM', link: '#', description: 'Best coffee and pastries near campus', image: 'sample_estab4.jpg', rating: 4.8 },
        { name: 'Cafe Breton', location: 'Taft Ave, Manila', contact: '0967 325 4489', hours: '10:00 AM - 5:00 PM', link: '#', description: 'A cozy cafe offering pastries and coffee', image: 'sample_estab5.jpg', rating: 4.2 },
        { name: "IDK's Diner", location: 'Taft Ave, Manila', contact: '0981 134 7235', hours: '7:00 AM - 7:00 PM', link: '#', description: 'A reliable diner near campus', image: 'sample_estab6.jpg', rating: 4.1 },
        { name: 'Jollibee', location: 'Taft Ave, Manila', contact: '87000', hours: '24/7', link: '#', description: 'Filipino staple fast food', image: 'sample_estab7.jpg', rating: 4.0 },
        { name: 'Sunny Side Cafe', location: 'Taft Ave, Manila', contact: '0952 123 8367', hours: '7:00 AM - 9:00 PM', link: '#', description: 'A cozy breakfast spot', image: 'sample_estab8.jpg', rating: 4.0 },
        { name: 'Brew & Chill', location: 'Taft Ave, Manila', contact: '0969 355 4321', hours: '7:00 AM - 8:00 PM', link: '#', description: 'Coffee shop with a chill atmosphere', image: 'sample_estab9.jpg', rating: 4.0 }
    ]);

    // Create regular users
    const users = await User.insertMany([
        { name: 'Luis Harold', email: 'luis_harold@gmail.com', password: '1234', joinDate: new Date('2026-02-01'), bio: 'Sophomore student, ID 124!', phone: '09112123231', image: 'sample_profile.jpg' },
        { name: 'Maria Santos', email: 'maria_santos@gmail.com', password: '1234', joinDate: new Date('2025-03-01'), bio: 'Food veteran :)', phone: '09181517222', image: 'sample_profile2.png' },
        { name: 'Karlie Chirk', email: 'karlofdachirk@gmail.com', password: '1234', joinDate: new Date('2024-04-01'), bio: 'Food lover :)', phone: '09097623483', image: 'sample_profile3.png' },
        { name: 'Bob Builder', email: 'Bob@gmail.com', password: '1234', joinDate: new Date('2026-01-01'), bio: 'Hello...', phone: '09251185412', image: 'sample_profile4.jpg' },
        { name: 'John Doe', email: 'John@yahoo.com', password: '1234', joinDate: new Date('2025-12-01'), bio: 'Nice nice', phone: '09332145678', image: 'sample_profile5.webp' }
    ]);

    // Create admin users
    await User.insertMany([
        { name: 'Ana Villanueva', email: 'ana@bloemen.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[0]._id] },
        { name: 'Carlos Tan', email: 'carlos@agnocourt.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[1]._id] },
        { name: 'Bea Rivera', email: 'bea@greenbites.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[2]._id] },
        { name: 'Miguel Santos', email: 'miguel@taftcafe.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[3]._id] },
        { name: 'Diana Lopez', email: 'diana@cafebreton.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[4]._id] },
        { name: 'Rico Mendoza', email: 'rico@idksdiner.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[5]._id] },
        { name: 'Grace Lim', email: 'grace@jollibee.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[6]._id] },
        { name: 'Marco Reyes', email: 'marco@sunnyside.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[7]._id] },
        { name: 'Sofia Cruz', email: 'sofia@brewandchill.com', password: 'admin123', isAdmin: true, establishmentsManaged: [establishments[8]._id] }
    ]);

    // Create reviews
    await Review.insertMany([
        { title: 'Affordable and delicious', comment: 'Great variety of food options at reasonable prices.', rating: 4, userId: users[0]._id, establishmentId: establishments[0]._id },
        { title: 'Best coffee in town', comment: 'The baristas here are amazing!', rating: 5, userId: users[0]._id, establishmentId: establishments[1]._id },
        { title: 'Overrated but still good', comment: 'Quick service even during rush hour.', rating: 4, userId: users[0]._id, establishmentId: establishments[2]._id },
        { title: 'Decent but limited', comment: 'Food variety could be better.', rating: 4, userId: users[1]._id, establishmentId: establishments[0]._id },
        { title: 'Best coffee in town', comment: 'Love the ambiance and WiFi.', rating: 5, userId: users[1]._id, establishmentId: establishments[3]._id },
        { title: 'Super underrated', comment: 'Hidden gem near campus!', rating: 5, userId: users[1]._id, establishmentId: establishments[4]._id },
        { title: 'Near campus', comment: 'Super convenient location.', rating: 5, userId: users[2]._id, establishmentId: establishments[5]._id },
        { title: 'Reliable', comment: 'Always consistent quality.', rating: 5, userId: users[2]._id, establishmentId: establishments[6]._id },
        { title: 'The bread is addicting wth', comment: 'Their pastries are incredible!', rating: 5, userId: users[2]._id, establishmentId: establishments[3]._id },
        { title: 'Cozy breakfast spot', comment: 'Perfect morning meals.', rating: 4, userId: users[3]._id, establishmentId: establishments[7]._id },
        { title: 'Best coffee in town', comment: 'Coffee is consistently good.', rating: 5, userId: users[3]._id, establishmentId: establishments[3]._id },
        { title: 'Super underrated', comment: 'Great food and atmosphere.', rating: 5, userId: users[3]._id, establishmentId: establishments[4]._id },
        { title: 'Best iced coffee', comment: 'Refreshing drinks and chill vibe.', rating: 5, userId: users[4]._id, establishmentId: establishments[8]._id },
        { title: 'Best hangout spot XD', comment: 'Love studying here.', rating: 5, userId: users[4]._id, establishmentId: establishments[3]._id },
        { title: 'Service is great', comment: 'Staff are super friendly.', rating: 4, userId: users[4]._id, establishmentId: establishments[2]._id }
    ]);

    console.log('Database seeded successfully!');
    mongoose.connection.close();
}

seed();