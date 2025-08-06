import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ExternalLink, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ApiKeyForm = () => {
  const [apiKey, setApiKey] = useState("");
  const [isTestingKey, setIsTestingKey] = useState(false);
  const { toast } = useToast();

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave de API válida",
        variant: "destructive"
      });
      return;
    }

    setIsTestingKey(true);
    
    try {
      // Test the API key by making a simple request
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello"
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso!",
          description: "Chave de API válida. Agora você pode usar o sistema de verificação.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Chave de API inválida. Verifique se está correta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar a chave de API. Verifique sua conexão.",
        variant: "destructive"
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  return (
    <Card className="mb-6 border-warning/50 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center text-warning">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Configuração Necessária
        </CardTitle>
        <CardDescription>
          Para usar o sistema de verificação, é necessário configurar a chave da API do Google Gemini nos secrets do Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold flex items-center">
            <Key className="mr-2 h-4 w-4" />
            Passos para Configuração:
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Obtenha uma chave de API do Google AI Studio</li>
            <li>Acesse o painel do Supabase do seu projeto</li>
            <li>Vá em "Edge Functions" → "Secrets"</li>
            <li>Adicione uma nova variável: <code className="bg-muted px-1 rounded">GOOGLE_API_KEY</code></li>
            <li>Cole sua chave de API como valor</li>
            <li>Salve e reimplante as Edge Functions</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Obter Chave API Google
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Painel Supabase
            </a>
          </Button>
        </div>

        <div className="border-t pt-4">
          <Label htmlFor="test-api-key" className="text-sm font-medium">
            Testar Chave de API (Opcional)
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="test-api-key"
              type="password"
              placeholder="Cole sua chave de API aqui para testar..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={testApiKey}
              disabled={isTestingKey || !apiKey.trim()}
              size="sm"
            >
              {isTestingKey ? "Testando..." : "Testar"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Esta chave é usada apenas para teste e não é salva.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};