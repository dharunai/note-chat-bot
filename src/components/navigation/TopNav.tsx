import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logoMark from "@/assets/logo-mark.webp";

const TopNav = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoMark} alt="Note Bot AI logo" className="h-8 w-8 rounded-md ring-1 ring-primary/30" loading="lazy" decoding="async" />
          <span className="font-bold tracking-tight text-foreground">Note Bot AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools..."
              className="pl-9"
              aria-label="Search tools"
            />
          </div>
        </div>

<nav className="flex items-center gap-2">
  <Button variant="ghost" asChild>
    <Link to="/blog">Blog</Link>
  </Button>
  <Button variant="outline" asChild>
    <Link to="/auth">Login</Link>
  </Button>
  <Button asChild>
    <Link to="/tools">Explore Tools</Link>
  </Button>
</nav>
      </div>
    </header>
  );
};

export default TopNav;
