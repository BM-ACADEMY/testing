const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shift = require('../models/Shift');
const connectDB = require('../config/db');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        try {
            await User.collection.drop(); // Remove indexes too
        } catch (e) {
            // Ignore if collection doesn't exist
        }

        try {
            await Shift.collection.drop();
        } catch (e) { }

        try {
            await mongoose.connection.collection('attendances').drop();
        } catch (e) { }

        console.log('Collections dropped...');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Shift
        const shift = await Shift.create({
            name: 'General Shift',
            loginTime: '09:00',
            gracePeriod: 15,
            lunchStart: '13:00',
            maxLunchDuration: 60,
            logoutTime: '18:00',
            isActive: true
        });

        console.log('Shift created:', shift.name);

        // Create HR
        await User.create({
            name: 'HR Manager',
            email: 'hr@example.com',
            password: hashedPassword,
            role: 'HR'
        });

        // Create Employee
        await User.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            role: 'Employee',
            shift: shift._id
        });

        // Create CEO
        await User.create({
            name: 'CEO Executive',
            email: 'ceo@example.com',
            password: hashedPassword,
            role: 'CEO'
        });

        console.log('Data Imported! Users: hr@example.com, john@example.com, ceo@example.com. Password: password123');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
