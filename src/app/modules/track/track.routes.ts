import express from 'express';
import auth from '../../middlewares/auth';
import { TrackController } from './track.controller';
import { USER_ROLES } from '../../../enums/user';
import { TrackValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.route("/")
    .get(
        auth(USER_ROLES.COURIER, USER_ROLES.SENDER),
        TrackController.getTrack
    )
.patch(
    auth(USER_ROLES.COURIER),
    validateRequest(TrackValidation.updateTrackZodValidationSchema),
    TrackController.updateTrack
);

export const TrackRoutes = router;
