import { Model, Types } from 'mongoose';
import { ParcelStatus, PaymentStatus } from '../../../enums/parcel';

export interface IReceiver {
    name: string;
    countryCode: string;
    phoneNumber: string;
}

export interface ITrackDate {
    posted?: Date;
    accepted?: Date;
    on_the_way?: Date;
    delivered?: Date;
}

interface ICoordinates {
    type: string;
    coordinates: [number, number];
};

export interface IParcel {
    _id?: Types.ObjectId;
    trackId: string;
    sender: Types.ObjectId;
    courier?: Types.ObjectId;
    receiver: IReceiver;
    length: number;
    width: number;
    height: number;
    weight: number;
    pickup: string;
    p_coordinates: ICoordinates;
    destination: string;
    d_coordinates: ICoordinates;
    distance?: number;
    duration?: number;
    price: number;
    note: string;
    postedDate: Date;
    deliveryDate: Date;
    paymentStatus?: PaymentStatus;
    status?: ParcelStatus;
    sendDeliveryRequest: boolean;
    images?: string[];
    proofImage?: string;
    track_date?: ITrackDate;
    isFavorite?: boolean;
}

export type TParcelModal = {
    isExistParcelById(id: string): any;
} & Model<IParcel>;