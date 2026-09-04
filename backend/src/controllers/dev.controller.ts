import { Request, Response } from "express";
import { getMockSmsMessages } from "../adapters/mock-sms.adapter.js";
import { getMockEmails } from "../adapters/mock-email.adapter.js";

export const getMockOtps = async (
  req: Request,
  res: Response
) => {
  const messages = getMockSmsMessages();

  const safeMessages = messages.map((sms) => ({
    phone:
      sms.phone.length > 4
        ? `******${sms.phone.slice(-4)}`
        : "****",

    message: sms.message,

    createdAt: sms.createdAt,
  }));

  return res.json({
    messages: safeMessages,
  });
};

export const getMockEmailsEndpoint = async (
  req: Request,
  res: Response
) => {
  const emails = getMockEmails();

  return res.json({
    emails,
  });
};