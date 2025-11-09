import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
type PieChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  height?: number;
  className?: string;
};
const PieChart = ({
  data,
  title,
  height = 300,
  className = ''
}: PieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <div className={`w-full ${className}`}>
      {title && <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
          {title}
        </h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({
          name,
          percent
        }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} (${(value / total * 100).toFixed(1)}%)`, 'Count']} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>;
};
export default PieChart;