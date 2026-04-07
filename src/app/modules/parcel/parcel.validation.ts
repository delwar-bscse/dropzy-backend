import { z } from 'zod';

const ReceiverSchema1 = z.object({
    name: z.string({ required_error: 'Name is required' }),
    countryCode: z.string().optional(),
    phoneNumber: z.string({ required_error: 'Phone Number is required' }),
});

const ReceiverSchema2 = z.object({
    name: z.string().optional(),
    countryCode: z.string().optional(),
    phoneNumber: z.string().optional(),
});

const CoordinatesSchema = z.object({
    type: z.literal("Point").optional(),
    coordinates: z
        .array(z.number())
        .length(2, "Coordinates must be [longitude, latitude]"),
});

// 1. Create Parcel Schema
const createParcelZodValidationSchema = z.object({
    body: z.object({
        receiver: ReceiverSchema1,
        length: z.number({ required_error: 'Length is required' }).positive(),
        width: z.number({ required_error: 'Width is required' }).positive(),
        height: z.number({ required_error: 'Height is required' }).positive(),
        weight: z.number({ required_error: 'Weight is required' }).positive(),
        pickup: z.string({ required_error: 'Pickup is required' }),
        p_coordinates: CoordinatesSchema,
        destination: z.string({ required_error: 'Destination is required' }),
        d_coordinates: CoordinatesSchema,
        distance: z.number().positive().optional(),
        duration: z.number().positive().optional(),
        price: z.number({ required_error: 'Price is required' }).positive(),
        note: z.string({ required_error: 'Note is required' }),
        images: z.array(z.string()).optional(),
    })
});

// 1. Create Parcel Schema
const updateParcelZodValidationSchema = z.object({
    body: z.object({
        receiver: ReceiverSchema2.optional(),
        length: z.number().positive().optional(),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        weight: z.number().positive().optional(),
        pickup: z.string().optional(),
        p_coordinates: CoordinatesSchema.optional(),
        destination: z.string().optional(),
        d_coordinates: CoordinatesSchema.optional(),
        distance: z.number().positive().optional(),
        duration: z.number().positive().optional(),
        price: z.number().positive().optional(),
        note: z.string().optional(),
        images: z.array(z.string()).optional(),
        prevImages: z.array(z.string()).optional(),
    })
});

export const ParcelValidation = {
    createParcelZodValidationSchema,
    updateParcelZodValidationSchema
}