// hybrid module, either works
import { LRUCache } from 'lru-cache';

// @TODO review these options
const options = {
  max: 500,
  // maxSize: 5000,
  ttl: 15 * 60 * 1000,
  allowStale: false,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
}

const cache = new LRUCache(options);

export default cache;