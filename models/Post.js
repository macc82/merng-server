const { model, Schema } = require('mongoose');

const postSchema = new Schema({
    body: { type: String, required: true, maxlength: 500 },
    username: { type: String, required: true, maxlength: 50 },
    createdAt: { type: Date, required: true, default: Date.now, expires: 172800 },
    comments: [
        {
            body: { type: String, required: true, maxlength: 500 },
            username: { type: String, required: true, maxlength: 50 },
            createdAt: { type: Date, required: true, default: Date.now, expires: 172800 },
        }
    ],
    likes: [
        {
            username: { type: String, required: true, maxlength: 50 },
            createdAt: { type: Date, required: true, default: Date.now, expires: 172800 },
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = model('Post', postSchema);