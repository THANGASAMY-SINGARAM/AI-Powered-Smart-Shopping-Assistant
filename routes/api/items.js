const express = require('express');
const router = express.Router();
const path = require('path');
const { spawnSync } = require('child_process');
const Item = require('../../models/Item');
const auth = require('../../middleware/auth');

const fallbackCategories = {
  Groceries: ['apple', 'banana', 'bread', 'butter', 'cheese', 'chicken', 'coffee', 'egg', 'milk', 'oil', 'rice', 'tea', 'tomato'],
  Electronics: ['adapter', 'battery', 'cable', 'camera', 'charger', 'earbuds', 'keyboard', 'laptop', 'monitor', 'mouse', 'phone', 'speaker'],
  Stationery: ['book', 'diary', 'eraser', 'file', 'folder', 'marker', 'notebook', 'paper', 'pen', 'pencil', 'stapler'],
  Household: ['cleaner', 'detergent', 'mop', 'napkin', 'soap', 'sponge', 'tissue', 'toothpaste'],
  'Personal Care': ['conditioner', 'cream', 'deodorant', 'lotion', 'medicine', 'razor', 'sanitizer', 'shampoo']
};

const normalize = text => (text || '').toLowerCase().match(/[a-z0-9]+/g) || [];

const fallbackAnalyze = name => {
  const words = normalize(name);
  let bestCategory = 'Other';
  let bestScore = 0;

  Object.entries(fallbackCategories).forEach(([category, keywords]) => {
    const score = words.reduce((total, word) => {
      return total + keywords.filter(keyword => keyword.includes(word) || word.includes(keyword)).length;
    }, 0);

    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  });

  return {
    category: bestCategory,
    confidence: bestScore ? Math.min(0.95, 0.55 + bestScore * 0.12) : 0.35
  };
};

const runAiModel = payload => {
  const script = path.join(__dirname, '..', '..', 'ai', 'shopping_ai.py');
  const runners = [
    { command: 'python', args: [script] },
    { command: 'python3', args: [script] },
    { command: 'py', args: ['-3', script] }
  ];

  for (const runner of runners) {
    const result = spawnSync(runner.command, runner.args, {
      input: JSON.stringify(payload),
      encoding: 'utf8',
      timeout: 2500
    });

    if (result.error || result.status !== 0) {
      continue;
    }

    try {
      return JSON.parse(result.stdout);
    } catch (err) {
      return null;
    }
  }

  return null;
};

const analyzeItem = name => runAiModel({ action: 'analyze', name }) || fallbackAnalyze(name);

const fallbackSuggestions = items => {
  const pairings = {
    milk: ['Bread', 'Eggs', 'Cereal'],
    bread: ['Butter', 'Jam', 'Eggs'],
    rice: ['Dal', 'Oil', 'Salt'],
    phone: ['Charger', 'Earbuds', 'Case'],
    laptop: ['Mouse', 'Keyboard', 'USB Cable'],
    notebook: ['Pen', 'Pencil', 'Eraser']
  };
  const existing = new Set(items.map(item => item.name.toLowerCase()));
  const counts = {};

  items.forEach(item => {
    normalize(item.name).forEach(word => {
      (pairings[word] || []).forEach(suggestion => {
        if (!existing.has(suggestion.toLowerCase())) {
          counts[suggestion] = (counts[suggestion] || 0) + 1;
        }
      });
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, score]) => ({
      name,
      category: analyzeItem(name).category,
      score,
      reason: 'Based on your shopping history'
    }));
};

// @route   GET api/items
// @desc    Get all items
// @access  Public
router.get('/', (req, res) => {
  Item.find()
    .sort({ date: -1 })
    .then(items => res.json(items));
});

// @route   GET api/items/ai/suggestions
// @desc    Predict likely next shopping items from history
// @access  Public
router.get('/ai/suggestions', (req, res) => {
  Item.find()
    .sort({ date: -1 })
    .limit(50)
    .then(items => {
      const payload = {
        action: 'suggest',
        history: items.map(item => ({
          name: item.name,
          category: item.category
        }))
      };
      const aiResult = runAiModel(payload);
      res.json(aiResult || { suggestions: fallbackSuggestions(items) });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

// @route   POST api/items/ai/analyze
// @desc    Categorize shopping item text
// @access  Public
router.post('/ai/analyze', (req, res) => {
  res.json(analyzeItem(req.body.name));
});

// @route  POST api/item
// @desc   Create an item
// @access Private
router.post('/',auth, (req, res) =>{
    const ai = analyzeItem(req.body.name);
    const newItem = new Item({
        name: req.body.name,
        category: req.body.category || ai.category,
        aiConfidence: ai.confidence,
        addedByVoice: Boolean(req.body.addedByVoice)
    });
    newItem.save().then(item => res.json(item));
});

// @route  DELETE api/item/:id
// @desc   Delete an item
// @access Private
router.delete('/:id', auth, (req, res) => {
  Item.findByIdAndDelete(req.params.id)
    .then(item => {
      if (!item) {
        return res.status(404).json({ success: false });
      }
      res.json({ success: true });
    })
    .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
