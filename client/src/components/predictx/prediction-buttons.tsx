import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Clock, Zap, Crown } from "lucide-react";
import { useState } from "react";

interface PredictionButtonsProps {
  coinSymbol: string;
  onPredict: (direction: 'up' | 'down', challengeType: 'quick' | 'big') => void;
  disabled?: boolean;
}

export function PredictionButtons({ coinSymbol, onPredict, disabled }: PredictionButtonsProps) {
  const [challengeType, setChallengeType] = useState<'quick' | 'big'>('quick');
  
  const challenges = [
    { 
      type: 'quick' as const, 
      label: 'Quick Challenge',
      duration: '5 minutes',
      Icon: Zap,
      description: 'Fast wins'
    },
    { 
      type: 'big' as const, 
      label: 'Big Challenge',
      duration: '24 hours',
      Icon: Crown,
      description: 'Big rewards'
    },
  ];
  
  return (
    <Card data-testid="card-prediction-buttons">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Make Your Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Type Selector */}
        <div className="grid grid-cols-2 gap-3">
          {challenges.map((challenge) => {
            const Icon = challenge.Icon;
            return (
              <Button
                key={challenge.type}
                variant={challengeType === challenge.type ? 'default' : 'outline'}
                size="lg"
                className="flex flex-col items-start gap-1"
                onClick={() => setChallengeType(challenge.type)}
                data-testid={`button-challenge-${challenge.type}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="w-4 h-4" />
                  <span className="font-bold text-sm">{challenge.label}</span>
                </div>
                <span className="text-xs opacity-80">{challenge.duration}</span>
              </Button>
            );
          })}
        </div>
        
        {/* Direction Buttons */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            {coinSymbol} price in {challengeType === 'quick' ? '5 minutes' : '24 hours'}:
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="default"
              className="flex flex-col gap-2 bg-success text-success-foreground"
              onClick={() => onPredict('up', challengeType)}
              disabled={disabled}
              data-testid="button-predict-up"
            >
              <ArrowUpIcon className="w-6 h-6" />
              <span className="text-base font-bold">UP</span>
            </Button>
            
            <Button
              size="lg"
              variant="default"
              className="flex flex-col gap-2 bg-destructive text-destructive-foreground"
              onClick={() => onPredict('down', challengeType)}
              disabled={disabled}
              data-testid="button-predict-down"
            >
              <ArrowDownIcon className="w-6 h-6" />
              <span className="text-base font-bold">DOWN</span>
            </Button>
          </div>
        </div>
        
        {disabled && (
          <p className="text-sm text-center text-muted-foreground">
            You have an active prediction. Please wait for it to complete.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
