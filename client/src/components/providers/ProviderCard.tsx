import { Link } from "wouter";

interface ProviderCardProps {
  id: number;
  name: string;
  specialty: string;
  institution: string;
  location: string;
  imageUrl?: string;
  isVerified: boolean;
}

export default function ProviderCard({
  id,
  name,
  specialty,
  institution,
  location,
  imageUrl,
  isVerified
}: ProviderCardProps) {
  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img className="h-16 w-16 rounded-full object-cover" src={imageUrl} alt={name} />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-user-md text-gray-400 text-xl"></i>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-900 truncate">{name}</p>
          <div className="flex items-center mt-1">
            <span className="badge badge-secondary mr-2">
              {specialty}
            </span>
            {isVerified && (
              <span className="badge badge-accent">
                <i className="fas fa-badge-check mr-1"></i> Verified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">{institution} • {location}</p>
        </div>
        <div>
          <Link href={`/user/provider/${id}`}>
            <a className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              View Profile
            </a>
          </Link>
        </div>
      </div>
    </li>
  );
}
