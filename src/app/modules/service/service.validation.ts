import { z } from 'zod'
import { checkValidID } from '../../../shared/checkValidID'


export const createServiceZodValidationSchema = z.object({
    body: z.object({

        title: z.string({
            required_error: "Title is required",
            invalid_type_error: "Title must be a string"
        }).min(1, "Title not be Empty"),

        category: checkValidID("Category Object ID is required"),

        image: z.string({
            required_error: "Image is required",
            invalid_type_error: "Image must be a string"
        }).min(1, "Image not be Empty"),

        price: z.number({
            required_error: "Price is required",
            invalid_type_error: "Price must be a number"
        }),
        
        description: z.string({
            required_error: "Description is required",
            invalid_type_error: "Description must be a string"
        }).min(1, "Description not be Empty"),
    })
})