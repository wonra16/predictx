import Navbar from '../Navbar';

export default function NavbarExample() {
  return (
    <div className="w-full">
      <Navbar
        username="CryptoKing"
        userScore={12450}
        onLogin={() => console.log('Login clicked')}
        onMenuClick={() => console.log('Menu clicked')}
      />
    </div>
  );
}
