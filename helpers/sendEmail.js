import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
dotenv.config();

const { SENDGRID_API_KEY } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "tenison.olga@gmail.com" };
  await sgMail.send(email);
  return true;
};

export default sendEmail;

// const email = {
//   to: "ricape4121@fryshare.com",
//   from: "tenison.olga@gmail.com",
//   subject: "Test email",
//   html: "<p><strong>Test email </strong>from localhost:3004</p>",
// };

// sgMail
//   .send(email)
//   .then(() => console.log("Email send success"))
//   .catch((error) => console.log(error.message));
