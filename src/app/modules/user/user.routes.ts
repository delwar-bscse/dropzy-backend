import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getMultipleFilesPath, getSingleFilePath } from '../../../shared/getFilePath';
const router = express.Router();

router.get(
    '/profile',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    UserController.getUserProfile
);

router.post(
    '/create-admin',
    validateRequest(UserValidation.createAdminZodSchema),
    UserController.createAdmin
);

router
    .route('/')
    .post(
        UserController.createUser
    )
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                
                const profile = await getSingleFilePath(req.files, "image");
                // console.log(profile)
                req.body = { ...req.body, profile };
                next();

            } catch (error) {
                console.log(error)
                res.status(500).json({ message: "Failed to Convert string to number" });
            }
        },
        UserController.updateProfile
    );

export const UserRoutes = router;