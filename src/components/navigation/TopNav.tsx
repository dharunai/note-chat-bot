import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import logoMark from "@/assets/logo-main.webp";
const TopNav = () => {
  return <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoMark} alt="Note Bot AI logo" className="h-8 w-8 object-contain" loading="lazy" decoding="async" />
          <div className="leading-tight">
            <span className="tracking-tight text-primary font-bold text-sm">NOTEBOT AI</span>
            <p className="text-muted-foreground mx-0 text-xs text-left">Made by a student</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link to="/blog" aria-label="Blog" className="rounded-lg p-2 hover:bg-muted transition-smooth">
            <img src="/icons/blog.svg" alt="Blog" className="h-5 w-5" loading="lazy" decoding="async" />
          </Link>
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link to="/auth">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/tools">Tools</Link>
          </Button>
        </nav>
      </div>
    </header>;
};
export default TopNav;