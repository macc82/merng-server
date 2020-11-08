module.exports.validateRegisterInput = (username, email, password, confirmPassword, avatarImage) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (email.trim() === '') {
        errors.email = 'Email must not be empty';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }
    if (password.trim() === '') {
        errors.password = 'Password must not be empty';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    if (avatarImage.trim() === '') {
        errors.avatarImage = 'Avatar Image must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}

module.exports.validateLoginInput = (username, password) => {
    const errors = {};
    if (username.trim() === '') {
        errors.username = 'Username must not be empty';
    }
    if (password.trim() === '') {
        errors.password = 'Password must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}

module.exports.validatePostInput = (body) => {
    const errors = {};
    if (body.trim() === '') {
        errors.body = 'Body must not be empty';
    }

    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}

module.exports.validateCommentInput = (body) => {
    const errors = {};
    if (body.trim() === '') {
        errors.body = 'Comment body must not be empty';
    }
    
    return {
        errors,
        valid: Object.keys(errors).length < 1
    };
}