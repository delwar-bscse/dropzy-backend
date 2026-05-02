import colors from "colors";
import { Server } from "socket.io";
import { logger } from "../shared/logger";
import { jwtHelper } from "./jwtHelper";
import { Secret } from "jsonwebtoken";
import config from "../config";
import { USER_ROLES } from "../enums/user";
import { TrackModel } from "../app/modules/track/track.model";

const socket = (io: Server) => {
    io.on('connection', socket => {
        logger.info(colors.blue('A User connected'));

        // Courier joins their own room
        socket.on("join-track-room", async (courierId: string) => {
            const headers = await socket.handshake.headers;
            const token = headers.authorization;

            if (!token) {
                socket.emit("error", "You are not authorized");
                return;
            }

            // console.log("Token:", token);
            const verifyUser = jwtHelper.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            );
            console.log("Verified Sender:", verifyUser);

            if (!verifyUser || verifyUser.role !== USER_ROLES.SENDER) {
                socket.emit("error", "You are not authorized");
                return;
            }
            logger.info(colors.yellow(`Sender joined room: track::${courierId}`));
            socket.join(`track::${courierId}`);
        });

        // 🔥 Update track via socket (instead of API)
        socket.on("update-track", async ({ courierId, payload }) => {
            const headers = await socket.handshake.headers;
            const token = headers.authorization;

            if (!token) {
                socket.emit("error", "You are not authorized");
                return;
            }

            // console.log("Token:", token);
            const verifyUser = jwtHelper.verifyToken(
                token,
                config.jwt.jwt_secret as Secret
            );
            console.log("Verified Courier:", verifyUser);

            if (!verifyUser || verifyUser.role !== USER_ROLES.COURIER || verifyUser.id !== courierId) {
                socket.emit("error", "You are not authorized");
                return;
            }

            try {
                logger.info(colors.green(`Updating track for courier: ${courierId}`));
                console.log({ courierId, payload })
                const track = await TrackModel.findOneAndUpdate({ courier: courierId }, payload, { new: true }).lean();

                if (!track) {
                    socket.emit("error", "Track room doesn't exist!");
                    return;
                }

                // Emit only to users tracking this courier
                io.to(`track::${courierId}`).emit("track-update", payload);

            } catch (err) {
                console.error(err);
                socket.emit("error", "Something went wrong");
            }
        });

        // disconnect
        socket.on("disconnect", () => {
            logger.info(colors.red('A user disconnect'));
        })
    })
}

export const socketHelper = { socket }

/*
Step 1: Handle update via Socket instead of API

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Courier joins their own room
  socket.on("join-track-room", (courierId: string) => {
    socket.join(`track::${courierId}`);
  });

  // 🔥 Update track via socket (instead of API)
  socket.on("update-track", async ({ courierId, payload }) => {
    try {
      const track = await TrackModel.findOneAndUpdate(
        { courier: courierId },
        payload,
        { new: true }
      ).lean();

      if (!track) {
        return socket.emit("error", "Track doesn't exist!");
      }

      // Emit only to users tracking this courier
      io.to(`track::${courierId}`).emit("track-update", track);

    } catch (err) {
      console.error(err);
      socket.emit("error", "Something went wrong");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



Step 2: Client-side (Courier updates location)

socket.emit("update-track", {
  courierId: "COURIER_ID",
  payload: {
    location: { lat: 23.81, lng: 90.41 },
    status: "on_the_way"
  }
});


Step 3: Client-side (Sender listens)

socket.emit("join-track-room", "COURIER_ID");

socket.on("track-update", (data) => {
  console.log("Live track update:", data);
});

*/