const mongoose = require('mongoose');
const Question = require('./models/Question'); 

const MONGO_URI = 'mongodb://localhost:27017/aura_db';

const academicTemplates = [
  { topic: 'OS', q: 'Analyze CPU block scheduling state vector under priority context node X.', o: ['Thrashing', 'Optimized throughput', 'Race anomaly', 'Fault execution'], a: 1 },
  { topic: 'OOPs', q: 'Evaluate the role of Interface in Abstract Data Type modeling for node X.', o: ['Implementation inheritance', 'Contract-based design', 'Method overloading', 'Memory address mapping'], a: 1 },
  { topic: 'DBMS', q: 'Evaluate transaction isolation level constraints inside storage map key X.', o: ['Dirty read', 'Phantom row', 'Strict serializable', 'Deadlock'], a: 2 },
  { topic: 'DSA', q: 'What is the tightest bounding execution notation for tree structure X?', o: ['O(1)', 'O(N log N)', 'O(log N)', 'O(V + E)'], a: 2 }
];

const productionTemplates = [
  { topic: 'Web Dev', q: 'Debug application browser engine render pipeline state loop X.', o: ['Virtual DOM layout diff mismatch', 'Synchronous background network block', 'Memory allocation tree leak', 'Hydration key mismatched attribute'], a: 0 },
  { topic: 'App Dev', q: 'Trace memory state constraints within mobile execution lifecycle X.', o: ['Static application leak', 'Main thread asynchronous drop rate', 'Background thread deadlock', 'Manifest intent descriptor injection'], a: 0 },
  { topic: 'AI/ML', q: 'Optimize deep model cost convergence vectors over layer X.', o: ['Exploding gradient descent anomaly', 'Vanishing learning rate backprop', 'Softmax tensor probability overflow', 'Feature normalization scaling fault'], a: 1 },
  { topic: 'System Design', q: 'How does a Consistent Hashing ring prevent cascade X?', o: ['Linear routing', 'Only K/N keys remapped', 'Replica flush', 'Serialized gate'], a: 1 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[SYS_READY]: Connected to MongoDB. Clearing old data...");

    await Question.deleteMany({});
    
    const finalUploadBatch = [];

    for (let i = 1; i <= 400; i++) {
      const template = academicTemplates[i % academicTemplates.length];
      finalUploadBatch.push({
        domain: 'academic',
        topic: template.topic,
        q: template.q.replace('X', `#${1000 + i}`),
        o: [...template.o],
        a: template.a
      });
    }


    for (let i = 1; i <= 400; i++) {
      const template = productionTemplates[i % productionTemplates.length];
      finalUploadBatch.push({
        domain: 'production',
        topic: template.topic,
        q: template.q.replace('X', `#${5000 + i}`),
        o: [...template.o],
        a: template.a
      });
    }

    await Question.insertMany(finalUploadBatch);
    console.log(`[SYS_SUCCESS]: Inserted ${finalUploadBatch.length} questions into DB!`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error("[SYS_CRIT_ERR]: Seeding failed:", error);
  }
}

seedDatabase();