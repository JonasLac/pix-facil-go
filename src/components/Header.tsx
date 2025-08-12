
import { useState } from "react";
import { QrCode, Menu, X, Home, QrCodeIcon, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pix-gradient rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold pix-gradient-text">Pix Fácil</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Simplifique seus pagamentos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left gap-3"
                onClick={() => handleMenuClick('/')}
              >
                <Home className="w-4 h-4" />
                Início
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left gap-3"
                onClick={() => handleMenuClick('/gerar-qr')}
              >
                <QrCodeIcon className="w-4 h-4" />
                Gerar QR Code
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left gap-3"
                onClick={() => handleMenuClick('/historico')}
              >
                <Clock className="w-4 h-4" />
                Histórico
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-left gap-3"
                onClick={() => handleMenuClick('/configuracoes')}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
