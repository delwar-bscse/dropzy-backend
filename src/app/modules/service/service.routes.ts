import express, { NextFunction, Request, Response } from 'express';
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ServiceController } from "./service.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createServiceZodValidationSchema } from "./service.validation";
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';

const router = express.Router();

router.route("/")
    .post(
        auth(USER_ROLES.USER),
        async (req: Request, res: Response, next: NextFunction) => {
            try {

                // extact only price;
                const { price, ...restPayload } = req.body;

                // retrieved image through helper function
                const image = await getSingleFilePath(req.files, "image");

                req.body = {
                    ...restPayload,
                    author: req.user.id,
                    price: Number(price), // convert price to number
                    image
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Service");
            }
        },
        validateRequest(createServiceZodValidationSchema),
        ServiceController.createService
    )
    .get(
        auth(USER_ROLES.USER),
        ServiceController.retrieveService
    );

router.get("/all",
    auth(USER_ROLES.USER),
    ServiceController.retrieveAllService
)

router.route("/:id")
    .get(
        auth(USER_ROLES.USER),
        ServiceController.retrieveServiceDetails
    )
    .delete(
        auth(USER_ROLES.USER),
        ServiceController.deleteService
    )
    .patch(
        auth(USER_ROLES.USER),
        fileUploadHandler(),
        async(req: Request, res: Response, next: NextFunction) => {
            try {

                // extact only price;
                const { price, ...restPayload } = req.body;

                // retrieved image through helper function
                const image = await getSingleFilePath(req.files, "image");

                // pass all the data through the next middleware
                req.body = {
                    ...restPayload,
                    author: req.user.id,
                    price: price ?? Number(price), // convert price to number
                    image
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Service");
            }
        },
        ServiceController.updateService
    )

export const ServiceRoutes = router;