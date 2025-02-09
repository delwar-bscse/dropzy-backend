import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from ".";
import { User } from "../app/modules/user/user.model";
import { Request } from "express"; // Ensure you import the correct Request type

passport.use(new GoogleStrategy(
    {
        clientID: config.social.google_client_id as string,
        clientSecret: config.social.google_client_secret as string,
        callbackURL: "https://nadir.binarybards.online/api/v1/auth/google/callback",
        passReqToCallback: true
    },
    async ( req: Request, accessToken: string, refreshToken: string, profile: any, done: any ) => {
        try {
            const role = req.query.state as string;
            console.log(role);
            done(null, profile);
        } catch (error) {
            done(error, undefined);
        }
    }
));


// Serialize & Deserialize User
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});


passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            done(new Error("User not found"), null);
        } else {
            done(null, user);
        }
    } catch (error) {
        done(error, null);
    }
});

export default passport;