import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  username?: string;
  userAvatar?: string;
  userScore?: number;
  onLogin?: () => void;
  onMenuClick?: () => void;
}

export default function Navbar({ username, userAvatar, userScore, onLogin, onMenuClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            data-testid="button-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span className="text-xl font-extrabold">PredictX</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {username ? (
            <>
              {userScore !== undefined && (
                <Badge variant="outline" className="font-mono font-bold" data-testid="text-user-score">
                  {userScore.toLocaleString('tr-TR')} puan
                </Badge>
              )}
              
              <div className="flex items-center gap-2 cursor-pointer hover-elevate px-2 py-1 rounded-md" data-testid="button-user-profile">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userAvatar} />
                  <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">{username}</span>
              </div>
            </>
          ) : (
            <Button variant="default" onClick={onLogin} data-testid="button-login">
              Farcaster ile Giriş
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
