# Supabase Storage Setup for CSV Exports

## Steps to Enable CSV Storage in Supabase:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Go to "Storage" in the left sidebar
   - Click "Create a new bucket"
   - Bucket name: `chat-exports`
   - Set as Public: `false` (keep private)
   - Click "Create bucket"

3. **Set Bucket Policies**
   - Click on the `chat-exports` bucket
   - Go to "Policies" tab
   - Add policy for INSERT:
     ```sql
     CREATE POLICY "Allow authenticated uploads"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'chat-exports');
     ```
   - Add policy for SELECT (optional, for viewing):
     ```sql
     CREATE POLICY "Allow authenticated reads"
     ON storage.objects FOR SELECT
     TO authenticated
     USING (bucket_id = 'chat-exports');
     ```

4. **For Public Access (Optional)**
   If you want to make the bucket public:
   - Go to bucket settings
   - Toggle "Public bucket" to ON
   - Update policy:
     ```sql
     CREATE POLICY "Allow public uploads"
     ON storage.objects FOR INSERT
     TO public
     WITH CHECK (bucket_id = 'chat-exports');
     ```

## How It Works:

- Every chat conversation is saved as CSV in Supabase Storage
- Files are named: `chat-YYYY-MM-DD-timestamp.csv`
- CSV format matches the database schema
- Files can be downloaded from Supabase dashboard
- Privacy mode prevents cloud storage

## Viewing CSV Files:

1. Go to Supabase Dashboard → Storage → chat-exports
2. Click on any CSV file to download
3. Open in Excel, Google Sheets, or any CSV viewer
