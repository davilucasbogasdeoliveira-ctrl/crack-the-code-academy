-- 1. Enum de trilhas
DO $$ BEGIN
  CREATE TYPE public.course_track AS ENUM ('python','cpp','html','css','java');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabela de acessos por linguagem
CREATE TABLE IF NOT EXISTS public.track_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  track public.course_track NOT NULL,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, track)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_access TO authenticated;
GRANT ALL ON public.track_access TO service_role;

ALTER TABLE public.track_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own track access" ON public.track_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins insert track access" ON public.track_access
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update track access" ON public.track_access
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete track access" ON public.track_access
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER track_access_updated_at BEFORE UPDATE ON public.track_access
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Função de dono do site (super admin)
CREATE OR REPLACE FUNCTION private.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = _user_id
      AND u.email_confirmed_at IS NOT NULL
      AND lower(u.email) = 'davilucasbogasdeoliveira@gmail.com'
  )
$$;

REVOKE ALL ON FUNCTION private.is_owner(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_owner(uuid) TO authenticated;

-- 4. Somente o dono gerencia admins
DROP POLICY IF EXISTS "admins insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete user_roles" ON public.user_roles;

CREATE POLICY "owner inserts user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (private.is_owner(auth.uid()));

CREATE POLICY "owner updates user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (private.is_owner(auth.uid()))
  WITH CHECK (private.is_owner(auth.uid()));

CREATE POLICY "owner deletes user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.is_owner(auth.uid()) AND NOT private.is_owner(user_id));

-- 5. Assinatura passa a ser somente vitalícia: limpa expirações existentes de ativos
UPDATE public.subscriptions SET expires_at = NULL WHERE status = 'active';