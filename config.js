module.exports = {
    MONGODB: 'mongodb+srv://muser1:2usoBJIZvvZS7ug0@macc82.0q7fw.mongodb.net/socialmedia?retryWrites=true&w=majority',
    SECRET_KEY: 'some very secret key',
    nodemailerConfig: {
        modeTest: true,
        transporterOptions: {
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: '',
                pass: '',
            },
        },
        from: '"No Reply" <no-reply@example.com>',
    }
}