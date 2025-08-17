import { AuthService } from './auth.service';
import type { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        name?: string;
        role: 'user' | 'merchant' | 'affiliate' | 'admin';
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
    login(body: {
        email: string;
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
    loginWithGoogle(body: {
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
    loginWithApple(body: {
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
    me(req: Request): Promise<{
        user: any;
    }>;
}
