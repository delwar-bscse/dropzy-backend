import { Schema, model } from 'mongoose';
import { IMessage, MessageModel } from './message.interface';
import config from '../../../config';

const messageSchema = new Schema<IMessage, MessageModel>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Chat',
        },
        sender: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        text: {
            type: String,
            required: false
        },
        image: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true,
    }
);

messageSchema.index({ chatId: 1, createdAt: -1 });

messageSchema.post("find", function (messages: IMessage[]) {
    messages.forEach((message: IMessage) => {
        if (message?.image) {
            message.image = `http://${config.ip_address}:${config.port}${message.image}`;
        }
    })
})

export const Message = model<IMessage, MessageModel>('Message', messageSchema);