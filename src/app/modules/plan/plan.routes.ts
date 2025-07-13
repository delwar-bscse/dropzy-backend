import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PlanController } from "./plan.controller";
import validateRequest from "../../middlewares/validateRequest";
import { createPlanZodValidationSchema } from "./plan.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
const router = express.Router()

router.route("/")
    .post(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), 
        fileUploadHandler(), 
        (req: Request, res: Response, next: NextFunction): void=>{

            try {
                const { price, ...restPayload} = req.body;

                req.body = {
                    price: Number(price), // convert string to number
                    ...restPayload
                };

                next();

            } catch (error: any) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to process Plan", error)
            }
        },
        validateRequest(createPlanZodValidationSchema), 
        PlanController.createPlan
    )
    .get(PlanController.retrievePlan)

router.route("/:id")
    .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PlanController.updatePlan)
    .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), PlanController.deletePlan)

export const PlanRoutes = router;