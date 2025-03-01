import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { validatePublicKey, validatePrivateKey } from "@/lib/nostr";
import { login } from "@/lib/auth";
import { UserRole } from "@/types";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<UserRole>('user');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!publicKey) {
      toast({
        title: "Missing information",
        description: "Please enter your Nostr public key (npub)",
        variant: "destructive"
      });
      return;
    }
    
    if (!validatePublicKey(publicKey)) {
      toast({
        title: "Invalid public key",
        description: "Please enter a valid Nostr public key (npub)",
        variant: "destructive"
      });
      return;
    }
    
    if (privateKey && !validatePrivateKey(privateKey)) {
      toast({
        title: "Invalid private key",
        description: "Please enter a valid Nostr private key (nsec)",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Authenticate user
      const user = await login(publicKey, loginType);
      
      // Navigate to appropriate dashboard based on role
      switch (user.role) {
        case 'authority':
          navigate('/authority/dashboard');
          break;
        case 'provider':
          navigate('/provider/profile');
          break;
        case 'user':
          navigate('/user/search');
          break;
        default:
          throw new Error('Unknown user role');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with the provided keys",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };
  
  const showNPUBInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "About Nostr Keys",
      description: "Nostr uses public/private key pairs. Your npub is your public identity, nsec is your private key which should be kept secret. Never share your nsec with anyone.",
      duration: 8000
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">MedCred</h2>
          <p className="mt-2 text-sm text-gray-600">Healthcare credential management on Nostr</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="login-type" className="block text-sm font-medium text-gray-700">I am a</label>
              <select
                id="login-type"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={loginType}
                onChange={(e) => setLoginType(e.target.value as UserRole)}
              >
                <option value="user">User (Patient)</option>
                <option value="provider">Healthcare Provider</option>
                <option value="authority">Credential Issuing Authority</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="nostr-key" className="block text-sm font-medium text-gray-700">Nostr Public Key (npub)</label>
              <input
                type="text"
                id="nostr-key"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="npub1..."
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="nostr-private-key" className="block text-sm font-medium text-gray-700">Nostr Private Key (nsec)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPrivateKey ? "text" : "password"}
                  id="nostr-private-key"
                  className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="nsec1..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={togglePrivateKeyVisibility}
                  >
                    <i className={`fas ${showPrivateKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Your keys are never stored on our servers</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <a
              href="#"
              className="font-medium text-primary-600 hover:text-primary-500 text-sm"
              onClick={showNPUBInfo}
            >
              What is an npub/nsec key?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
