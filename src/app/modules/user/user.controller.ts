import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import pick from '../../../helpers/pick';

// register user
const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.createUserToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    })
});

// retrieve profile
const retrieveProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.retrieveProfileFromDB(req.user as JwtPayload,);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result
    });
});

// get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    // 1. Define which query fields are filters
    const acceptableFields = ['searchTerm', 'verified', 'isActive', 'isDeleted', 'fields', 'sort', 'role', 'page', 'limit'];
    // 2. Pick only allowed filters from req.query
    const filterOptions = pick(req.query, acceptableFields);

    const result = await UserService.getAllUsersFromDB(filterOptions);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Users data retrieved successfully',
        data: result.data,
        pagination: result.meta
    });
});

// delete my profile
const deleteProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.deleteUserFromDB(req.user.id);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile deleted successfully',
        data: result
    });
});

// admin: delete user
const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.deleteUserFromDB( req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User deleted successfully',
        data: result
    });
});

// approve user
const approveUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.approveUserToDB( req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User deleted successfully',
        data: result
    });
});

// Decline user
const declineUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.declineUserFromDB( req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User deleted successfully',
        data: result
    });
});

// active or block user
const activeBlockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.activeBlockUserFromDB( req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});

//update profile
const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateProfileToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result.data
    });
});


// withdraw courier account balance
const withdraw = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

        const result = await UserService.withdrawFromDB(req?.user);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: result?.message,
            data: result?.url ?? "",
        });
    }
);

export const UserController = {
    createUser,
    retrieveProfile,
    getAllUsers,
    updateProfile,
    deleteProfile,
    deleteUser,
    activeBlockUser,
    approveUser,
    declineUser,
    withdraw
};