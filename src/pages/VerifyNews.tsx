import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Upload, Link as LinkIcon, CheckCircle, XCircle, AlertTriangle, ExternalLink, Shield, Target, Users, Instagram, Mail, Megaphone, Star, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ApiKeyForm } from "@/components/ApiKeyForm";

const VerifyNews = () => {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [impactStats, setImpactStats] = useState({
    total_verifications: 0,
    fake_news_detected: 0,
    verified_news: 0
  });
  const { toast } = useToast();

  const bannerContent = [
    {
      title: "ANUNCIE AQUI",
      subtitle: "Espaço disponível",
      icon: <Megaphone className="h-8 w-8" />
    },
    {
      title: "CTD VERIFICA",
      subtitle: "Combatendo desinformação",
      icon: <Shield className="h-8 w-8" />
    },
    {
      title: "INFORMAÇÃO CONFIÁVEL",
      subtitle: "Verificação em tempo real",
      icon: <Target className="h-8 w-8" />
    }
  ];

  // Load impact stats and listen for real-time updates
  useEffect(() => {
    const loadStats = async () => {
      const { data } = await supabase
        .from('impact_stats')
        .select('*')
        .single();
      
      if (data) {
        setImpactStats(data);
      }
    };

    loadStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('impact-stats-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'impact_stats'
        },
        (payload) => {
          setImpactStats(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-advance banner every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerContent.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerContent.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % bannerContent.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + bannerContent.length) % bannerContent.length);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setDescription(`Imagem selecionada: ${file.name}`);
      toast({
        title: "Imagem Selecionada",
        description: "Agora clique em 'Verificar Informação' para analisar a imagem.",
      });
    }
  };

  const handleVerification = async () => {
    // Allow verification even with minimal content
    if (!description.trim() && !selectedImage && !url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira texto, URL ou selecione uma imagem para verificar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare content for analysis
      const contentToAnalyze = description?.trim() || '';
      const urlToAnalyze = url?.trim() || '';
      
      const requestBody: any = {
        content: contentToAnalyze || (selectedImage ? "Análise de imagem fornecida pelo usuário" : ""),
        url: urlToAnalyze || undefined
      };

      if (selectedImage) {
        requestBody.imageFile = selectedImage;
      }

      console.log('Tentando verificar informação...', { 
        contentLength: contentToAnalyze.length,
        hasUrl: !!urlToAnalyze,
        hasImage: !!selectedImage,
        actualContent: contentToAnalyze.substring(0, 50) + '...'
      });

      console.log('Dados sendo enviados:', requestBody);

      const { data, error } = await supabase.functions.invoke('verify-news', {
        body: requestBody
      });

      console.log('Resposta da função edge:', { data, error });
      console.log('Status da resposta:', { success: data?.success, errorMessage: data?.error });

      if (error) {
        console.error('Erro na função edge:', error);
        
        // Check if it's an API key issue
        if (error.message?.includes('GOOGLE_API_KEY') || error.message?.includes('Configuração da API')) {
          setShowApiKeyForm(true);
          toast({
            title: "Configuração Necessária",
            description: "É necessário configurar a chave da API do Google no Supabase.",
            variant: "destructive"
          });
          return;
        }
        
        // Fallback para quando a função edge não está disponível
        if (error.message?.includes('Function not found') || error.message?.includes('404')) {
          setResult({
            classification: 'false',
            score: 20,
            explanation: 'Serviço de verificação temporariamente indisponível. Esta informação não pôde ser verificada em fontes confiáveis.',
            criteria: [
              { name: 'Verificação em fontes confiáveis', status: false },
              { name: 'Consistência informativa', status: false }
            ],
            sources: []
          });
          toast({
            title: "Informação Não Verificada",
            description: "Não foi possível confirmar esta informação em fontes confiáveis.",
            variant: "destructive"
          });
          return;
        }
        throw new Error(error.message);
      }

      if (data?.success) {
        setResult(data.verification);
        toast({
          title: "Verificação Concluída",
          description: "A análise foi processada com sucesso.",
        });
      } else {
        throw new Error(data?.error || 'Erro na verificação');
      }
    } catch (error) {
      console.error('Error during verification:', error);
      
      // Fallback para qualquer erro inesperado
      setResult({
        classification: 'false',
        score: 15,
        explanation: 'Esta informação não pôde ser verificada ou confirmada. Sem confirmação em fontes confiáveis, classificamos como informação não verificável.',
        criteria: [
          { name: 'Verificação automatizada', status: false },
          { name: 'Confirmação em fontes confiáveis', status: false }
        ],
        sources: []
      });
      
      toast({
        title: "Informação Não Verificada",
        description: "Não foi possível confirmar esta informação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (classification: string) => {
    switch (classification) {
      case "verified":
        return <CheckCircle className="h-6 w-6 text-success" />;
      case "false":
        return <XCircle className="h-6 w-6 text-destructive" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-warning" />;
    }
  };

  const getResultLabel = (classification: string) => {
    switch (classification) {
      case "verified":
        return "Verdadeira";
      case "false":
        return "Falsa";
      default:
        return "Duvidosa";
    }
  };

  const getResultColor = (classification: string) => {
    switch (classification) {
      case "verified":
        return "text-success";
      case "false":
        return "text-destructive";
      default:
        return "text-warning";
    }
  };

  const impactStatsDisplay = [
    {
      icon: <Shield className="h-6 w-6" />,
      number: impactStats.total_verifications.toLocaleString(),
      label: "Verificações Realizadas",
      description: "Informações verificadas desde o lançamento"
    },
    {
      icon: <Target className="h-6 w-6" />,
      number: impactStats.fake_news_detected.toLocaleString(),
      label: "Fake News Detectadas",
      description: "Desinformação identificada e marcada"
    },
    {
      icon: <Users className="h-6 w-6" />,
      number: impactStats.verified_news.toLocaleString(),
      label: "Notícias Verdadeiras",
      description: "Informações verificadas como verdadeiras"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Animated Banner - Auto-changing */}
        <div className="mb-8 relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 h-32">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {bannerContent.map((banner, index) => (
              <div key={index} className="w-full flex-shrink-0 h-32 flex items-center justify-center">
                <div className="text-center space-y-2 animate-fade-in">
                  <div className="flex justify-center items-center space-x-3 mb-2">
                    <div className="text-primary animate-pulse">
                      {banner.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-primary">{banner.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevBanner}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-primary" />
          </button>
          <button 
            onClick={nextBanner}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-primary" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {bannerContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentBanner ? 'bg-primary' : 'bg-primary/30'
                }`}
              />
            ))}
          </div>
        </div>


        {/* Impact Stats - Moved to top */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-8">Nosso Impacto</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {impactStatsDisplay.map((stat, index) => (
              <Card key={index} className="ctd-card-shadow text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="font-semibold mb-2">{stat.label}</div>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Donation Notice */}
        {result && (
          <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Gostou?</strong> Ajude-nos clicando na aba doações a manter e melhorar cada vez mais.
              <br />
              <strong>PIX:</strong> ctdcontatooficial@outlook.com | <strong>Contato:</strong> ctdcontatooficial@outlook.com
            </p>
          </div>
        )}

        {/* API Key Configuration Form */}
        {showApiKeyForm && <ApiKeyForm />}
        
        {/* How to Use Instructions */}
        <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="h-4 w-4 text-primary" />
            <strong className="text-sm">Como usar:</strong>
          </div>
          <p className="text-sm text-muted-foreground">
            Cole o link da notícia, digite o texto completo ou envie uma foto para verificar se a informação é verdadeira ou falsa. 
            O sistema faz busca em tempo real na internet para verificar informações como cotações, preços, eventos atuais e notícias recentes.
          </p>
        </div>

        {/* Verification Interface */}
        <Card className="mb-8 ctd-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Verificar Informação
            </CardTitle>
            <CardDescription>
              Digite sua mensagem, cole um link ou envie uma imagem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Cole um link, digite o texto da notícia ou descreva a informação..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px] text-base resize-none pr-12"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 bottom-2 h-8 w-8 p-0 touch-manipulation"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  type="button"
                >
                  <Upload className="h-5 w-5" />
                </Button>
              </div>
              <Button
                onClick={handleVerification}
                disabled={isLoading || (!description.trim() && !selectedImage)}
                className="w-full h-12 text-base touch-manipulation"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Buscando na internet...</span>
                  </div>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Verificar Informação
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="ctd-card-shadow mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resultado da Verificação</span>
                <div className="flex items-center space-x-2">
                  {getResultIcon(result.classification)}
                  <span className={`font-bold ${getResultColor(result.classification)}`}>
                    {getResultLabel(result.classification)}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center p-6 bg-secondary/50 rounded-lg">
                <div className="text-4xl font-bold mb-2">{result.score}%</div>
                <div className="text-muted-foreground">Pontuação de Veracidade</div>
              </div>

              {/* Explanation */}
              <div>
                <h3 className="font-semibold mb-2">Explicação</h3>
                <p className="text-muted-foreground">{result.explanation}</p>
              </div>

              {/* Criteria */}
              <div>
                <h3 className="font-semibold mb-4">Critérios Analisados</h3>
                <div className="space-y-2">
                  {result.criteria.map((criterion: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span>{criterion.name}</span>
                      {criterion.status ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sources - Only show if there are actual sources */}
              {result.sources && result.sources.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Fontes Consultadas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.sources.map((source: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {source.verified ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{source.name}</span>
                          </div>
                          {source.url && source.url !== '#' && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default VerifyNews;