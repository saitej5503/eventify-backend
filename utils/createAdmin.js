require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (existing) {
      console.log('⚠️ Admin already exists');
    } else {
      await Admin.create({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });
      console.log('✅ Admin created successfully');
    }
    process.exit(0);
  })
  .catch(err => console.error('❌ Error creating admin:', err));
