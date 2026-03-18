import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SENDER),
    validateRequest(ReviewValidation.reviewZodSchema),
    ReviewController.createReview
  )
  .get(
    auth(USER_ROLES.COURIER),
    ReviewController.getMyReviews
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SENDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ReviewController.getCourierReviews
  )


export const ReviewRoutes = router;