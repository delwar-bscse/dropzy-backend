import express from 'express';
import { NotificationController } from './notification.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

// get my notifications
router.get('/',
  auth(USER_ROLES.SENDER, USER_ROLES.COURIER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getMyNotifications
);

// get my notifications amount
router.get('/amount',
  auth(USER_ROLES.SENDER, USER_ROLES.COURIER,  USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  NotificationController.getUserNotificationAmount
);

export const NotificationRoutes = router;