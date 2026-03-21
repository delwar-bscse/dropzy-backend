import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TransactionService } from './transaction.service';


// create Contact Support
const createTransaction = catchAsync(
  async (req: Request, res: Response) => {

    const result = await TransactionService.createTransactionToDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

// create Contact Support
const getTransactions = catchAsync(
  async (req: Request, res: Response) => {

    const result = await TransactionService.getTransactionsFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta,
    });
  }
);

// create Contact Support
const getMyTransactions = catchAsync(
  async (req: Request, res: Response) => {

    const result = await TransactionService.getMyTransactionsFromDB(req.user, req.query);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta,
    });
  }
);


export const TransactionController = { createTransaction, getTransactions, getMyTransactions };