import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private serviceSupabase: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
      this.serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    }
  }

  getClient(): SupabaseClient | null {
    return this.supabase;
  }

  getServiceClient(): SupabaseClient | null {
    return this.serviceSupabase;
  }
}
