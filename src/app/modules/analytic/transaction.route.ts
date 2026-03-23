import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { AnalyticController } from './analytic.controller';
const router = express.Router();

router.get('/admin-overview', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AnalyticController.overView);
router.get('/admin-revenue', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AnalyticController.getRevenues);
router.get('/admin-parcels', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AnalyticController.getParcels);
router.get('/admin-users', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), AnalyticController.getUsers);
router.get('/my-progress', auth(USER_ROLES.COURIER), AnalyticController.getMyProgress);

export const AnalyticRoutes = router;