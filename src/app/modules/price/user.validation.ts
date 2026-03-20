import { z } from 'zod';

// 1. Create User Schema
const updatePriceZodValidationSchema = z.object({
    body: z.object({
        basePrice: z.number().optional(),
        freeWeight: z.number().optional(),
        freeDimension: z.number().optional(),
        weightRate: z.number().optional(),
        dimensionRate: z.number().optional(),
    })
});

const calculatePriceZodValidationSchema = z.object({
  query: z.object({
    weight: z.coerce
      .number()
      .positive("Weight must be positive")
      .max(1000, "Weight too large"),

    dimension: z.coerce
      .number()
      .positive("Dimension must be positive")
      .max(500, "Dimension too large"),
  }),
});


export const PriceValidation = {
    updatePriceZodValidationSchema,
    calculatePriceZodValidationSchema
}