import { UserModel } from '../user/user.model';
import { Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { ParcelModel } from '../parcel/parcel.model';
import { PaymentStatus } from '../../../enums/parcel';
import { JwtPayload } from 'jsonwebtoken';
import { TransactionModel } from '../transaction/transaction.model';


// get overview from db
const overViewFromDB = async () => {
  const totalSender = await UserModel.countDocuments({ role: USER_ROLES.SENDER });
  const totalCourier = await UserModel.countDocuments({ role: USER_ROLES.COURIER });
  const totalParcel = await ParcelModel.countDocuments({ paymentStatus: PaymentStatus.PAID });
  const transaction = await TransactionModel.aggregate([
    {
      $group: {
        _id: null,
        systemBalance: { $sum: '$systemBalance' },
        totalCourierBalance: { $sum: '$courierBalance' },
        totalBalance: { $sum: '$balance' }
      }
    }
  ]);
  return { totalSender, totalCourier, totalParcel, transaction: transaction[0] };
}

// get revenues yearly summary
const getRevenuesFromDB = async (year: number): Promise<any> => {
  const data = await TransactionModel.aggregate([
    // 1️⃣ Match by selected year
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, year],
        },
      },
    },

    // 2️⃣ Group by month and sum credits
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        systemBalance: { $sum: "$systemBalance" },
      },
    },

    // 3️⃣ Sort by month ascending
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // 4️⃣ Map Mongo months (1–12) to names & ensure all months exist
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // initialize array with all months (default 0 credits)
  const result = monthNames.map((month, index) => {
    const monthData = data.find((item) => item._id.month === index + 1);
    return {
      month,
      revenue: monthData ? monthData.systemBalance : 0,
    };
  });

  return { year, data: result };
};

// get parcels yearly summary
const getParcelsFromDB = async (year: number): Promise<any> => {
  const data = await ParcelModel.aggregate([
    // 1️⃣ Match by selected year
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, year],
        },
      },
    },

    // 2️⃣ Group by month and sum credits
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },

    // 3️⃣ Sort by month ascending
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // 4️⃣ Map Mongo months (1–12) to names & ensure all months exist
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // initialize array with all months (default 0 credits)
  const result = monthNames.map((month, index) => {
    const monthData = data.find((item) => item._id.month === index + 1);
    return {
      month,
      count: monthData ? monthData.count : 0,
    };
  });

  return { year, data: result };
};

// get users weekly summary
const getUsersFromDB = async (date: string): Promise<any> => {
  const endDate = new Date(date || new Date());

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6); // previous 7 days (including endDate)

  const data = await UserModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);

  // Generate previous 7 days manually
  const result = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const formattedDate = current.toISOString().split("T")[0];

    const found = data.find((d) => d._id.date === formattedDate);

    result.push({
      date: current,
      count: found ? found.count : 0,
    });
  }

  return { data: result };
};

// get my progress weekly summary
const getMyProgressFromDB = async (user: JwtPayload, date: string): Promise<any> => {
  const endDate = new Date(date || new Date());

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);

  const data = await TransactionModel?.aggregate([
    {
      $match: {
        to: new Types.ObjectId(user.id),
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
        amount: { $sum: "$courierBalance" },
      },
    },
    {
      $sort: { "_id.date": 1 },
    },
  ]);

  // Generate 7 days manually
  const result = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);

    const formattedDate = current.toISOString().split("T")[0];

    const found = data.find((d) => d._id.date === formattedDate);

    result.push({
      date: current,
      day: current.toLocaleDateString("en-US", { weekday: "short" }),
      amount: found ? found.amount : 0,
    });
  }

  return { data: result };
};



export const AnalyticService = {
  overViewFromDB,
  getRevenuesFromDB,
  getParcelsFromDB,
  getUsersFromDB,
  getMyProgressFromDB
};