import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';


// create review
const createReview = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.createReviewToDB(req.user.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
    });
  }
);

// get review
const getMyReviews = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.getReviewFromDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta
    });
  }
);

// get courier review
const getCourierReviews = catchAsync(
  async (req: Request, res: Response) => {

    const result = await ReviewService.getReviewFromDB(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
      pagination: result.meta
    });
  }
);


export const ReviewController = { createReview, getMyReviews, getCourierReviews };