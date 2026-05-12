import { Button } from "@adconfirm/ui";

export default function DashboardHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-4 text-3xl font-bold text-brand-900">
        AdConfirm Dashboard
      </h1>
      <p className="mb-8 text-gray-600">Sign in to manage your campaigns</p>
      <Button variant="primary">Sign in</Button>
    </main>
  );
}
