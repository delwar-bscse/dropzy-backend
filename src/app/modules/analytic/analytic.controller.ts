import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AnalyticService } from './analytic.service';



// get my transactions
const overView = catchAsync(
  async (req: Request, res: Response) => {

    const result = await AnalyticService.overViewFromDB();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result
    });
  }
);

// get system revenues
const getRevenues = catchAsync(
  async (req: Request, res: Response) => {
    const year = Number(req.query.year);
    const result = await AnalyticService.getRevenuesFromDB(year);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result
    });
  }
);

// get parcels summary
const getParcels = catchAsync(
  async (req: Request, res: Response) => {
    const year = Number(req.query.year);
    const result = await AnalyticService.getParcelsFromDB(year);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result
    });
  }
);

// get system revenues
const getUsers = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticService.getUsersFromDB(req.query.date as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result
    });
  }
);

// get system revenues
const getMyProgress = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AnalyticService.getMyProgressFromDB(req.user, req.query.date as string);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result
    });
  }
);


export const AnalyticController = { overView, getRevenues, getParcels, getUsers, getMyProgress };