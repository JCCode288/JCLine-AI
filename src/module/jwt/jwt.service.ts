import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as _jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private readonly logger = new Logger();
  private readonly jwt = _jwt;
  private readonly jwt_secret = process.env.JWT_SECRET;
  encrypt(data) {
    try {
      if (!data || typeof data !== 'string') {
        throw new HttpException('Invalid Data', HttpStatus.BAD_REQUEST);
      }
      return this.jwt.sign(data, this.jwt_secret);
    } catch (err) {
      this.logger.log(err, JwtService.name);
      throw err;
    }
  }

  validate(token: string) {
    try {
      return this.jwt.verify(token, this.jwt_secret);
    } catch (err) {
      this.logger.log(err, JwtService.name);

      throw err;
    }
  }
}
