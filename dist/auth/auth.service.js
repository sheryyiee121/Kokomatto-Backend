"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const google_auth_library_1 = require("google-auth-library");
const appleSignIn = __importStar(require("apple-signin-auth"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(emailOrUsername, password) {
        const user = await this.usersService.findByEmailOrUsername(emailOrUsername);
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    generateTokens(user) {
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
    async register(params) {
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
    async login(params) {
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
    async googleLogin(params) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const client = new google_auth_library_1.OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({ idToken: params.idToken, audience: clientId });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub)
            throw new common_1.UnauthorizedException('Invalid Google token');
        const googleId = payload.sub;
        const email = payload.email ?? `${googleId}@google.local`;
        const name = payload.name ?? payload.given_name ?? null;
        let user = await this.usersService.findByGoogleId(googleId);
        if (!user) {
            const existingByEmail = email ? await this.usersService.findByEmail(email) : null;
            if (existingByEmail) {
                user = await this.usersService.linkGoogleAccount(existingByEmail.id, googleId);
            }
            else {
                user = await this.usersService.createOauthUser({ email, name, googleId, role: client_1.Role.USER });
            }
        }
        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
    async appleLogin(params) {
        const audience = process.env.APPLE_CLIENT_ID;
        const claims = await appleSignIn.verifyIdToken(params.idToken, { audience, ignoreExpiration: false });
        const appleId = claims.sub;
        const email = claims.email ?? `${appleId}@apple.local`;
        const name = null;
        let user = await this.usersService.findByAppleId(appleId);
        if (!user) {
            const existingByEmail = await this.usersService.findByEmail(email);
            if (existingByEmail) {
                user = await this.usersService.linkAppleAccount(existingByEmail.id, appleId);
            }
            else {
                user = await this.usersService.createOauthUser({ email, name, appleId, role: client_1.Role.USER });
            }
        }
        const tokens = this.generateTokens(user);
        return {
            ...tokens,
            profile: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map