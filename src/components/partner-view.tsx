import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye } from "lucide-react";

export function PartnerView() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Partner View</CardTitle>
        <CardDescription>Simulated view for a lending partner evaluating your profile.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
                <p className="font-semibold text-sm">Anonymous User #4B7A</p>
                <p className="text-sm text-muted-foreground">Credit Score: 785</p>
            </div>
            <Badge variant="default" className="bg-green-500">Approved</Badge>
        </div>
        <p className="text-xs text-muted-foreground">This is how partners see your score when you grant them permission. Your raw data is never exposed.</p>
        <div className="flex gap-2">
            <Button variant="default" className="w-full">
              <Share2 className="mr-2 h-4 w-4" /> Share Score
            </Button>
            <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" /> View Details
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
