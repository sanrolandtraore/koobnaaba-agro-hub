-- 1. Fix user_subscriptions: remove INSERT and UPDATE policies (payment bypass)
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;

-- 2. Fix cooperative-docs storage: scope to user's own folder
DROP POLICY IF EXISTS "Cooperative can upload docs" ON storage.objects;
DROP POLICY IF EXISTS "Cooperative can view own docs" ON storage.objects;
DROP POLICY IF EXISTS "Cooperative can delete own docs" ON storage.objects;

CREATE POLICY "Cooperative can upload docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cooperative-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Cooperative can view own docs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cooperative-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Cooperative can delete own docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cooperative-docs' AND (storage.foldername(name))[1] = auth.uid()::text);