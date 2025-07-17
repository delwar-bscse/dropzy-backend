import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IBookmark } from "./bookmark.interface";
import { Bookmark } from "./bookmark.model";
import { JwtPayload } from "jsonwebtoken";
import { FilterQuery } from "mongoose";
import QueryBuilder from "../../../helpers/QueryBuilder";
import redis from "../../../config/redisClient";

const toggleBookmark = async (payload: IBookmark): Promise<string> => {

    // Check if the bookmark already exists
    const existingBookmark = await Bookmark.findOne({
        user: payload.user,
        service: payload.service
    });

    if (existingBookmark) {
        // If the bookmark exists, delete it
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        await redis.del(`bookmark_${payload.user}`);
        return "Bookmark Remove successfully";
    } else {

        // If the bookmark doesn't exist, create it
        const result = await Bookmark.create(payload);
        if (!result) {
            throw new ApiError(StatusCodes.EXPECTATION_FAILED, "Failed to add bookmark");
        }
        await redis.del(`bookmark_${payload.user}`);
        return "Bookmark Added successfully";
    }
};


const retrieveBookmarksFromDB = async (user: JwtPayload, query: FilterQuery<IBookmark>): Promise<{bookmarks: IBookmark[], pagination: any}> => {

    const cachedBookmarks = await redis.get(`bookmark_${user.id}`);
    if (cachedBookmarks) {
        return JSON.parse(cachedBookmarks);
    }

    const BookmarkQuery = new QueryBuilder(
        Bookmark.find({ user: user?.id }).lean().exec(),
        query
    ).paginate();

    const [bookmarks, pagination] = await Promise.all([
        BookmarkQuery.queryModel.populate("service"),
        BookmarkQuery.getPaginationInfo()
    ])
    
    await redis.set(`bookmark_${user.id}`, JSON.stringify({ bookmarks, pagination }), 'EX', 60 * 5);
    return { bookmarks, pagination };
}

export const BookmarkService = { toggleBookmark, retrieveBookmarksFromDB }