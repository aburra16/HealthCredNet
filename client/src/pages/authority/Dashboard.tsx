import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CredentialRequest } from "@/types";
import CredentialReviewModal from "@/components/credentials/CredentialReviewModal";

export default function AuthorityDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<CredentialRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Fetch credential requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/credential-requests'],
    select: (data: any) => {
      return data.map((request: any) => ({
        id: request.id,
        providerId: request.providerId,
        providerName: `${request.provider.firstName} ${request.provider.lastName}`,
        providerSpecialty: request.provider.specialty,
        providerPublicKey: request.provider.nostrPubkey,
        providerImageUrl: request.provider.profileImageUrl,
        credentialType: request.type,
        issuingAuthority: request.issuingAuthority,
        requestDate: request.createdAt,
        status: request.status,
        details: request.details
      }));
    }
  });
  
  const pendingRequests = requests?.filter((req: any) => req.status === 'pending') || [];
  
  const openReviewModal = (request: CredentialRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };
  
  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };
  
  return (
    <div className="fade-in">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-white shadow-sm rounded-lg mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Credential Authority Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage healthcare provider credentials and verification</p>
      </div>
      
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="card group hover:border-primary-300 transition-all border border-transparent">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-full p-3 group-hover:bg-primary-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Registered Providers
                    </dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : '156'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-100">
              <div className="text-sm">
                <Link href="/authority/providers" className="font-medium text-primary-600 hover:text-primary-500 group-hover:underline transition-all flex items-center">
                  View all providers <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="card group hover:border-blue-300 transition-all border border-transparent">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 15c3 0 6-2 6-5s-3-5-6-5-6 2-6 5 3 5 6 5Z" />
                    <path d="m9 11-3 6" />
                    <path d="m15 11 3 6" />
                    <path d="M12 15v6" />
                    <path d="M12 3v3" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Credentials
                    </dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : '324'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-100">
              <div className="text-sm">
                <Link href="/authority/issue" className="font-medium text-blue-600 hover:text-blue-500 group-hover:underline transition-all flex items-center">
                  View all credentials <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="card group hover:border-yellow-300 transition-all border border-transparent">
            <div className="px-6 py-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3 group-hover:bg-yellow-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd>
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : pendingRequests.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg border-t border-gray-100">
              <div className="text-sm">
                <Link href="/authority/issue" className="font-medium text-yellow-600 hover:text-yellow-500 group-hover:underline transition-all flex items-center">
                  Review pending requests <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-10 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Credential Requests</h2>
          <Link href="/authority/issue" className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center">
            View all <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </Link>
        </div>
        <div className="overflow-hidden">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : requests?.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
              <p className="text-lg font-medium">No credential requests found</p>
              <p className="text-sm mt-1">When providers request credentials, they'll appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-gray-700 sm:pl-6">Provider</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-700">Credential Type</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-700">Requested Date</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-gray-700">Status</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requests?.map((request: any, index: number) => (
                    <tr key={request.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {request.providerImageUrl ? (
                              <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white" src={request.providerImageUrl} alt="" />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{request.providerName}</div>
                            <div className="text-gray-500 text-xs">{request.providerSpecialty}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="text-gray-900">{request.credentialType}</div>
                        <div className="text-gray-500 text-xs">{request.issuingAuthority}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {request.status === 'approved' ? 'Approved' :
                           request.status === 'pending' ? 'Pending Review' :
                           'Rejected'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md ${
                            request.status === 'pending' 
                              ? 'text-white bg-primary-600 hover:bg-primary-700 border-primary-600' 
                              : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => openReviewModal(request)}
                        >
                          {request.status === 'pending' ? 'Review' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <CredentialReviewModal
        isOpen={isModalOpen}
        onClose={closeReviewModal}
        request={selectedRequest}
      />
    </div>
  );
}
