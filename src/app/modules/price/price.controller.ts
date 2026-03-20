
import { Request, Response } from 'express';
import { PriceService } from './price.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

const addPrice = catchAsync(async (req, res) => {

  const result = await PriceService.addPriceToDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Price added successfully',
    data: result,
  });
});

const getPrice = catchAsync(async (req: Request, res: Response): Promise<void> => {
  
  const result = await PriceService.getPriceFromDB()
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Price update successfully',
    data: result,
  });
},
);


const updatePrice = catchAsync(async (req, res) => {

  const result = await PriceService.updatePriceToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result,
  });
});


const calculatePrice = catchAsync(async (req, res) => {

  const payload = {
    dimension: Number(req.query.dimension) || 0,
    weight: Number(req.query.weight) || 0,
  }
  console.log("Payload : ", payload)

  const result = await PriceService.calculatePriceFromDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result,
  });
});

export const PriceController = {
  addPrice,
  getPrice,
  updatePrice,
  calculatePrice
};
