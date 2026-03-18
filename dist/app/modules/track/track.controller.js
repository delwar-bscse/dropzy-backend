"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_codes_1 = require("http-status-codes");
const track_service_1 = require("./track.service");
const createTrack = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const track = await track_service_1.TrackService.createTrackToDB({ courier: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Track Created Successfully',
        data: track,
    });
});
const updateTrack = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    const track = await track_service_1.TrackService.updateTrackToDB({ id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, payload: req.body });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Track Created Successfully',
        data: track,
    });
});
const getTrack = (0, catchAsync_1.default)(async (req, res) => {
    var _a;
    console.log("Courier : ", req.user.id);
    const track = await track_service_1.TrackService.retrievedTrackToDB({ courier: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: 'Retrieved track Successfully',
        data: track
    });
});
exports.TrackController = {
    createTrack,
    getTrack,
    updateTrack
};
