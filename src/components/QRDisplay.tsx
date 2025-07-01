
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share } from "lucide-react";
import { PixKey } from "./PixKeyForm";
import { toast } from "@/hooks/use-toast";

interface QRDisplayProps {
  qrCodeUrl: string;
  amount: string;
  description: string;
  selectedKey: PixKey;
  onNewQRCode: () => void;
}

const QRDisplay = ({ qrCodeUrl, amount, description, selectedKey, onNewQRCode }: QRDisplayProps) => {
  const shareQRCode = () => {
    if (navigator.share && qrCodeUrl) {
      navigator.share({
        title: "QR Code Pix",
        text: `Pagamento Pix - R$ ${amount}`,
        url: qrCodeUrl,
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(qrCodeUrl || "");
      toast({
        title: "Link copiado!",
        description: "O link do QR Code foi copiado para a área de transferência",
      });
    }
  };

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

  return (
    <Card className="pix-card text-center">
      <CardHeader>
        <CardTitle className="text-lg">QR Code Gerado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
          <img src={qrCodeUrl} alt="QR Code Pix" className="w-64 h-64 mx-auto" />
        </div>
        
        <div className="bg-pix-gradient-light p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Dados do pagamento:</p>
          <p className="font-bold text-lg">R$ {parseFloat(amount).toFixed(2)}</p>
          {description && <p className="text-sm text-gray-600">{description}</p>}
          <p className="text-xs text-gray-500 mt-2">
            Chave: {selectedKey.label} ({getTypeLabel(selectedKey.type)})
          </p>
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={shareQRCode}
            className="flex-1 bg-pix-gradient hover:bg-pix-green-dark"
          >
            <Share className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
          <Button 
            variant="outline" 
            onClick={onNewQRCode}
            className="flex-1"
          >
            Novo QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRDisplay;
