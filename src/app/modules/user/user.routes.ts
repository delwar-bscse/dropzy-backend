import express, { NextFunction, Response, Request } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
const router = express.Router();

router.route('/')
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.COURIER, USER_ROLES.SENDER),
        UserController.retrieveProfile
    )
    .delete(
        auth(USER_ROLES.COURIER, USER_ROLES.SENDER),
        UserController.deleteProfile
    )
    .post(
        validateRequest(UserValidation.createUserZodValidationSchema),
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
                const { accountInfo, coordinates, email, ...payload } = req.body;

                req.body = {
                    ...payload,
                    ...(profile && { profile }),
                    ...(imgFront && { imgFront }),
                    ...(imgBack && { imgBack }),
                    ...(coordinates && { coordinates: JSON.parse(coordinates) }),
                    ...(accountInfo && { accountInfo: JSON.parse(accountInfo) })
                };
                next();

            } catch (error) {
                console.log(error)
                res.status(500).json({ message: "Failed to Process Update Profile" });
            }
        },
        validateRequest(UserValidation.updateUserZodValidationSchema),
        UserController.updateProfile
    )

router.get('/all-users', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.getAllUsers);
router.patch('/delete-user/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.deleteUser);
router.patch('/active-block-user/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.activeBlockUser);
router.patch('/approve-user/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.approveUser);
router.delete('/decline-user/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), UserController.declineUser);

export const UserRoutes = router;