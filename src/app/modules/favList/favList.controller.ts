import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FavListService } from './favList.service';


// create fav list
const createFavList = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.createFavListToDB(req.user.id, req.body.parcelId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

// get fav list
const getFavList = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.getFavListToDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result,
    });
  }
);

//create sub category controller
const getFavListWithDetails = catchAsync(
  async (req: Request, res: Response) => {

    const result = await FavListService.getFavListWithDetailsFromDB(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      data: result.data,
    });
  }
);

export const FavListController = { createFavList, getFavList, getFavListWithDetails };