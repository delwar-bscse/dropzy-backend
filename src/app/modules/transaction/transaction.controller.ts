import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TransactionService } from './transaction.service';
import mongoose, { Types } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';


// create transaction
const createTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payload = {
        ref: "Parcel Delivery confirmed by Sender",
        parcel: new Types.ObjectId("69ba1374336f0f964d37d6f3"),
        from: new Types.ObjectId("69b949c46642b044b97d90c1"),
        to: new Types.ObjectId("69b9489e6642b044b97d90b4"),
        balance: 400
      }

      const result = await TransactionService.createTransactionToDB(payload, session);

      await session.commitTransaction();

      sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        data: result,
      });
    } catch (error: any) {
      await session.abortTransaction();
      throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    } finally {
      session.endSession();
    }
  }
);

// get transactions
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

// get my transactions
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