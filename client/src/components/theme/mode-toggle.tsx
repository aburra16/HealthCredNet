import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    console.log('Current theme setting:', theme);
    
    // Toggle between dark and light directly, not system
    if (theme === 'dark') {
      console.log('Switching to light theme');
      setTheme('light');
    } else {
      console.log('Switching to dark theme');
      setTheme('dark');
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme} 
      className={`rounded-full ${className}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="h-5 w-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}