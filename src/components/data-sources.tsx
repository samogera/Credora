
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, FileText, Phone, Upload, Link as LinkIcon } from "lucide-react";

export function DataSources() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
        <CardDescription>Connect your data to build your score. You control what you share.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Wallet className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Stellar Wallet</p>
                <p className="text-sm text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
                <LinkIcon className="mr-2 h-4 w-4" /> Connect
            </Button>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Utility Bills</p>
                <p className="text-sm text-muted-foreground">Gas, Electric, Water</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Phone className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Off-chain ID</p>
                <p className="text-sm text-muted-foreground">Phone Number</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <LinkIcon className="mr-2 h-4 w-4" /> Link
            </Button>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
