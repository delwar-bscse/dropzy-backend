const calculateProfit = async (payload: { l: number; w: number; h: number; price: number }): Promise<{ totalCharge: number; courierProfit: number; companyProfit: number }> => {
  const { l, w, h } = payload; // l = length, w = width, h = height
  const TOTAL_CHARGE = payload.price;
  let courierSharePercent;

  // Determine size tier based on maximum dimensions
  if (l <= 25 && w <= 15 && h <= 15) {
    // Small Package
    courierSharePercent = 0.80;
  } else if (l <= 50 && w <= 30 && h <= 30) {
    // Medium Package
    courierSharePercent = 0.80;
  } else if (l <= 100 && w <= 60 && h <= 60) {
    // Large Package
    courierSharePercent = 0.90;
  } else {
    courierSharePercent = 0.90;
  }

  const courierProfit = TOTAL_CHARGE * courierSharePercent;
  const companyProfit = TOTAL_CHARGE - courierProfit;

  return {
    totalCharge: TOTAL_CHARGE,
    courierProfit: courierProfit,
    companyProfit: companyProfit
  };
};