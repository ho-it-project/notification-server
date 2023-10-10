import { JwtOption } from './interface';

export const jwtOption: JwtOption = {
  access_secret: process.env.JWT_ACCESS_SECRET as string,
};

