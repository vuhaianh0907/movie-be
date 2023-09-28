import { GraphQLError } from 'graphql';
import prisma from '../handlers/prisma';
import emailServices from './email.services';

class OtpService {
  public async sendOtp(id: string, otp: string) {
    let otpGenerate = '';

    const emailOtp = await prisma.emailOtp.findUnique({
      where: {
        id: id,
      },
    });

    if (!emailOtp) {
      const newEmailOtp = await prisma.emailOtp.create({
        data: {
          id: id,
          otp: otp,
        },
      });

      otpGenerate = newEmailOtp.otp;
    }

    if (emailOtp) {
      const updateEmailOtp = await prisma.emailOtp.update({
        where: {
          id: id,
        },
        data: {
          otp: otp,
        },
      });

      otpGenerate = updateEmailOtp.otp;
    }
    const emailInput = {
      to: id,
      subject: 'Xác thực otp',
      content: 'Đây là email xác thực, không chia sẽ otp cho bất kì ai',
      code: otpGenerate,
    };

    emailServices.sendEmail(emailInput);
    return otpGenerate;
  }
}

export default new OtpService();
