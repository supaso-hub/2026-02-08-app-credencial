import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://mdftijdjckugrdouslni.supabase.co",
    "sb_publishable_itbwTGCKUHx5Kg_FuYfT8g_iiZsVnUS"
  )
}
