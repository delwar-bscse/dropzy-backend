import { JwtPayload } from "jsonwebtoken";
import { IReservation } from "./reservation.interface";
import { Reservation } from "./reservation.model";
import { StatusCodes } from "http-status-codes";
import mongoose, { FilterQuery } from "mongoose";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import QueryBuilder from "../../../helpers/QueryBuilder";
import ApiError from "../../../errors/ApiErrors";
import { checkMongooseIDValidation } from "../../../shared/checkMongooseIDValidation";
import { Service } from "../service/service.model";
import stripe from "../../../config/stripe";
import config from "../../../config";

const createReservationToDB = async (payload: IReservation): Promise<string> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        
        const service = await Service.findById(payload.service).lean().exec();
        if (!service) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to find service');
        }

        payload.price = Number(service.price);
        payload.provider = service.author;

        const [reservation] = await Reservation.create([payload], { session });
        if (!reservation) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create reservation');
        }

        await sendNotifications({
            text: 'Someone has submitted a reservation',
            receiver: payload.provider,
            referenceId: reservation._id,
            screen: 'RESERVATION'
        }, session);

        
        await session.commitTransaction();
        session.endSession();

        const line_items = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: service.title as string || 'Reservation Service'
                    },
                    unit_amount: Math.ceil(Number(service.price) * 100),
                },
                quantity: 1,
            },
        ];

        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `http://${config.ip_address}:${config.port}/api/v1/reservation/success?intent={CHECKOUT_SESSION_ID}&reservationId=${reservation._id}`,
            cancel_url: `http://${config.ip_address}:${config.port}/api/v1/reservation/failed/${reservation._id}`,
        });

        if (!checkoutSession.url) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create checkout session');
        }

        return checkoutSession.url;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to process reservation');
    }
};


const successPaymentToDB = async (reservationId: string, checkoutSessionId: string): Promise<IReservation> => {

    checkMongooseIDValidation(reservationId, "Reservation");

    const reservation = await Reservation.findOneAndUpdate(
        { _id: reservationId },
        { $set: { paymentStatus: "Paid", stripeIntent: checkoutSessionId } },
        { new: true }
    ).lean().exec();

    if (!reservation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to find reservation');
    }

    return reservation;
}


const failedPaymentToDB = async (reservationId: string): Promise<IReservation> => {

    checkMongooseIDValidation(reservationId, "Reservation");

    const reservation = await Reservation.findByIdAndDelete(reservationId).lean().exec();

    if (!reservation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to find reservation');
    }

    return reservation;
}

const retrieveReservationFromDB = async (user: JwtPayload, query: FilterQuery<IReservation>): Promise<{ reservations: IReservation[], pagination: any }> => {

    const ReservationQuery = new QueryBuilder(
        Reservation.find({ $or: [{ provider: user?.id }, { author: user?.id }] }).lean().exec(),
        query
    ).paginate().filter();

    // Dynamically define the fields to populate
    const populateFields = [
        { path: "service", select: "title category image rating totalRating" },
        { path: user.role === "PROVIDER" ? "author" : "provider", select: "name profile email" }
    ];

    const [reservations, pagination] = await Promise.all([
        ReservationQuery.queryModel.populate(populateFields).sort({ createdAt: -1 }),
        ReservationQuery.getPaginationInfo(),
    ])

    return { reservations, pagination };
}

const retrieveReservationDetailsFromDB = async (id: string): Promise<IReservation | null> => {

    checkMongooseIDValidation(id, "Reservation");

    const reservation = await Reservation.findById(id).lean().exec();

    if (!reservation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to find reservation');
    }

    return reservation;
}

const acceptReservationToDB = async (id: string): Promise<IReservation | null> => {

    checkMongooseIDValidation(id, "Reservation");


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const updatedReservation = await Reservation.findOneAndUpdate(
            { _id: id },
            { $set: { status: "Accepted" } },
            { new: true, session },
        );

        if (!updatedReservation) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update reservation');
        }

        const data = {
            text: "Your reservation has been Accepted. Your service will start soon",
            receiver: updatedReservation.author,
            referenceId: id,
            screen: "RESERVATION"
        }

        sendNotifications(data, session);

        await session.commitTransaction();
        session.endSession();

        return updatedReservation;

    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to Process Reservation');
    } finally {
        session.endSession();
    }
}

const rejectReservationToDB = async (id: string): Promise<IReservation | null> => {

    checkMongooseIDValidation(id, "Reservation");


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const updatedReservation = await Reservation.findOneAndUpdate(
            { _id: id },
            { $set: { status: "Rejected" } },
            { new: true, session },
        );

        if (!updatedReservation) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update reservation');
        }

        const data = {
            text: "Your reservation has been Rejected.",
            receiver: updatedReservation.author,
            referenceId: id,
            screen: "RESERVATION"
        }

        sendNotifications(data, session);

        await session.commitTransaction();
        session.endSession();

        return updatedReservation;

    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to Process Reservation');
    } finally {
        session.endSession();
    }
}

const completeReservationToDB = async (id: string): Promise<IReservation | null> => {

    checkMongooseIDValidation(id, "Reservation");


    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const updatedReservation = await Reservation.findOneAndUpdate(
            { _id: id },
            { $set: { status: "Completed" } },
            { new: true, session },
        );

        if (!updatedReservation) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Failed to update reservation');
        }

        const data = {
            text: "Your reservation has been Completed.",
            receiver: updatedReservation.provider,
            referenceId: id,
            screen: "RESERVATION"
        }

        sendNotifications(data, session);

        await session.commitTransaction();
        session.endSession();

        return updatedReservation;

    } catch (error) {
        session.abortTransaction();
        session.endSession();
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to Process Reservation');
    } finally {
        session.endSession();
    }
}


export const ReservationService = {
    createReservationToDB,
    retrieveReservationFromDB,
    retrieveReservationDetailsFromDB,
    acceptReservationToDB,
    rejectReservationToDB,
    completeReservationToDB,
    successPaymentToDB,
    failedPaymentToDB
}