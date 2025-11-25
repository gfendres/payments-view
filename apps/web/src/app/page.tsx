export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          Gnosis Card Portfolio Dashboard
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Track your Gnosis Pay card transactions, spending analytics, and cashback rewards.
        </p>
        <div className="flex gap-4 justify-center">
          <div className="rounded-2xl bg-card p-6 border border-border">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold">€0.00</p>
          </div>
          <div className="rounded-2xl bg-card p-6 border border-border">
            <p className="text-sm text-muted-foreground">Cashback Earned</p>
            <p className="text-2xl font-bold text-primary">€0.00</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          Connect your wallet to get started
        </p>
      </div>
    </main>
  );
}

