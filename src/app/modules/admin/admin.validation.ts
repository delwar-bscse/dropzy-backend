import { z } from 'zod';

export const createAdminZodValidationSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required',
            invalid_type_error: 'Name must be a string',
        }).min(1, { message: 'Name cannot be empty' }),
        email: z.string({
            required_error: 'Email is required',
            invalid_type_error: 'Email must be a string',
        }).email({ message: 'Invalid email format' }),

        role: z.enum(["ADMIN", "SUPER_ADMIN"], {
            required_error: 'Role is required',
            invalid_type_error: 'Role must be a string',
        }),
        
        password: z.string({
            required_error: 'Password is required',
            invalid_type_error: 'Password must be a string',
        }).min(6, { message: 'Password must be at least 6 characters long' })
    })
});