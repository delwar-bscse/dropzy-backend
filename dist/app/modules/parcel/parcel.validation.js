"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelValidation = void 0;
const zod_1 = require("zod");
const ReceiverSchema1 = zod_1.z.object({
    name: zod_1.z.string({ required_error: 'Name is required' }),
    countryCode: zod_1.z.string({ required_error: 'Country Code is required' }),
    phoneNumber: zod_1.z.string({ required_error: 'Phone Number is required' }),
});
const ReceiverSchema2 = zod_1.z.object({
    name: zod_1.z.string().optional(),
    countryCode: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
});
const CoordinatesSchema = zod_1.z.object({
    type: zod_1.z.literal("Point").optional(),
    coordinates: zod_1.z
        .array(zod_1.z.number())
        .length(2, "Coordinates must be [longitude, latitude]"),
});
// 1. Create Parcel Schema
const createParcelZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiver: ReceiverSchema1,
        length: zod_1.z.number({ required_error: 'Length is required' }).positive(),
        width: zod_1.z.number({ required_error: 'Width is required' }).positive(),
        height: zod_1.z.number({ required_error: 'Height is required' }).positive(),
        weight: zod_1.z.number({ required_error: 'Weight is required' }).positive(),
        pickup: zod_1.z.string({ required_error: 'Pickup is required' }),
        p_coordinates: CoordinatesSchema,
        destination: zod_1.z.string({ required_error: 'Destination is required' }),
        d_coordinates: CoordinatesSchema,
        distance: zod_1.z.number().positive().optional(),
        duration: zod_1.z.number().positive().optional(),
        price: zod_1.z.number({ required_error: 'Price is required' }).positive(),
        note: zod_1.z.string({ required_error: 'Note is required' }),
        images: zod_1.z.array(zod_1.z.string()).optional(),
    })
});
// 1. Create Parcel Schema
const updateParcelZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        receiver: ReceiverSchema2.optional(),
        length: zod_1.z.number().positive().optional(),
        width: zod_1.z.number().positive().optional(),
        height: zod_1.z.number().positive().optional(),
        weight: zod_1.z.number().positive().optional(),
        pickup: zod_1.z.string().optional(),
        p_coordinates: CoordinatesSchema.optional(),
        destination: zod_1.z.string().optional(),
        d_coordinates: CoordinatesSchema.optional(),
        distance: zod_1.z.number().positive().optional(),
        duration: zod_1.z.number().positive().optional(),
        price: zod_1.z.number().positive().optional(),
        note: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
        prevImages: zod_1.z.array(zod_1.z.string()).optional(),
    })
});
exports.ParcelValidation = {
    createParcelZodValidationSchema,
    updateParcelZodValidationSchema
};
