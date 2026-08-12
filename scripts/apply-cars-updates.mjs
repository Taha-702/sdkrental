#!/usr/bin/env node
import pkg from '@supabase/supabase-js';
const { createClient } = pkg;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY (service role key) in the environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const OVERRIDES = [
  { tokens: ['alto'], key: 'alto', rate: 4000 },
  { tokens: ['cultus'], key: 'cultus', rate: 5000 },
  { tokens: ['city'], key: 'city-5500', rate: 5500 },
  { tokens: ['gli'], key: 'gli', rate: 6500 },
  { tokens: ['yaris'], key: 'yaris', rate: 7000 },
  { tokens: ['grande'], key: 'grande', rate: 12000 },
  { tokens: ['elentr'], key: 'elentra', rate: 13000 },
  { tokens: ['civic', ' x'], key: 'civic-x', rate: 10000 },
  { tokens: ['civic', 'new'], key: 'civic-new', rate: 15000 },
  { tokens: ['sportage'], key: 'kia-sportage-16', rate: 16000 },
  { tokens: ['oshan'], key: 'oshan-x-7', rate: 18000 },
  { tokens: ['revo'], key: 'revo-dala', rate: 28000 },
  { tokens: ['jac'], key: 'jac-dala', rate: 30000 },
  { tokens: ['havel'], key: 'havel', rate: 30000 },
  { tokens: ['fortuner'], key: 'fortuner', rate: 35000 },
  { tokens: ['prado'], key: 'prado', rate: 40000 },
  { tokens: ['v8'], key: 'land-cruiser-v8', rate: 80000 },
];

async function run() {
  for (const o of OVERRIDES) {
    try {
      let query = supabase.from('cars');
      // build query with token-based ilike filters
      let q = query;
      for (const t of o.tokens) {
        q = q.ilike('name', `%${t}%`);
      }
      const { data, error } = await q.update({ image_key: o.key, rate_per_day: o.rate }).select('id');
      if (error) {
        console.error('Error updating', o.key, error.message || error);
      } else {
        console.log(`Updated ${data?.length ?? 0} rows for ${o.key}`);
      }
    } catch (err) {
      console.error('Unexpected error for', o.key, err);
    }
  }
  console.log('Done.');
}

run();
