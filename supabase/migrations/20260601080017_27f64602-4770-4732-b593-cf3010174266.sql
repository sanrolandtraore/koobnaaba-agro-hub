
ALTER TABLE public.animals
  ADD COLUMN IF NOT EXISTS is_group boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS group_size integer,
  ADD COLUMN IF NOT EXISTS mortality_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS group_label text;

-- Auto-mark poultry & fish as groups by default if size is provided
COMMENT ON COLUMN public.animals.is_group IS 'True for lot/batch tracking (e.g. poultry, fish)';
COMMENT ON COLUMN public.animals.group_size IS 'Current number of animals in the group/lot';
COMMENT ON COLUMN public.animals.mortality_count IS 'Cumulative deaths in the group';
