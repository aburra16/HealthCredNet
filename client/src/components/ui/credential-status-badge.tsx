import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface CredentialStatusBadgeProps {
  status: string;
  className?: string;
}

export default function CredentialStatusBadge({
  status,
  className = ""
}: CredentialStatusBadgeProps) {
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
  
  // Return just the badge for inline use
  return (
    <Badge variant="outline" className={`${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}