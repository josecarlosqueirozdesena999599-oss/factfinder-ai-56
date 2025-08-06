import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create Gmail compose URL with form data
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=ctdcontatooficial@outlook.com&su=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Nome: ${formData.name}\nE-mail: ${formData.email}\n\nMensagem:\n${formData.message}`
    )}`;
    
    // Open Gmail in new tab
    window.open(gmailUrl, '_blank');
    
    toast({
      title: "Redirecionando para Gmail",
      description: "Abrindo Gmail com sua mensagem preenchida. Complete o envio lá!",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contato</h1>
          <p className="text-xl text-muted-foreground">
            Entre em contato conosco. Estamos aqui para ajudar!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="ctd-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Envie uma Mensagem
              </CardTitle>
              <CardDescription>
                Preencha o formulário abaixo e entraremos em contato em breve
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Descreva sua dúvida, sugestão ou problema..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full ctd-transition">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <Card className="ctd-card-shadow">
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>
                  Outras formas de entrar em contato conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-muted-foreground">ctdcontatooficial@outlook.com</p>
                    <p className="text-sm text-muted-foreground">
                      Resposta em até 24 horas
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Telefone</h3>
                    <p className="text-muted-foreground">Em breve</p>
                    <p className="text-sm text-muted-foreground">
                      Atendimento em horário comercial
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">Endereço</h3>
                    <p className="text-muted-foreground">
                      Plataforma 100% digital
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Atendemos todo o Brasil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="ctd-card-shadow">
              <CardHeader>
                <CardTitle>Dúvidas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Como funciona a verificação?</h4>
                  <p className="text-sm text-muted-foreground">
                    Utilizamos IA para consultar fontes confiáveis e analisar critérios de credibilidade.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">O serviço é gratuito?</h4>
                  <p className="text-sm text-muted-foreground">
                    Sim! O CTD é uma plataforma gratuita dedicada ao combate da desinformação.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Posso sugerir melhorias?</h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutamente! Suas sugestões nos ajudam a melhorar continuamente.
                  </p>
                </div>

                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Como posso contribuir?</h4>
                  <p className="text-sm text-muted-foreground">
                    Entre em contato conosco para saber sobre oportunidades de colaboração.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="ctd-card-shadow bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-primary mb-2">Tempo de Resposta</h3>
                  <p className="text-2xl font-bold mb-2">&lt; 24h</p>
                  <p className="text-sm text-muted-foreground">
                    Respondemos todas as mensagens em até 24 horas durante dias úteis
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;