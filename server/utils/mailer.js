import nodemailer from 'nodemailer';

let transporterCache = null;

export const createTransporter = async () => {
    if(transporterCache) return transporterCache;

    if(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS){
        transporterCache = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }else{
        const testAccount = await nodemailer.createTestAccount();
        transporterCache = nodemailer.createTransporter({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        })
        console.log("Etheral test account created. Preview email set at:", nodemailer.getTestMessageUrl)
    }

    return transporterCache;
}

export const sendMail = async (opts) => {
    const transporter = await createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject || "Notification",
        text: opts.text || "",
        html: opts.html || undefined,
        attachments: opts.attachments || undefined,
    };

    const info = await transporter.sendMail(mailOptions);

    if(nodemailer.getTestMessageUrl && info){
        console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
    }

    return info;
}