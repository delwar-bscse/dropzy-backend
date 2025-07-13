import { Schema, model } from "mongoose";
import { IReservation, ReservationModel } from "./reservation.interface";
import { randomBytes } from "crypto";

const ReservationSchema = new Schema<IReservation, ReservationModel>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },
        status: {
            type: String,
            enum: ["Upcoming", "Accepted", "Rejected", "Canceled", "Completed"],
            default: "Upcoming",
            required: true
        },
        paymentStatus: {
            type: String,
            enum: [ "Pending", "Paid", "Refunded"],
            default: "Pending"
        },
        price: {
            type: Number,
            required: true
        },
        stripeIntent: {
            type: String,
            required: true
        },
        txid: {
            type: String,
            unique: true,
            index: true
        }

    },
    { timestamps: true }
);


ReservationSchema.index({ author: 1 });
ReservationSchema.index({ provider: 1 });
ReservationSchema.index({ service: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ paymentStatus: 1 });

ReservationSchema.pre("save", async function (next) {
    const reservation = this;

    if (reservation.isNew && !reservation.txid) {
        const prefix = "tx_";
        const uniqueId = randomBytes(8).toString("hex");
        reservation.txid = `${prefix}${uniqueId}`;
    }

    next();
});

export const Reservation = model<IReservation, ReservationModel>("Reservation", ReservationSchema);