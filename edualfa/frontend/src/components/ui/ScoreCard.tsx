interface ScoreCardProps {
  label: string;
  value: string;
}

export function ScoreCard({ label, value }: ScoreCardProps) {
  return (
    <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
      <p className="text-sm text-[#8C8C9D]">{label}</p>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}
