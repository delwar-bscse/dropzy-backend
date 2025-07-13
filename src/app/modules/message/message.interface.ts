import { Model, Types } from 'mongoose';

export type IMessage = {
    _id?: Types.ObjectId;
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    text?: string;
    image?: string;
};

export type MessageModel = Model<IMessage, Record<string, unknown>>;