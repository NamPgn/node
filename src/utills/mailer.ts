import NodeMailer from 'nodemailer'
export const sendMail = async (mailOptions) => {
  try {

    const transporter = NodeMailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PS, // generated ethereal password
      }
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