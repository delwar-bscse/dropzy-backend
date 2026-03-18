"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../shared/logger");
const config_1 = __importDefault(require("../config"));
const redis = new ioredis_1.default({
    host: config_1.default.redis.host,
    port: Number(config_1.default.redis.port),
});
const connectRedis = () => {
    redis.on('connect', () => {
        logger_1.logger.info(colors_1.default.green('🟥 Redis connected successfully'));
    });
    redis.on('error', (error) => {
        logger_1.errorLogger.error('Redis connection error', error);
    });
};
exports.connectRedis = connectRedis;
exports.default = redis;
