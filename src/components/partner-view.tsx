import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye, ShieldCheck } from "lucide-react";

export function PartnerView() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Partner View</CardTitle>
        <CardDescription>This is how partners see your score when you grant them access.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4 bg-secondary/50">
            <div className="flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                    <p className="font-semibold text-sm">Anonymous User #4B7A</p>
                    <p className="text-sm text-muted-foreground">Credit Score: 785</p>
                </div>
            </div>
            <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Your raw data is never exposed. Partners only see your anonymized score and risk level after you explicitly share it.</p>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full">
              <Share2 className="mr-2 h-4 w-4" /> Share Score
            </Button>
            <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
