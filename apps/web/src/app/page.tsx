import { Button } from "@adconfirm/ui";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="mb-8 text-4xl font-bold text-brand-900">AdConfirm</h1>
      <p className="mb-8 text-lg text-gray-600">
        Transparent advertising invoice reconciliation
      </p>
      <Button size="lg">Get started</Button>
    </main>
  );
}
