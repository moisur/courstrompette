import React from 'react'

interface PerformanceMetricsProps {
  performance: {
    correct: number
    total: number
  }
}

export default function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const accuracy = performance.total > 0
    ? ((performance.correct / performance.total) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="text-right">
      <p className="text-sm text-gray-600">Accuracy</p>
      <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
      <p className="text-xs text-gray-500">
        {performance.correct} / {performance.total} notes correct
      </p>
    </div>
  )
}

