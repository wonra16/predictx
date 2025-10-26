import LeaderboardTable from '../LeaderboardTable';

export default function LeaderboardTableExample() {
  const mockEntries = [
    { rank: 1, username: "CryptoKing", score: 45200, accuracy: 78, totalPredictions: 342 },
    { rank: 2, username: "MoonShot", score: 38900, accuracy: 72, totalPredictions: 289 },
    { rank: 3, username: "DiamondHands", score: 32100, accuracy: 69, totalPredictions: 256 },
    { rank: 4, username: "BullRunner", score: 28500, accuracy: 65, totalPredictions: 198, isCurrentUser: true },
    { rank: 5, username: "HODLer", score: 24200, accuracy: 71, totalPredictions: 176 },
    { rank: 6, username: "WhaleWatch", score: 21800, accuracy: 68, totalPredictions: 164 },
    { rank: 7, username: "SatoshiFan", score: 19300, accuracy: 63, totalPredictions: 145 },
  ];

  return (
    <div className="w-full max-w-2xl">
      <LeaderboardTable entries={mockEntries} />
    </div>
  );
}
