import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function DownloadButton() {
  const handleDownload = () => {
    window.location.href = "/api/download";
  };

  return (
    <Button onClick={handleDownload} className="flex items-center gap-2">
      <Download size={16} />
      Download App
    </Button>
  );
}