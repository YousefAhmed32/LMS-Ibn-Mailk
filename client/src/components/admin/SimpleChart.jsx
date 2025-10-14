import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const SimpleChart = ({ title, data, type = 'bar', height = 'h-64' }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300`}>
            <div className="text-center">
              <p className="text-gray-500">لا توجد بيانات متاحة</p>
              <p className="text-sm text-gray-400">سيتم عرض البيانات عند توفرها</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-500">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300`}>
        <div className="text-center">
          <p className="text-gray-500">رسم بياني خطي</p>
          <p className="text-sm text-gray-400">سيتم إضافة الرسوم البيانية قريباً</p>
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    return (
      <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300`}>
        <div className="text-center">
          <p className="text-gray-500">رسم بياني دائري</p>
          <p className="text-sm text-gray-400">سيتم إضافة الرسوم البيانية قريباً</p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default SimpleChart;
