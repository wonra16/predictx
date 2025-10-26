import PredictionHistory from '../PredictionHistory';

export default function PredictionHistoryExample() {
  const mockPredictions = [
    {
      id: "1",
      coin: "BTC" as const,
      direction: "up" as const,
      timeframe: "5dk",
      timestamp: "2 dk önce",
      result: "pending" as const,
      entryPrice: 67842.50,
    },
    {
      id: "2",
      coin: "ETH" as const,
      direction: "down" as const,
      timeframe: "15dk",
      timestamp: "18 dk önce",
      result: "win" as const,
      points: 150,
      entryPrice: 3421.30,
    },
    {
      id: "3",
      coin: "BTC" as const,
      direction: "up" as const,
      timeframe: "1s",
      timestamp: "1 saat önce",
      result: "loss" as const,
      entryPrice: 67200.00,
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      <PredictionHistory predictions={mockPredictions} />
    </div>
  );
}
