/**
 * Migration: Normalize all user phone numbers to E.164.
 * Run after deploying the new auth/phone logic. After this, legacy login
 * support still works until you remove it (old users will have E.164 in DB).
 *
 * Usage: node migrations/migrate-user-phones-to-e164.js
 * Requires: MONGO_URL in env or .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { normalizePhone } = require('../utils/normalizePhone');

const PHONE_FIELDS = ['phoneNumber', 'phoneStudent', 'phoneFather', 'phoneMother', 'guardianPhone'];

async function migrateUserPhonesToE164() {
  const stats = { processed: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    console.log('Starting user phone E.164 migration...');

    const users = await User.find({}).lean();
    console.log(`Found ${users.length} users`);

    for (const u of users) {
      stats.processed++;
      const updates = {};
      let changed = false;

      for (const field of PHONE_FIELDS) {
        const value = u[field];
        if (!value || typeof value !== 'string') continue;

        const trimmed = value.trim();
        if (!trimmed) continue;

        try {
          const normalized = normalizePhone(trimmed);
          if (normalized !== trimmed) {
            updates[field] = normalized;
            changed = true;
          }
        } catch (err) {
          console.warn(`  [${u._id}] ${field} "${trimmed.substring(0, 15)}..." invalid: ${err.message}`);
          stats.errors++;
        }
      }

      if (!changed) {
        stats.skipped++;
        continue;
      }

      await User.updateOne({ _id: u._id }, { $set: updates });
      stats.updated++;
      console.log(`  ✓ ${u._id} ${u.firstName || ''} ${u.phoneNumber} → ${updates.phoneNumber || updates.phoneStudent || '...'}`);
    }

    console.log('Migration finished.');
    console.log('Processed:', stats.processed, '| Updated:', stats.updated, '| Skipped:', stats.skipped, '| Errors:', stats.errors);
    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  const mongoUrl = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/lms';
  mongoose
    .connect(mongoUrl)
    .then(() => {
      console.log('Connected to MongoDB');
      return migrateUserPhonesToE164();
    })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { migrateUserPhonesToE164 };
