import PredictionButtons from '../PredictionButtons';

export default function PredictionButtonsExample() {
  return (
    <div className="w-full max-w-md">
      <PredictionButtons
        coin="BTC"
        onPredict={(direction, timeframe) => {
          console.log(`Tahmin: ${direction}, Zaman: ${timeframe}`);
        }}
      />
    </div>
  );
}
