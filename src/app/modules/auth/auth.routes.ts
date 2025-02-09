import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';
import passport from '../../../config/passport'
const router = express.Router();

router.post(
    '/login',
    validateRequest(AuthValidation.createLoginZodSchema),
    AuthController.loginUser
);

router.post(
    '/forgot-password',
    validateRequest(AuthValidation.createForgetPasswordZodSchema),
    AuthController.forgetPassword
);

router.post(
    '/refresh-token',
    AuthController.newAccessToken
);

router.post(
    '/resend-otp',
    AuthController.resendVerificationEmail
);

router.post(
    '/verify-email',
    async (req: Request, res: Response, next: NextFunction) => {

        try {
            const { email, oneTimeCode } = req.body;

            req.body = { email, oneTimeCode: Number(oneTimeCode)};
            next();

        } catch (error) {
            res.status(500).json({ message: "Failed to convert string to number" });
        }
    },
    validateRequest(AuthValidation.createVerifyEmailZodSchema),
    AuthController.verifyEmail
);

router.post(
    '/reset-password',
    validateRequest(AuthValidation.createResetPasswordZodSchema),
    AuthController.resetPassword
);

router.post(
    '/change-password',
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest(AuthValidation.createChangePasswordZodSchema),
    AuthController.changePassword
);

router.post(
    '/resend-otp',
    AuthController.resendVerificationEmail
);

router.post(
    '/social-login',
    AuthController.socialLogin
);

router.delete(
    '/delete-account',
    auth(USER_ROLES.ADMIN),
    AuthController.deleteUser
);


// Google Auth Routes
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
    const role = req.query.role as string;

    if (!role || (role !== "INFLUENCER" && role !== "BRAND")) {
        res.status(400).json({ error: "Invalid role" });
    }

    // Store the role in the session or state
    req.body.role = role;

    // Initiate authentication
    passport.authenticate("google", { 
        scope: ["profile", "email"], 
        state: role
    })(req, res, next);
});


router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/"); // Redirect after successful login
    }
);

export const AuthRoutes = router;