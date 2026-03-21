import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { TransactionController } from './transaction.controller';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.COURIER, USER_ROLES.SENDER),
    TransactionController.getMyTransactions
  )
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TransactionController.createTransaction
  )

  router.get('/all-transactions', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TransactionController.getTransactions);


export const TransactionRoutes = router;