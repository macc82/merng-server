const { AuthenticationError, UserInputError } = require('apollo-server');
const Post = require('../../models/Post');
const checkAuth = require('../../util/check-auth');
const {validatePostInput} = require('../../util/validators');

module.exports = {
    Query: {
		async getPosts(_, args) {
			try {
				// destrcture search, page, limit, and set default values
				const { page = 1, limit = 9 } = args;

				const posts = await Post.find()
					.sort({ createdAt: -1 })
					.limit(limit)
					.skip((page - 1) * limit)
					;
				// get total documents
				const count = await Post.countDocuments();
				
				return {
					posts,
					totalPages: Math.ceil(count / limit),
					currentPage: page
				};
			} catch (err) {
				throw new Error(err);
			}
		},
		async getPost(_, { postId }) {
			try {
				const post = await Post.findById(postId);
				if (post) {
					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		}
	},
	Mutation: {
		async createPost(_, { body }, context) {
			const user = checkAuth(context);

			const { valid, errors } = validatePostInput(body);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
			}
			
			const postFind = await Post.findOne({ username: user.username, body: new RegExp('^'+body+'$', "i")});			
			if (postFind)
			{
				errors.general = 'Post duplicated';
				throw new UserInputError('Post duplicated', { errors });
			}

			const newPost = new Post({
				body,
				user: user.id,
				username: user.username,
				createdAt: new Date().toISOString()
			});

			const post = await newPost.save();

			context.pubsub.publish('NEW_POST', {
				newPost: post
			});

			return post;
		},
		async deletePost(_, { postId }, context) {
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (post)
				{
					if (user.username === post.username) {
						await post.delete();
						return 'Post deleted successfully';
					} else {
						return new AuthenticationError('Action not allowed');
					}
				} else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async likePost(_, { postId }, context) {
			const user = checkAuth(context);

			try {
				const post = await Post.findById(postId);
				if (post)
				{
					const like = post.likes.find(l => l.username === user.username);
					if (like) {
						//Remove like
						post.likes.splice(post.likes.indexOf(like), 1);
					} else {
						//Append like
						post.likes.unshift({
							username: user.username,
							createdAt: new Date().toISOString()
						});
					}

					await post.save();

					return post;
				} else {
					throw new Error('Post not found');
				}
			} catch (err) {
				throw new Error(err);
			}

		}
	},
	Subscription: {
		newPost: {
			subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
		}
	}
};