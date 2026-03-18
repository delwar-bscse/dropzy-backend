"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelModel = void 0;
const mongoose_1 = require("mongoose");
const parcel_1 = require("../../../enums/parcel");
// --- Sub-Schemas ---
const ReceiverSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
}, { _id: false });
const TrackDateSchema = new mongoose_1.Schema({
    posted: { type: Date },
    accepted: { type: Date },
    on_the_way: { type: Date },
    delivered: { type: Date },
}, { _id: false });
// --- Main Schema ---
const ParcelSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courier: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: ReceiverSchema,
        required: true,
    },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    pickup: { type: String, required: true },
    p_coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (val) => val.length === 2,
                message: "Coordinates must be [longitude, latitude]"
            }
        }
    },
    destination: { type: String, required: true },
    d_coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (val) => val.length === 2,
                message: "Coordinates must be [longitude, latitude]"
            }
        }
    },
    distance: { type: Number },
    duration: { type: Number },
    price: { type: Number, required: true },
    postedDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    paymentStatus: {
        type: String,
        enum: Object.values(parcel_1.PaymentStatus),
        default: parcel_1.PaymentStatus.UNPAID,
    },
    status: {
        type: String,
        enum: Object.values(parcel_1.ParcelStatus),
        default: parcel_1.ParcelStatus.POSTED,
    },
    sendDeliveryRequest: { type: Boolean, default: false },
    note: { type: String, default: '' },
    images: { type: [String], default: [] },
    proofImage: { type: String },
    track_date: {
        type: TrackDateSchema,
        default: () => ({}),
    },
}, {
    timestamps: true,
});
// --- Static Method ---
ParcelSchema.statics.isExistParcelById = async function (id) {
    return await this.findById(id);
};
// --- Model ---
ParcelSchema.index({ p_coordinates: "2dsphere" });
ParcelSchema.index({ d_coordinates: "2dsphere" });
exports.ParcelModel = (0, mongoose_1.model)('Parcel', ParcelSchema);
