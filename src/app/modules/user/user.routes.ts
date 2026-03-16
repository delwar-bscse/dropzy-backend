import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { createUserZodValidationSchema, updateUserZodValidationSchema, UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
import z from 'zod';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COURIER, USER_ROLES.SENDER),
        UserController.retrieveProfile
    )
    .post(
        validateRequest(createUserZodValidationSchema),
        UserController.createUser
    )
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COURIER, USER_ROLES.SENDER),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // console.log("Files : ", req.files)
                const profile = await getSingleFilePath(req.files, "profile");
                const imgFront = await getSingleFilePath(req.files, "imgFront");
                const imgBack = await getSingleFilePath(req.files, "imgBack");

                console.log("Account info : ", req.body.accountInfo)
                const { accountInfo, email, ...payload } = req.body;
                
                req.body = { 
                    ...payload, 
                    ...(profile && { profile }), 
                    ...(imgFront && { imgFront }), 
                    ...(imgBack && { imgBack }), 
                    ...(accountInfo && { accountInfo:JSON.parse(accountInfo) })
                };
                next();

            } catch (error) {
                console.log(error)
                res.status(500).json({ message: "Failed to Process Update Profile" });
            }
        },
        validateRequest(UserValidation.updateUserZodValidationSchema),
        UserController.updateProfile
    );

export const UserRoutes = router;