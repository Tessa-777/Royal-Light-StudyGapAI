import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type DataPoint = {
  name: string;
  [key: string]: string | number;
};

type LineConfig = {
  dataKey: string;
  color: string;
  name?: string;
};

type LineChartProps = {
  data: DataPoint[];
  lines: LineConfig[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  className?: string;
};

const LineChart = ({
  data,
  lines,
  title,
  xAxisLabel,
  yAxisLabel,
  height = 300,
  className = ''
}: LineChartProps) => {
  return <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-base font-semibold text-gray-700 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
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
            label={
              xAxisLabel
                ? {
                    value: xAxisLabel,
                    position: 'insideBottomRight',
                    offset: -15
                  }
                : undefined
            }
          />
          <YAxis
            domain={[0, 100]}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10
                  }
                : undefined
            }
          />
          <Tooltip formatter={value => [`${value}%`, '']} />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              name={line.name || line.dataKey}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>;
};

export default LineChart;

