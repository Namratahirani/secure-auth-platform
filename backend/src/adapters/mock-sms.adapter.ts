export const sendOtpSms = async (
  phone: string,
  otp: string
) => {
  console.log("=================================");
  console.log("📱 MOCK SMS");
  console.log(`To: ${phone}`);
  console.log(`Your Sstudize SecureAuth OTP is: ${otp}`);
  console.log("This OTP expires in 5 minutes.");
  console.log("=================================");
};