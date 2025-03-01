import { Badge } from "@/components/ui/badge";
import { verifyNIP58Badge } from "@/lib/nostr";
import { CheckCircle, Clock, XCircle, BadgeCheck, Shield, Award } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  return (
    <div className={cn(
      "visualens-card p-4 border border-gray-100 hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div className="ml-4 flex-1">
          <h4 className="text-sm font-semibold text-foreground">{type}</h4>
          <p className="text-xs text-muted-foreground mt-1">Issued by: {issuingAuthority}</p>
          {badgeId && (
            <p className="text-xs text-muted-foreground/70 mt-0.5 font-mono">
              {badgeId.slice(0, 8)}...{badgeId.slice(-8)}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("rounded-md py-1 px-2.5 font-medium text-xs", getStatusColor())}>
              {getStatusIcon()}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            
            {isVerified && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-md py-1 px-2.5 font-medium text-xs">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                Verified on Nostr
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
