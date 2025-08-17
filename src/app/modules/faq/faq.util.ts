export async function clearFaqCache(redis: any): Promise<void> {
    const keys = await redis.smembers('faq:cacheKeys');
    if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del('faq:cacheKeys');
    }
    return;
}