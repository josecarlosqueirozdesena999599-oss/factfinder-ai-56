import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Shield, Target, Users, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Donations = () => {
  const [pixKey, setPixKey] = useState("ctdcontatooficial@outlook.com");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast({
        title: "PIX copiado!",
        description: "A chave PIX foi copiada para sua área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-4 md:mb-6">
            <Heart className="h-12 w-12 md:h-16 md:w-16 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-2">Apoie o CTD</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Sua contribuição é fundamental para mantermos a luta contra a desinformação. 
            Ajude-nos a construir um futuro mais informado e democrático.
          </p>
        </div>

        {/* PIX Donation */}
        <Card className="mb-8 md:mb-12 ctd-card-shadow mx-2 md:mx-0">
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-xl md:text-2xl text-center">Doe via PIX</CardTitle>
            <CardDescription className="text-center text-sm md:text-base px-2">
              Sua contribuição ajuda a manter o CTD funcionando e melhorando cada vez mais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="w-full max-w-md mx-auto">
              <Label htmlFor="pix-key" className="text-sm md:text-base font-semibold">Chave PIX do CTD</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="pix-key"
                  value={pixKey}
                  readOnly
                  className="bg-secondary/50 text-sm md:text-base h-10 md:h-11"
                />
                <Button
                  onClick={copyPixKey}
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-10 md:h-11 px-3 md:px-4 touch-manipulation"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                Clique no botão para copiar a chave PIX
              </p>
            </div>

            <div className="text-center p-4 md:p-6 bg-primary/10 rounded-lg mx-2 md:mx-0">
              <p className="text-sm md:text-base text-muted-foreground">
                ✨ <strong>Qualquer valor faz a diferença!</strong> ✨<br/>
                Sua doação é 100% destinada ao combate à desinformação.
              </p>
            </div>

            {/* Valores sugeridos para mobile */}
            <div className="block md:hidden">
              <Label className="text-sm font-semibold mb-3 block">Valores Sugeridos</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-12 text-sm touch-manipulation">R$ 5,00</Button>
                <Button variant="outline" className="h-12 text-sm touch-manipulation">R$ 10,00</Button>
                <Button variant="outline" className="h-12 text-sm touch-manipulation">R$ 25,00</Button>
                <Button variant="outline" className="h-12 text-sm touch-manipulation">R$ 50,00</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Use os valores como referência para sua doação via PIX
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donations;