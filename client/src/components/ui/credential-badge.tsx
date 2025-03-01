import { Badge } from "@/components/ui/badge";
import { verifyNIP58Badge } from "@/lib/nostr";
import { CheckCircle, Clock, XCircle, BadgeCheck } from "lucide-react";

interface CredentialBadgeProps {
  type: string;
  status: string;
  badgeId?: string;
  issuingAuthority: string;
  className?: string;
}

export default function CredentialBadge({
  type,
  status,
  badgeId,
  issuingAuthority,
  className = ""
}: CredentialBadgeProps) {
  // Verify the badge if it exists
  const isVerified = badgeId ? verifyNIP58Badge(badgeId) : false;
  
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case 'rejected':
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className={`bg-white rounded-md shadow-sm p-3 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <BadgeCheck className="h-5 w-5 text-accent-500" />
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{type}</h4>
          <p className="text-xs text-gray-500">Issued by: {issuingAuthority}</p>
          {badgeId && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              Badge ID: {badgeId.slice(0, 12)}...
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            
            {isVerified && (
              <Badge variant="outline" className="bg-accent-100 text-accent-800 hover:bg-accent-100">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
