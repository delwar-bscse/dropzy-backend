import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IParcel } from './parcel.interface';
import { ParcelModel } from './parcel.model';
import { unlinkFiles } from "../../../shared/unlinkFile";

const createParcelToDB = async (senderId: string, payload: Partial<IParcel>): Promise<any> => {
    let message = '';
    let createParcel = {}

    const postedDate = new Date();

    const newPayload = {
        ...payload,
        sender: senderId,
        postedDate: postedDate,
        track_date: {
            posted: postedDate
        }
    }

    const parcel = await ParcelModel.create(newPayload);
    if (!parcel) {
        payload.images && unlinkFiles(payload.images);
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create parcel');
    }
    createParcel = parcel;
    message = 'Parcel created successfully';



    return {
        message,
        data: createParcel
    };
};

const updateParcelToDB = async (senderId: string, parcelId: string, payload: any): Promise<any> => {
    let message = '';
    let createParcel = {}

    const isExistParcel = await ParcelModel.findOne({ _id: parcelId, sender: senderId });
    if (!isExistParcel) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Parcel not found');
    }

    // console.log("Service payload :", payload)

    const { track_date, receiver, prevImages, images, ...rest } = payload;
    console.log("Service: Payload", { track_date, receiver, prevImages, images, rest })


    const newPayload = {
        ...rest,
        receiver: {
            name: receiver?.name ?? isExistParcel.receiver?.name,
            countryCode: receiver?.countryCode ?? isExistParcel.receiver?.countryCode,
            phoneNumber: receiver?.phoneNumber ?? isExistParcel.receiver?.phoneNumber
        },
        images: [
            ...(prevImages ? prevImages : []),
            ...(images ? images : [])
        ]
    }

    const parcel = await ParcelModel.findOneAndUpdate({ _id: parcelId, sender: senderId }, newPayload, { new: true });
    if (!parcel) {
        payload.images && unlinkFiles(payload.images);
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update parcel');
    }

    const deleteImages = isExistParcel.images?.filter((image: string) => !prevImages?.includes(image));
    if (deleteImages?.length) {
        unlinkFiles(deleteImages);
    }
    createParcel = parcel;
    message = 'Parcel updated successfully';



    return {
        message,
        data: createParcel
    };
};

const getParcelsFromDB = async (payload: any): Promise<any> => {
    const { p_lng, p_lat, d_lng, d_lat } = payload;

    const radius = 50 / 6378.1; // 50km in radians

    const parcels = await ParcelModel.aggregate([
        {
            $match: {
                status: "posted",

                p_coordinates: {
                    $geoWithin: {
                        $centerSphere: [[Number(p_lng), Number(p_lat)], radius],
                    },
                },

                d_coordinates: {
                    $geoWithin: {
                        $centerSphere: [[Number(d_lng), Number(d_lat)], radius],
                    },
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return {
        data: parcels,
    };
};

export const ParcelService = {
    createParcelToDB,
    updateParcelToDB,
    getParcelsFromDB
};