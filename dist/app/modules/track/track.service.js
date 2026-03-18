"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackService = void 0;
const track_model_1 = require("./track.model");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_codes_1 = require("http-status-codes");
const createTrackToDB = async (payload) => {
    const isExistTrack = await track_model_1.TrackModel.findOne({
        courier: payload.courier,
    }).lean();
    if (isExistTrack) {
        return isExistTrack;
    }
    const track = await track_model_1.TrackModel.create({
        courier: payload.courier,
        location: payload.location,
        coordinates: payload.coordinates
    });
    return track;
};
const updateTrackToDB = async ({ id, payload }) => {
    const track = await track_model_1.TrackModel.findOneAndUpdate({ courier: id }, payload, { new: true }).lean();
    if (!track) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Track doesn't exist!");
    }
    const io = global.io;
    if (io) {
        io.emit(`track::${id}`, track);
    }
    return track;
};
const retrievedTrackToDB = async (payload) => {
    const isExistTrack = await track_model_1.TrackModel.findOne({
        courier: payload.courier,
    }).lean();
    if (!isExistTrack) {
        throw new ApiErrors_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Track doesn't exist!");
    }
    return isExistTrack;
};
exports.TrackService = { createTrackToDB, retrievedTrackToDB, updateTrackToDB };
