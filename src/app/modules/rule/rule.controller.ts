import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RuleService } from './rule.service';


//privacy policy
const createPrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const { ...privacyData } = req.body
    const result = await RuleService.createPrivacyPolicyToDB(privacyData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy created successfully',
        data: result
    })
})


const retrievePrivacyPolicy = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.retrievePrivacyPolicyFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Privacy policy retrieved successfully',
        data: result
    })
})


//terms and conditions
const createTermsAndCondition = catchAsync( async (req: Request, res: Response) => {
    const { ...termsData } = req.body
    const result = await RuleService.createTermsAndConditionToDB(termsData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions created successfully',
        data: result
    })
})
  
const retrieveTermsAndCondition = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.retrieveTermsAndConditionFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Terms and conditions retrieved successfully',
        data: result
    })
})

//about
const createAbout = catchAsync(async (req: Request, res: Response) => {
    const { ...aboutData } = req.body
    const result = await RuleService.createAboutToDB(aboutData)
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About created successfully',
        data: result
    })
})
  
const retrieveAbout = catchAsync(async (req: Request, res: Response) => {
    const result = await RuleService.retrieveAboutFromDB()
  
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'About retrieved successfully',
        data: result
    })
})

export const RuleController = {
    createPrivacyPolicy,
    retrievePrivacyPolicy,
    createTermsAndCondition,
    retrieveTermsAndCondition,
    createAbout,
    retrieveAbout
}  