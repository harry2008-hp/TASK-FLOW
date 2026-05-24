const fs = require('fs');
const path = require('path');
const { getDbMode } = require('../config/db');

const JSON_DB_DIR = path.join(__dirname, '../data');

// Generate unique string ID mimicking MongoDB ObjectId
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generic JSON database driver
class JsonCollection {
  constructor(collectionName) {
    this.filePath = path.join(JSON_DB_DIR, `${collectionName}.json`);
    this.initFile();
  }

  initFile() {
    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  read() {
    this.initFile();
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  // Filter dynamic queries
  matchQuery(item, query) {
    if (!query || Object.keys(query).length === 0) return true;
    
    for (const key in query) {
      const val = query[key];
      
      // Handle MongoDB Operators ($or, $and, $in, $ne)
      if (key === '$or') {
        return val.some(subQuery => this.matchQuery(item, subQuery));
      }
      if (key === '$and') {
        return val.every(subQuery => this.matchQuery(item, subQuery));
      }
      
      // Standard key match
      let itemVal = item[key];
      
      // If querying ObjectId ref, convert to string
      if (itemVal && typeof itemVal === 'object' && itemVal._id) {
        itemVal = itemVal._id;
      }

      if (val && typeof val === 'object') {
        if ('$in' in val) {
          if (!val.$in.includes(itemVal)) return false;
        } else if ('$ne' in val) {
          if (itemVal === val.$ne) return false;
        } else if ('$regex' in val) {
          const regex = new RegExp(val.$regex, val.$options || 'i');
          if (!regex.test(itemVal || '')) return false;
        }
      } else {
        if (itemVal != val) return false;
      }
    }
    return true;
  }

  // Mock Query class to support chainable stubs (.sort, .populate, .select)
  createQuery(dataPromise) {
    const queryObj = {
      then: (onSuccess, onFailure) => dataPromise.then(onSuccess, onFailure),
      catch: (onFailure) => dataPromise.catch(onFailure),
      sort: function() { return this; },
      populate: function() { return this; },
      select: function() { return this; },
    };
    return queryObj;
  }

  find(query = {}) {
    const list = this.read();
    const results = list.filter(item => this.matchQuery(item, query));
    return this.createQuery(Promise.resolve(results));
  }

  findOne(query = {}) {
    const list = this.read();
    const item = list.find(item => this.matchQuery(item, query)) || null;
    return this.createQuery(Promise.resolve(item));
  }

  findById(id) {
    const list = this.read();
    const item = list.find(item => item._id === String(id)) || null;
    return this.createQuery(Promise.resolve(item));
  }

  async create(data) {
    const list = this.read();
    const newItem = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(newItem);
    this.write(list);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this.read();
    const index = list.findIndex(item => item._id === String(id));
    if (index === -1) return null;

    // Handle Mongoose style update operators like $set or $push
    let current = list[index];
    let updated = { ...current };

    if (update.$set) {
      updated = { ...updated, ...update.$set };
    } else if (update.$push) {
      for (const k in update.$push) {
        if (Array.isArray(updated[k])) {
          updated[k].push(update.$push[k]);
        } else {
          updated[k] = [update.$push[k]];
        }
      }
    } else {
      updated = { ...updated, ...update };
    }

    updated.updatedAt = new Date().toISOString();
    list[index] = updated;
    this.write(list);
    return updated;
  }

  async findByIdAndDelete(id) {
    const list = this.read();
    const item = list.find(item => item._id === String(id));
    if (!item) return null;
    const filtered = list.filter(item => item._id !== String(id));
    this.write(filtered);
    return item;
  }

  async updateMany(query, update) {
    const list = this.read();
    let count = 0;
    const updatedList = list.map(item => {
      if (this.matchQuery(item, query)) {
        count++;
        let updated = { ...item };
        if (update.$set) {
          updated = { ...updated, ...update.$set };
        } else {
          updated = { ...updated, ...update };
        }
        updated.updatedAt = new Date().toISOString();
        return updated;
      }
      return item;
    });
    this.write(updatedList);
    return { nModified: count };
  }
}

// Function to export dynamic model based on current mode
function createDynamicModel(modelName, mongooseSchema) {
  const MongooseModel = mongoose.model(modelName, mongooseSchema);
  const jsonDb = new JsonCollection(modelName.toLowerCase() + 's');

  const proxy = new Proxy({}, {
    get: (target, prop) => {
      const mode = getDbMode();
      if (mode === 'mongodb') {
        return MongooseModel[prop];
      } else {
        // Fallback to JSON collection
        if (typeof jsonDb[prop] === 'function') {
          return jsonDb[prop].bind(jsonDb);
        }
        return jsonDb[prop];
      }
    }
  });

  return proxy;
}

module.exports = { createDynamicModel };
