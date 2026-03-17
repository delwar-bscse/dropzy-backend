import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ParcelService } from './parcel.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

// post parcel
const createParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.createParcelToDB(req.user.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const updateParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log("Result : ", req.body)
    const result = await ParcelService.updateParcelToDB(req.user.id, req.params.id, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// register user
const getParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // console.log("Result : ", req.body)
    const { p_lng, p_lat, d_lng, d_lat } = req.query
    const filter = {
        ...((p_lng && p_lat) && { p_lng: Number(p_lng), p_lat: Number(p_lat) }),
        ...((d_lng && d_lat) && { d_lng: Number(d_lng), d_lat: Number(d_lat) })
    };

    const result = await ParcelService.getParcelsFromDB(filter);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

export const ParcelController = {
    createParcel,
    updateParcel,
    getParcels
};