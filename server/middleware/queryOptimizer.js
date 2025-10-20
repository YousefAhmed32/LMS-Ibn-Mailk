// Database query optimization middleware
const queryOptimizer = (req, res, next) => {
  // Add query optimization to request object
  req.optimizeQuery = (query, options = {}) => {
    const {
      limit = 20,
      maxLimit = 100,
      select = '',
      populate = '',
      sort = { createdAt: -1 },
      lean = true
    } = options;
    
    // Apply pagination
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.limit) || limit, maxLimit);
    const skip = (page - 1) * pageSize;
    
    // Apply limit and skip
    query = query.limit(pageSize).skip(skip);
    
    // Apply sorting
    if (sort) {
      query = query.sort(sort);
    }
    
    // Apply field selection
    if (select) {
      query = query.select(select);
    }
    
    // Apply population
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => query = query.populate(pop));
      } else {
        query = query.populate(populate);
      }
    }
    
    // Use lean for better performance
    if (lean) {
      query = query.lean();
    }
    
    return query;
  };
  
  // Add aggregation optimization
  req.optimizeAggregation = (pipeline, options = {}) => {
    const {
      limit = 20,
      maxLimit = 100,
      allowDiskUse = true
    } = options;
    
    // Add pagination to aggregation
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.limit) || limit, maxLimit);
    const skip = (page - 1) * pageSize;
    
    // Add pagination stages
    pipeline.push(
      { $skip: skip },
      { $limit: pageSize }
    );
    
    // Add allowDiskUse for large datasets
    if (allowDiskUse) {
      pipeline.push({ $allowDiskUse: true });
    }
    
    return pipeline;
  };
  
  next();
};

module.exports = queryOptimizer;

