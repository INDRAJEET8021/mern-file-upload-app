const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
    },
}, {
    timestamps: true,
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password during login
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
