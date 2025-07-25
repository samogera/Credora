import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import Link from "next/link";

export function PartnerView() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building /> For Partners</CardTitle>
        <CardDescription>Manage your loan applications or join our growing network of lending partners.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-2">
          <Button className="w-full" asChild>
            <Link href="/dashboard/partner-admin">
                Partner Dashboard
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
              <Link href="/signup-partner">
                Become a Partner
              </Link>
          </Button>
      </CardContent>
    </Card>
  );
}
