import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    private readonly businessCode: number,
    details?: unknown,
  ) {
    super({ message, code: businessCode, details }, HttpStatus.OK);
  }

  getBusinessCode(): number {
    return this.businessCode;
  }
}
