"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelService = void 0;
const http_status_codes_1 = require("http-status-codes");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const parcel_model_1 = require("./parcel.model");
const unlinkFile_1 = require("../../../shared/unlinkFile");
const user_model_1 = require("../user/user.model");
const user_1 = require("../../../enums/user");
const parcel_1 = require("../../../enums/parcel");
// create parcel to db
const createParcelToDB = async (senderId, payload) => {
    try {
        const postedDate = new Date();
        const isExistSender = await user_model_1.UserModel.findOne({ _id: senderId, role: user_1.USER_ROLES.SENDER });
        if (!isExistSender) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Sender not found');
        }
        const newPayload = {
            ...payload,
            sender: senderId,
            postedDate: postedDate,
            status: parcel_1.ParcelStatus.POSTED,
            track_date: {
                [parcel_1.ParcelStatus.POSTED]: postedDate
            }
        };
        const parcel = await parcel_model_1.ParcelModel.create(newPayload);
        if (!parcel) {
            payload.images && (0, unlinkFile_1.unlinkFiles)(payload.images);
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create parcel');
        }
        return {
            message: 'Parcel created successfully',
            data: parcel.toObject()
        };
    }
    catch (error) {
        payload.images && (0, unlinkFile_1.unlinkFiles)(payload.images);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
};
// update parcel to db
const updateParcelToDB = async (senderId, parcelId, payload) => {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const isExistParcel = await parcel_model_1.ParcelModel.findOne({ _id: parcelId, sender: senderId });
        if (!isExistParcel) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Parcel not found');
        }
        if (isExistParcel.status !== parcel_1.ParcelStatus.POSTED) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Parcel is not in POSTED status');
        }
        const { track_date, receiver, prevImages, images, ...rest } = payload;
        console.log("Service: Payload", { track_date, receiver, prevImages, images, rest });
        const newPayload = {
            ...rest,
            receiver: {
                name: (_a = receiver === null || receiver === void 0 ? void 0 : receiver.name) !== null && _a !== void 0 ? _a : (_b = isExistParcel.receiver) === null || _b === void 0 ? void 0 : _b.name,
                countryCode: (_c = receiver === null || receiver === void 0 ? void 0 : receiver.countryCode) !== null && _c !== void 0 ? _c : (_d = isExistParcel.receiver) === null || _d === void 0 ? void 0 : _d.countryCode,
                phoneNumber: (_e = receiver === null || receiver === void 0 ? void 0 : receiver.phoneNumber) !== null && _e !== void 0 ? _e : (_f = isExistParcel.receiver) === null || _f === void 0 ? void 0 : _f.phoneNumber
            },
            images: [
                ...(prevImages ? prevImages : []),
                ...(images ? images : [])
            ]
        };
        const parcel = await parcel_model_1.ParcelModel.findOneAndUpdate({ _id: parcelId, sender: senderId }, newPayload, { new: true }).lean();
        if (!parcel) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update parcel');
        }
        const deleteImages = (_g = isExistParcel.images) === null || _g === void 0 ? void 0 : _g.filter((image) => !(prevImages === null || prevImages === void 0 ? void 0 : prevImages.includes(image)));
        if (deleteImages === null || deleteImages === void 0 ? void 0 : deleteImages.length) {
            (0, unlinkFile_1.unlinkFiles)(deleteImages);
        }
        return {
            message: 'Parcel updated successfully',
            data: parcel
        };
    }
    catch (error) {
        payload.images && (0, unlinkFile_1.unlinkFiles)(payload.images);
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
};
// get all parcels from db
const getParcelsFromDB = async (payload) => {
    var _a, _b;
    const { p_lng, p_lat, d_lng, d_lat } = payload;
    const page = Number(payload.page) || 1;
    const limit = Number(payload.limit) || 10;
    const skip = (page - 1) * limit;
    const radius = (Number(payload.radius) || 10) / 6378.1; //radius in radians;
    const status = "posted";
    const match = {
        status: status,
    };
    // pickup filter
    if (p_lng && p_lat) {
        match.p_coordinates = {
            $geoWithin: {
                $centerSphere: [[Number(p_lng), Number(p_lat)], radius],
            },
        };
    }
    // destination filter
    if (d_lng && d_lat) {
        match.d_coordinates = {
            $geoWithin: {
                $centerSphere: [[Number(d_lng), Number(d_lat)], radius],
            },
        };
    }
    const pipeline = [
        { $match: match },
        { $sort: { createdAt: -1 } }
    ];
    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }],
        },
    });
    const parcels = await parcel_model_1.ParcelModel.aggregate(pipeline);
    const total = Number(((_b = (_a = parcels[0]) === null || _a === void 0 ? void 0 : _a.total[0]) === null || _b === void 0 ? void 0 : _b.count) || 0);
    const totalPage = Math.ceil(total / limit);
    return {
        // data: parcels,
        data: parcels[0].data,
        meta: {
            total,
            page,
            limit,
            totalPage,
        },
    };
};
// get parcel from db
const getParcelToDB = async (parcelId) => {
    const isExistParcel = await parcel_model_1.ParcelModel.findById(parcelId).lean();
    if (!isExistParcel) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Parcel not found');
    }
    return {
        data: isExistParcel
    };
};
// accept parcel to db
const acceptParcelToDB = async (courierId, parcelId) => {
    const isExistCourier = await user_model_1.UserModel.findOne({ _id: courierId, role: user_1.USER_ROLES.COURIER });
    if (!isExistCourier) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Courier not found');
    }
    const payload = {
        status: parcel_1.ParcelStatus.ACCEPTED,
        courier: courierId,
        $set: {
            [`track_date.${parcel_1.ParcelStatus.ACCEPTED}`]: new Date()
        }
    };
    const parcel = await parcel_model_1.ParcelModel.findOneAndUpdate({ _id: parcelId, status: parcel_1.ParcelStatus.POSTED }, payload, { new: true });
    if (!parcel) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to accept parcel');
    }
    return {
        data: parcel
    };
};
// pickup parcel to db
const pickupParcelToDB = async (courierId, parcelId) => {
    const isExistCourier = await user_model_1.UserModel.findOne({ _id: courierId, role: user_1.USER_ROLES.COURIER });
    if (!isExistCourier) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Courier not found');
    }
    const payload = {
        status: parcel_1.ParcelStatus.ONTHEWAY,
        $set: {
            [`track_date.${parcel_1.ParcelStatus.ONTHEWAY}`]: new Date()
        }
    };
    const parcel = await parcel_model_1.ParcelModel.findOneAndUpdate({ _id: parcelId, status: parcel_1.ParcelStatus.ACCEPTED, courier: courierId }, payload, { new: true });
    if (!parcel) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to pickup parcel');
    }
    return {
        data: parcel
    };
};
// leave parcel to db
const leaveParcelToDB = async (courierId, parcelId, payload) => {
    try {
        const isExistCourier = await user_model_1.UserModel.findOne({ _id: courierId, role: user_1.USER_ROLES.COURIER });
        if (!isExistCourier) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Courier not found');
        }
        const parcel = await parcel_model_1.ParcelModel.findOneAndUpdate({ _id: parcelId, status: parcel_1.ParcelStatus.ONTHEWAY, sendDeliveryRequest: false, courier: courierId }, { sendDeliveryRequest: true, proofImage: payload.proofImage }, { new: true }).lean();
        if (!parcel) {
            throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to leave parcel');
        }
        return { data: parcel };
    }
    catch (error) {
        if (payload.proofImage) {
            (0, unlinkFile_1.unlinkFile)(payload.proofImage);
        }
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
};
// leave parcel to db
const acceptDeliveryToDB = async (senderId, parcelId) => {
    const isExistSender = await user_model_1.UserModel.findOne({ _id: senderId, role: user_1.USER_ROLES.SENDER });
    if (!isExistSender) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Sender not found');
    }
    const parcel = await parcel_model_1.ParcelModel.findOneAndUpdate({ _id: parcelId, status: parcel_1.ParcelStatus.ONTHEWAY, sendDeliveryRequest: true, sender: senderId }, {
        status: parcel_1.ParcelStatus.DELIVERED,
        [`track_date.${parcel_1.ParcelStatus.DELIVERED}`]: new Date()
    }, { new: true }).lean();
    if (!parcel) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to update parcel');
    }
    return { data: parcel };
};
exports.ParcelService = {
    createParcelToDB,
    updateParcelToDB,
    getParcelsFromDB,
    getParcelToDB,
    acceptParcelToDB,
    pickupParcelToDB,
    leaveParcelToDB,
    acceptDeliveryToDB
};
