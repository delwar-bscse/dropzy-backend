import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WithdrawService } from './withdraw.service';




// get transactions
const getTransactions = catchAsync(
  async (req: Request, res: Response) => {

    const result = await WithdrawService.getWithdrawsFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta,
    });
  }
);

// get my transactions
const getMyTransactions = catchAsync(
  async (req: Request, res: Response) => {

    const result = await WithdrawService.getMyWithdrawsFromDB(req.user, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta,
    });
  }
);



export const WithdrawController = { getTransactions, getMyTransactions };