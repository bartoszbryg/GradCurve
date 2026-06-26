'use strict';
if(!window.BLOCKS) window.BLOCKS = [];
/* ── Lesson block data ────────────────────────────────────────────────
   Format per block:
     ['p',  'paragraph text']
     ['h2', 'heading text']
     ['code', 'filename', 'source code string']
     ['callout', 'type', 'title', 'body']
     ['math', 'formula string']
     ['quiz', [ {q, a, opts:[{t,e}]} ]]
─────────────────────────────────────────────────────────────────────── */
window.LESSON_TITLES = [
  'Home',                    // 0
  'Dataset',                 // 1
  'Feature Engineering',     // 2
  'Feature Scaling',         // 3
  'Logistic Regression OvR', // 4
  'Softmax Regression',      // 5
  'Attention Classifier',    // 6
  'XGBoost',                 // 7
  'Neural Network (MLP)',    // 8
  'Ensemble Methods',        // 9
  'Cross-Validation',        // 10
  'Evaluation Metrics',      // 11
  'Decision Boundaries',     // 12
  'MLflow',                  // 13
  'FastAPI',                 // 14
  'Docker',                  // 15
  'Streamlit Dashboard',     // 16
  'GitHub Actions CI',       // 17
  'AutoML Assistant',        // 18
  'Codebase Tour',           // 19
  'Gradient Descent',        // 20
  'Overfitting',             // 21
  'Reading Your Results',    // 22
];

