import { Shield, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Social Media Section */}
          <div className="text-center space-y-2">
            <span className="text-sm font-semibold text-foreground">Siga-nos</span>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover-scale" asChild>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ctdcontatooficial@outlook.com&su=Contato%20CTD&body=Olá,%20gostaria%20de%20entrar%20em%20contato%20sobre:" target="_blank" rel="noopener noreferrer">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover-scale">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Email: ctdcontatooficial@outlook.com
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              CTD © 2025 - Contra Toda Desinformação
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;