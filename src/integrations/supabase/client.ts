
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const SUPABASE_URL = "https://pxmhjwnhjcxcbmkhovsf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4bWhqd25oamN4Y2Jta2hvdnNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODkzMzUsImV4cCI6MjA2MjM2NTMzNX0.53bOVmq-2zLmIa006TvpVh0LXgsw5DUgR9peLqeBUtI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
