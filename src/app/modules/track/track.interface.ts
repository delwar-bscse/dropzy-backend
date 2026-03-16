import { Model, Types } from 'mongoose';

export type ITrack = {
    _id?: Types.ObjectId;
    courier: Types.ObjectId;
    senders: [Types.ObjectId];
    location: string;
    coordinates: [number, number];
}

export type ITrackModel = Model<ITrack, Record<string, unknown>>;