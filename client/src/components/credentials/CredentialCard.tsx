import { Credential } from "@/types";

interface CredentialCardProps {
  credential: Credential;
}

export default function CredentialCard({ credential }: CredentialCardProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <i className="fas fa-certificate text-2xl text-accent-500"></i>
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-md font-medium text-gray-900">{credential.type}</h4>
          <p className="text-sm text-gray-500">Issued by: {credential.issuerName}</p>
          
          {credential.issueDate && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <i className="fas fa-calendar-check mr-1.5 text-green-500 flex-shrink-0"></i>
              <p>Issued: {new Date(credential.issueDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</p>
            </div>
          )}
          
          {credential.badgeId && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <i className="fas fa-key mr-1.5 text-primary-500 flex-shrink-0"></i>
              <p className="truncate">NIP-58 Badge ID: {credential.badgeId.substring(0, 10)}...</p>
            </div>
          )}
          
          <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium 
            ${credential.status === 'approved' ? 'bg-green-100 text-green-800' : 
              credential.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'}`}>
            <i className={`fas ${credential.status === 'approved' ? 'fa-check-circle' : 
                         credential.status === 'pending' ? 'fa-clock' : 
                         'fa-times-circle'} mr-1`}></i>
            {credential.status === 'approved' ? 'Active' : 
             credential.status === 'pending' ? 'Pending' : 'Rejected'}
          </span>
          
          {credential.details && (
            <p className="mt-2 text-sm text-gray-600">{credential.details}</p>
          )}
        </div>
      </div>
    </div>
  );
}
