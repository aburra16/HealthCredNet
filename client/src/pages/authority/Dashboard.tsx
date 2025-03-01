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
    <>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Credential Authority Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage healthcare provider credentials and verification</p>
      </div>
      
      <div className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <i className="fas fa-user-md text-primary-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Registered Providers
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : '156'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/authority/providers">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    View all providers <span aria-hidden="true">&rarr;</span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                  <i className="fas fa-certificate text-secondary-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Credentials
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : '324'}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/authority/issue">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    View all credentials <span aria-hidden="true">&rarr;</span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <i className="fas fa-clock text-yellow-600"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {isLoading ? <span className="animate-pulse">...</span> : pendingRequests.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <Link href="/authority/issue">
                  <a className="font-medium text-primary-600 hover:text-primary-500">
                    Review pending requests <span aria-hidden="true">&rarr;</span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Credential Requests</h2>
        <div className="mt-2 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : requests?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No credential requests found</div>
          ) : (
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
                {requests?.map((request: any) => (
                  <tr key={request.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {request.providerImageUrl ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={request.providerImageUrl} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-user-md text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{request.providerName}</div>
                          <div className="text-gray-500">{request.providerSpecialty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="text-gray-900">{request.credentialType}</div>
                      <div className="text-gray-500">{request.issuingAuthority}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'approved' ? 'Approved' :
                         request.status === 'pending' ? 'Pending Review' :
                         'Rejected'}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {request.status === 'pending' ? (
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => openReviewModal(request)}
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => openReviewModal(request)}
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <CredentialReviewModal
        isOpen={isModalOpen}
        onClose={closeReviewModal}
        request={selectedRequest}
      />
    </>
  );
}
