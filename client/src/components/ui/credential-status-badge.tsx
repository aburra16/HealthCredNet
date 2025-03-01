import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
        return <CheckCircle className="h-3.5 w-3.5 mr-1.5" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 mr-1.5" />;
      case 'rejected':
        return <XCircle className="h-3.5 w-3.5 mr-1.5" />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'pending':
        return "bg-amber-50 text-amber-700 border-amber-200";
      case 'rejected':
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  // Return just the badge for inline use
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "rounded-md py-1 px-2.5 font-medium text-xs", 
        getStatusColor(), 
        className
      )}
    >
      {getStatusIcon()}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}