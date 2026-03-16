import { ITrack } from './track.interface';
import { TrackModel } from './track.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';

const createTrackToDB = async (payload: any): Promise<ITrack> => {
    const isExistTrack: ITrack | null = await TrackModel.findOne({
        courier: payload.courier,
    }).lean();

    if (isExistTrack) {
        return isExistTrack;
    }

    const track: ITrack = await TrackModel.create({
        courier: payload.courier,
        location: payload.location,
        coordinates: payload.coordinates
    });
    return track;
}

const updateTrackToDB = async ({ id, payload }: { id: string, payload: any }): Promise<any> => {
    const track = await TrackModel.findOneAndUpdate({ courier: id }, payload, { new: true }).lean();

    if (!track) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Track doesn't exist!");
    }

    const io = (global as any).io;
    if (io) {
        io.emit(`track::${id}`, track);
    }

    return track;
}

const retrievedTrackToDB = async (payload: any): Promise<ITrack> => {
    const isExistTrack: ITrack | null = await TrackModel.findOne({
        courier: payload.courier,
    }).lean();

    if (!isExistTrack) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Track doesn't exist!");
    }

    return isExistTrack;
}

export const TrackService = { createTrackToDB, retrievedTrackToDB, updateTrackToDB };