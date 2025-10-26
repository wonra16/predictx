import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  return (
    <div className="w-full max-w-6xl">
      <HeroSection
        onGetStarted={() => console.log('Başla butonuna tıklandı')}
      />
    </div>
  );
}
