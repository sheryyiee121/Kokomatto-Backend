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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmailOrUsername(identifier) {
        return this.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async createLocalUser(params) {
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
    async ensureUniqueUsername(base) {
        const sanitized = base.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user';
        let candidate = sanitized;
        let attempt = 0;
        while (true) {
            const existing = await this.prisma.user.findUnique({ where: { username: candidate } });
            if (!existing)
                return candidate;
            attempt += 1;
            const suffix = Math.floor(1000 + Math.random() * 9000).toString();
            candidate = `${sanitized}${suffix}`;
            if (attempt > 5) {
                candidate = `${sanitized}${Date.now().toString().slice(-5)}`;
            }
        }
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async linkGoogleAccount(userId, googleId) {
        return this.prisma.user.update({ where: { id: userId }, data: { googleId } });
    }
    async linkAppleAccount(userId, appleId) {
        return this.prisma.user.update({ where: { id: userId }, data: { appleId } });
    }
    async findByGoogleId(googleId) {
        return this.prisma.user.findUnique({ where: { googleId } });
    }
    async findByAppleId(appleId) {
        return this.prisma.user.findUnique({ where: { appleId } });
    }
    async createOauthUser(params) {
        const username = await this.ensureUniqueUsername(params.usernameBase ?? (params.email?.split('@')[0] ?? 'user'));
        return this.prisma.user.create({
            data: {
                email: params.email,
                username,
                name: params.name ?? null,
                role: params.role ?? client_1.Role.USER,
                googleId: params.googleId,
                appleId: params.appleId,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map