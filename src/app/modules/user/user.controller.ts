import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';

// register user
const createUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Your account has been successfully created. Verify Your Email By OTP. Check your email',
    })
});

// register admin
const createAdmin = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createAdminToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Admin created successfully',
        data: result
    });
});

// retrieved user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getUserProfileFromDB(req.user as JwtPayload,);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result
    });
});

//update profile
const updateProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateProfileToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});

export const UserController = { 
    createUser, 
    createAdmin, 
    getUserProfile, 
    updateProfile
};