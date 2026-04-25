import { Schema, model } from 'mongoose';
import { ParcelStatus, PaymentStatus } from '../../../enums/parcel';
import { IParcel, IReceiver, TParcelModal, ITrackDate } from './parcel.interface';

// --- Sub-Schemas ---
const ReceiverSchema = new Schema<IReceiver>({
  name: { type: String, required: true },
  countryCode: { type: String },
  phoneNumber: { type: String, required: true },
}, { _id: false });

const TrackDateSchema = new Schema<ITrackDate>({
  posted: { type: Date },
  accepted: { type: Date },
  on_the_way: { type: Date },
  request_for_delivery: { type: Date },
  delivered: { type: Date },
}, { _id: false });

// --- Main Schema ---
const parcelSchema = new Schema<IParcel, TParcelModal>(
  {
    trackId: { type: String, required: true },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courier: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: ReceiverSchema,
      required: true,
    },
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    pickup: { type: String, required: true },
    p_coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (val: number[]) => val.length === 2,
          message: "Coordinates must be [longitude, latitude]"
        }
      }
    },
    destination: { type: String, required: true },
    d_coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (val: number[]) => val.length === 2,
          message: "Coordinates must be [longitude, latitude]"
        }
      }
    },
    distance: { type: Number },
    duration: { type: Number },
    price: { type: Number, required: true },
    postedDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
    },
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      default: ParcelStatus.POSTED,
    },
    sendDeliveryRequest: { type: Boolean, default: false },
    note: { type: String, default: '' },
    images: { type: [String], default: [] },
    proofImage: { type: String },
    locationImage: { type: String },
    track_date: {
      type: TrackDateSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// --- Static Method ---
parcelSchema.statics.isExistParcelById = async function (id: string) {
  return await this.findById(id);
};

// --- Model ---

parcelSchema.index({ p_coordinates: "2dsphere" });
parcelSchema.index({ d_coordinates: "2dsphere" });
parcelSchema.index({ trackId: "text" });

export const ParcelModel = model<IParcel, TParcelModal>('Parcel', parcelSchema);