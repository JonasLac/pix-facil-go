import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share, QrCode } from "lucide-react";
import { PixKey } from "./PixKeyForm";
import { toast } from "@/hooks/use-toast";

interface QRGeneratorProps {
  selectedKey: PixKey;
  onBack: () => void;
}

const QRGenerator = ({ selectedKey, onBack }: QRGeneratorProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);

  const generateBRCode = (pixKey: PixKey, amount: string, description: string) => {
    // Payload Format Indicator (ID 00)
    const payloadFormatIndicator = "000201";
    
    // Point of Initiation Method (ID 01) - opcional para pagamento único
    const pointOfInitiation = "010211";
    
    // Merchant Account Information (ID 26)
    const pixKeyValue = pixKey.value.trim();
    const gui = "0014BR.GOV.BCB.PIX";
    const keyField = `01${pixKeyValue.length.toString().padStart(2, '0')}${pixKeyValue}`;
    const merchantAccountInfo = gui + keyField;
    const merchantAccountField = `26${merchantAccountInfo.length.toString().padStart(2, '0')}${merchantAccountInfo}`;
    
    // Merchant Category Code (ID 52)
    const merchantCategoryCode = "52040000";
    
    // Transaction Currency (ID 53) - 986 = BRL
    const transactionCurrency = "5303986";
    
    // Transaction Amount (ID 54) - apenas se valor for informado
    let transactionAmount = "";
    if (amount && parseFloat(amount) > 0) {
      const amountValue = parseFloat(amount).toFixed(2);
      transactionAmount = `54${amountValue.length.toString().padStart(2, '0')}${amountValue}`;
    }
    
    // Country Code (ID 58)
    const countryCode = "5802BR";
    
    // Merchant Name (ID 59)
    const merchantName = pixKey.label.substring(0, 25);
    const merchantNameField = `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
    
    // Merchant City (ID 60)
    const merchantCity = "6009SAO PAULO";
    
    // Additional Data Field Template (ID 62)
    let additionalDataField = "";
    if (description && description.trim()) {
      const desc = description.trim().substring(0, 99);
      const txidField = `05${desc.length.toString().padStart(2, '0')}${desc}`;
      additionalDataField = `62${(txidField.length).toString().padStart(2, '0')}${txidField}`;
    } else {
      // Campo obrigatório mesmo que vazio (TXID = ***)
      const txidField = "0503***"; // ID 05 (TXID), Length 03, Value ***
      additionalDataField = `62${(txidField.length).toString().padStart(2, '0')}${txidField}`;
    }
    
    // CRC16 Placeholder (ID 63)
    const crcPlaceholder = "6304";
    
    // Montar payload sem CRC
    const payloadWithoutCrc = payloadFormatIndicator + 
                             pointOfInitiation + 
                             merchantAccountField + 
                             merchantCategoryCode + 
                             transactionCurrency + 
                             transactionAmount + 
                             countryCode + 
                             merchantNameField + 
                             merchantCity + 
                             additionalDataField + 
                             crcPlaceholder;
    
    // Calcular CRC16
    const crc16 = calculateCRC16(payloadWithoutCrc);
    const finalPayload = payloadWithoutCrc + crc16;
    
    return finalPayload;
  };

  const calculateCRC16 = (data: string) => {
    let crc = 0xFFFF;
    const polynomial = 0x1021;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= (data.charCodeAt(i) << 8);
      
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  const generateQRCode = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erro",
        description: "Digite um valor válido",
        variant: "destructive",
      });
      return;
    }

    const brCode = generateBRCode(selectedKey, amount, description);
    console.log("BR Code gerado:", brCode);
    console.log("Tamanho do BR Code:", brCode.length);
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(brCode)}`;
    
    setQrCode(qrCodeUrl);
    
    toast({
      title: "QR Code gerado!",
      description: "Seu QR Code está pronto para pagamento",
    });
  };

  const shareQRCode = () => {
    if (navigator.share && qrCode) {
      navigator.share({
        title: "QR Code Pix",
        text: `Pagamento Pix - R$ ${amount}`,
        url: qrCode,
      });
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(qrCode || "");
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

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="pix-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chave Selecionada</CardTitle>
            <Button variant="outline" size="sm" onClick={onBack}>
              Voltar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Badge className={getTypeColor(selectedKey.type)}>
              {getTypeLabel(selectedKey.type)}
            </Badge>
            <div>
              <p className="font-medium">{selectedKey.label}</p>
              <p className="text-sm text-gray-600 font-mono">{selectedKey.value}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="pix-card">
        <CardHeader>
          <CardTitle className="text-lg">Dados do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="text-lg font-medium"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pagamento de serviço, produto..."
              maxLength={100}
            />
          </div>

          <Button
            onClick={generateQRCode}
            className="w-full bg-pix-gradient hover:bg-pix-green-dark text-lg py-6"
            disabled={!amount}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Gerar QR Code Pix
          </Button>
        </CardContent>
      </Card>

      {qrCode && (
        <Card className="pix-card text-center">
          <CardHeader>
            <CardTitle className="text-lg">QR Code Gerado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              <img src={qrCode} alt="QR Code Pix" className="w-64 h-64 mx-auto" />
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
                onClick={() => setQrCode(null)}
                className="flex-1"
              >
                Novo QR Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRGenerator;
