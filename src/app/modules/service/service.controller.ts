import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ServiceService } from "./service.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createService = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.createServiceToDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service created Successfully",
        data: result
    })
})

const updateService = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.updateServiceToDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service updated Successfully",
        data: result
    })
})

const retrieveService = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.retrieveServiceFromDB(req.user, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service Retrieved Successfully",
        data: result
    })
})

const retrieveAllService = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.retrieveAllServiceFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service Retrieved Successfully",
        data: result
    })
})

const deleteService = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.deleteServiceFromDB(req.user, req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service Deleted Successfully",
        data: result
    })
})

const retrieveServiceDetails = catchAsync(async(req: Request, res: Response)=>{
    const result = await ServiceService.retrievedServiceDetailsFromDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Service Retrieved Successfully",
        data: result
    })
})

export const ServiceController = {
    createService,
    updateService,
    retrieveService,
    retrieveAllService,
    deleteService,
    retrieveServiceDetails
}