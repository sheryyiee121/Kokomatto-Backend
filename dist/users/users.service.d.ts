import { PrismaService } from '../prisma/prisma.service';
import { Role, User } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmailOrUsername(identifier: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createLocalUser(params: {
        email: string;
        username?: string;
        name?: string;
        password: string;
        role: Role;
    }): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private ensureUniqueUsername;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    linkGoogleAccount(userId: string, googleId: string): Promise<User>;
    linkAppleAccount(userId: string, appleId: string): Promise<User>;
    findByGoogleId(googleId: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findByAppleId(appleId: string): Promise<{
        id: string;
        email: string;
        username: string;
        passwordHash: string | null;
        googleId: string | null;
        appleId: string | null;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    createOauthUser(params: {
        email: string;
        name?: string | null;
        usernameBase?: string;
        role?: Role;
        googleId?: string;
        appleId?: string;
    }): Promise<User>;
}
