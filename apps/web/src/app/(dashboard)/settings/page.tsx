'use client';

import { HelpCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@payments-view/ui';
import { WalletButton } from '@/features/auth';
import { useOnboarding } from '@/features/onboarding';

export default function SettingsPage() {
  const { restartOnboarding, isCompleted } = useOnboarding();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect or disconnect your wallet
              </p>
              <WalletButton />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help & Tutorial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need a refresher on how to use the dashboard? Restart the guided tour to learn
                about all the features.
              </p>
              <Button
                variant="outline"
                onClick={restartOnboarding}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart Tour
              </Button>
              {!isCompleted && (
                <p className="text-xs text-muted-foreground">
                  Tour is currently active
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">More settings coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

