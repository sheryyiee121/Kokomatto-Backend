import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: Request) {
        return { user: (req as any).user };
    }
}
