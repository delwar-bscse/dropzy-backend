import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReservationService } from "./reservation.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createReservation = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.createReservationToDB(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation created successfully",
        data: reservation
    })
}); 

const retrieveReservation = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.retrieveReservationFromDB(req.user, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation retrieved successfully",
        data: reservation
    })
}); 

const reservationDetails = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.retrieveReservationDetailsFromDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation details retrieved successfully",
        data: reservation
    })
}); 


const acceptReservation = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.acceptReservationToDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation accepted successfully",
        data: reservation
    })
}); 

const rejectReservation = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.rejectReservationToDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation rejected successfully",
        data: reservation
    })
});

const completeReservation = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.completeReservationToDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation completed successfully",
        data: reservation
    })
});

const successPayment = catchAsync(async (req: Request, res: Response) => {

    const reservation = await ReservationService.successPaymentToDB(req.query.intent as string, req.query.reservationId as string);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation completed successfully",
        data: reservation
    })
});

const failedPayment = catchAsync(async (req: Request, res: Response) => {
    const reservation = await ReservationService.failedPaymentToDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Reservation completed successfully",
        data: reservation
    })
});

export const ReservationController = {
    createReservation,
    
    acceptReservation,
    rejectReservation,
    completeReservation,

    retrieveReservation,
    reservationDetails,
    successPayment,
    failedPayment
}