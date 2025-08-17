import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IBookmark } from "./bookmark.interface";
import { Bookmark } from "./bookmark.model";
import { JwtPayload } from "jsonwebtoken";
import { FilterQuery } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";
import redis from "../../../config/redisClient";
import qs from 'qs';



const clearBookmarkCache = async (redis: any, user: JwtPayload): Promise<void> => {
    const keys = await redis.smembers(`bookmark:cacheKeys:${user.id}`);
    if (keys.length > 0) {
        await redis.del(...keys);
        await redis.del(`bookmark:cacheKeys:${user.id}`);
    }
    return;
}

const toggleBookmark = async (payload: IBookmark): Promise<string> => {

    // Check if the bookmark already exists
    const existingBookmark = await Bookmark.findOne({
        user: payload.user,
        service: payload.service
    });

    if (existingBookmark) {
        // If the bookmark exists, delete it
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        await clearBookmarkCache(redis, payload.user);
        return "Bookmark Remove successfully";
    } else {

        // If the bookmark doesn't exist, create it
        const result = await Bookmark.create(payload);
        if (!result) {
            throw new ApiError(StatusCodes.EXPECTATION_FAILED, "Failed to add bookmark");
        }
        await clearBookmarkCache(redis, payload.user);
        return "Bookmark Added successfully";
    }
};


const retrieveBookmarksFromDB = async (user: JwtPayload, query: FilterQuery<IBookmark>): Promise<{ bookmarks: IBookmark[], pagination: any }> => {

    const allowedParams = ["page", "limit"];
    const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([key]) => allowedParams.includes(key))
    );

    const queryKey = qs.stringify(filteredQuery, { encode: false }) || 'default';
    const redisKey = `bookmark:${user.id}:${queryKey}`;

    // retrieve cache data from redis cache
    const cachedBookmarks = await redis.get(redisKey);
    if (cachedBookmarks) {
        return JSON.parse(cachedBookmarks);
    }

    const BookmarkQuery = new QueryBuilder(
        Bookmark.find({ user: user.id }).lean().exec(),
        query
    ).paginate();

    const ttl = Number(filteredQuery.page) === 1 ? 60 * 10 : 60 * 3; // 10 min for page 1, 3 min for others

    const [bookmarks, pagination] = await Promise.all([
        BookmarkQuery.queryModel.populate("service"),
        BookmarkQuery.getPaginationInfo()
    ])

    // Cache only if data will be valid
    if (bookmarks.length > 0) {
        await redis.set(redisKey, JSON.stringify({ bookmarks, pagination }), "EX", ttl);
        await redis.sadd(`bookmark:cacheKeys:${user.id}`, redisKey);
    }

    return { bookmarks, pagination };
}

export const BookmarkService = { toggleBookmark, retrieveBookmarksFromDB }