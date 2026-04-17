import { z } from 'zod';

const favListZodSchema = z.object({
  body: z.object({
    parcelId: z.string({ required_error: 'Parcel ID is required'})
  }),
});

export const FavListValidation = {
  favListZodSchema
};