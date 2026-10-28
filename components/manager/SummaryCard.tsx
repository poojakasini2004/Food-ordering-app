interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: "gray" | "orange" | "blue" | "green" | "yellow";
}

const COLOR_CLASSES = {
  gray: "bg-gray-50 border-gray-200",
  orange: "bg-orange-50 border-orange-200",
  blue: "bg-blue-50 border-blue-200",
  green: "bg-green-50 border-green-200",
  yellow: "bg-yellow-50 border-yellow-200",
};

const TEXT_COLOR_CLASSES = {
  gray: "text-gray-900",
  orange: "text-orange-600",
  blue: "text-blue-600",
  green: "text-green-600",
  yellow: "text-yellow-600",
};

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  color = "gray",
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-xl border-2 p-6 ${COLOR_CLASSES[color]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${TEXT_COLOR_CLASSES[color]}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
