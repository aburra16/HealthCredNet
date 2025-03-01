import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Types
interface AuditLog {
  id: number;
  userId: number;
  action: string;
  targetId?: number;
  details?: string;
  timestamp: Date;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
}

export default function AuditLogs() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  // Fetch audit logs
  const { data: auditLogs, isLoading: isLoadingLogs } = useQuery<AuditLog[]>({
    queryKey: ['/api/audit-logs'],
    enabled: !!user,
  });
  
  // Fetch all users for mapping
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!user,
  });
  
  // Filter logs based on search term and action filter
  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === "" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });
  
  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(auditLogs?.map(log => log.action)));
  
  // Paginate logs
  const paginatedLogs = filteredLogs?.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = filteredLogs ? Math.ceil(filteredLogs.length / itemsPerPage) : 0;
  
  // Get user name by ID
  const getUserNameById = (userId: number) => {
    const user = users?.find(u => u.id === userId);
    return user ? user.displayName : `User #${userId}`;
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">Track all credential-related actions performed in the system</p>
      </div>
      
      <div className="px-4 py-5 sm:p-6 bg-white shadow sm:rounded-md mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Logs</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <Input
                type="text"
                id="search"
                placeholder="Search by action or details"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <label htmlFor="action-filter" className="block text-sm font-medium text-gray-700">Filter by Action</label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger id="action-filter" className="mt-1">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>
                    {formatAction(action)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoadingLogs ? (
          <div className="text-center py-4">
            <p>Loading audit logs...</p>
          </div>
        ) : filteredLogs && filteredLogs.length > 0 ? (
          <>
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Timestamp</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">User</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedLogs?.map(log => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 sm:pl-6">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {getUserNameById(log.userId)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {formatAction(log.action)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      // Only show a few pages with ellipsis for many pages
                      if (
                        totalPages <= 7 ||
                        i === 0 ||
                        i === totalPages - 1 ||
                        (i >= page - 2 && i <= page + 2)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={() => setPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        (i === 1 && page > 4) ||
                        (i === totalPages - 2 && page < totalPages - 3)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No audit logs found.</p>
            {(searchTerm || actionFilter) && (
              <p className="mt-2">Try adjusting your search criteria.</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
