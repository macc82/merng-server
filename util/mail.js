const nodemailer = require("nodemailer");
const {nodemailerConfig} = require("../config");

module.exports.sendVerificationMail = async (mailAccount, vToken, host) => {
    const errors = {};
    let transporter;
    if (nodemailerConfig.modeTest) {
        // Generate test SMTP service account from ethereal.email
        const testAccount = await nodemailer.createTestAccount();

        nodemailerConfig.transporterOptions.auth.user = testAccount.user;
        nodemailerConfig.transporterOptions.auth.pass = testAccount.pass;
        // create reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport(nodemailerConfig.transporterOptions);
    } else {
        transporter = nodemailer.createTransport(nodemailerConfig.transporterOptions);
    }

    const mailOptions = {
        from: nodemailerConfig.from, // sender address
        to: mailAccount, // list of receivers
        subject: "Account Verification Token", // Subject line
        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + host + '\/confirmation\/' + vToken, // plain text body
        html: `Hello<br/><br/>Please verify your account by clicking the link: <a href="https://${host}/confirmation/${vToken}">Validate user</a>`, // html body
    };
    // send mail with defined transport object
    let url = '';
    await transporter.sendMail(mailOptions)
        .then(info => {
            if (nodemailerConfig.modeTest) {
                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...  
                url = nodemailer.getTestMessageUrl(info);
            }
        })
        .catch(err => errors.general = err.message);

    return {
        errors,
        valid: Object.keys(errors).length < 1,
        url: url
    };
};