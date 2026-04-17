import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FavListController } from './favList.controller';
import { FavListValidation } from './favList.validation';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.COURIER),
    FavListController.getFavList
  )
  .post(
    auth(USER_ROLES.COURIER),
    validateRequest(FavListValidation.favListZodSchema),
    FavListController.createFavList
  );

router
  .route('/fav-list-with-details')
  .get(
    auth(USER_ROLES.COURIER),
    FavListController.getFavListWithDetails
  )


export const FavListRoutes = router;