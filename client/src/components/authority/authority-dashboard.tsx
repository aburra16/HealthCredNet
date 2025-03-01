import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CredentialReviewModal from "@/components/modals/credential-review-modal";
import { Link } from "wouter";
import { UserRound, BadgeCheck, Clock, ChevronRight } from "lucide-react";

// Types
interface CredentialRequest {
  id: number;
  providerId: number;
  type: string;
  issuingAuthority: string;
  details?: string;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedById?: number;
}

interface User {
  id: number;
  username: string;
  displayName: string;
  role: string;
  nostrPubkey: string;
  location?: string;
  specialty?: string;
  institution?: string;
  about?: string;
  avatar?: string;
}

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<CredentialRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Fetch pending credential requests
  const { data: pendingRequests } = useQuery<CredentialRequest[]>({
    queryKey: ['/api/credential-requests'],
    enabled: !!user,
  });
  
  // Fetch all providers
  const { data: providers } = useQuery<User[]>({
    queryKey: ['/api/providers'],
    enabled: !!user,
  });
  
  // Fetch all credentials
  const { data: credentials } = useQuery<any[]>({
    queryKey: ['/api/credentials'],
    enabled: !!user,
  });
  
  // Get provider for a request
  const getProviderForRequest = (providerId: number) => {
    return providers?.find(p => p.id === providerId);
  };
  
  const openReviewModal = (request: CredentialRequest) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Credential Authority Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage healthcare provider credentials and verification</p>
      </div>
      
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Registered Providers Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <UserRound className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Registered Providers
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {providers?.filter(p => p.role === 'provider').length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/providers" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                  View all providers <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Active Credentials Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <BadgeCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Credentials
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {credentials?.length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/credentials" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                  View all credentials <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Pending Requests Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {pendingRequests?.filter(r => r.status === 'pending').length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/dashboard/issue" className="font-medium text-primary-600 hover:text-primary-500 flex items-center">
                  Review pending requests <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Credential Requests</h2>
        <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Provider</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Credential Type</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Requested Date</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pendingRequests && pendingRequests.length > 0 ? (
                pendingRequests.slice(0, 5).map(request => {
                  const provider = getProviderForRequest(request.providerId);
                  return (
                    <tr key={request.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Avatar>
                              <AvatarImage src={provider?.avatar} />
                              <AvatarFallback>
                                {provider?.displayName.charAt(0).toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{provider?.displayName || 'Unknown Provider'}</div>
                            <div className="text-gray-500">{provider?.specialty || 'No specialty'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">{request.type}</div>
                        <div className="text-gray-500">{request.issuingAuthority}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(request.createdAt)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button 
                          variant="link" 
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => openReviewModal(request)}
                        >
                          {request.status === 'pending' ? 'Review' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                    No recent credential requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedRequest && (
        <CredentialReviewModal
          request={selectedRequest}
          provider={getProviderForRequest(selectedRequest.providerId)}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </>
  );
}
