import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

type BarChartProps = {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  horizontal?: boolean;
  height?: number;
  className?: string;
};

const BarChart = ({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
  horizontal = false,
  height = 300,
  className = ''
}: BarChartProps) => {
  // Set a default color if not provided
  const dataWithColors = data.map(item => ({
    ...item,
    color: item.color || '#3b82f6'
  }));

  return <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {horizontal ? (
          <RechartsBarChart
            data={dataWithColors}
            layout="vertical"
            margin={{
              top: 20,
              right: 30,
              left: 70,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              width={60}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={value => [`${value}%`, 'Accuracy']} />
            <Legend />
            <Bar dataKey="value" name={yAxisLabel || 'Value'} radius={[0, 4, 4, 0]}>
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        ) : (
          <RechartsBarChart
            data={dataWithColors}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 50
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={value => [`${value}%`, 'Accuracy']} />
            <Legend />
            <Bar dataKey="value" name={yAxisLabel || 'Value'} radius={[4, 4, 0, 0]}>
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </RechartsBarChart>
        )}
      </ResponsiveContainer>
    </div>;
};

export default BarChart;

