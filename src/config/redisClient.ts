import Redis from 'ioredis';
import colors from 'colors';
import { errorLogger, logger } from '../shared/logger';

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

export const connectRedis = () => {

    redis.on('connect', () => {
        logger.info(colors.green('🟥 Redis connected successfully'));
    });

    redis.on('error', (error) => {
        errorLogger.error('Redis connection error', error);
    });
}

export default redis;