import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PlanService } from "./plan.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPlan = catchAsync(async(req: Request, res: Response)=>{
    const result = await PlanService.createPlanToDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Plan created Successfully",
        data: result
    })
})

const updatePlan = catchAsync(async(req: Request, res: Response)=>{
    const result = await PlanService.updatePlanToDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Plan updated Successfully",
        data: result
    })
})

const retrievePlan = catchAsync(async(req: Request, res: Response)=>{
    const result = await PlanService.retrievedPlanFromDB(req.query.paymentType as string);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Plan Retrieved Successfully",
        data: result
    })
})

const planDetails = catchAsync(async(req: Request, res: Response)=>{
    const result = await PlanService.retrievedPlanDetailsFromDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Plan Details Retrieved Successfully",
        data: result
    })
})


const deletePlan = catchAsync(async(req: Request, res: Response)=>{
    const result = await PlanService.deletePlanToDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Plan Deleted Successfully",
        data: result
    })
})

export const PlanController = {
    createPlan,
    updatePlan,
    retrievePlan,
    planDetails,
    deletePlan
}