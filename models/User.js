const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: { type: String, required: true, maxlength: 50 },
    password: { type: String, required: true},
    email: { type: String, required: true},
    createdAt: { type: Date, required: true, default: Date.now, expires: 172800 },
    avatarImage: {type: String, default: 'ade.jpg'},
    isVerified: {type: Boolean, default: false}
});

module.exports = model('User', userSchema);