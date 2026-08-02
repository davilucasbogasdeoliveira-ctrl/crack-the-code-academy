CREATE TABLE public.progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id text NOT NULL,
  track public.course_track NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz NULL,
  practice_count integer NOT NULL DEFAULT 0,
  notes text NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress TO authenticated;
GRANT ALL ON public.progress TO service_role;

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress"
ON public.progress FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all progress"
ON public.progress FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION private.set_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER progress_updated_at
BEFORE UPDATE ON public.progress
FOR EACH ROW
EXECUTE FUNCTION private.set_progress_updated_at();

REVOKE EXECUTE ON FUNCTION private.set_progress_updated_at() FROM public, anon, authenticated;