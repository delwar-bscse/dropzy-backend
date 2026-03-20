import express from 'express';
import { PriceController } from './price.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PriceValidation } from './user.validation';

const router = express.Router();

router.route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    PriceController.addPrice,
  )
  .get(PriceController.getPrice)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(PriceValidation.updatePriceZodValidationSchema),
    PriceController.updatePrice
  );

router.get('/calculate-price', 
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SENDER),
  validateRequest(PriceValidation.calculatePriceZodValidationSchema),
  PriceController.calculatePrice
);

export const PriceRoutes = router;
