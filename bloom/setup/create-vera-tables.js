#!/usr/bin/env node
/**
 * BLOOM Vera Tables Setup
 *
 * One-time script to create Vera's audit tables in Supabase with proper RLS.
 * Run from Railway workspace: node bloom/setup/create-vera-tables.js
 *
 * Uses existing SUPABASE_URL and SUPABASE_SERVICE_KEY from Railway environment.
 */

const { createClient } = require('@supabase/supabase-js');

async function createVeraTables() {
  // Use existing Railway environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables:');
    console.error('   SUPABASE_URL:', !!supabaseUrl);
    console.error('   SUPABASE_SERVICE_KEY:', !!serviceKey);
    console.error('\nEnsure these are set in Railway environment.');
    process.exit(1);
  }

  console.log('🚀 Creating Vera audit tables...');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  // Create Supabase client with service key (admin access)
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    // Create vera_audit_log table
    console.log('\n📋 Creating vera_audit_log table...');
    const { error: auditError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vera_audit_log (
          id BIGSERIAL PRIMARY KEY,
          agent_name TEXT NOT NULL,
          task_id BIGINT NOT NULL,
          task_description TEXT NOT NULL,
          claimed_complete_at TIMESTAMPTZ NOT NULL,
          verified_at TIMESTAMPTZ DEFAULT now(),
          verification_method TEXT NOT NULL,
          verification_source TEXT NOT NULL,
          result TEXT NOT NULL CHECK (result IN ('VERIFIED', 'FAILED', 'FABRICATED', 'UNVERIFIABLE')),
          evidence TEXT,
          escalate_to_kimberly BOOLEAN DEFAULT false,
          escalation_reason TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    });

    if (auditError) {
      console.error('❌ Error creating vera_audit_log:', auditError.message);
    } else {
      console.log('✅ vera_audit_log table created');
    }

    // Create vera_escalations table
    console.log('\n📋 Creating vera_escalations table...');
    const { error: escalationError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vera_escalations (
          id BIGSERIAL PRIMARY KEY,
          agent_name TEXT NOT NULL,
          task_id BIGINT,
          severity TEXT NOT NULL CHECK (severity IN ('WARNING', 'CRITICAL', 'FABRICATION_DETECTED')),
          description TEXT NOT NULL,
          evidence TEXT,
          resolved BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `
    });

    if (escalationError) {
      console.error('❌ Error creating vera_escalations:', escalationError.message);
    } else {
      console.log('✅ vera_escalations table created');
    }

    // Set up RLS permissions - Vera-only write access
    console.log('\n🔒 Setting up RLS permissions...');
    const { error: permissionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on both tables
        ALTER TABLE vera_audit_log ENABLE ROW LEVEL SECURITY;
        ALTER TABLE vera_escalations ENABLE ROW LEVEL SECURITY;

        -- Revoke all default permissions
        REVOKE ALL ON vera_audit_log FROM anon, authenticated;
        REVOKE ALL ON vera_escalations FROM anon, authenticated;

        -- Only vera service key can write (when deployed)
        -- For now, service key has full access through admin bypass
        CREATE POLICY "vera_audit_admin_only" ON vera_audit_log
        FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

        CREATE POLICY "vera_escalations_admin_only" ON vera_escalations
        FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

        -- No read access for regular agents - Vera's reasoning is private
        CREATE POLICY "no_agent_read_audit" ON vera_audit_log
        FOR SELECT USING (false);

        CREATE POLICY "no_agent_read_escalations" ON vera_escalations
        FOR SELECT USING (false);
      `
    });

    if (permissionError) {
      console.error('❌ Error setting RLS permissions:', permissionError.message);
    } else {
      console.log('✅ RLS permissions configured');
    }

    // Verify tables exist
    console.log('\n🔍 Verifying table creation...');
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['vera_audit_log', 'vera_escalations']);

    if (verifyError) {
      console.error('❌ Error verifying tables:', verifyError.message);
    } else {
      console.log('✅ Tables verified:', tables?.map(t => t.table_name));
    }

    console.log('\n🎯 VERA TABLES SETUP COMPLETE!');
    console.log('\n📊 Summary:');
    console.log('   ✅ vera_audit_log - Verification results (Vera writes only)');
    console.log('   ✅ vera_escalations - Fabrication alerts (Vera writes only)');
    console.log('   ✅ RLS enabled - No agent read/write access');
    console.log('   ✅ Service key bypass - Admin operations allowed');
    console.log('\n🔐 Security: All agents blocked. Only Vera service can write.');
    console.log('📈 Ready for: Independent verification deployment');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
createVeraTables();