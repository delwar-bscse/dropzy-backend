import { z } from 'zod';

const reviewZodSchema = z.object({
  body: z.object({
    parcel: z.string({ required_error: 'Parcel id is required' }),
    rating: z.number({ required_error: 'Rating is required' }),
    comment: z.string({ required_error: 'Comment is required' }),
  }),
});

export const ReviewValidation = {
  reviewZodSchema,
};