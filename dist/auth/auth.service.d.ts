import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(emailOrUsername: string, password: string): Promise<{
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
    generateTokens(user: {
        id: string;
        email: string;
        role: Role;
        name: string | null;
    }): {
        accessToken: string;
        refreshToken: string;
    };
    register(params: {
        email: string;
        password: string;
        name?: string;
        role: Role;
    }): Promise<{
        profile: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(params: {
        emailOrUsername: string;
        password: string;
    }): Promise<{
        profile: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    googleLogin(params: {
        idToken: string;
    }): Promise<{
        profile: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    appleLogin(params: {
        idToken: string;
    }): Promise<{
        profile: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
}
