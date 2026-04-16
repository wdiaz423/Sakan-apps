-- Allow home members to view completions on tasks of homes they belong to
CREATE POLICY "Home members can view home task history"
ON public.completion_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.maintenance_tasks t
    WHERE t.id = completion_history.task_id
      AND t.home_id IS NOT NULL
      AND public.is_home_member(auth.uid(), t.home_id)
  )
);

-- Allow home members to view profiles of fellow members
CREATE POLICY "Home members can view fellow members profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.home_members hm1
    JOIN public.home_members hm2 ON hm1.home_id = hm2.home_id
    WHERE hm1.user_id = auth.uid()
      AND hm2.user_id = profiles.user_id
  )
);

-- Allow home members to view tasks belonging to homes they're members of
CREATE POLICY "Home members can view home tasks"
ON public.maintenance_tasks
FOR SELECT
USING (
  home_id IS NOT NULL AND public.is_home_member(auth.uid(), home_id)
);