/**
 * A local implementation of LRU cache, Don't have a ttl, only supports max number of entries to save
 */
class LRUCache {
  /**
   *
   * @param {number} maxItems : Max cache items allowed
   */
  constructor(maxItems) {
    this.cache = new Map();
    this.maxItems = maxItems;
    this.savedKeys = [];
  }

  /**
   *
   * @param {string} key - key to save in cache
   * @param {any} value - value to save in cache
   */
  set(key, value) {
    if (!this.cache.has(key)) {
      if (this.savedKeys.length === this.maxItems) {
        const last = this.savedKeys.pop();
        this.cache.delete(last);
      }
    } else {
      this.savedKeys.splice(this.savedKeys.indexOf(key), 1);
    }
    this.savedKeys.unshift(key);
    this.cache.set(key, value);
  }

  /**
   *
   * @param {string} key - key to fetch from cache
   * @return {string} - Stored data in cache
   */
  get(key) {
    return this.cache.get(key);
  }


  /**
   *
   * @param {string} key - key to fetch from cache
   * @return {boolean} - if key exist in cache
   */
  has(key) {
    return this.cache.has(key);
  }
}

module.exports = LRUCache;
