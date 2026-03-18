import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IParcel } from './parcel.interface';
import { ParcelModel } from './parcel.model';
import { unlinkFile, unlinkFiles } from "../../../shared/unlinkFile";
import { UserModel } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import { ParcelStatus } from "../../../enums/parcel";

// create parcel to db
const createParcelToDB = async (senderId: string, payload: Partial<IParcel>): Promise<any> => {
    try {
        const postedDate = new Date();

        const isExistSender = await UserModel.findOne({ _id: senderId, role: USER_ROLES.SENDER });
        if (!isExistSender) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Sender not found');
        }

        const newPayload = {
            ...payload,
            sender: senderId,
            postedDate: postedDate,
            status: ParcelStatus.POSTED,
            track_date: {
                [ParcelStatus.POSTED]: postedDate
            }
        }

        const parcel = await ParcelModel.create(newPayload);
        if (!parcel) {
            payload.images && unlinkFiles(payload.images);
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create parcel');
        }

        return {
            message: 'Parcel created successfully',
            data: parcel.toObject()
        };
    } catch (error: any) {
        payload.images && unlinkFiles(payload.images);
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

// update parcel to db
const updateParcelToDB = async (senderId: string, parcelId: string, payload: any): Promise<any> => {
    try {
        const isExistParcel = await ParcelModel.findOne({ _id: parcelId, sender: senderId });
        if (!isExistParcel) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Parcel not found');
        }

        if (isExistParcel.status !== ParcelStatus.POSTED) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Parcel is not in POSTED status');
        }

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

        const parcel = await ParcelModel.findOneAndUpdate({ _id: parcelId, sender: senderId }, newPayload, { new: true }).lean();
        if (!parcel) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update parcel');
        }

        const deleteImages = isExistParcel.images?.filter((image: string) => !prevImages?.includes(image));
        if (deleteImages?.length) {
            unlinkFiles(deleteImages);
        }

        return {
            message: 'Parcel updated successfully',
            data: parcel
        };
    } catch (error: any) {
        payload.images && unlinkFiles(payload.images);
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

// get all parcels from db
const getParcelsFromDB = async (payload: any): Promise<any> => {
    const { p_lng, p_lat, d_lng, d_lat } = payload;
    const page = Number(payload.page) || 1;
    const limit = Number(payload.limit) || 10;
    const skip = (page - 1) * limit;
    const radius = (Number(payload.radius) || 10) / 6378.1; //radius in radians;
    const status = "posted";

    const match: any = {
        status: status,
    };

    // pickup filter
    if (p_lng && p_lat) {
        match.p_coordinates = {
            $geoWithin: {
                $centerSphere: [[Number(p_lng), Number(p_lat)], radius],
            },
        };
    }

    // destination filter
    if (d_lng && d_lat) {
        match.d_coordinates = {
            $geoWithin: {
                $centerSphere: [[Number(d_lng), Number(d_lat)], radius],
            },
        };
    }

    const pipeline: any[] = [
        { $match: match },
        { $sort: { createdAt: -1 } }
    ];

    pipeline.push({
        $facet: {
            data: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }],
        },
    });

    const parcels = await ParcelModel.aggregate(pipeline);

    const total = Number(parcels[0]?.total[0]?.count || 0);
    const totalPage = Math.ceil(total / limit);

    return {
        // data: parcels,
        data: parcels[0].data,
        meta: {
            total,
            page,
            limit,
            totalPage,
        },
    };
};

// get parcel from db
const getParcelToDB = async (parcelId: string): Promise<any> => {
    const isExistParcel = await ParcelModel.findById(parcelId).lean();
    if (!isExistParcel) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Parcel not found');
    }

    return {
        data: isExistParcel
    };
};

// accept parcel to db
const acceptParcelToDB = async (courierId: string, parcelId: string): Promise<any> => {
    const isExistCourier = await UserModel.findOne({ _id: courierId, role: USER_ROLES.COURIER });
    if (!isExistCourier) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Courier not found');
    }

    const payload = {
        status: ParcelStatus.ACCEPTED,
        courier: courierId,
        $set: {
            [`track_date.${ParcelStatus.ACCEPTED}`]: new Date()
        }
    }

    const parcel = await ParcelModel.findOneAndUpdate({ _id: parcelId, status: ParcelStatus.POSTED }, payload, { new: true });

    if (!parcel) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to accept parcel');
    }

    return {
        data: parcel
    };
};

// pickup parcel to db
const pickupParcelToDB = async (courierId: string, parcelId: string): Promise<any> => {
    const isExistCourier = await UserModel.findOne({ _id: courierId, role: USER_ROLES.COURIER });
    if (!isExistCourier) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Courier not found');
    }

    const payload = {
        status: ParcelStatus.ONTHEWAY,
        $set: {
            [`track_date.${ParcelStatus.ONTHEWAY}`]: new Date()
        }
    }

    const parcel = await ParcelModel.findOneAndUpdate({ _id: parcelId, status: ParcelStatus.ACCEPTED, courier: courierId }, payload, { new: true });

    if (!parcel) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to pickup parcel');
    }

    return {
        data: parcel
    };
};

// leave parcel to db
const leaveParcelToDB = async (courierId: string, parcelId: string, payload: any): Promise<any> => {
    try {
        const isExistCourier = await UserModel.findOne({ _id: courierId, role: USER_ROLES.COURIER });
        if (!isExistCourier) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Courier not found');
        }

        const parcel = await ParcelModel.findOneAndUpdate(
            { _id: parcelId, status: ParcelStatus.ONTHEWAY, sendDeliveryRequest: false, courier: courierId },
            { sendDeliveryRequest: true, proofImage: payload.proofImage },
            { new: true }
        ).lean();

        if (!parcel) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to leave parcel');
        }

        return { data: parcel };

    } catch (error: any) {
        if (payload.proofImage) {
            unlinkFile(payload.proofImage);
        }
        throw new ApiError(StatusCodes.BAD_REQUEST, error.message);
    }
};

// leave parcel to db
const acceptDeliveryToDB = async (senderId: string, parcelId: string): Promise<any> => {
    const isExistSender = await UserModel.findOne({ _id: senderId, role: USER_ROLES.SENDER });
    if (!isExistSender) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Sender not found');
    }

    const parcel = await ParcelModel.findOneAndUpdate(
        { _id: parcelId, status: ParcelStatus.ONTHEWAY, sendDeliveryRequest: true, sender: senderId }, {
        status: ParcelStatus.DELIVERED,
        [`track_date.${ParcelStatus.DELIVERED}`]: new Date()
    }, { new: true }
    ).lean();

    if (!parcel) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update parcel');
    }

    return { data: parcel };
};

export const ParcelService = {
    createParcelToDB,
    updateParcelToDB,
    getParcelsFromDB,
    getParcelToDB,
    acceptParcelToDB,
    pickupParcelToDB,
    leaveParcelToDB,
    acceptDeliveryToDB
};