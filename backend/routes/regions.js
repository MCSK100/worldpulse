const express = require('express');
const router = express.Router();
const REGIONS = [
  { code: 'global', name: 'Global', bbox: null },
  { code: 'EU', name: 'Europe', bbox: { lamin: 35, lamax: 72, lomin: -25, lomax: 45 } },
  { code: 'NA', name: 'North America', bbox: { lamin: 15, lamax: 72, lomin: -170, lomax: -50 } },
  { code: 'AS', name: 'Asia', bbox: { lamin: -10, lamax: 60, lomin: 60, lomax: 150 } },
  { code: 'AF', name: 'Africa', bbox: { lamin: -35, lamax: 37, lomin: -20, lomax: 55 } },
  { code: 'SA', name: 'South America', bbox: { lamin: -60, lamax: 15, lomin: -85, lomax: -30 } },
  { code: 'OC', name: 'Oceania', bbox: { lamin: -50, lamax: 0, lomin: 110, lomax: 180 } },
];
router.get('/', (req, res) => res.json({ data: REGIONS }));
module.exports = router;
