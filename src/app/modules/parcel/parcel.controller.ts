import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ParcelService } from './parcel.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';

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

// update parcel
const acceptParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.acceptParcelToDB(req.user.id, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const pickupParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.pickupParcelToDB(req.user.id, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const leaveParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const proofImage = await getSingleFilePath(req.files, "proofImage");
    const result = await ParcelService.leaveParcelToDB(req.user.id, req.params.id, { proofImage });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const acceptDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.acceptDeliveryToDB(req.user.id, req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// get all parcels
const getParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await ParcelService.getParcelsFromDB(req.query);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcels data retrieved successfully",
        data: result.data,
        pagination: result.meta
    })
});

// get single parcel
const getParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.getParcelToDB(req.params.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcel data retrieved successfully",
        data: result.data
    })
});

export const ParcelController = {
    createParcel,
    updateParcel,
    getParcels,
    getParcel,
    acceptParcel,
    pickupParcel,
    leaveParcel,
    acceptDelivery    
};