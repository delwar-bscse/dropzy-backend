import cron from "node-cron";
import { UserService } from "../app/modules/user/user.service";

// Runs every minute
cron.schedule("* * * * *", async () => {
  console.log("Node Corn Working Every 1 minute");
  try {
    await UserService.deleteUnverifiedAccount();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});

// Runs every 10 minutes
// cron.schedule("*/10 * * * *", async () => {
//   try {
//     await sendNotificationsForPendingBookings();
//   } catch (err) {
//     console.error("❌ Error in cleanup job:", err);
//   }
// });
