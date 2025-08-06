-- Create table for news verifications
CREATE TABLE public.news_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  url TEXT,
  classification TEXT NOT NULL CHECK (classification IN ('verified', 'false', 'partial')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  explanation TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  criteria JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for impact statistics
CREATE TABLE public.impact_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  total_verifications INTEGER NOT NULL DEFAULT 0,
  fake_news_detected INTEGER NOT NULL DEFAULT 0,
  verified_news INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial stats row
INSERT INTO public.impact_stats (total_verifications, fake_news_detected, verified_news) 
VALUES (0, 0, 0);

-- Enable RLS on tables
ALTER TABLE public.news_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_stats ENABLE ROW LEVEL SECURITY;

-- Create public access policies (no auth required)
CREATE POLICY "Anyone can view news verifications" 
ON public.news_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create news verifications" 
ON public.news_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view impact stats" 
ON public.impact_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update impact stats" 
ON public.impact_stats 
FOR UPDATE 
USING (true);

-- Create storage bucket for verification images/prints
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-images', 'verification-images', true);

-- Create storage policies for public access
CREATE POLICY "Anyone can view verification images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'verification-images');

CREATE POLICY "Anyone can upload verification images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'verification-images');

-- Function to update impact stats automatically
CREATE OR REPLACE FUNCTION public.update_impact_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.impact_stats
  SET 
    total_verifications = (SELECT COUNT(*) FROM public.news_verifications),
    fake_news_detected = (SELECT COUNT(*) FROM public.news_verifications WHERE classification = 'false'),
    verified_news = (SELECT COUNT(*) FROM public.news_verifications WHERE classification = 'verified'),
    updated_at = now()
  WHERE id = (SELECT id FROM public.impact_stats LIMIT 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update stats
CREATE TRIGGER update_stats_on_verification
  AFTER INSERT ON public.news_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_impact_stats();

-- Enable realtime for impact stats
ALTER TABLE public.impact_stats REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.impact_stats;