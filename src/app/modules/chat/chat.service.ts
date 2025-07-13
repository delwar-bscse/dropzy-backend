import { FilterQuery } from 'mongoose';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { IMessage } from '../message/message.interface';
import { Message } from '../message/message.model';
import { IChat } from './chat.interface';
import { Chat } from './chat.model';

const createChatToDB = async (payload: any): Promise<IChat> => {
    const isExistChat: IChat | null = await Chat.findOne({
        participants: { $all: payload },
    });

    if (isExistChat) {
        return isExistChat;
    }
    const chat: IChat = await Chat.create({ participants: payload });
    return chat;
}

const retrievedChatFromDB = async (user: any, query: FilterQuery<IChat>): Promise<{ chats: IChat[], pagination: any }> => {

    const ChatQuery = new QueryBuilder(
        Chat.find({ participants: { $in: [user.id] } }).lean().exec(),
        query
    ).paginate();

    const [chats, pagination] = await Promise.all([

        ChatQuery.queryModel.populate({
            path: 'participants',
            select: '_id name profile',
            match: {
                _id: { $ne: user.id }
            }
        }),

        ChatQuery.getPaginationInfo()
    ]);

    //Use Promise.all to handle the asynchronous operations inside the map
    const chatList: IChat[] = await Promise.all(
        chats?.map(async (chat: any) => {
            const data = chat?.toObject();

            const lastMessage: IMessage | null = await Message.findOne({ chatId: chat?._id })
                .sort({ createdAt: -1 })
                .select('text image createdAt sender');

            return {
                ...data,
                lastMessage: lastMessage || null,
            };
        })
    );

    return { chats: chatList, pagination };
};

export const ChatService = { createChatToDB, retrievedChatFromDB };