interface MockEmail {
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const mockEmails: MockEmail[] = [];

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
) => {
  const message =
    `Reset your Sstudize SecureAuth password using this link: ${resetLink}`;

  console.log("=================================");
  console.log("📧 MOCK EMAIL");
  console.log(`To: ${email}`);
  console.log(message);
  console.log("This link expires in 1 hour.");
  console.log("=================================");

  mockEmails.push({
    email,
    subject: "Sstudize SecureAuth Password Reset",
    message,
    createdAt: new Date(),
  });

  // Keep only the latest 20 mock emails
  if (mockEmails.length > 20) {
    mockEmails.shift();
  }
};

export const getMockEmails = () => {
  return mockEmails;
};