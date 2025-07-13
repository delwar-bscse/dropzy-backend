import { Model, Types } from "mongoose";

export type IBookmark= {
    _id?: Types.ObjectId;
    user: Types.ObjectId,
    service: Types.ObjectId
}

export type BookmarkModel = Model<IBookmark>;