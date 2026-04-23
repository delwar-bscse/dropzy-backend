import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { WithdrawController } from './withdraw.controller';
const router = express.Router();

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), WithdrawController.getTransactions);
router.get("/my-withdraw", auth(USER_ROLES.COURIER), WithdrawController.getMyTransactions)

export const WithdrawRoutes = router;