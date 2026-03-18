"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const http_status_codes_1 = require("http-status-codes");
const review_model_1 = require("./review.model");
const user_model_1 = require("../user/user.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const parcel_model_1 = require("../parcel/parcel.model");
const parcel_1 = require("../../../enums/parcel");
const mongoose_1 = require("mongoose");
//create contact support
const createReviewToDB = async (from, payload) => {
    const sender = await user_model_1.UserModel.findById(from);
    if (!sender) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Sender doesn't exist!");
    }
    const parcel = await parcel_model_1.ParcelModel.findOne({
        _id: payload.parcel,
        sender: from,
        status: parcel_1.ParcelStatus.DELIVERED
    });
    if (!parcel) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Parcel doesn't exist!");
    }
    const user = await user_model_1.UserModel.findById(parcel.courier);
    if (!user) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Courier doesn't exist!");
    }
    const isExistReview = await review_model_1.ReviewModel.findOne({ from: from, to: parcel.courier, parcel: payload.parcel });
    if (isExistReview) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "You already reviewed to this courier!");
    }
    const newReview = {
        from: from,
        to: parcel.courier,
        parcel: payload.parcel,
        rating: payload.rating,
        comment: payload.comment,
    };
    const res = await review_model_1.ReviewModel.create(newReview);
    if (!res) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Review to Provider failed!");
    }
    return { data: res };
};
//create contact support
const getReviewFromDB = async (id, page = 1, limit = 10) => {
    var _a, _b;
    const skip = (page - 1) * limit;
    const result = await review_model_1.ReviewModel.aggregate([
        {
            $match: {
                to: new mongoose_1.Types.ObjectId(id)
            }
        },
        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalReview: [
                    { $count: "count" }
                ],
                averageRating: [
                    {
                        $group: {
                            _id: null,
                            avg: { $avg: "$rating" }
                        }
                    }
                ]
            }
        }
    ]);
    const formatted = result[0];
    const total = ((_a = formatted.totalReview[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
    const avg = ((_b = formatted.averageRating[0]) === null || _b === void 0 ? void 0 : _b.avg) || 0;
    const totalPage = Math.ceil(total / limit);
    return {
        meta: {
            page,
            limit,
            total,
            totalPage
        },
        data: {
            reviews: formatted.data,
            averageRating: avg,
            totalReview: total
        }
    };
};
exports.ReviewService = {
    createReviewToDB,
    getReviewFromDB
};
