"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const user_1 = require("../../../enums/user");
// 1. Create User Schema
const createUserZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'Name is required' }),
        email: zod_1.z.string({ required_error: 'Email is required' }).email({ message: 'Invalid email format' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
        role: zod_1.z.nativeEnum(user_1.USER_ROLES, { required_error: 'Role is required' })
    })
});
// Account Info
const accountInfoSchema = zod_1.z.object({
    status: zod_1.z.boolean().optional(),
    accountId: zod_1.z.string().optional(),
    externalAccountId: zod_1.z.string().optional(),
    accountUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
    accountHolderName: zod_1.z.string().optional(),
    iban: zod_1.z.string().optional(),
    landOfBank: zod_1.z.string().optional(),
    bankName: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    cardNumber: zod_1.z.string().optional(),
    twintNumber: zod_1.z.string().optional(),
});
// 2. User Schema
const updateUserZodValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        phoneNumber: zod_1.z.string().optional(),
        countryCode: zod_1.z.string().optional(),
        profile: zod_1.z.string().optional(),
        imgFront: zod_1.z.string().optional(),
        imgBack: zod_1.z.string().optional(),
        dob: zod_1.z.coerce.date().optional(),
        address: zod_1.z.string().optional(),
        coordinates: zod_1.z.array(zod_1.z.number()).optional(),
        landRegion: zod_1.z.string().optional(),
        city: zod_1.z.string().optional(),
        zipCode: zod_1.z.string().optional(),
        appId: zod_1.z.string().optional(),
        fcmToken: zod_1.z.array(zod_1.z.string()).optional(),
        accountInfo: accountInfoSchema.optional(),
    })
});
exports.UserValidation = {
    createUserZodValidationSchema,
    updateUserZodValidationSchema
};
