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

  return <div className={`w-full ${className}`} style={{ padding: '0 10px' }}>
      {title && (
        <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            outerRadius={Math.min(70, height * 0.3)}
            fill="#8884d8"
            labelLine={false}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${name}: ${value} (${((value / total) * 100).toFixed(1)}%)`,
              'Error Type'
            ]}
            contentStyle={{
              fontSize: '12px',
              padding: '10px',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              maxWidth: '250px',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            labelStyle={{
              fontWeight: 'bold',
              marginBottom: '4px'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '13px',
              lineHeight: '18px'
            }}
            iconType="circle"
            iconSize={10}
            formatter={(value: string) => value}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>;
};

export default PieChart;

