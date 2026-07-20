
-- Move role-check helpers out of the API-exposed public schema so signed-in users can't call them via RPC.
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.has_active_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  ) OR private.has_role(_user_id, 'admin');
$$;

-- Only the postgres role should execute these; authenticated/anon must not.
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.has_active_access(uuid) FROM PUBLIC, anon, authenticated;

-- Recreate policies to reference the private helpers.
DROP POLICY IF EXISTS "users read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins delete user_roles" ON public.user_roles;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins insert user_roles" ON public.user_roles
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update user_roles" ON public.user_roles
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete user_roles" ON public.user_roles
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "users read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "admins insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "admins update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "admins delete subscriptions" ON public.subscriptions;

CREATE POLICY "users read own subscription" ON public.subscriptions
  FOR SELECT USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins insert subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins update subscriptions" ON public.subscriptions
  FOR UPDATE USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "admins delete subscriptions" ON public.subscriptions
  FOR DELETE USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop the public-schema versions now that nothing references them.
DROP FUNCTION IF EXISTS public.has_active_access(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
