"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const http_status_codes_1 = require("http-status-codes");
const parcel_service_1 = require("./parcel.service");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const getFilePath_1 = require("../../../shared/getFilePath");
// post parcel
const createParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.createParcelToDB(req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// update parcel
const updateParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    // console.log("Result : ", req.body)
    const result = await parcel_service_1.ParcelService.updateParcelToDB(req.user.id, req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// update parcel
const acceptParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.acceptParcelToDB(req.user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// update parcel
const pickupParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.pickupParcelToDB(req.user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// update parcel
const leaveParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    const proofImage = await (0, getFilePath_1.getSingleFilePath)(req.files, "proofImage");
    const result = await parcel_service_1.ParcelService.leaveParcelToDB(req.user.id, req.params.id, { proofImage });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// update parcel
const acceptDelivery = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.acceptDeliveryToDB(req.user.id, req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: result.message,
        data: result.data
    });
});
// get all parcels
const getParcels = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.getParcelsFromDB(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Parcels data retrieved successfully",
        data: result.data,
        pagination: result.meta
    });
});
// get single parcel
const getParcel = (0, catchAsync_1.default)(async (req, res, next) => {
    const result = await parcel_service_1.ParcelService.getParcelToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        message: "Parcel data retrieved successfully",
        data: result.data
    });
});
exports.ParcelController = {
    createParcel,
    updateParcel,
    getParcels,
    getParcel,
    acceptParcel,
    pickupParcel,
    leaveParcel,
    acceptDelivery
};
