import { useState, useEffect } from 'react';
import apiClient from '../lib/api-client';

export default function AdminAnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnomalies();
  }, []);

  const loadAnomalies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAnomalies();
      setAnomalies(response || []);
    } catch (error) {
      console.error('Failed to load anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Anomaly Detection</h1>

      {anomalies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Anomalies Detected</h3>
          <p className="mt-2 text-gray-500">System is running smoothly</p>
        </div>
      ) : (
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`bg-white rounded-lg shadow border-l-4 p-6 ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">{anomaly.type}</span>
                  </div>
                  <p className="text-gray-900 font-medium mb-2">{anomaly.description}</p>
                  <div className="text-sm text-gray-600">
                    Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                  </div>
                </div>
                
                {!anomaly.isResolved && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}