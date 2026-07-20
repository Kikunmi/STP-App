class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw new Error(`Error finding document by ID: ${error.message}`);
    }
  }

  async findOne(query, options = {}) {
    try {
      let findQuery = this.model.findOne(query);

      if (options.select) {
        findQuery = findQuery.select(options.select);
      }
      if (options.lean) {
        findQuery = findQuery.lean();
      }

      return await findQuery;
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  async find(query = {}, options = {}) {
    try {
      let findQuery = this.model.find(query);

      if (options.select) {
        findQuery = findQuery.select(options.select);
      }
      if (options.skip) {
        findQuery = findQuery.skip(options.skip);
      }
      if (options.limit) {
        findQuery = findQuery.limit(options.limit);
      }
      if (options.sort) {
        findQuery = findQuery.sort(options.sort);
      }
      if (options.lean) {
        findQuery = findQuery.lean();
      }

      return await findQuery;
    } catch (error) {
      throw new Error(`Error finding documents: ${error.message}`);
    }
  }

  async count(query = {}) {
    try {
      return await this.model.countDocuments(query);
    } catch (error) {
      throw new Error(`Error counting documents: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  async findByIdAndUpdate(id, update, options = {}) {
    try {
      const defaultOptions = {
        new: true,
        runValidators: true,
        ...options
      };

      return await this.model.findByIdAndUpdate(id, update, defaultOptions);
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  async updateMany(query, update, options = {}) {
    try {
      const defaultOptions = {
        runValidators: true,
        ...options
      };

      return await this.model.updateMany(query, update, defaultOptions);
    } catch (error) {
      throw new Error(`Error updating documents: ${error.message}`);
    }
  }

  async findByIdAndDelete(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  async deleteMany(query) {
    try {
      return await this.model.deleteMany(query);
    } catch (error) {
      throw new Error(`Error deleting documents: ${error.message}`);
    }
  }

  async exists(query) {
    try {
      return await this.model.exists(query);
    } catch (error) {
      throw new Error(`Error checking existence: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
