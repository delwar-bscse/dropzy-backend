import { StatusCodes } from 'http-status-codes'
import ApiError from '../../../errors/ApiErrors'
import { IRule } from './rule.interface'
import { Rule } from './rule.model'
import redis from '../../../config/redisClient'

//privacy policy
const createPrivacyPolicyToDB = async (payload: IRule) => {

    // check if privacy policy exist or not
    const isExistPrivacy = await Rule.findOne({ type: 'privacy' })

    if (isExistPrivacy) {

        // update privacy is exist 
        const result = await Rule.findOneAndUpdate({type: 'privacy'}, {content: payload?.content}, {new: true});

        await redis.del(`about`);
        const message = "Privacy & Policy Updated successfully"
        return { message, result }
    } else {

        // create new if not exist
        const result = await Rule.create({ ...payload, type: 'privacy' });
        await redis.del(`privacy`);
        const message = "Privacy & Policy Created successfully"
        return {message, result}
    }
}

const retrievePrivacyPolicyFromDB = async () => {

    const cachedPrivacy = await redis.get(`privacy`);
    if (cachedPrivacy) {
        return JSON.parse(cachedPrivacy);
    }
    const result = await Rule.findOne({ type: 'privacy' })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Privacy policy doesn't exist!")
    }
    await redis.set(`privacy`, JSON.stringify(result), 'EX', 60 * 30);
    return result
}

//terms and conditions
const createTermsAndConditionToDB = async (payload: IRule) => {

    const isExistTerms = await Rule.findOne({ type: 'terms' })
    if (isExistTerms) {
        const result = await Rule.findOneAndUpdate({type: 'terms'}, {content: payload?.content}, {new: true});
        await redis.del(`terms`);
        const message = "Terms And Condition Updated successfully"
        return { message, result }
  
    } else {
        const result = await Rule.create({ ...payload, type: 'terms' });
        await redis.del(`terms`);
        const message = "Terms And Condition Created Successfully"
        return { message, result }
    }
}

const retrieveTermsAndConditionFromDB = async () => {

    const cachedTerms = await redis.get(`terms`);
    if (cachedTerms) {
        return JSON.parse(cachedTerms);
    }
    const result = await Rule.findOne({ type: 'terms' })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Terms and conditions doesn't  exist!")
    }
    await redis.set(`terms`, JSON.stringify(result), 'EX', 60 * 30);
    return result
}

//privacy policy
const createAboutToDB = async (payload: IRule) => {

    const isExistAbout = await Rule.findOne({ type: 'about' })
    if (isExistAbout) {
        const result = await Rule.findOneAndUpdate({type: 'about'}, {content: payload?.content}, {new: true});
        await redis.del(`about`);
        const message = "About Us Updated successfully"
        return { message, result }
    } else {
        const result = await Rule.create({ ...payload, type: 'about' });
        await redis.del(`about`);
        const message = "About Us created successfully"
        return { message, result }
    }
}
  
const retrieveAboutFromDB = async () => {

    const cachedAbout = await redis.get(`about`);
    if (cachedAbout) {
        return JSON.parse(cachedAbout);
    }
    const result = await Rule.findOne({ type: 'about' })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "About doesn't exist!")
    }
    await redis.set(`about`, JSON.stringify(result), 'EX', 60 * 30);
    return result
}
  
export const RuleService = {
    createPrivacyPolicyToDB,
    retrievePrivacyPolicyFromDB,
    createTermsAndConditionToDB,
    retrieveTermsAndConditionFromDB,
    createAboutToDB,
    retrieveAboutFromDB
}  