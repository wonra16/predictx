import StreakReward from '../StreakReward';

export default function StreakRewardExample() {
  return (
    <div className="w-full max-w-md">
      <StreakReward
        currentStreak={7}
        canClaim={true}
        onClaim={() => console.log('Ödül talep edildi')}
      />
    </div>
  );
}
