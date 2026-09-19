import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
}

export const QRScanner = ({ onScan }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const startScanning = async () => {
    try {
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      
      setIsScanning(true);
      
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          },
          false
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            stopScanning();
          },
          (error) => {}
        );

        scannerRef.current = scanner;
      }, 100);
    } catch (error) {
      alert('Camera permission required. Please allow camera access.');
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {!isScanning ? (
        <Button onClick={startScanning} className="w-full" size="lg">
          <Camera className="h-4 w-4 mr-2" />
          Open Camera
        </Button>
      ) : (
        <div>
          <div id="qr-reader" className="w-full"></div>
          <Button onClick={stopScanning} className="w-full mt-4" variant="outline">
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  );
};