import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface AuditLogEntry {
  id: number;
  timestamp: string;
  action: 'issue' | 'revoke' | 'approve' | 'reject';
  credentialType: string;
  providerName: string;
  performedBy: string;
}

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState<string>('');
  
  // Mock audit logs data (in a real app, this would come from the API)
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: 'approve',
      credentialType: 'Board Certification',
      providerName: 'Dr. Michael Chen',
      performedBy: 'Authority Admin'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      action: 'issue',
      credentialType: 'Board Certification',
      providerName: 'Dr. Michael Chen',
      performedBy: 'Authority Admin'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'reject',
      credentialType: 'Medical License',
      providerName: 'Dr. Alex Thompson',
      performedBy: 'Authority Admin'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'approve',
      credentialType: 'Fellowship',
      providerName: 'Dr. Sarah Johnson',
      performedBy: 'Authority Admin'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000).toISOString(),
      action: 'issue',
      credentialType: 'Fellowship',
      providerName: 'Dr. Sarah Johnson',
      performedBy: 'Authority Admin'
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      action: 'revoke',
      credentialType: 'Hospital Affiliation',
      providerName: 'Dr. James Wilson',
      performedBy: 'Authority Admin'
    }
  ];
  
  // Filter logs based on action
  const filteredLogs = actionFilter
    ? mockAuditLogs.filter(log => log.action === actionFilter)
    : mockAuditLogs;
  
  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">Track all credential actions performed in the system</p>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Credential Activity Log</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Filter by action:</span>
              <select
                className="block w-auto py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All actions</option>
                <option value="issue">Issue</option>
                <option value="revoke">Revoke</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credential Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        log.action === 'issue' ? 'bg-green-100 text-green-800' : 
                        log.action === 'revoke' ? 'bg-red-100 text-red-800' :
                        log.action === 'approve' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.action === 'issue' ? 'Issued' : 
                         log.action === 'revoke' ? 'Revoked' :
                         log.action === 'approve' ? 'Approved' :
                         'Rejected'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.credentialType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.providerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.performedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="py-6 text-center text-gray-500">
              No audit logs found for the selected filter
            </div>
          )}
        </div>
      </div>
    </>
  );
}
