interface MockSms {
  phone: string;
  message: string;
  createdAt: Date;
}

const mockSmsMessages: MockSms[] = [];

export const sendOtpSms = async (
  phone: string,
  otp: string
) => {
  const message = `Your Sstudize SecureAuth OTP is: ${otp}`;

  console.log("=================================");
  console.log("📱 MOCK SMS");
  console.log(`To: ${phone}`);
  console.log(message);
  console.log("This OTP expires in 5 minutes.");
  console.log("=================================");

  mockSmsMessages.push({
    phone,
    message,
    createdAt: new Date(),
  });

  // Keep only the latest 20 mock SMS messages
  if (mockSmsMessages.length > 20) {
    mockSmsMessages.shift();
  }
};

export const getMockSmsMessages = () => {
  return mockSmsMessages;
};