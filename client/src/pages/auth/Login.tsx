import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { validatePublicKey, validatePrivateKey, hasNip07Extension, getNip07PublicKey } from "@/lib/nostr";
import { login } from "@/lib/auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  // Add fade-in animation class
  useEffect(() => {
    document.documentElement.classList.add('login-page');
    return () => {
      document.documentElement.classList.remove('login-page');
    };
  }, []);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginType, setLoginType] = useState<UserRole>('user');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [authorityToken, setAuthorityToken] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);
  
  useEffect(() => {
    // Check if browser has Nostr extension
    setHasExtension(hasNip07Extension());
  }, []);
  
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
      // Special handling for authority role
      let user;
      if (loginType === 'authority') {
        const nosFabricaTestNsec = 'nsec18r04f8s6u6z6uestrtyn2xh6jjlrgpgapa6mg75fth97sh2hn2dqccjlum';
        const nosFabricaTestPubkey = 'npub1uvc02wxk75r06n5wu8jwg8w3slycyw9hqpxlgngprdty393tv87s3wfcxu';
        
        // Strictly check private key for authority logins
        if (!privateKey) {
          console.error("Authority login attempt without nsec key");
          toast({
            title: "Authority login restricted",
            description: "You must provide the NosFabricaTest private key to log in as an authority",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Validating authority credentials...");
        
        // Do exact string comparison for authority restriction
        if (privateKey !== nosFabricaTestNsec) {
          console.error("Authority login attempt with incorrect nsec key");
          toast({
            title: "Authority login denied",
            description: "Only the official NosFabricaTest account can log in as an authority. Your credentials don't match.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("NosFabricaTest credentials verified, using hardcoded token");
        
        // For authority, use the NosFabricaTest pubkey and hardcoded token
        // This bypasses any state updates that might not have happened yet
        user = await login(nosFabricaTestPubkey, loginType, "nosfabrica-test-9876543210");
      } else {
        // For non-authority roles, use the standard login flow
        user = await login(publicKey, loginType);
      }
      
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
  
  const handleExtensionLogin = async () => {
    try {
      setIsLoading(true);
      const npub = await getNip07PublicKey();
      
      if (!npub) {
        toast({
          title: "Extension error",
          description: "Could not get public key from extension",
          variant: "destructive"
        });
        return;
      }
      
      setPublicKey(npub);
      
      // Block extension login for authority role
      if (loginType === 'authority') {
        toast({
          title: "Authority login restricted",
          description: "Authority role requires manual login with NosFabricaTest credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Authenticate user
      const user = await login(npub, loginType);
      
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
      console.error('Extension login error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with the extension",
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
  
  // Role-specific descriptions and icons
  const roleInfo = {
    user: {
      title: "Patient Login",
      description: "Access your personal health records and find verified healthcare providers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    provider: {
      title: "Provider Login",
      description: "Manage your credentials and professional profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
          <path d="M12 7h.01"></path>
        </svg>
      ),
      color: "bg-green-50 text-green-600 border-green-100"
    },
    authority: {
      title: "Authority Login",
      description: "Issue and verify healthcare credentials for trusted providers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      color: "bg-purple-50 text-purple-600 border-purple-100"
    }
  };
  
  const currentRole = roleInfo[loginType];
  
  return (
    <div className="visualens-accent-top min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#fafbff] relative overflow-hidden">
      {/* Visual accent elements */}
      <div className="visualens-accent visualens-accent-1 text-primary absolute"></div>
      <div className="visualens-accent visualens-accent-2 text-primary/80 absolute"></div>
      <div className="visualens-accent visualens-accent-3 text-primary absolute"></div>
      
      {/* Decorative geometric elements */}
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary/5 to-background"></div>
      
      {/* Bottom right geometric shape */}
      <div className="absolute bottom-0 right-0 w-1/3 h-64 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-[100px]"></div>
      
      {/* Floating decorative elements - Visualens inspired */}
      <div className="absolute top-[10%] left-[5%] w-16 h-16 bg-primary/5 rounded-full blur-xl"></div>
      <div className="absolute top-[30%] right-[10%] w-24 h-24 bg-primary/3 rounded-full blur-xl"></div>
      <div className="absolute bottom-[15%] left-[15%] w-20 h-20 bg-primary/2 rounded-full blur-xl"></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-[15%] right-[20%] w-8 h-8 border border-primary/10 rounded-lg rotate-12"></div>
      <div className="absolute bottom-[30%] left-[10%] w-10 h-10 border border-primary/10 rounded-full"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="bg-primary text-white p-3 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h2 className="ml-3 text-3xl font-bold tracking-tight text-primary">MedCred</h2>
          </div>
          <p className="mt-3 text-sm text-muted-foreground font-medium tracking-wide uppercase">Healthcare credential verification</p>
        </div>
        
        <div className="visualens-gradient-card mt-8">
          <div className="space-y-8">
            <Tabs 
            value={loginType} 
            onValueChange={(value) => setLoginType(value as UserRole)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 p-1 bg-primary/5 rounded-xl">
              <TabsTrigger 
                value="user" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-3"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="mt-1 text-xs font-medium">Patient</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="provider" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-3"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                  <span className="mt-1 text-xs font-medium">Provider</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="authority" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm py-3"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span className="mt-1 text-xs font-medium">Authority</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="mt-6">
              <div className="bg-primary/5 rounded-xl p-4 flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  {roleInfo.user.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-foreground">{roleInfo.user.title}</h3>
                  <p className="text-xs mt-1 text-muted-foreground">{roleInfo.user.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="provider" className="mt-6">
              <div className="bg-primary/5 rounded-xl p-4 flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  {roleInfo.provider.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-foreground">{roleInfo.provider.title}</h3>
                  <p className="text-xs mt-1 text-muted-foreground">{roleInfo.provider.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="authority" className="mt-6">
              <div className="bg-primary/5 rounded-xl p-4 flex items-start">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  {roleInfo.authority.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-foreground">{roleInfo.authority.title}</h3>
                  <p className="text-xs mt-1 text-muted-foreground">{roleInfo.authority.description}</p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-800 text-xs">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>
                    Authority login is restricted to <strong>NosFabricaTest</strong> only.
                    <br/>
                    <span className="mt-1 inline-block">
                      Use nsec key: <strong>nsec18r04f8s6u6z6uestrtyn2xh6jjlrgpgapa6mg75fth97sh2hn2dqccjlum</strong>
                    </span>
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="pt-2">
            <div className="flex items-center">
              <div className="h-px bg-border flex-grow"></div>
              <h3 className="text-base font-semibold px-4 text-foreground">Sign In</h3>
              <div className="h-px bg-border flex-grow"></div>
            </div>
            
            {hasExtension && (
              <Button
                type="button"
                className="w-full mt-6 text-white flex items-center justify-center gap-2 py-6 rounded-xl transition-all"
                style={{
                  background: "linear-gradient(180deg, #4A5BE1, #3D52D0)",
                  boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 16px -4px rgba(65, 91, 232, 0.3)"
                }}
                onClick={handleExtensionLogin}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Sign in with Nostr Extension
              </Button>
            )}
            
            {hasExtension && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-muted-foreground font-medium">Or sign in manually</span>
                </div>
              </div>
            )}
            
            <form className="mt-6 space-y-5" onSubmit={handleLogin}>
              <div>
                <label htmlFor="nostr-key" className="block text-sm font-medium text-foreground">Nostr Public Key (npub)</label>
                <input
                  type="text"
                  id="nostr-key"
                  className="form-input mt-1.5 text-sm"
                  placeholder="npub1..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="nostr-private-key" className="block text-sm font-medium text-foreground">
                  Nostr Private Key (nsec)
                  <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                </label>
                <div className="mt-1.5 relative">
                  <input
                    type={showPrivateKey ? "text" : "password"}
                    id="nostr-private-key"
                    className="form-input text-sm pr-10"
                    placeholder="nsec1..."
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={togglePrivateKeyVisibility}
                  >
                    {showPrivateKey ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Your keys are never stored on our servers
                </p>
              </div>
              
              {/* Authority Token Field - Auto-filled for NosFabricaTest */}
              {loginType === 'authority' && (
                <div>
                  <label htmlFor="authority-token" className="block text-sm font-medium text-foreground">
                    Auth Token
                    <span className="text-xs text-green-500 ml-1">(auto-filled)</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      type="text"
                      id="authority-token"
                      className="form-input text-sm pr-10 bg-gray-50"
                      value="nosfabrica-test-9876543210"
                      readOnly
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-green-600 flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    Token is automatically provided for the NosFabricaTest account
                  </p>
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full text-white flex items-center justify-center gap-2 py-6 rounded-xl transition-all"
                  style={{
                    background: "linear-gradient(180deg, #4A5BE1, #3D52D0)",
                    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 8px 16px -4px rgba(65, 91, 232, 0.3)"
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                      Sign in
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center">
              <a
                href="#"
                className="text-sm text-primary hover:text-primary/80 flex items-center justify-center transition-colors"
                onClick={showNPUBInfo}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                What is an npub/nsec key?
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
