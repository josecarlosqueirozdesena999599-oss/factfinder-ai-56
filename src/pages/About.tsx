import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Target, Users, Zap } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Transparência",
      description: "Todos os nossos critérios de verificação são públicos e baseados em evidências científicas."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Precisão",
      description: "Utilizamos tecnologia de ponta e fontes confiáveis para garantir resultados precisos."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Comunidade",
      description: "Construímos uma plataforma colaborativa onde todos podem contribuir para combater a desinformação."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Rapidez",
      description: "Verificações em tempo real para que você tenha informações confiáveis instantaneamente."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Quem Somos</h1>
          <p className="text-lg text-muted-foreground">
            CTD - Combatendo desinformação com tecnologia
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-6 ctd-card-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Nossa Missão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Democratizar o acesso à verificação de fatos através de uma ferramenta 
              gratuita que utiliza IA para analisar informações e determinar sua veracidade.
            </p>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="mb-6 ctd-card-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm text-muted-foreground">Insira URL, texto ou imagem</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm text-muted-foreground">IA consulta fontes confiáveis (G1, UOL, Estadão, BBC)</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm text-muted-foreground">Análise de credibilidade e linguagem</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm text-muted-foreground">Resultado instantâneo com pontuação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {values.map((value, index) => (
            <Card key={index} className="ctd-card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-primary">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold">{value.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <Card className="ctd-card-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Contato & Parcerias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Desenvolvido por profissionais da tecnologia dedicados ao combate à desinformação. 
              Abertos a colaborações e parcerias. Entre em contato para contribuir com nossa missão.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;