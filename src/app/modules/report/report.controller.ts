import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReportService } from "./report.service";
import sendResponse from "../../../shared/sendResponse";

const createReport = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ReportService.createReportToDB(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Report Created Successfully",
        data: result,
    });
})

export const ReportController = {
    createReport
}