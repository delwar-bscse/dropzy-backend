import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { DimensionFetcherServices } from "./dimensionFetcher.service";
import catchAsync from "../../../shared/catchAsync";

const extractDimensions = catchAsync(async (req: Request, res: Response) => {
    const result = await DimensionFetcherServices.fetchDimensionsFromImages(req.body.images);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Dimensions extracted successfully",
        data: result
    });
});

export const DimensionFetcherController = {
    extractDimensions
}
