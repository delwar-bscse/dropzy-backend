import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ReservationController } from "./reservation.controller";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import validateRequest from "../../middlewares/validateRequest";
import { reservationZodValidationSchema } from "./reservation.validation";
const router = express.Router();

router.route("/")
    .post(
        auth(USER_ROLES.USER),
        (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = { ...req.body, author: req.user.id };
                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Reservation");
            }
        },
        validateRequest(reservationZodValidationSchema),
        ReservationController.createReservation
    )
    .get(
        auth(USER_ROLES.USER), 
        ReservationController.retrieveReservation
    )
    .patch(
        auth(USER_ROLES.USER),
        ReservationController.acceptReservation
    )
    .delete(
        auth(USER_ROLES.USER),
        ReservationController.rejectReservation
    )
    .put(
        auth(USER_ROLES.USER),
        ReservationController.completeReservation
    );

router.get("/success",
    auth(USER_ROLES.USER),
    ReservationController.successPayment
);

router.get("/failed/:id",
    auth(USER_ROLES.USER),
    ReservationController.failedPayment
);

router.route("/:id")
    .get(
        auth(USER_ROLES.USER),
        ReservationController.reservationDetails
    )
    .delete(
        auth(USER_ROLES.USER),
        ReservationController.cancelReservation
    );

export const ReservationRoutes = router;