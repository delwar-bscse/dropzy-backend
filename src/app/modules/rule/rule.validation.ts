import { z } from 'zod'

// create privacy policy
const createPrivacyPolicyZodSchema = z.object({
    body: z.object({
        content: z.string({ required_error: 'Privacy policy is required' }),
    }),
})

// update privacy policy
const updatePrivacyPolicyZodSchema = z.object({
    body: z.object({
        content: z.string().optional(),
    }),
})

// create terms and condition
const createTermsAndConditionZodSchema = z.object({
    body: z.object({
        content: z.string({ required_error: 'Terms and conditions is required' }),
    }),
})

// update terms and condition
const updateTermsAndConditionZodSchema = z.object({
    body: z.object({
        content: z.string().optional(),
    }),
})

// create about
const createAboutZodSchema = z.object({
    body: z.object({
        content: z.string({ required_error: 'About is required' }),
    }),
})

// update about
const updateAboutZodSchema = z.object({
    body: z.object({
        content: z.string().optional(),
    }),
})

export const RuleValidation = {
    createPrivacyPolicyZodSchema,
    updatePrivacyPolicyZodSchema,
    createAboutZodSchema,
    updateAboutZodSchema,
    createTermsAndConditionZodSchema,
    updateTermsAndConditionZodSchema,
}