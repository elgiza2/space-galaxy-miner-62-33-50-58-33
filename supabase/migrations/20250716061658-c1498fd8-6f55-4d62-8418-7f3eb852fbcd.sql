-- Create space_apps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.space_apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    app_url TEXT NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.space_apps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access to active apps
CREATE POLICY "Allow public read access to active apps" 
ON public.space_apps 
FOR SELECT 
USING (is_active = true);

-- Allow authenticated users to view all apps (for admin panels)
CREATE POLICY "Allow authenticated users to view all apps" 
ON public.space_apps 
FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users to create apps
CREATE POLICY "Allow authenticated users to create apps" 
ON public.space_apps 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update apps
CREATE POLICY "Allow authenticated users to update apps" 
ON public.space_apps 
FOR UPDATE 
TO authenticated
USING (true);

-- Allow authenticated users to delete apps
CREATE POLICY "Allow authenticated users to delete apps" 
ON public.space_apps 
FOR DELETE 
TO authenticated
USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_space_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_space_apps_updated_at ON public.space_apps;
CREATE TRIGGER update_space_apps_updated_at 
BEFORE UPDATE ON public.space_apps
FOR EACH ROW 
EXECUTE FUNCTION public.update_space_apps_updated_at();

-- Insert some sample data
INSERT INTO public.space_apps (name, description, image_url, app_url, category, is_active) VALUES
('Space Calculator', 'حاسبة متقدمة للحسابات الفضائية', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', 'https://calculator.space-app.com', 'أدوات', true),
('Cosmic Weather', 'تطبيق لمعرفة حالة الطقس الفضائي', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400', 'https://weather.space-app.com', 'طقس', true),
('Star Navigator', 'دليل للملاحة بين النجوم', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://navigator.space-app.com', 'ملاحة', true)
ON CONFLICT (id) DO NOTHING;