import { model, Schema } from "mongoose";
import { IReport, ReportModel } from "./report.interface";

const reportSchema = new Schema<IReport, ReportModel>(
    {
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        provider: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        reservation: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Reservation"
        },
        reason: [
            {
                type: String,
                required: true
            }
        ]
    },
    { timestamps: true }
);

export const Report = model<IReport, ReportModel>("Report", reportSchema);