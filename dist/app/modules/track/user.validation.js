"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackValidation = void 0;
const zod_1 = require("zod");
const updateTrackZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        location: zod_1.z.string({
            required_error: 'Location is required',
            invalid_type_error: 'Location must be a string'
        }).min(1, 'Location cannot be empty').optional(),
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()], {
            required_error: 'Coordinates are required',
            invalid_type_error: 'Coordinates must be an array of two numbers'
        }),
    }).strict()
});
exports.TrackValidation = {
    updateTrackZodValidationSchema
};
