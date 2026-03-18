"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactSupportService = void 0;
const http_status_codes_1 = require("http-status-codes");
const contactSupport_model_1 = require("./contactSupport.model");
const mongoose_1 = require("mongoose");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const unlinkFile_1 = require("../../../shared/unlinkFile");
//create contact support
const createContactSupportToDB = async (userId, payload) => {
    try {
        const isExistContactSupport = await contactSupport_model_1.ContactSupportModel.findOne({ user: new mongoose_1.Types.ObjectId(userId), isReply: false });
        if (isExistContactSupport) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Your already have pending contact support! Please wait for admin response to you mail!");
        }
        const newContactSupport = {
            user: new mongoose_1.Types.ObjectId(userId),
            attachment: payload.attachment,
            sub: payload.sub,
            msg: payload.msg,
        };
        const res = await contactSupport_model_1.ContactSupportModel.create(newContactSupport);
        if (!res) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
        }
        return res;
    }
    catch (error) {
        payload.attachment && (0, unlinkFile_1.unlinkFile)(payload.attachment);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
};
// update contact support
const updateContactSupportToDB = async (id, reply) => {
    const res = await contactSupport_model_1.ContactSupportModel.findById(id).populate('user', 'email');
    if (!res) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
    }
    if (res.isReply) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Already replied! Please Check through your email");
    }
    // Make sure user is properly populated
    if (!res.user || typeof res.user === 'string' || !('email' in res.user)) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User information not available");
    }
    const values = {
        email: res.user.email,
        sub: res.sub,
        msg: res.msg,
        reply: reply,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.contactSupport(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    res.reply = reply;
    res.isReply = true;
    await res.save();
    return res;
};
// get contact support
const getContactSupportToDB = async (id) => {
    const res = await contactSupport_model_1.ContactSupportModel.findById(id).populate('user', 'name email contact location');
    if (!res) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Contact Support doesn't exist!");
    }
    return res;
};
// get contact support with pagination
const getContactSupportsToDB = async (limit, pageNumber, status) => {
    var _a, _b;
    const skip = (pageNumber - 1) * limit;
    const isReply = status === 'solved' ? true : false;
    const pipeline = [];
    if (status === 'pending' || status === 'solved') {
        pipeline.push({ $match: { isReply: isReply } });
    }
    pipeline.push({ $sort: { createdAt: -1 } }, {
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
            pipeline: [
                {
                    $project: {
                        name: 1,
                        email: 1,
                        contact: 1,
                        location: 1,
                    },
                },
            ],
        },
    }, { $unwind: '$user' });
    pipeline.push({
        $facet: {
            data: [
                { $skip: skip },
                { $limit: limit },
            ],
            totalCount: [
                { $count: 'count' }
            ],
        },
    }, {
        $unwind: {
            path: '$totalCount',
            preserveNullAndEmptyArrays: true,
        },
    }, {
        $project: {
            data: 1,
            total: '$totalCount.count',
        },
    });
    const result = await contactSupport_model_1.ContactSupportModel.aggregate(pipeline);
    const total = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    const data = ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.data) || [];
    return {
        meta: {
            total,
            page: pageNumber,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
};
exports.ContactSupportService = {
    createContactSupportToDB,
    updateContactSupportToDB,
    getContactSupportToDB,
    getContactSupportsToDB
};
