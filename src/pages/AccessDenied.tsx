import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function AccessDenied() {
  const { defaultRoute } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Acesso restrito</h1>
            <p className="text-sm text-muted-foreground">
              Sua função na igreja não possui permissão para esta área.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link to={defaultRoute}>Voltar para início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
