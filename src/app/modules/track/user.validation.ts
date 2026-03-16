import { z } from 'zod';

const updateTrackZodValidationSchema = z.object({
    body: z.object({
        location: z.string({
            required_error: 'Location is required',
            invalid_type_error: 'Location must be a string'
        }).min(1, 'Location cannot be empty').optional(),
        coordinates: z.tuple([z.number(), z.number()], {
            required_error: 'Coordinates are required',
            invalid_type_error: 'Coordinates must be an array of two numbers'
        }),
    }).strict()
});

export const TrackValidation = {
    updateTrackZodValidationSchema
};