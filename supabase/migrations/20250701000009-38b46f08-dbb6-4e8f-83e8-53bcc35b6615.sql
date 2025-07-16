
-- Create storage bucket for giveaway images
INSERT INTO storage.buckets (id, name, public)
VALUES ('giveaway-images', 'giveaway-images', true);

-- Create policy to allow public read access
CREATE POLICY "Allow public read access on giveaway images"
ON storage.objects FOR SELECT
USING (bucket_id = 'giveaway-images');

-- Create policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload giveaway images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'giveaway-images');

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete giveaway images"
ON storage.objects FOR DELETE
USING (bucket_id = 'giveaway-images');
