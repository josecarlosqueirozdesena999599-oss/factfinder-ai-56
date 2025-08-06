import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  content: string;
  url?: string;
  imageFile?: File;
}

const TRUSTED_SOURCES = [
  'g1.globo.com',
  'nytimes.com',
  'uol.com.br',
  'estadao.com.br',
  'folha.uol.com.br',
  'bbc.com',
  'reuters.com',
  'ap.org',
  'cnn.com',
  'agenciabrasil.ebc.com.br'
];

// Function to search the web for current information
async function searchWeb(query: string): Promise<string> {
  try {
    console.log('Searching web for:', query);
    
    // Use a web search API (you can replace this with your preferred search API)
    const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
      headers: {
        'X-Subscription-Token': Deno.env.get('BRAVE_API_KEY') || '',
        'Accept': 'application/json'
      }
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      const results = searchData.web?.results || [];
      
      let searchSummary = `Resultados da busca para "${query}":\n\n`;
      results.slice(0, 3).forEach((result: any, index: number) => {
        searchSummary += `${index + 1}. ${result.title}\n${result.description}\nFonte: ${result.url}\n\n`;
      });
      
      return searchSummary;
    } else {
      // Fallback search using Google Custom Search
      const googleSearchResponse = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${Deno.env.get('GOOGLE_API_KEY')}&cx=${Deno.env.get('GOOGLE_CSE_ID') || '017576662512468239146:omuauf_lfve'}&q=${encodeURIComponent(query)}&num=3`
      );
      
      if (googleSearchResponse.ok) {
        const googleData = await googleSearchResponse.json();
        const items = googleData.items || [];
        
        let searchSummary = `Resultados da busca para "${query}":\n\n`;
        items.forEach((item: any, index: number) => {
          searchSummary += `${index + 1}. ${item.title}\n${item.snippet}\nFonte: ${item.link}\n\n`;
        });
        
        return searchSummary;
      }
    }
  } catch (error) {
    console.error('Error searching web:', error);
  }
  
  return `Não foi possível realizar busca web para: ${query}`;
}

// Function to determine if content needs web search
function needsWebSearch(content: string): boolean {
  const searchTriggers = [
    'dólar', 'dolar', 'cotação', 'preço', 'valor', 'subiu', 'caiu', 'aumentou', 'diminuiu',
    'hoje', 'ontem', 'esta semana', 'atual', 'agora', 'recente', 'último', 'nova',
    'bolsa', 'ibovespa', 'ação', 'bitcoin', 'cripto', 'inflação', 'pib', 'economia',
    'eleição', 'presidente', 'governo', 'ministro', 'deputado', 'senador',
    'covid', 'vacina', 'pandemia', 'vírus', 'saúde', 'sus',
    'greve', 'manifestação', 'protesto', 'acordo', 'decisão', 'aprovado',
    'morreu', 'morte', 'acidente', 'crime', 'prisão', 'condenado'
  ];
  
  const lowerContent = content.toLowerCase();
  return searchTriggers.some(trigger => lowerContent.includes(trigger));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Function started, checking environment variables...');
    
    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('GOOGLE_API_KEY present:', !!GOOGLE_API_KEY);
    console.log('SUPABASE_URL present:', !!SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY present:', !!SUPABASE_SERVICE_ROLE_KEY);

    if (!GOOGLE_API_KEY) {
      console.error('Google API key not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Configuração da API não encontrada' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    console.log('Parsing request body...');
    
    // Handle different content types properly
    let requestBody;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with files
      const formData = await req.formData();
      requestBody = {
        content: formData.get('content') as string || '',
        url: formData.get('url') as string || '',
        imageFile: formData.get('imageFile') as File || null
      };
    } else {
      // Handle JSON data
      requestBody = await req.json();
    }
    
    console.log('Request body received:', {
      hasContent: !!requestBody.content,
      hasUrl: !!requestBody.url,
      hasImageFile: !!requestBody.imageFile,
      contentLength: requestBody.content?.length || 0
    });
    
    const { content, url, imageFile }: VerificationRequest = requestBody;

    // Allow processing even without content if there's an image or URL
    if (!content && !url && !imageFile) {
      console.error('No content, URL, or image provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Por favor, forneça texto, URL ou imagem para verificar' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting news verification for:', content ? content.substring(0, 100) + '...' : 'URL/Image analysis');

    // Build comprehensive prompt for analysis based on available data
    let analysisContent = '';
    let searchResults = '';
    
    if (content && content.trim()) {
      analysisContent += `TEXTO/CONTEÚDO: ${content.trim()}`;
      
      // Check if we need to search the web for current information
      if (needsWebSearch(content.trim())) {
        console.log('Content requires web search for verification');
        searchResults = await searchWeb(content.trim());
        analysisContent += `\n\nRESULTADOS DA BUSCA WEB:\n${searchResults}`;
      }
    }
    if (url && url.trim()) {
      analysisContent += `\nURL: ${url.trim()}`;
    }
    if (imageFile) {
      analysisContent += `\nIMAGEM: Análise de imagem fornecida pelo usuário`;
    }

    // If no meaningful content, provide fallback
    if (!analysisContent.trim()) {
      analysisContent = 'Conteúdo muito curto ou indefinido fornecido para análise';
    }

    const analysisPrompt = `
Você é um verificador de fatos profissional brasileiro. Analise a seguinte informação e forneça uma verificação completa:

INFORMAÇÃO A VERIFICAR:
${analysisContent}

INSTRUÇÕES IMPORTANTES:
1. Se o conteúdo for muito vago, indefinido ou sem substância informativa (como letras aleatórias, textos sem sentido), classifique como FALSA
2. Para URLs, analise o domínio e credibilidade da fonte
3. Para imagens, analise se realmente contém informação noticiosa relevante ou se é spam/desinformação
4. USE OS RESULTADOS DA BUSCA WEB fornecidos acima para verificar informações atuais como cotações, preços, eventos recentes
5. Se os resultados da busca CONFIRMAM a informação, classifique como VERDADEIRA
6. Se os resultados da busca CONTRADIZEM a informação, classifique como FALSA
7. Se NÃO há resultados de busca ou informações insuficientes, classifique como FALSA (fake news)
8. Se encontrar informações contraditórias ou parciais, classifique como DUVIDOSA
9. Para informações factuais (cotações, preços, eventos): SEMPRE se baseie nos resultados da busca web mais recentes
10. Classifique como: VERDADEIRA (verified), FALSA (false) ou DUVIDOSA (partial)
11. Dê uma pontuação de 0-100 para veracidade (0-30 = Falsa, 31-70 = Duvidosa, 71-100 = Verdadeira)
12. Forneça explicação detalhada mencionando se foi encontrada confirmação nas buscas realizadas
13. Liste critérios analisados incluindo verificação em tempo real
14. NÃO mencione nomes de sites específicos na resposta, apenas indique "fontes verificadas" ou "busca em tempo real"

IMPORTANTE: Responda APENAS em JSON válido com esta estrutura exata:
{
  "classification": "verified|false|partial",
  "score": 85,
  "explanation": "Explicação detalhada baseada na busca em tempo real e verificação de fontes",
  "criteria": [
    {"name": "Verificação em tempo real", "status": true},
    {"name": "Confirmação em múltiplas fontes", "status": true},
    {"name": "Consistência com dados atuais", "status": true}
  ],
  "sources": []
}`;

    // Call Google Gemini API
    console.log('Calling Gemini API...');
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
          responseMimeType: "application/json"
        }
      })
    });

    console.log('Gemini API response status:', geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Erro na API do Google: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response structure:', Object.keys(geminiData));
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      console.error('No candidates in Gemini response:', geminiData);
      throw new Error('Resposta inválida da API do Google');
    }
    
    const analysisText = geminiData.candidates[0].content.parts[0].text;
    
    console.log('Raw Gemini response:', analysisText.substring(0, 200) + '...');

    // Parse JSON response from Gemini
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n(.*?)\n```/s) || analysisText.match(/\{.*\}/s);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      // Fallback analysis - default to false for unparseable content
      analysis = {
        classification: 'false',
        score: 20,
        explanation: 'Não foi possível analisar esta informação adequadamente. Conteúdo pode ser spam, desinformação ou não possui substância informativa verificável.',
        criteria: [
          { name: 'Análise automatizada', status: false },
          { name: 'Conteúdo verificável', status: false }
        ],
        sources: []
      };
    }

    // Store image if provided
    let imageUrl = null;
    if (imageFile) {
      const fileName = `verification_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-images')
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data } = supabase.storage
          .from('verification-images')
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    // Save verification to database
    const { data: verification, error: dbError } = await supabase
      .from('news_verifications')
      .insert({
        content,
        url,
        classification: analysis.classification,
        score: analysis.score,
        explanation: analysis.explanation,
        sources: analysis.sources || [],
        criteria: analysis.criteria || [],
        image_url: imageUrl
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Erro ao salvar verificação');
    }

    console.log('Verification saved successfully:', verification.id);

    return new Response(JSON.stringify({
      success: true,
      verification: {
        ...verification,
        sources: verification.sources.map((source: any) => ({
          ...source,
          url: source.url || '#'
        }))
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-news function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});