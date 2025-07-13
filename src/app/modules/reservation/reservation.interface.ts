import { Model, Types } from "mongoose"

export type IReservation = {
    _id?: Types.ObjectId;
    author: Types.ObjectId;
    provider: Types.ObjectId;
    service: Types.ObjectId;
    price: number;
    txid: string;
    stripeIntent: string;
    paymentStatus: "Pending" | "Paid" | "Refunded";
    status: "Upcoming" | "Accepted" | "Rejected" | "Canceled" | "Completed";
}

export type ReservationModel = Model<IReservation, Record<string, unknown>>;