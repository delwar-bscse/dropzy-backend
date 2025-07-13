import { Model, Types } from 'mongoose';

export type ICategory = {
    _id?: Types.ObjectId;
    name: string;
    image: string;
}

export type CategoryModel = Model<ICategory, Record<string, unknown>>