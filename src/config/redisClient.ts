import Redis from 'ioredis';
import colors from 'colors';
import { errorLogger, logger } from '../shared/logger';
import config from '../config';

const redis = new Redis({
    host: config.redis.host as string,
    port: Number(config.redis.port),
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

// --------------------- Redis Connection Commands --------------------- //
// wsl
// pass:mdhcse
// sudo apt update
// sudo apt install redis-server
// sudo service redis-server start
// sudo systemctl enable redis-server

// sudo service redis-server stop
// sudo service redis-server restart
// sudo service redis-server status