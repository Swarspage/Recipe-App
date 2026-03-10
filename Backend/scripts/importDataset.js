const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DATASET_PATH = 'd:\\Code\\Recipe App\\Dataset_Temp\\RecipeNLG_dataset.csv';

const STRICT_INDIAN = [
  'paneer', 'ghee', 'masala', 'biryani', 'dal', 'naan', 'tikka', 'tandoori', 
  'kheer', 'lassi', 'curry leaves', 'asafoetida', 'hing', 'cardamom', 
  'basmati', 'garam masala', 'mutton curry', 'chicken curry', 'vindaloo', 'makhani'
];

const GENERIC_INDIAN = [
  'turmeric', 'cumin', 'coriander', 'ginger', 'garlic', 'chili', 'cayenne', 'mustard seeds'
];

async function importData() {
  console.log('--- STARTING DEEP INDIAN IMPORT (FULL SCAN) ---');
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DATABASE CONNECTED');

    console.log('Deleting existing records...');
    await Recipe.deleteMany({});
    console.log('DATABASE WIPED');

    let processedCount = 0;
    let savedCount = 0;
    let batch = [];
    const BATCH_SIZE = 1000;

    const stream = fs.createReadStream(DATASET_PATH).pipe(csv());

    for await (const row of stream) {
      processedCount++;
      
      if (processedCount % 100000 === 0) {
        console.log(`[PROGRESS] Scanned: ${processedCount} | Indian Matches: ${savedCount}`);
      }

      const rawText = `${row.title || ''} ${row.ingredients || ''} ${row.NER || ''}`.toLowerCase();
      
      // Intelligent Indian Match Rule:
      // 1. Any 'Strict' keyword
      // 2. OR at least 3 'Generic' keywords
      const strictMatch = STRICT_INDIAN.some(kw => rawText.includes(kw));
      const genericCount = GENERIC_INDIAN.filter(kw => rawText.includes(kw)).length;
      
      const isIndian = strictMatch || genericCount >= 3;

      if (isIndian) {
        try {
          const parseDatasetList = (str) => {
            if (!str) return [];
            try { return JSON.parse(str); } catch (e) {}
            try { return JSON.parse(str.replace(/\'/g, '\"')); } catch (e) {}
            const matches = str.match(/[\"\'](.*?)[\"\'](?=\s*[,\]])/g);
            if (matches) return matches.map(m => m.replace(/^[\"\']|[\"\']$/g, '').replace(/\\\'/g, "'").replace(/\\\"/g, '"').trim());
            return (str || '').replace(/[\[\]\'\"]/g, '').split(' , ').map(s => s.trim()).filter(s => s);
          };

          const rawIngredients = parseDatasetList(row.ingredients || '[]');
          const entities = parseDatasetList(row.NER || '[]');
          const stepsClean = parseDatasetList(row.directions || '[]');

          if (entities.length === 0 || stepsClean.length < 2) continue;

          batch.push({
            title: row.title || `Indian Selection ${savedCount}`,
            ingredients: rawIngredients.map(n => ({ name: n.trim() })),
            ingredientNames: entities.map(e => e.toLowerCase().trim()),
            steps: stepsClean.map(s => s.trim()),
            cuisine: 'Indian',
            tags: ['indian', 'authentic', 'local-search'],
            sourceUrl: row.link,
            notes: 'Imported from RecipeNLG Full Scan',
            difficulty: stepsClean.length > 8 ? 'hard' : (stepsClean.length > 4 ? 'medium' : 'easy'),
            cookTime: Math.max(15, stepsClean.length * 6)
          });

          savedCount++;

          if (batch.length >= BATCH_SIZE) {
            await Recipe.insertMany(batch, { ordered: false });
            batch = [];
          }
        } catch (e) { continue; }
      }
    }

    if (batch.length > 0) await Recipe.insertMany(batch, { ordered: false });

    console.log('--- DEEP IMPORT COMPLETE ---');
    console.log('Total Recipes Scanned:', processedCount);
    console.log('Authentic Indian Saved:', savedCount);
    process.exit(0);

  } catch (err) {
    console.error('CRITICAL ERROR:', err);
    process.exit(1);
  }
}

importData();
