import { Clock } from '@daos/shared-kernel';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
