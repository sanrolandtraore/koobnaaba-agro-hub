
-- ============ crop_technical_sheets ============
CREATE TABLE public.crop_technical_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_key text NOT NULL UNIQUE,
  name_fr text NOT NULL,
  name_en text,
  category text NOT NULL,
  cycle_days_min int,
  cycle_days_max int,
  climate_zones text[] DEFAULT '{}',
  seasons text[] DEFAULT '{}',
  sowing_calendar jsonb DEFAULT '{}'::jsonb,
  itinerary jsonb DEFAULT '[]'::jsonb,
  npk_needs jsonb DEFAULT '{}'::jsonb,
  water_needs_mm int,
  common_pests text[] DEFAULT '{}',
  common_diseases text[] DEFAULT '{}',
  recommended_varieties text[] DEFAULT '{}',
  yield_potential_t_ha numeric,
  notes text,
  sources text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crop_technical_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read tech sheets"
  ON public.crop_technical_sheets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tech sheets"
  ON public.crop_technical_sheets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_crop_tech_sheets_updated BEFORE UPDATE ON public.crop_technical_sheets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ expert_clients ============
CREATE TABLE public.expert_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL,
  client_user_id uuid NOT NULL,
  client_full_name text NOT NULL,
  client_phone text,
  status text NOT NULL DEFAULT 'actif',
  notes text,
  since date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (expert_id, client_user_id)
);
ALTER TABLE public.expert_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expert manages own client list"
  ON public.expert_clients FOR ALL TO authenticated
  USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Client can view own expert link"
  ON public.expert_clients FOR SELECT TO authenticated
  USING (auth.uid() = client_user_id);
CREATE TRIGGER trg_expert_clients_updated BEFORE UPDATE ON public.expert_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE INDEX idx_expert_clients_expert ON public.expert_clients(expert_id);
CREATE INDEX idx_expert_clients_client ON public.expert_clients(client_user_id);

-- ============ client_visits ============
CREATE TABLE public.client_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL,
  client_user_id uuid NOT NULL,
  parcel_id uuid REFERENCES public.parcels(id) ON DELETE SET NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visit_type text NOT NULL DEFAULT 'conseil',
  observations text,
  recommendations text,
  next_visit_date date,
  latitude numeric,
  longitude numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expert manages own visits"
  ON public.client_visits FOR ALL TO authenticated
  USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Client can view visits about them"
  ON public.client_visits FOR SELECT TO authenticated
  USING (auth.uid() = client_user_id);
CREATE TRIGGER trg_client_visits_updated BEFORE UPDATE ON public.client_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE INDEX idx_client_visits_expert ON public.client_visits(expert_id);
CREATE INDEX idx_client_visits_client ON public.client_visits(client_user_id);

-- ============ crop_diagnoses ============
CREATE TABLE public.crop_diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL,
  client_user_id uuid,
  parcel_id uuid REFERENCES public.parcels(id) ON DELETE SET NULL,
  image_path text,
  crop_key text,
  symptoms_input text,
  ai_response jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnosis_summary text,
  confidence numeric,
  treatment_bio text,
  treatment_chemical text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expert manages own diagnoses"
  ON public.crop_diagnoses FOR ALL TO authenticated
  USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Client views diagnoses about them"
  ON public.crop_diagnoses FOR SELECT TO authenticated
  USING (auth.uid() = client_user_id);
CREATE INDEX idx_crop_diagnoses_expert ON public.crop_diagnoses(expert_id);

-- ============ expert_prescriptions ============
CREATE TABLE public.expert_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL,
  client_user_id uuid NOT NULL,
  parcel_id uuid REFERENCES public.parcels(id) ON DELETE SET NULL,
  diagnosis_id uuid REFERENCES public.crop_diagnoses(id) ON DELETE SET NULL,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_path text,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expert_prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expert manages own prescriptions"
  ON public.expert_prescriptions FOR ALL TO authenticated
  USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Client views prescriptions about them"
  ON public.expert_prescriptions FOR SELECT TO authenticated
  USING (auth.uid() = client_user_id);
CREATE TRIGGER trg_expert_prescriptions_updated BEFORE UPDATE ON public.expert_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ Storage bucket ============
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-diagnoses', 'crop-diagnoses', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Experts upload own diagnosis images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'crop-diagnoses' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Experts read own diagnosis images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'crop-diagnoses' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Experts delete own diagnosis images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'crop-diagnoses' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============ Seed data: 12 cultures ============
INSERT INTO public.crop_technical_sheets (crop_key, name_fr, category, cycle_days_min, cycle_days_max, climate_zones, seasons, sowing_calendar, npk_needs, water_needs_mm, common_pests, common_diseases, recommended_varieties, yield_potential_t_ha, notes) VALUES
('mil','Mil (Pennisetum)','Céréale',75,120,'{sahel,soudano-sahelien}','{hivernage}','{"sahel":"juin-juillet","soudano":"mai-juin"}','{"N":40,"P":30,"K":30}',400,'{"chenille mineuse","oiseaux granivores"}','{"mildiou","charbon"}','{"Souna 3","Gawane","SOSAT-C88"}',2.5,'Culture rustique, résiste à la sécheresse. Densité 10000 poquets/ha.'),
('sorgho','Sorgho','Céréale',90,140,'{sahel,soudano-sahelien,soudanien}','{hivernage}','{"sahel":"juin-juillet","soudano":"mai-juin"}','{"N":60,"P":40,"K":40}',500,'{"foreur des tiges","cécidomyie","puceron"}','{"charbon","anthracnose","striga"}','{"CSM 63E","ICSV 1049","Faourou"}',3.5,'Tolère sols pauvres. Sensible au striga.'),
('mais','Maïs','Céréale',90,120,'{soudanien,guineen}','{hivernage,contre-saison}','{"soudano":"juin-juillet","guineen":"mai-juin"}','{"N":120,"P":60,"K":60}',650,'{"foreur","chenille legionnaire","pyrale"}','{"helminthosporiose","rouille","striga"}','{"DMR-LSR-Y","Obatanpa","TZE-COMP1"}',6,'Forte demande en azote. Fractionnement urée recommandé.'),
('niebe','Niébé','Légumineuse',60,90,'{sahel,soudano-sahelien,soudanien}','{hivernage,contre-saison}','{"hivernage":"juillet-aout"}','{"N":15,"P":45,"K":30}',300,'{"thrips","puceron","punaise des gousses"}','{"viroses","bacteriose","macrophomina"}','{"IT89KD-288","Melakh","Mouride"}',1.8,'Fixe l azote. Excellent précédent cultural. Inoculation rhizobium possible.'),
('arachide','Arachide','Légumineuse',90,120,'{soudano-sahelien,soudanien}','{hivernage}','{"hivernage":"juin-juillet"}','{"N":20,"P":50,"K":40}',500,'{"iule","termite","puceron"}','{"cercosporiose","rosette","aflatoxine"}','{"73-33","Fleur 11","ICGV 86015"}',2.5,'Sols sablo-limoneux. Récolte avant pluies pour limiter aflatoxine.'),
('riz','Riz pluvial/irrigué','Céréale',100,140,'{soudanien,guineen}','{hivernage,contre-saison}','{"hivernage":"juin-juillet","contre-saison":"novembre-decembre"}','{"N":120,"P":60,"K":60}',1200,'{"foreur","cecidomyie","oiseaux"}','{"pyriculariose","helminthosporiose","RYMV"}','{"NERICA 4","Sahel 108","WITA 9"}',6,'Irrigué ou bas-fond. Apports N fractionnés tallage/épiaison.'),
('coton','Coton','Industrielle',150,180,'{soudano-sahelien,soudanien}','{hivernage}','{"hivernage":"juin"}','{"N":75,"P":50,"K":50}',700,'{"helicoverpa","jassides","aleurodes","punaise"}','{"bacteriose","fusariose"}','{"STAM 59A","NTA L-100","FK 37"}',2.5,'Filière encadrée. Programme phyto strict.'),
('sesame','Sésame','Oléagineuse',90,120,'{sahel,soudano-sahelien}','{hivernage}','{"hivernage":"juillet"}','{"N":30,"P":30,"K":30}',400,'{"sphinx du sesame","puceron"}','{"alternariose","cercosporiose"}','{"S42","32-15","Humera"}',1.2,'Petites graines, semis superficiel. Récolte échelonnée.'),
('manioc','Manioc','Tubercule',270,365,'{soudanien,guineen}','{toutes}','{}','{"N":60,"P":30,"K":120}',900,'{"cochenille farineuse","acarien vert"}','{"mosaique africaine","bacteriose","CBSD"}','{"TMS 4(2)1425","Yace","Bocou 2"}',20,'Très exigeant en potasse. Résistant à la sécheresse.'),
('igname','Igname','Tubercule',240,300,'{soudanien,guineen}','{hivernage}','{"hivernage":"mars-avril"}','{"N":80,"P":40,"K":120}',1100,'{"cochenille","nematodes"}','{"anthracnose","mosaique"}','{"Florido","Kponan","C18"}',15,'Tuteurage requis. Sols profonds bien drainés.'),
('oignon','Oignon','Maraîchage',90,120,'{toutes}','{contre-saison}','{"contre-saison":"octobre-decembre"}','{"N":120,"P":60,"K":120}',450,'{"thrips","mouche de l oignon"}','{"mildiou","alternariose","fonte de semis"}','{"Violet de Galmi","Soumarana","Bama Red"}',25,'Pépinière 6-8 semaines. Marché porteur.'),
('tomate','Tomate','Maraîchage',90,120,'{toutes}','{contre-saison}','{"contre-saison":"septembre-novembre"}','{"N":150,"P":80,"K":200}',500,'{"helicoverpa","aleurode","mineuse Tuta absoluta"}','{"mildiou","alternariose","fletrissement bacterien","TYLCV"}','{"Mongal F1","Tropimech","Roma VF"}',40,'Tuteurage et taille. Forte pression Tuta absoluta.');
