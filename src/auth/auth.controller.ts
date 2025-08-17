import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() body: { email: string; password: string; name?: string; role: 'user' | 'merchant' | 'affiliate' | 'admin' }) {
        const roleMap: Record<string, Role> = {
            user: Role.USER,
            merchant: Role.MERCHANT,
            affiliate: Role.AFFILIATE,
            admin: Role.ADMIN,
        };
        const role = roleMap[body.role] ?? Role.USER;
        return this.authService.register({ email: body.email, password: body.password, name: body.name, role });
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        return this.authService.login({ emailOrUsername: body.email, password: body.password });
    }

    @Post('google')
    async loginWithGoogle(@Body() body: { idToken: string }) {
        return this.authService.googleLogin({ idToken: body.idToken });
    }

    @Post('apple')
    async loginWithApple(@Body() body: { idToken: string }) {
        return this.authService.appleLogin({ idToken: body.idToken });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: Request) {
        const user = (req as any).user;
        return { user };
    }
}
