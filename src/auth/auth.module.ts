import { JWT_OPTIONS } from '@config/constant';
import { jwtOption } from '@config/option';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './provider/common.auth.service';
@Global()
@Module({
  imports: [JwtModule],
  providers: [
    AuthService,
    {
      provide: JWT_OPTIONS,
      useValue: jwtOption,
    },
  ],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
