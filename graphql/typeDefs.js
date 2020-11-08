const gql = require('graphql-tag');

module.exports = gql`
	type Post{
		id: ID!
		body: String!
		createdAt: String!
		username: String!
		comments: [Comment]!
		likes: [Like]!
		commentsCount: Int!
		likesCount: Int!
		user: ID!
		userAvatarImage: String
	}
	type Comment{
		id: ID!
		createdAt: String!
		username: String!
		body: String!
		commentAvatarImage: String
	}
	type Like{
		id: ID!
		createdAt: String!
		username: String!
	}
	type User {
		id: ID!
		email: String!
		token: String!
		username: String!
		createdAt: String!
		avatarImage: String
	}
	input RegisterInput {
		username: String!
		password: String!
		confirmPassword: String!
		email: String!
		avatarImage: String!
	}
	type PostsResult{
		posts: [Post]
		currentPage: Int
    	totalPages: Int
	}
	type Query{
		getPosts(page: Int, limit: Int): PostsResult
		getPost(postId: ID!): Post
	}
	type Mutation{
		register(registerInput: RegisterInput, host: String!): String!
		login(username: String!, password: String!): User!
		confirmation(email: String!, token: String!): String!
		createPost(body: String!): Post!
		deletePost(postId: ID!): String!
		createComment(postId: ID!, body: String!): Post!
		deleteComment(postId: ID!, commentId: ID!): Post!
		likePost(postId: ID!): Post!
	}
	type Subscription {
    	newPost: Post!
	}
`;