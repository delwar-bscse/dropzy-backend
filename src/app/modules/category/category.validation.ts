import { z } from 'zod'

export const createCategoryZodValidationSchema = z.object({
    body: z.object({

        name: z.string({
            required_error: 'Category name is required',
            invalid_type_error: 'Category name must be a string',
        }).min(1, { message: 'Category name cannot be empty' }),

        image: z.string({
            required_error: 'Category image is required',
            invalid_type_error: 'Category image must be a string',
        }).min(1, { message: 'Category image cannot be empty' })

    })
});