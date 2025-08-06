import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Users, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Verificar Notícia", icon: Shield },
    { href: "/sobre", label: "Quem Somos", icon: Users },
    { href: "/contato", label: "Contato", icon: MessageCircle },
    { href: "/doacoes", label: "Doações", icon: Heart },
  ];

  const isActivePage = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-primary-foreground tracking-tight">CTD</span>
              <span className="text-xs text-primary-foreground/90 hidden sm:block font-semibold uppercase tracking-wider leading-none">
                Contra Toda Desinformação
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={isActivePage(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={
                    isActivePage(item.href) 
                      ? "bg-white text-primary hover:bg-white/90" 
                      : "text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                  }
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={
                      isActivePage(item.href)
                        ? "justify-start bg-white text-primary hover:bg-white/90"
                        : "justify-start text-primary-foreground hover:bg-white/10"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link to={item.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;