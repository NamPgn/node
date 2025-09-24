import NodeMailer from 'nodemailer'
export const sendMail = async (mailOptions) => {
  try {

    const transporter = NodeMailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: "maddison53@ethereal.email",
        pass: "jn7jnAPss4f63QBp6D",
      },
    });
    await transporter.sendMail(mailOptions);

    // const db = client.db('mydatabase');
    // const emailCollection = db.collection('emails');

    // await emailCollection.insertOne({
    //   from: mailOptions.from,
    //   to: mailOptions.to,
    //   subject: mailOptions.subject,
    //   text: mailOptions.text,
    //   sentDate: new Date()
    // });

    console.log('Email sent successfully');
  } catch (error) {
    console.log(error);
  }
}