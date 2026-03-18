"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const emailTemplate_1 = require("../../../shared/emailTemplate");
const emailHelper_1 = require("../../../helpers/emailHelper");
const unlinkFile_1 = require("../../../shared/unlinkFile");
const redisClient_1 = __importDefault(require("../../../config/redisClient"));
const track_service_1 = require("../track/track.service");
const createUserToDB = async (payload) => {
    let message = '';
    let createUser = {};
    const isExistUser = await user_model_1.UserModel.isExistUserByEmail(payload === null || payload === void 0 ? void 0 : payload.email);
    if (isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.verified) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.CONFLICT, 'User already exist! Please Login');
    }
    if (isExistUser && !(isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.verified)) {
        const newPayload = {
            role: payload.role,
            name: payload.name,
            password: payload.password
        };
        isExistUser.set(newPayload);
        const res = await isExistUser.save();
        // console.log("Res : ", res)
        if (!res) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
        }
        createUser = isExistUser;
        message = "User already exist! Please verify your account";
    }
    else {
        createUser = await user_model_1.UserModel.create(payload);
        if (!createUser) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
        }
        message = 'User created successfully';
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    await user_model_1.UserModel.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return {
        message,
        data: createUser
    };
};
const retrieveProfileFromDB = async (user) => {
    const { id } = user;
    const cachedUser = await redisClient_1.default.get(`user:${id}`);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }
    const isExistUser = await user_model_1.UserModel.findById(id).lean();
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    // Cache user in Redis for future requests
    await redisClient_1.default.set(`user:${id}`, JSON.stringify(isExistUser), 'EX', 60 * 30);
    return isExistUser;
};
const updateProfileToDB = async (user, payload) => {
    const { id } = user;
    const isExistUser = await user_model_1.UserModel.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //unlink file here
    if (payload.profile && isExistUser.profile) {
        // console.log("Profile image : ", isExistUser.profile, payload.profile)
        (0, unlinkFile_1.unlinkFile)(isExistUser.profile);
    }
    if (payload.imgFront && isExistUser.imgFront) {
        (0, unlinkFile_1.unlinkFile)(isExistUser.imgFront);
    }
    if (payload.imgBack && isExistUser.imgBack) {
        (0, unlinkFile_1.unlinkFile)(isExistUser.imgBack);
    }
    const newPayload = {
        ...payload,
        accountInfo: {
            ...isExistUser.accountInfo,
            ...payload.accountInfo
        }
    };
    const updateDoc = await user_model_1.UserModel.findOneAndUpdate({ _id: id }, newPayload, { new: true });
    if (!updateDoc) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update user');
    }
    await redisClient_1.default.del(`user:${id}`);
    //create track room for tracking.
    const track = await track_service_1.TrackService.createTrackToDB({
        courier: id,
        location: updateDoc.address,
        coordinates: updateDoc.coordinates
    });
    if (!track) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create track');
    }
    return {
        data: updateDoc
    };
};
exports.UserService = {
    createUserToDB,
    retrieveProfileFromDB,
    updateProfileToDB
};
