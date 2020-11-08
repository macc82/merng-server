const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../util/validators');
const { SECRET_KEY, nodemailerConfig: { modeTest: mailModeTest } } = require('../../config');
const User = require('../../models/User');
const VerificationToken = require('../../models/VerificationToken');
const { sendVerificationMail } = require('../../util/mail');

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        avatarImage: user.avatarImage
    }, SECRET_KEY, { expiresIn: '1h' });
}

module.exports = {
    Mutation: {
        async register(_, { registerInput: { username, email, password, confirmPassword, avatarImage }, host }) {
            // Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword, avatarImage);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
            // Make sure user doesn't already exist
            const user = await User.findOne({ username: new RegExp('^'+username+'$', "i") });
            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                });
            } else {
                // Make sure email not associated with another account
                const user2 = await User.findOne({ email: new RegExp('^'+email+'$', "i") });
                if (user2) {
                    throw new UserInputError('Email address already associated', {
                        errors: {
                            email: 'The email address you have entered is already associated with another account'
                        }
                    });
                }
            }
            // Hash password and create an auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                username,
                password,
                email,
                createdAt: new Date().toISOString(),
                avatarImage
            });

            const res = await newUser.save();

            //Generate verification token
            const vToken = new VerificationToken({ _userId: res._id, token: crypto.randomBytes(16).toString('hex') });

            // Save the verification token
            const resT = await vToken.save();
            console.log(resT);
            //Send verification email
            const { valid: validMail, errors: errorsMail, url } = await sendVerificationMail(email, resT.token, host);
            //Send result message
            if (!validMail) throw new UserInputError('Verification mail send error', { errors: errorsMail });

            if (mailModeTest)
                return 'It has been simulated sending a verification email to: ' + email + '\nPreview URL: ' + url;
            else
                return 'A verification email has been sent to: ' + email;
        },
        async login(_, { username, password }) {
            const { valid, errors } = validateLoginInput(username, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            let user = await User.findOne({ username: new RegExp('^'+username+'$', "i") });
            if (!user) {
                //Can login with username or email account
                user = await User.findOne({ email: new RegExp('^'+username+'$', "i") });
                if (!user) {
                    errors.general = 'User not found';
                    throw new UserInputError('User not found', { errors });
                }
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong cretendials';
                throw new UserInputError('Wrong cretendials', { errors });
            }

            //Is user's email verified yet?
            if (!user.isVerified) {
                errors.general = 'Your account has not been verified';
                throw new UserInputError('Not verified', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        async confirmation(_, { email, token }) {
            const errors = {};

            if (email.trim() === '') {
                errors.email = 'Email must not be empty';
            } else {
                const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
                if (!email.match(regEx)) {
                    errors.email = 'Email must be a valid email address';
                }
            }

            if (token.trim() === '') {
                errors.token = 'Token must not be empty';
            }

            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Errors', { errors });
            }

            // Find a matching token
            const tokenFinded =  await VerificationToken.findOne({ token }, (err) => { if (err) errors.general = err.message; });
            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Errors', { errors });
            }

            if (!tokenFinded) {
                errors.general = 'We were unable to find a valid token. Your token my have expired';
                throw new UserInputError('Not verified', { errors });
            }
            // If we found a token, find a matching user
            const user = await User.findOne({ _id: tokenFinded._userId, email: new RegExp('^'+email+'$', "i") }, (err) => { if (err) errors.general = err.message; });
            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Errors', { errors });
            }

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }
            if (user.isVerified) {
                errors.general = 'This user has already been verified';
                throw new UserInputError('User already verified', { errors });
            }
            // Verify and save the user
            user.isVerified = true;
            await user.save((err) => { if (err) errors.general = err.message; });
            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Errors', { errors });
            }

            return 'The account has been verified. Please log in';
        }
    }
}