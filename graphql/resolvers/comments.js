const { AuthenticationError, UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const {validateCommentInput} = require('../../util/validators');

module.exports = {
    Mutation: {
        createComment: async (_, { postId, body }, context) => {
            const user = checkAuth(context);

            const { valid, errors } = validateCommentInput(body);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const post = await Post.findById(postId);
            if (post) {
                const comment = post.comments.find(x => x.username === user.username && x.body === body);
                if (comment) {
                    errors.general = 'Comment duplicated';
                    throw new UserInputError('Comment duplicated', { errors });
                }
                
                post.comments.unshift({
                    body,
                    username: user.username,
                    createdAt: new Date().toISOString()
                });

                await post.save();
                
                return post;
            } else {
                errors.general = 'Post not found';
                throw new UserInputError('Post not found', { errors });
            }
        },
        deleteComment: async (_, { postId, commentId }, context) => {
            const user = checkAuth(context);

            const errors = {};

            const post = await Post.findById(postId);
            if (post) {
                const comment = post.comments.find(x => x.id === commentId);
                if (comment) {
                    if (user.username === comment.username) {
						post.comments.splice(post.comments.indexOf(comment), 1);

                        await post.save();
                        
                        return post;
					} else {
						return new AuthenticationError('Action not allowed');
					}
                } else {
                    errors.general = 'Comment not found';
                    throw new UserInputError('Comment not found', { errors });
                }
                
                return post;
            } else {
                errors.general = 'Post not found';
                throw new UserInputError('Post not found', { errors });
            }
        }
    }
}