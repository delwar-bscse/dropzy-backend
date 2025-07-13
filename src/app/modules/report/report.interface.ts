import { Model, Types } from "mongoose";

export type IReport = {
    _id?: Types.ObjectId;
    author: Types.ObjectId;
    provider: Types.ObjectId;
    reservation: Types.ObjectId;
    reason: [];
};

export type ReportModel = Model<IReport, Record<string, unknown>>;