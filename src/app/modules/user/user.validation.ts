import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

// 2. Create User Schema
export const createUserZodValidationSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.nativeEnum(USER_ROLES,{required_error:'Role is required'})
    })
});

// 1. Account Info Schema
const accountInfoSchema = z.object({
    status: z.boolean().optional(),
    accountId: z.string().optional(),
    externalAccountId: z.string().optional(),
    accountUrl: z.string().url().optional().or(z.literal('')),
    accountHolderName: z.string().optional(),
    iban: z.string().optional(),
    landOfBank: z.string().optional(),
    bankName: z.string().optional(),
    currency: z.string().optional(),
    cardNumber: z.string().optional(),
    twintNumber: z.string().optional(),
});

// 3. User Schema
export const updateUserZodValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        phoneNumber: z.string().optional(),
        countryCode: z.string().optional(),
        profile: z.string().optional(),
        imgFront: z.string().optional(),
        imgBack: z.string().optional(),
        dob: z.coerce.date().optional(),
        address: z.string().optional(),
        coordinates: z.array(z.number()).optional(),
        landRegion: z.string().optional(),
        city: z.string().optional(),
        zipCode: z.string().optional(),
        appId: z.string().optional(),
        fcmToken: z.array(z.string()).optional(),
        accountInfo: accountInfoSchema.optional(),
    })
});

export const UserValidation = {
    createUserZodValidationSchema,
    updateUserZodValidationSchema
}