import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmailOrUsername(identifier: string) {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async createLocalUser(params: { email: string; username?: string; name?: string; password: string; role: Role }) {
        const { email, username, name, password, role } = params;
        const passwordHash = await bcrypt.hash(password, 10);
        const derivedUsername = username ?? (await this.ensureUniqueUsername(email.split('@')[0]));
        return this.prisma.user.create({
            data: {
                email,
                username: derivedUsername,
                name,
                passwordHash,
                role,
            },
        });
    }

    private async ensureUniqueUsername(base: string): Promise<string> {
        const sanitized = base.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
        let candidate = sanitized;
        let attempt = 0;
        while (true) {
            const existing = await this.prisma.user.findUnique({ where: { username: candidate } });
            if (!existing) return candidate;
            attempt += 1;
            const suffix = Math.floor(1000 + Math.random() * 9000).toString();
            candidate = `${sanitized}${suffix}`;
            if (attempt > 5) {
                candidate = `${sanitized}${Date.now().toString().slice(-5)}`;
            }
        }
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async linkGoogleAccount(userId: string, googleId: string): Promise<User> {
        return this.prisma.user.update({ where: { id: userId }, data: { googleId } });
    }

    async linkAppleAccount(userId: string, appleId: string): Promise<User> {
        return this.prisma.user.update({ where: { id: userId }, data: { appleId } });
    }

    async findByGoogleId(googleId: string) {
        return this.prisma.user.findUnique({ where: { googleId } });
    }

    async findByAppleId(appleId: string) {
        return this.prisma.user.findUnique({ where: { appleId } });
    }

    async createOauthUser(params: { email: string; name?: string | null; usernameBase?: string; role?: Role; googleId?: string; appleId?: string }): Promise<User> {
        const username = await this.ensureUniqueUsername(params.usernameBase ?? (params.email?.split('@')[0] ?? 'user'));
        return this.prisma.user.create({
            data: {
                email: params.email,
                username,
                name: params.name ?? null,
                role: params.role ?? Role.USER,
                googleId: params.googleId,
                appleId: params.appleId,
            },
        });
    }
}
