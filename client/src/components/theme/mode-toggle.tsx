import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    console.log('Current theme setting:', theme);
    console.log('Actual resolved theme:', resolvedTheme);
    
    // Toggle between dark and light directly, not system
    if (resolvedTheme === 'dark') {
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
      title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className={`h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'opacity-0 scale-0 -rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-300 ${resolvedTheme === 'dark' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-0 rotate-90'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}