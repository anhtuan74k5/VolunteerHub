import nodemailer from "nodemailer";

export async function sendOtpEmail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"VolunteerHub" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "Mã xác thực OTP",
    html: `
      <h2>📌 Mã OTP của bạn là: <b>${otp}</b></h2>
      <p>OTP có hiệu lực trong 5 phút. Không chia sẻ mã này cho bất kỳ ai.</p>
    `,
  });
}
