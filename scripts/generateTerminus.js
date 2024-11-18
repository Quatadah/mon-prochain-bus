import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import arretsLignes from '../src/data/arrets-lignes.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Include the distance calculation function directly
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const generateTerminus = () => {
  const terminusMap = {};

  // Group stops by line ID
  const lineStops = new Map();
  arretsLignes.forEach((stop) => {
    if (!lineStops.has(stop.id)) {
      lineStops.set(stop.id, []);
    }
    lineStops.get(stop.id).push(stop);
  });

  // Calculate terminus for each line
  lineStops.forEach((stops, lineId) => {
    if (stops.length > 1) {
      let maxDistance = 0;
      let station1 = stops[0];
      let station2 = stops[0];

      for (let i = 0; i < stops.length; i++) {
        for (let j = i + 1; j < stops.length; j++) {
          const distance = calculateDistance(
            parseFloat(stops[i].stop_lat),
            parseFloat(stops[i].stop_lon),
            parseFloat(stops[j].stop_lat),
            parseFloat(stops[j].stop_lon)
          );
          if (distance > maxDistance) {
            maxDistance = distance;
            station1 = stops[i];
            station2 = stops[j];
          }
        }
      }

      terminusMap[lineId] = {
        start: station1.stop_name,
        end: station2.stop_name
      };
    }
  });

  // Write to file
  writeFileSync(
    join(__dirname, '../src/data/terminus.json'),
    JSON.stringify(terminusMap, null, 2)
  );
};

generateTerminus();