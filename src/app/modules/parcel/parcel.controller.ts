import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ParcelService } from './parcel.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getSingleFilePath } from '../../../shared/getFilePath';
import pick from '../../../helpers/pick';

//create service controller
const stripeTestPayment = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ParcelService.stripeTestPaymentToDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Payment success",
      data: result
    });
  }
);

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
    const result = await ParcelService.updateParcelToDB(req.user.id,  req.params.id as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const acceptParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.acceptParcelToDB(req.user.id,  req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const pickupParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.pickupParcelToDB(req.user.id,  req.params.id as string);

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
    const result = await ParcelService.leaveParcelToDB(req.user.id,  req.params.id as string, { proofImage });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// update parcel
const acceptDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.acceptDeliveryToDB(req.user.id,  req.params.id as string);

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
    // console.log("get parcels : ", JSON.parse(req.query.routePoints as string));

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcels data retrieved successfully",
        data: result.data,
        pagination: result.meta
    })
});

// get all parcels for admin
const getMyParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Define which query fields are filters
    const acceptableFields = ['searchTerm', 'status', 'page', 'limit'];
    // 2. Pick only allowed filters from req.query
    const filterOptions = {...pick(req.query, acceptableFields), fields: "sender, receiver, courier, status, pickup, destination, price"};

    const result = await ParcelService.getMyParcelsFromDB(req.user, filterOptions);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcels data retrieved successfully",
        data: result.data,
        pagination: result.meta
    })
});

// get all parcels for admin
const getParcelsForAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Define which query fields are filters
    const acceptableFields = ['searchTerm', 'status', 'page', 'limit'];
    // 2. Pick only allowed filters from req.query
    const filterOptions = {...pick(req.query, acceptableFields), fields: "sender, receiver, courier, status, pickup, destination, price"};

    const result = await ParcelService.getParcelsForAdminFromDB(filterOptions);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcels data retrieved successfully",
        data: result.data,
        pagination: result.meta
    })
});

// parcels overview for admin
const parcelsOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await ParcelService.parcelsOverviewFromDB();

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcels Overview retrieved successfully",
        data: result
    })
});

// get single parcel
const getParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ParcelService.getParcelToDB( req.user.id, req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Parcel data retrieved successfully",
        data: result.data
    })
});

export const ParcelController = {
    stripeTestPayment,
    createParcel,
    updateParcel,
    getParcels,
    getParcel,
    getParcelsForAdmin,   
    acceptParcel,
    pickupParcel,
    leaveParcel,
    acceptDelivery,
    parcelsOverview,
    getMyParcels
};