import { useQuery } from "@tanstack/react-query";
import { ElectricityPrice } from "@/types";

export function useElectricityPrices({ zone = "SE3" }: { zone?: string } = {}) {
  return useQuery<ElectricityPrice[]>({
    queryKey: ['/api/electricity-prices', zone],
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
}

export function useCurrentPrice(prices: ElectricityPrice[] | undefined) {
  if (!prices || prices.length === 0) {
    return null;
  }

  const now = new Date();
  
  // Find the price for the current hour
  const currentPrice = prices.find(price => {
    const startTime = new Date(price.time_start);
    const endTime = new Date(price.time_end);
    return now >= startTime && now < endTime;
  });

  return currentPrice || null;
}

export function usePriceStatistics(prices: ElectricityPrice[] | undefined) {
  if (!prices || prices.length === 0) {
    return {
      lowestPrice: null,
      highestPrice: null,
      averagePrice: null,
      priceChange: null
    };
  }

  const pricesInSEK = prices.map(price => price.SEK_per_kWh);
  
  const lowestPrice = Math.min(...pricesInSEK);
  const highestPrice = Math.max(...pricesInSEK);
  const averagePrice = pricesInSEK.reduce((sum, price) => sum + price, 0) / pricesInSEK.length;
  
  // Get current and previous price for price change calculation
  const now = new Date();
  const currentHour = now.getHours();
  
  const currentPrice = prices.find(price => new Date(price.time_start).getHours() === currentHour)?.SEK_per_kWh;
  const previousHour = currentHour === 0 ? 23 : currentHour - 1;
  const previousPrice = prices.find(price => new Date(price.time_start).getHours() === previousHour)?.SEK_per_kWh;
  
  let priceChange = null;
  if (currentPrice !== undefined && previousPrice !== undefined) {
    priceChange = currentPrice - previousPrice;
  }
  
  return {
    lowestPrice,
    highestPrice,
    averagePrice,
    priceChange
  };
}

export function formatPriceData(prices: ElectricityPrice[] | undefined) {
  if (!prices || prices.length === 0) {
    return { labels: [], data: [] };
  }
  
  const labels = prices.map(price => {
    const date = new Date(price.time_start);
    return date.getHours() + ":00";
  });
  
  const data = prices.map(price => price.SEK_per_kWh);
  
  return { labels, data };
}
