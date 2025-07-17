import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IBanner } from "./banner.interface";
import { Banner } from "./banner.model";
import unlinkFile from "../../../shared/unlinkFile";
import mongoose from "mongoose";
import redis from "../../../config/redisClient";

const createBannerToDB = async (payload: IBanner): Promise<IBanner> => {

    const createBanner: any = await Banner.create(payload);
    if (!createBanner) {
        unlinkFile(payload.image)               
        throw new ApiError(StatusCodes.OK, "Failed to created banner");
    }

    await redis.del(`banner`);

    return createBanner;
};


const retrieveBannerFromDB = async (): Promise<IBanner[]> => {

    const cachedBanner = await redis.get(`banner`);
    if (cachedBanner) {
        return JSON.parse(cachedBanner);
    }
    const result = await Banner.find({});

    // Cache user in Redis for future requests
    await redis.set(`banner`, JSON.stringify(result), 'EX', 60 * 5);
    return result;
};

const updateBannerToDB = async (id: string, payload: IBanner): Promise<IBanner | {}> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid ")
    }

    const isBannerExist: any = await Banner.findById(id);

    if (payload.image) {
        unlinkFile(isBannerExist?.image);
    }

    const banner: any = await Banner.findOneAndUpdate({ _id: id }, payload, { new: true });

    await redis.del(`banner`);
    return banner;
};

const deleteBannerToDB = async (id: string): Promise<IBanner | undefined> => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid ")
    }

    const isBannerExist: any = await Banner.findById({ _id: id });

    //delete from folder
    if (isBannerExist) {
        unlinkFile(isBannerExist?.image);
    }

    //delete from database
    await Banner.findByIdAndDelete(id);
    await redis.del(`banner`);
    return;
};

export const BannerService = {
    createBannerToDB,
    retrieveBannerFromDB,
    updateBannerToDB,
    deleteBannerToDB
}