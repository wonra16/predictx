import UserStats from '../UserStats';

export default function UserStatsExample() {
  return (
    <div className="w-full max-w-4xl">
      <UserStats
        score={12450}
        rank={42}
        totalPredictions={156}
        accuracy={68}
        currentStreak={7}
      />
    </div>
  );
}
