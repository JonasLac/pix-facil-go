
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share, QrCode } from "lucide-react";
import { PixKey } from "./PixKeyForm";

interface PixKeyListProps {
  keys: PixKey[];
  onDeleteKey: (id: string) => void;
  onGenerateQR: (key: PixKey) => void;
}

const PixKeyList = ({ keys, onDeleteKey, onGenerateQR }: PixKeyListProps) => {
  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      cpf: "CPF",
      cnpj: "CNPJ",
      email: "Email",
      phone: "Telefone",
      random: "Aleatória"
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      cpf: "bg-blue-100 text-blue-800",
      cnpj: "bg-purple-100 text-purple-800",
      email: "bg-green-100 text-green-800",
      phone: "bg-orange-100 text-orange-800",
      random: "bg-gray-100 text-gray-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const maskValue = (type: string, value: string) => {
    if (type === "cpf") {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4");
    }
    if (type === "email") {
      const [user, domain] = value.split("@");
      return `${user.charAt(0)}***@${domain}`;
    }
    if (type === "phone") {
      return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-****");
    }
    return value;
  };

  if (keys.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500 mb-4">Nenhuma chave Pix cadastrada ainda</p>
          <p className="text-sm text-gray-400">Cadastre sua primeira chave para começar a receber pagamentos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map((key) => (
        <Card key={key.id} className="animate-fade-in hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getTypeColor(key.type)}>
                    {getTypeLabel(key.type)}
                  </Badge>
                  <span className="font-medium text-gray-900">{key.label}</span>
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  {maskValue(key.type, key.value)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Criada em {new Date(key.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => onGenerateQR(key)}
                  className="bg-pix-gradient hover:bg-pix-green-dark"
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  Gerar QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteKey(key.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PixKeyList;
