import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CredentialReviewModal from "@/components/modals/credential-review-modal";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

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

export default function IssueCredential() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<CredentialRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Fetch pending credential requests
  const { data: pendingRequests, isLoading: isLoadingRequests } = useQuery<CredentialRequest[]>({
    queryKey: ['/api/credential-requests'],
    enabled: !!user,
  });
  
  // Fetch all providers
  const { data: providers, isLoading: isLoadingProviders } = useQuery<User[]>({
    queryKey: ['/api/providers'],
    enabled: !!user,
  });
  
  // Filter requests based on search term
  const filteredRequests = pendingRequests?.filter(request => {
    const provider = providers?.find(p => p.id === request.providerId);
    
    if (!provider) return false;
    
    return (
      request.status === 'pending' &&
      (searchTerm === "" || 
        provider.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
  
  // Get provider for a request
  const getProviderForRequest = (providerId: number) => {
    return providers?.find(p => p.id === providerId);
  };
  
  const handleReviewRequest = (request: CredentialRequest) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Issue Credentials</h1>
        <p className="mt-1 text-sm text-gray-500">Review and issue credentials to healthcare providers</p>
      </div>
      
      <div className="px-4 py-5 sm:p-6 bg-white shadow sm:rounded-md mt-6">
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Requests</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <Input
              type="text"
              id="search"
              placeholder="Search by provider name, credential type, or issuing authority"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Credential Requests</h3>
        
        {isLoadingRequests || isLoadingProviders ? (
          <div className="text-center py-4">
            <p>Loading requests...</p>
          </div>
        ) : filteredRequests && filteredRequests.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                {filteredRequests.map(request => {
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
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending Review
                        </Badge>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Button
                          variant="link"
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => handleReviewRequest(request)}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No pending credential requests found.</p>
            {searchTerm && (
              <p className="mt-2">Try adjusting your search criteria.</p>
            )}
          </div>
        )}
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
