import React from 'react';
import type { SimulationRequest } from '../lib/ecs';

interface Props {
  requests: SimulationRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const SimulationRequests: React.FC<Props> = ({ requests, onApprove, onReject }) => {
  if (requests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                  {request.type}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(request.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <p className="text-sm mb-4">{request.content}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(request.id)}
                className="px-3 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 