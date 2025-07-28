
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import PixKeyForm, { PixKey } from "@/components/PixKeyForm";
import PixKeyList from "@/components/PixKeyList";
import QRGenerator from "@/components/QRGenerator";
import PrimaryKeyCard from "@/components/PrimaryKeyCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Share, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "keys" | "add-key" | "generate-qr">("dashboard");
  const [pixKeys, setPixKeys] = useState<PixKey[]>([]);
  const [selectedKey, setSelectedKey] = useState<PixKey | null>(null);

  // Carregar chaves do localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem("pixKeys");
    if (savedKeys) {
      setPixKeys(JSON.parse(savedKeys));
    }
  }, []);

  // Salvar chaves no localStorage
  useEffect(() => {
    localStorage.setItem("pixKeys", JSON.stringify(pixKeys));
  }, [pixKeys]);

  const handleSavePixKey = (newKey: Omit<PixKey, 'id' | 'createdAt'>) => {
    // Se a nova chave for marcada como principal, remover a flag das outras
    let updatedKeys = pixKeys;
    if (newKey.isPrimary) {
      updatedKeys = pixKeys.map(key => ({ ...key, isPrimary: false }));
    }

    const pixKey: PixKey = {
      ...newKey,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setPixKeys([...updatedKeys, pixKey]);
    setCurrentView("keys");
  };

  const handleDeleteKey = (id: string) => {
    setPixKeys(prev => prev.filter(key => key.id !== id));
    toast({
      title: "Chave removida",
      description: "A chave Pix foi excluída com sucesso",
    });
  };

  const handleSetPrimary = (id: string) => {
    setPixKeys(prev => prev.map(key => ({
      ...key,
      isPrimary: key.id === id
    })));
    toast({
      title: "Chave principal definida",
      description: "A chave foi definida como principal com sucesso",
    });
  };

  const handleGenerateQR = (key: PixKey) => {
    setSelectedKey(key);
    setCurrentView("generate-qr");
  };

  const primaryKey = pixKeys.find(key => key.isPrimary);

  const renderCurrentView = () => {
    switch (currentView) {
      case "add-key":
        return (
          <PixKeyForm
            onSave={handleSavePixKey}
            onCancel={() => setCurrentView("keys")}
          />
        );
      
      case "keys":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Minhas Chaves Pix</h2>
              <Button 
                onClick={() => setCurrentView("add-key")}
                className="bg-pix-gradient hover:bg-pix-green-dark"
              >
                + Nova Chave
              </Button>
            </div>
            <PixKeyList
              keys={pixKeys}
              onDeleteKey={handleDeleteKey}
              onGenerateQR={handleGenerateQR}
              onSetPrimary={handleSetPrimary}
            />
          </div>
        );

      case "generate-qr":
        return selectedKey ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Gerar QR Code</h2>
            <QRGenerator
              selectedKey={selectedKey}
              onBack={() => setCurrentView("keys")}
            />
          </div>
        ) : null;

      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h1 className="text-3xl font-bold pix-gradient-text mb-4">
                Bem-vindo ao Pix Fácil
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Simplifique seus pagamentos Pix: cadastre suas chaves, gere QR Codes e receba pagamentos em segundos.
              </p>
            </div>

            {primaryKey && (
              <PrimaryKeyCard 
                primaryKey={primaryKey}
                onGenerateQR={handleGenerateQR}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Chaves Cadastradas"
                value={pixKeys.length}
                icon={User}
              />
              <StatsCard
                title="QR Codes Gerados"
                value="0"
                icon={QrCode}
                gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
              />
              <StatsCard
                title="Compartilhamentos"
                value="0"
                icon={Share}
                gradient="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="pix-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-pix-green" />
                    Gerenciar Chaves Pix
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Cadastre e gerencie suas chaves Pix de forma simples e organizada.
                  </p>
                  <Button 
                    onClick={() => setCurrentView("keys")}
                    className="w-full bg-pix-gradient hover:bg-pix-green-dark"
                  >
                    Ver Minhas Chaves
                  </Button>
                </CardContent>
              </Card>

              <Card className="pix-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-pix-blue" />
                    Gerar QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Crie QR Codes Pix instantaneamente para receber pagamentos.
                  </p>
                  <Button 
                    onClick={() => setCurrentView("add-key")}
                    variant="outline"
                    className="w-full"
                    disabled={pixKeys.length === 0}
                  >
                    {pixKeys.length === 0 ? "Cadastre uma chave primeiro" : "Gerar QR Code"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {pixKeys.length === 0 && (
              <Card className="pix-card text-center py-8 bg-pix-gradient-light">
                <CardContent>
                  <QrCode className="w-16 h-16 mx-auto text-pix-green mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Comece agora!</h3>
                  <p className="text-gray-600 mb-4">
                    Cadastre sua primeira chave Pix para começar a receber pagamentos
                  </p>
                  <Button 
                    onClick={() => setCurrentView("add-key")}
                    className="bg-pix-gradient hover:bg-pix-green-dark"
                  >
                    + Cadastrar Primeira Chave
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex space-x-1 mb-6">
          <Button
            variant={currentView === "dashboard" ? "default" : "ghost"}
            onClick={() => setCurrentView("dashboard")}
            className={currentView === "dashboard" ? "bg-pix-gradient hover:bg-pix-green-dark" : ""}
          >
            Dashboard
          </Button>
          <Button
            variant={currentView === "keys" || currentView === "add-key" ? "default" : "ghost"}
            onClick={() => setCurrentView("keys")}
            className={currentView === "keys" || currentView === "add-key" ? "bg-pix-gradient hover:bg-pix-green-dark" : ""}
          >
            Minhas Chaves ({pixKeys.length})
          </Button>
        </nav>

        {renderCurrentView()}
      </main>
    </div>
  );
};

export default Index;
