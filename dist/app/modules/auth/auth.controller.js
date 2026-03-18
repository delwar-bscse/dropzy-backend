"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const auth_service_1 = require("./auth.service");
// verify email
const verifyEmail = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.verifyEmailToDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});
// login user
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.loginUserFromDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'User login successfully',
        data: result
    });
});
// forget password
const forgetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.forgetPasswordToDB(req.body.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Please check your email, we send a OTP!',
        data: result
    });
});
// reset password
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.resetPasswordToDB(req.headers.authorization, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password reset successfully',
        data: result
    });
});
// change password
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    await auth_service_1.AuthService.changePasswordToDB(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Password changed successfully',
    });
});
// new access token
const newAccessToken = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.newAccessTokenToUser(req.body.refreshToken);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Generate Access Token successfully',
        data: result
    });
});
// resend verification email
const resendVerificationEmail = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.resendVerificationEmailToDB(req.body.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Generate OTP and send successfully',
        data: result
    });
});
// delete user
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.deleteUserFromDB(req.user, req.body.password);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: 'Account Deleted successfully',
        data: result
    });
});
// swap user role
const swapUserRole = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_service_1.AuthService.swapUserRoleFromDB(req.user.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: `Your role swapped to ${result.role} successfully`,
        data: result
    });
});
exports.AuthController = {
    verifyEmail,
    loginUser,
    forgetPassword,
    resetPassword,
    changePassword,
    newAccessToken,
    resendVerificationEmail,
    deleteUser,
    swapUserRole
};
