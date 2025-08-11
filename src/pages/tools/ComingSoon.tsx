import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TopNav from "@/components/navigation/TopNav";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

const ComingSoon = ({ title = "Coming Soon", description = "This tool is under construction. Check back shortly!" }: ComingSoonProps) => {
  useMemo(() => { document.title = `${title} – Note Bot AI`; }, [title]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/70">
      <TopNav />
      <main className="container mx-auto px-4 py-10">
        <Card className="max-w-xl mx-auto text-center">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-3">
            <Button asChild>
              <Link to="/tools">Back to Tools</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComingSoon;
