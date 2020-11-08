const { model, Schema } = require('mongoose');

const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    createdAt: String,
    avatarImage: {type: String, default: 'ade.jpg'},
    isVerified: {type: Boolean, default: false}
});

module.exports = model('User', userSchema);