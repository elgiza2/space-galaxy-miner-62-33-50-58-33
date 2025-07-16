
-- Create space_apps table
CREATE TABLE IF NOT EXISTS space_apps (
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

-- Create RLS policies for space_apps
ALTER TABLE space_apps ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active apps
CREATE POLICY "Allow public read access to active apps" ON space_apps
    FOR SELECT USING (is_active = true);

-- Allow all operations for authenticated users (admin access)
CREATE POLICY "Allow all operations for authenticated users" ON space_apps
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_space_apps_updated_at BEFORE UPDATE ON space_apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO space_apps (name, description, image_url, app_url, category, is_active) VALUES
('Space Calculator', 'حاسبة متقدمة للحسابات الفضائية', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400', 'https://calculator.space-app.com', 'أدوات', true),
('Cosmic Weather', 'تطبيق لمعرفة حالة الطقس الفضائي', 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400', 'https://weather.space-app.com', 'طقس', true),
('Star Navigator', 'دليل للملاحة بين النجوم', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', 'https://navigator.space-app.com', 'ملاحة', true);
