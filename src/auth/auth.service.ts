import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import * as appleSignIn from 'apple-signin-auth';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(emailOrUsername: string, password: string) {
        const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

    generateTokens(user: { id: string; email: string; role: Role; name: string | null }) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }

    async register(params: { email: string; password: string; name?: string; role: Role }) {
        const user = await this.usersService.createLocalUser({
            email: params.email,
            username: undefined,
            name: params.name,
            password: params.password,
            role: params.role,
        });
        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async login(params: { emailOrUsername: string; password: string }) {
        const user = await this.validateUser(params.emailOrUsername, params.password);
        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async googleLogin(params: { idToken: string }) {
        const clientId = process.env.GOOGLE_CLIENT_ID as string;
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({ idToken: params.idToken, audience: clientId });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub) throw new UnauthorizedException('Invalid Google token');
        const googleId = payload.sub;
        const email = payload.email ?? `${googleId}@google.local`;
        const name = payload.name ?? payload.given_name ?? null;

        let user = await this.usersService.findByGoogleId(googleId);
        if (!user) {
            const existingByEmail = email ? await this.usersService.findByEmail(email) : null;
            if (existingByEmail) {
                user = await this.usersService.linkGoogleAccount(existingByEmail.id, googleId);
            } else {
                user = await this.usersService.createOauthUser({ email, name, googleId, role: Role.USER });
            }
        }

        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    async appleLogin(params: { idToken: string }) {
        const audience = process.env.APPLE_CLIENT_ID as string;
        const claims = await appleSignIn.verifyIdToken(params.idToken, { audience, ignoreExpiration: false });
        const appleId = claims.sub as string;
        const email = (claims.email as string) ?? `${appleId}@apple.local`;
        const name = null;

        let user = await this.usersService.findByAppleId(appleId);
        if (!user) {
            const existingByEmail = await this.usersService.findByEmail(email);
            if (existingByEmail) {
                user = await this.usersService.linkAppleAccount(existingByEmail.id, appleId);
            } else {
                user = await this.usersService.createOauthUser({ email, name, appleId, role: Role.USER });
            }
        }

        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
}
