import { Badge } from "@/components/ui/badge";
import { verifyNIP58Badge } from "@/lib/nostr";
import { CheckCircle, Clock, XCircle, Shield, Award, Medal, Sparkles } from "lucide-react";
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
        return <CheckCircle className="h-3.5 w-3.5 mr-1.5 stroke-[2.5px]" />;
      case 'pending':
        return <Clock className="h-3.5 w-3.5 mr-1.5 stroke-[2.5px]" />;
      case 'rejected':
        return <XCircle className="h-3.5 w-3.5 mr-1.5 stroke-[2.5px]" />;
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
      "visualens-gradient-card group",
      className
    )}>
      <div className="absolute inset-0 visualens-accent text-primary opacity-5"></div>
      
      <div className="flex items-start relative z-10">
        <div className="flex-shrink-0 bg-primary/10 p-3 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Medal className="h-7 w-7 text-primary relative z-10" />
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-base font-semibold text-foreground">{type}</h4>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Issued by <span className="text-primary font-semibold">{issuingAuthority}</span>
              </p>
            </div>
            
            {isVerified && (
              <div className="bg-primary/10 rounded-full p-1.5 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
          
          {badgeId && (
            <div className="mt-3 py-1 px-3 bg-primary/5 rounded-lg inline-block">
              <p className="text-[10px] text-primary/70 font-mono tracking-wide">
                {badgeId.slice(0, 8)}...{badgeId.slice(-8)}
              </p>
            </div>
          )}
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("rounded-full py-1 px-3 text-xs font-semibold", getStatusColor())}>
              {getStatusIcon()}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            
            {isVerified && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full py-1 px-3 text-xs font-semibold">
                <Shield className="h-3.5 w-3.5 mr-1.5 stroke-[2.5px]" />
                Verified on Nostr
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
