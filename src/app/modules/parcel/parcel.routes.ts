import express, { NextFunction, Request, Response } from 'express';
import { ParcelController } from './parcel.controller';
import { ParcelValidation } from './parcel.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

router.route('/')
    .get(
        ParcelController.getParcels
    )
    .post(
        auth(USER_ROLES.SENDER),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // console.log("Files : ", req.files)
                const images = await getMultipleFilesPath(req.files, "images");
                const payload = JSON.parse(req.body.data);

                req.body = {
                    ...payload,
                    ...(images && { images }),
                };
                next();

            } catch (error) {
                console.log(error)
                res.status(500).json({ message: "Failed to Process Create Parcel" });
            }
        },
        validateRequest(ParcelValidation.createParcelZodValidationSchema),
        ParcelController.createParcel
    )

router.patch('/accept-parcel/:id', auth(USER_ROLES.COURIER), ParcelController.acceptParcel);
router.patch('/pickup-parcel/:id', auth(USER_ROLES.COURIER), ParcelController.pickupParcel);
router.patch('/leave-parcel/:id', auth(USER_ROLES.COURIER), fileUploadHandler(), ParcelController.leaveParcel);
router.patch('/accept-delivery/:id', auth(USER_ROLES.SENDER), ParcelController.acceptDelivery);
router.get('/get-all-parcels-for-admin', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ParcelController.getParcelsForAdmin);
router.get('/parcels-overview-for-admin', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ParcelController.parcelsOverview);
router.get('/my-parcels', auth(USER_ROLES.SENDER, USER_ROLES.COURIER), ParcelController.getMyParcels);

router.route('/:id')
    .get(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COURIER, USER_ROLES.SENDER),
        ParcelController.getParcel
    )
    .patch(
        auth(USER_ROLES.SENDER),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // console.log("Files : ", req.files)
                const images = await getMultipleFilesPath(req.files, "images");
                const payload = req.body.data && JSON.parse(req.body.data) || {};
                // console.log("Routes Data : ", payload)

                req.body = {
                    ...payload,
                    ...(images && { images })
                };
                next();

            } catch (error) {
                console.log(error)
                res.status(500).json({ message: "Failed to Process Create Parcel" });
            }
        },
        validateRequest(ParcelValidation.updateParcelZodValidationSchema),
        ParcelController.updateParcel
    )

export const ParcelRoutes = router;

/*
{
  "receiver": {
    "name": "Hossain",
    "countryCode": "+1",
    "phoneNumber": "5550123456"
  },
  "length": 10.5,
  "width": 8.0,
  "height": 5.2,
  "weight": 2.5,
  "pickup": "123 Warehouse Way, Tech City",
  "p_coordinates": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "destination": "456 Residential Ave, Suburbia",
  "d_coordinates": {
    "type": "Point",
    "coordinates": [-118.2437, 34.0522]
  },
  "distance": 380.5,
  "duration": 360,
  "price": 45.99,
  "note": "Handle with care, contains glassware."
}
  
{
  "prevImages": [
    "\\images\\user-1773744534859.jpg"
  ]
}
*/