"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSupportController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const contactSupport_service_1 = require("./contactSupport.service");
// create Contact Support
const createContactSupport = (0, catchAsync_1.default)(async (req, res) => {
    const result = await contactSupport_service_1.ContactSupportService.createContactSupportToDB(req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
});
// update Contact Support
const updateContactSupport = (0, catchAsync_1.default)(async (req, res) => {
    const result = await contactSupport_service_1.ContactSupportService.updateContactSupportToDB(req.params.id, req.body.reply);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
});
// get Contact Support
const getContactSupport = (0, catchAsync_1.default)(async (req, res) => {
    const result = await contactSupport_service_1.ContactSupportService.getContactSupportToDB(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
});
// get Contact Support
const getContactSupports = (0, catchAsync_1.default)(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const status = req.query.status ? String(req.query.status) : '';
    const result = await contactSupport_service_1.ContactSupportService.getContactSupportsToDB(limit, page, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_codes_1.StatusCodes.OK,
        data: result,
    });
});
exports.ContactSupportController = { createContactSupport, updateContactSupport, getContactSupport, getContactSupports };
