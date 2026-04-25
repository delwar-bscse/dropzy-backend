import cron from "node-cron";
import { UserService } from "../app/modules/user/user.service";
import { ParcelService } from "../app/modules/parcel/parcel.service";

// Runs every minute
cron.schedule("* * * * *", async () => {
  // console.log("Node Corn Working Every 1 minute");
  try {
    await ParcelService.autoAcceptDeliveryToDB();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});

// Runs every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  // console.log("Node Corn Working Every 10 minus");
  try {
    await UserService.deleteUnverifiedAccount();
  } catch (err) {
    console.error("❌ Error in cleanup job:", err);
  }
});
