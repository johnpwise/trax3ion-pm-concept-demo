type HoursDifferenceValueProps = {
  estimatedHours: number;
  actualHours: number;
};

export default function HoursDifferenceValue({ estimatedHours, actualHours }: HoursDifferenceValueProps) {
  const isOver = actualHours > estimatedHours;
  const isUnder = actualHours < estimatedHours;
  const diff = Math.abs(actualHours - estimatedHours);
  const colorClassName = isOver ? "text-[#c22921]" : isUnder ? "text-[#308a48]" : "text-muted-foreground";

  return (
    <span className={`font-medium ${colorClassName}`}>
      {isOver ? "-" : ""}
      {diff}h
    </span>
  );
}
