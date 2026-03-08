-- Migration: 20260308000003_seed_catalogs.sql
-- Description: Seed damage_types and damage_severities catalogs
-- Date: 2026-03-08

-- ============================================================================
-- DAMAGE SEVERITIES
-- ============================================================================

INSERT INTO public.damage_severities (level, name, description, color_hex, response_days, sort_order) VALUES
  ('low',      'Baja',     'Dano menor que no impide la circulacion. Monitoreo preventivo.', '#22C55E', 30, 1),
  ('medium',   'Media',    'Dano visible que puede empeorar. Requiere atencion programada.', '#F59E0B', 14, 2),
  ('high',     'Alta',     'Dano significativo que afecta la seguridad vial. Atencion prioritaria.', '#EF4444', 7, 3),
  ('critical', 'Critica',  'Peligro inminente. Requiere intervencion inmediata o cierre de via.', '#7C2D12', 2, 4);

-- ============================================================================
-- DAMAGE TYPES (road damage taxonomy for Dominican Republic)
-- ============================================================================

INSERT INTO public.damage_types (code, name, name_en, description, icon, sort_order) VALUES
  -- Surface defects
  ('BACH',  'Bache',              'Pothole',           'Cavidad en la superficie de rodadura causada por desgaste o rotura del pavimento.',  'circle-dot',      1),
  ('GRIET', 'Grieta',             'Crack',             'Fractura lineal en la superficie del pavimento, puede ser longitudinal o transversal.', 'split',        2),
  ('PIEL',  'Piel de Cocodrilo',  'Alligator Crack',   'Patron de grietas interconectadas que asemejan la piel de un reptil. Indica falla estructural.', 'grid', 3),
  ('HUND',  'Hundimiento',        'Depression',        'Area hundida o deprimida en la superficie de la via.',                              'arrow-down',      4),
  ('DESG',  'Desgaste Superficial','Surface Wear',     'Perdida de la capa de rodadura, exposicion del material base.',                     'eraser',          5),

  -- Structural defects
  ('AHUELL','Ahuellamiento',      'Rutting',           'Depresion longitudinal en la huella de las ruedas por deformacion permanente.',      'tire',            6),
  ('CORRUG','Corrugacion',        'Corrugation',       'Ondulaciones regulares en la superficie de la via.',                                'waves',           7),
  ('HINCH', 'Hinchamiento',       'Swelling',          'Abultamiento de la superficie por expansion del suelo subyacente.',                 'arrow-up',        8),

  -- Drainage and utility issues
  ('DREN',  'Problema de Drenaje','Drainage Issue',    'Acumulacion de agua por drenaje insuficiente o bloqueado.',                          'droplets',        9),
  ('ALCANT','Alcantarilla Danada','Damaged Manhole',    'Tapa de alcantarilla rota, hundida o faltante.',                                    'circle',          10),
  ('CONT',  'Contaminacion',      'Contamination',     'Derrame de sustancias (aceite, combustible) en la superficie vial.',                 'alert-triangle',  11),

  -- Signage and markings
  ('SENAL', 'Senalizacion Danada','Damaged Signage',   'Senales de transito danadas, ilegibles o faltantes.',                               'sign-post',       12),
  ('MARCA', 'Demarcacion Borrada','Faded Markings',    'Lineas y simbolos de demarcacion vial desgastados o invisibles.',                   'minus',           13),

  -- Shoulder and edge
  ('HOMB',  'Hombro Danado',      'Damaged Shoulder',  'Erosion o deterioro del espaldón o berma de la via.',                               'road',            14),
  ('BORDE', 'Borde Roto',         'Broken Edge',       'Rotura del borde del pavimento en la union con el espaldón.',                       'square-slash',    15),

  -- Other
  ('VEGET', 'Vegetacion Invasiva','Invasive Vegetation','Crecimiento de vegetacion que invade la calzada o bloquea visibilidad.',            'tree-pine',       16),
  ('ESCOMB','Escombros en Via',   'Road Debris',        'Presencia de escombros, basura o materiales que obstruyen la via.',                 'trash',           17),
  ('OTRO',  'Otro',              'Other',              'Otro tipo de dano vial no clasificado en las categorias anteriores.',               'help-circle',     18);

-- ============================================================================
-- AUTH HOOK: Sync user_profiles on signup (via database function)
-- ============================================================================

-- This function is called after a user signs up via an invitation.
-- It creates the user_profile and sets app_metadata on the auth.users record.
CREATE OR REPLACE FUNCTION public.handle_new_user_from_invitation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  inv record;
BEGIN
  -- Check if the user signed up via an invitation token
  -- The invitation token is passed as user_metadata during signup
  SELECT * INTO inv
  FROM public.invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF inv IS NOT NULL THEN
    -- Create user profile
    INSERT INTO public.user_profiles (id, organization_id, role, first_name, last_name)
    VALUES (
      NEW.id,
      inv.organization_id,
      inv.role,
      coalesce(NEW.raw_user_meta_data ->> 'first_name', 'Nuevo'),
      coalesce(NEW.raw_user_meta_data ->> 'last_name', 'Usuario')
    );

    -- Set app_metadata with org and role (this goes into the JWT)
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object(
      'organization_id', inv.organization_id,
      'role', inv.role::text
    )
    WHERE id = NEW.id;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_by = NEW.id
    WHERE id = inv.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_from_invitation();

-- ============================================================================
-- STORAGE BUCKET for report photos
-- ============================================================================

-- Note: Storage bucket creation is done via Supabase Dashboard or CLI.
-- This documents the required configuration:
--
-- Bucket name: report-photos
-- Public: false (private, accessed via signed URLs)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
--
-- Storage RLS policies (applied via Dashboard > Storage > Policies):
--
-- SELECT (download):
--   authenticated users where bucket_id = 'report-photos'
--   AND storage.foldername(name)[1] = (auth.jwt() -> 'app_metadata' ->> 'organization_id')
--
-- INSERT (upload):
--   same as SELECT
--
-- Path convention: {organization_id}/{report_id}/{photo_type}_{timestamp}.{ext}
-- Example: 550e8400.../report-abc123/before_1709913600.jpg
