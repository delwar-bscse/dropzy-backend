"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackModel = void 0;
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    senders: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    courier: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
}, { timestamps: true });
exports.TrackModel = (0, mongoose_1.model)('Track', chatSchema);
