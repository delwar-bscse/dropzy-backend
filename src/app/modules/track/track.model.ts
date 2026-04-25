import { model, Schema } from 'mongoose';
import { ITrackModel, ITrack } from './track.interface';

const trackSchema = new Schema<ITrack, ITrackModel>(
    {
        senders: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        courier: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        location: {
            type: String,
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    { timestamps: true }
)

trackSchema.index({ coordinates: "2dsphere" });

export const TrackModel = model<ITrack, ITrackModel>('Track', trackSchema);