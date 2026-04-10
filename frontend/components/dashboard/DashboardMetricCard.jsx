export default function DashboardMetricCard({ icon: Icon, title, value, subtitle, bgColor, iconBgColor }) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${bgColor} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <Icon className="text-inherit" size={24} />
        </div>
      </div>
    </div>
  );
}
