
import { Request, Response } from 'express';
import { RuleService } from './rule.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// add rule
const addRule = catchAsync(async (req, res) => {

  const result = await RuleService.addRuleToDB();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting added successfully',
    data: result,
  });
});

// get rule
const getRule = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { title } = req.params;
  const result = await RuleService.getRuleFromDB(title)
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Setting update successfully',
    data: result,
  });
},
);

// update rule
const updateRule = catchAsync(async (req, res) => {
  
  const result = await RuleService.updateRuleToDB(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message:  result,
  });
});

export const RuleController = {
  addRule,
  getRule,
  updateRule,
};
