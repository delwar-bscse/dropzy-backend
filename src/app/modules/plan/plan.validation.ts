import { z } from 'zod';

export const createPlanZodValidationSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        }).min(1, { message: "Name cannot be empty" }),

        description: z.string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string",
        }).min(1, { message: "Description cannot be empty" }),

        price: z.number({
            required_error: "Price is required",
            invalid_type_error: "Price must be a number",
        }),

        duration: z.enum(["1 month", "3 months", "6 months", "1 year"], {
            required_error: "Duration is required",
            invalid_type_error: "Duration must be one of the predefined options",
        }),

        paymentType: z.enum(["Monthly", "Yearly"], {
            required_error: "Payment type is required",
            invalid_type_error: "Payment type must be one of the predefined options",
        })
    })

});