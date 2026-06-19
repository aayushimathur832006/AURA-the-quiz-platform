
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');


router.get('/fetch-sandbox', async (req, res) => {
  try {
    const { domain, quantity } = req.query;
    
    
    const targetLimit = parseInt(quantity, 10) || 20;

  
    const questionsPipeline = await Question.aggregate([
     
      { $match: { domain: domain } },
      
      
      { $sample: { size: targetLimit } }
    ]);

    return res.status(200).json({
      status: "SUCCESS_VECTOR_SYNC",
      nodesLoaded: questionsPipeline.length,
      data: questionsPipeline
    });

  } catch (error) {
    console.error("[SYS_CRIT_ERR]: Database retrieval exception:", error);
    return res.status(500).json({ error: "Internal compilation pipeline failure." });
  }
});

module.exports = router;