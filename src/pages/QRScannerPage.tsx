import { useState } from "react";
import { QRScanner } from "@/components/qr/QRScanner";
import { QRScanResult } from "@/components/qr/QRScanResult";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const QRScannerPage = () => {
  const [scannedCode, setScannedCode] = useState<string>("");

  const handleScan = (result: string) => {
    setScannedCode(result);
  };

  const handleBack = () => {
    setScannedCode("");
  };

  if (scannedCode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button onClick={handleBack} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Scan Another
          </Button>
          <QRScanResult qrCode={scannedCode} onClose={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">QR Scanner</h1>
        <QRScanner onScan={handleScan} />
      </div>
    </div>
  );
};