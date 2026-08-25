-- 1. Add the new education role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'formation';

-- 2. Drop the cooperative module entirely
DROP TABLE IF EXISTS public.cooperative_distributions CASCADE;
DROP TABLE IF EXISTS public.cooperative_sales CASCADE;
DROP TABLE IF EXISTS public.cooperative_collectes CASCADE;
DROP TABLE IF EXISTS public.cooperative_cotisations CASCADE;
DROP TABLE IF EXISTS public.cooperative_expenses CASCADE;
DROP TABLE IF EXISTS public.cooperative_equipment_schedule CASCADE;
DROP TABLE IF EXISTS public.cooperative_parcels CASCADE;
DROP TABLE IF EXISTS public.cooperative_documents CASCADE;
DROP TABLE IF EXISTS public.cooperative_members CASCADE;
DROP TABLE IF EXISTS public.cooperative_profiles CASCADE;

DROP FUNCTION IF EXISTS public.compute_cooperative_sale_total() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_member_limit() CASCADE;
DROP FUNCTION IF EXISTS public.protect_cooperative_member_role() CASCADE;
DROP FUNCTION IF EXISTS public.generate_cooperative_invite_code() CASCADE;
DROP FUNCTION IF EXISTS public.join_cooperative_by_code(text) CASCADE;
DROP FUNCTION IF EXISTS public.get_cooperative_owner_for_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_cooperative_admin(uuid) CASCADE;

-- 3. Subscription limits no longer know about cooperative members
CREATE OR REPLACE FUNCTION public.check_subscription_limit(_user_id uuid, _resource text)
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _plan text;
  _status text;
  _expires_at timestamptz;
  _is_premium boolean := false;
  _current_count int;
  _max_limit int;
BEGIN
  SELECT plan, status, expires_at INTO _plan, _status, _expires_at
  FROM public.user_subscriptions
  WHERE user_id = _user_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;

  IF _plan = 'premium' AND (_expires_at IS NULL OR _expires_at > now()) THEN
    _is_premium := true;
  END IF;

  IF _is_premium THEN
    RETURN;
  END IF;

  IF _resource = 'parcels' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.parcels p JOIN public.farms f ON f.id = p.farm_id
    WHERE f.user_id = _user_id;
    _max_limit := 3;
  ELSIF _resource = 'animals' THEN
    SELECT COUNT(*) INTO _current_count
    FROM public.animals a JOIN public.farms f ON f.id = a.farm_id
    WHERE f.user_id = _user_id;
    _max_limit := 10;
  ELSE
    RETURN;
  END IF;

  IF _current_count >= _max_limit THEN
    RAISE EXCEPTION 'Limite du plan gratuit atteinte: % max %', _resource, _max_limit;
  END IF;
END;
$function$;

-- 4. Signup accepts the new education role, no longer the cooperative one
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _phone text;
  _email text;
  _requested_role text;
  _role app_role;
BEGIN
  _phone := COALESCE(NULLIF(NEW.raw_user_meta_data->>'phone', ''), NEW.phone, '');

  IF NEW.email LIKE '%@koobnaaba.local' THEN
    _email := COALESCE(NEW.raw_user_meta_data->>'real_email', '');
  ELSE
    _email := COALESCE(NEW.email, '');
  END IF;

  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    _phone,
    _email
  );

  _requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'agriculteur');

  IF _requested_role IN ('agriculteur', 'eleveur', 'partenaire', 'agent_technique', 'formation') THEN
    _role := _requested_role::app_role;
  ELSE
    _role := 'agriculteur';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$function$;

-- 5. Education module tables
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  domain text NOT NULL CHECK (domain IN ('elevage', 'agriculture')),
  category text NOT NULL,
  title text NOT NULL,
  subtitle text,
  summary text,
  level text NOT NULL DEFAULT 'debutant',
  duration_min integer NOT NULL DEFAULT 30,
  icon text NOT NULL DEFAULT '📘',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon;
GRANT SELECT ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are readable by everyone"
  ON public.courses FOR SELECT USING (is_published = true);

CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  content text NOT NULL,
  key_points text[] NOT NULL DEFAULT '{}',
  duration_min integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, position)
);
GRANT SELECT ON public.course_lessons TO anon;
GRANT SELECT ON public.course_lessons TO authenticated;
GRANT ALL ON public.course_lessons TO service_role;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lessons of published courses are readable by everyone"
  ON public.course_lessons FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published = true));

CREATE TABLE public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_progress TO authenticated;
GRANT ALL ON public.course_progress TO service_role;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own progress"
  ON public.course_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_course_progress_updated_at BEFORE UPDATE ON public.course_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_course_lessons_course ON public.course_lessons(course_id, position);
CREATE INDEX idx_course_progress_user ON public.course_progress(user_id, course_id);