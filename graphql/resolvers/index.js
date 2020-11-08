const postsResolvers = require('./posts');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

const User = require('../../models/User');

module.exports = {
    Post: {
        commentsCount: (parent) => parent.comments.length,
        likesCount: (parent) => parent.likes.length,
        userAvatarImage: async (parent) => {
            const user = await User.findById(parent.user);
            return user.avatarImage;
        }
    },
    Comment: {
        commentAvatarImage: async (parent) => {
            const user = await User.findOne({username: parent.username});
            return user ? user.avatarImage : 'ade.jpg';
        }
    },
    Query: {
        ...postsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...postsResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription: {
        ...postsResolvers.Subscription
    }
}