import express,  { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { BannerController } from "./banner.controller";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import { getSingleFilePath } from "../../../shared/getFilePath";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
const router = express.Router();

router.route('/')
    .post(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
        fileUploadHandler(), 
       async (req: Request, res: Response, next: NextFunction) => {
            try {
                const image = await getSingleFilePath(req.files, 'image');

                req.body = {
                    ...req.body,
                    image: image
                };
                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Category");
            }
        },
        BannerController.createBanner
    )
    .get(
        auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
        BannerController.retrieveBanner
    );

router.route('/:id')
    .patch(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
        fileUploadHandler(), 
        async(req: Request, res: Response, next: NextFunction) => {
            try {
                const image = await getSingleFilePath(req.files, 'image');

                req.body = {
                    ...req.body,
                    image: image
                };
                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Category");
            }
        },
        BannerController.updateBanner
    )
    .delete(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), 
        BannerController.deleteBanner
    );


export const BannerRoutes = router;