import { Injectable } from '@nestjs/common';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor() {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== 'HR' && user.role !== 'Candidate') {
      throw new ForbiddenException('You do not have the required permissions');
    }

    return true;
  }
}
