import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { createAdminZodValidationSchema } from './admin.validation';
const router = express.Router();

router.route("/")
    .post(
        auth(USER_ROLES.SUPER_ADMIN),
        validateRequest(createAdminZodValidationSchema),
        AdminController.createAdmin
    )
    .get(
        auth(USER_ROLES.SUPER_ADMIN),
        AdminController.retrieveAdmins
    )
    .delete(
        auth(USER_ROLES.SUPER_ADMIN),
        AdminController.deleteAdmin
    )

export const AdminRoutes = router;