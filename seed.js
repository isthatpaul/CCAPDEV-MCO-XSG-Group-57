const mongoose = require('mongoose');
const User = require('./model/User');
const Establishment = require('./model/Establishment');
const Review = require('./model/Review');

mongoose.connect('mongodb://angelobarras_db_user:apdev@ac-0vk9nij-shard-00-00.umiueta.mongodb.net:27017,ac-0vk9nij-shard-00-01.umiueta.mongodb.net:27017,ac-0vk9nij-shard-00-02.umiueta.mongodb.net:27017/?ssl=true&replicaSet=atlas-cb3ity-shard-0&authSource=admin&appName=CCAPDEV-TaftBites')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Helper function to create standard hours array
function createHours(openTime = '09:00', closeTime = '17:00', closedDays = []) {
    const hours = [];
    for (let i = 0; i < 7; i++) {
        hours.push({
            dayOfWeek: i,
            openTime,
            closeTime,
            isClosed: closedDays.includes(i)
        });
    }
    return hours;
}

async function seed() {
    // Clear existing data
    await User.deleteMany({});
    await Establishment.deleteMany({});
    await Review.deleteMany({});

    // Create database admin first (no establishments needed)
    const databaseAdmin = await User.create({
        name: 'Admin Master',
        email: 'admin@taftbites.com',
        password: 'admin123',
        joinDate: new Date(),
        bio: 'Database Administrator',
        isAdmin: true,
        adminType: 'database_admin'
    });

    console.log('✓ Database admin created:', databaseAdmin.email);

    // Create establishment admins first (so we can reference them)
    const adminData = [
        { name: 'Ana Bloemen', email: 'ana@bloemen.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Carlos Agno', email: 'carlos@agnocourt.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Diana TaftCafe', email: 'diana@taftcafe.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Edward Archer', email: 'edward@archer.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Fiona Breton', email: 'fiona@breton.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'George IDK', email: 'george@idk.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Hannah Jollibee', email: 'hannah@jollibee.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Ivan Sunny', email: 'ivan@sunny.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' },
        { name: 'Julia Brew', email: 'julia@brew.com', password: 'admin123', joinDate: new Date(), isAdmin: true, adminType: 'establishment_admin' }
    ];

    // Create Establishment Admins one by one to ensure HASHING
    const adminUsers = [];
    for (const data of adminData) {
        const admin = await User.create({ ...data, joinDate: new Date() });
        adminUsers.push(admin);
    }
    console.log('✓ 9 Establishment Admins created (Hashed)');

    // Create establishments with admin references
    const establishments = await Establishment.insertMany([
        { name: 'Bloemen Food Court', location: 'Taft Ave, Manila', contact: 'info@bloemen.com', category: 'Food Court', phone: '0912-123-2367', hours: createHours('09:00', '20:00'), link: '#', description: 'Bloemen canteen inside DLSU', image: 'sample_estab1.jpg', rating: 4.5, admin: adminUsers[0]._id },
        { name: 'Agno Food Court', location: 'Taft Ave, Manila', contact: 'info@agnocourt.com', category: 'Food Court', phone: '0912-123-2367', hours: createHours('07:00', '21:00'), link: '#', description: 'Agno canteen near Gokongwei Building', image: 'sample_estab2.jpg', rating: 4.0, admin: adminUsers[1]._id },
        { name: 'GreenBites', location: 'Taft Ave, Manila', contact: 'hello@greenbites.com', category: 'Healthy Food', phone: '0912-123-2367', hours: createHours('09:00', '20:00'), link: '#', description: 'GreenBites where everything is green', image: 'sample_estab3.jpg', rating: 4.5, admin: adminUsers[2]._id },
        { name: 'TaftCafe', location: 'Taft Ave, Manila', contact: 'contact@taftcafe.com', category: 'Cafe', phone: '0924-456-7433', hours: createHours('07:00', '21:00'), link: '#', description: 'Best coffee and pastries near campus', image: 'sample_estab4.jpg', rating: 4.8, admin: adminUsers[3]._id },
        { name: 'Cafe Breton', location: 'Taft Ave, Manila', contact: 'hello@cafebreton.com', category: 'Cafe', phone: '0967-325-4489', hours: createHours('10:00', '17:00'), link: '#', description: 'A cozy cafe offering pastries and coffee', image: 'sample_estab5.jpg', rating: 4.2, admin: adminUsers[4]._id },
        { name: "IDK's Diner", location: 'Taft Ave, Manila', contact: 'info@idksdiner.com', category: 'Diner', phone: '0981-134-7235', hours: createHours('07:00', '19:00'), link: '#', description: 'A reliable diner near campus', image: 'sample_estab6.jpg', rating: 4.1, admin: adminUsers[5]._id },
        { name: 'Jollibee', location: 'Taft Ave, Manila', contact: 'taft@jollibee.com', category: 'Fast Food', phone: '0800-087-000', hours: createHours('06:00', '23:00'), link: '#', description: 'Filipino staple fast food', image: 'sample_estab7.jpg', rating: 4.0, admin: adminUsers[6]._id },
        { name: 'Sunny Side Cafe', location: 'Taft Ave, Manila', contact: 'hello@sunnysidecafe.com', category: 'Cafe', phone: '0952-123-8367', hours: createHours('07:00', '21:00'), link: '#', description: 'A cozy breakfast spot', image: 'sample_estab8.jpg', rating: 4.0, admin: adminUsers[7]._id },
        { name: 'Brew & Chill', location: 'Taft Ave, Manila', contact: 'contact@brewandchill.com', category: 'Cafe', phone: '0969-355-4321', hours: createHours('07:00', '20:00'), link: '#', description: 'Coffee shop with a chill atmosphere', image: 'sample_estab9.jpg', rating: 4.0, admin: adminUsers[8]._id }
    ]);

    // Update admin users with their managed establishments
    for (let i = 0; i < adminUsers.length; i++) {
        adminUsers[i].establishmentsManaged = [establishments[i]._id];
        await adminUsers[i].save();
    }

    // Create regular users
    const userData = [
        { name: 'Luis Harold', email: 'luis_harold@gmail.com', password: '1234', joinDate: new Date('2026-02-01'), bio: 'Sophomore student, ID 124!', phone: '09112123231', image: 'sample_profile.jpg' },
        { name: 'Maria Santos', email: 'maria_santos@gmail.com', password: '1234', joinDate: new Date('2025-03-01'), bio: 'Food veteran :)', phone: '09181517222', image: 'sample_profile2.png' },
        { name: 'Karlie Chirk', email: 'karlofdachirk@gmail.com', password: '1234', joinDate: new Date('2024-04-01'), bio: 'Food lover :)', phone: '09097623483', image: 'sample_profile3.png' },
        { name: 'Bob Builder', email: 'Bob@gmail.com', password: '1234', joinDate: new Date('2026-01-01'), bio: 'Hello...', phone: '09251185412', image: 'sample_profile4.jpg' },
        { name: 'John Doe', email: 'John@yahoo.com', password: '1234', joinDate: new Date('2025-12-01'), bio: 'Nice nice', phone: '09332145678', image: 'sample_profile5.webp' }
    ]

    // Create the user's using the User create hook
    const users = [];
    for (const data of userData) {
        const user = await User.create(data);
        users.push(user);
    }

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
    console.log('✓ Database Admin - Email: admin@taftbites.com | Password: admin123');
    console.log('✓ 9 Establishment Admins created');
    console.log('✓ 5 Regular users created');
    console.log('✓ 9 Establishments created');
    console.log('✓ 15 Reviews created');
    mongoose.connection.close();
}

seed();