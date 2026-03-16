import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { TrackService } from "./track.service";

const createTrack = catchAsync(async (req: Request, res: Response) => {
    const track = await TrackService.createTrackToDB({courier: req.user?.id});

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Track Created Successfully',
        data: track,
    });
})

const updateTrack = catchAsync(async (req: Request, res: Response) => {
    const track = await TrackService.updateTrackToDB({id: req.user?.id, payload: req.body});

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Track Created Successfully',
        data: track,
    });
})

const getTrack = catchAsync(async (req: Request, res: Response) => {
    console.log("Courier : ", req.user.id);
    const track = await TrackService.retrievedTrackToDB({courier: req.user?.id});
  
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Retrieved track Successfully',
        data: track
    });
});

export const TrackController = { 
    createTrack, 
    getTrack,
    updateTrack
};