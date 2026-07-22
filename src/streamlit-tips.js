'use strict';
var ST = {
  tip: function(page, text) { return ['streamlit', page, text]; }
};

/* 1 — Dataset */
(window.BLOCKS[1] || (window.BLOCKS[1] = [])).push(ST.tip(
  'GradCurve → EDA',
  'Run: streamlit run dashboard.py\n1. Sidebar: Mode = EnergyTypeNet\n2. Sidebar: Page = EDA\n3. Look at the "Class Distribution" bar chart — three roughly equal bars confirm LABEL_MAP is working correctly.\n4. The "Feature Distributions" histograms below show the raw Energy Consumption range (1 000–60 000 kWh). Notice how the three classes overlap in the middle — this is why the model only reaches ~63% accuracy on 2 features.'
));

/* 2 — Feature Engineering */
(window.BLOCKS[2] || (window.BLOCKS[2] = [])).push(ST.tip(
  'Custom Dataset → upload train_energy_data.csv',
  'Run: streamlit run dashboard.py\n1. Sidebar: Mode = Custom Dataset\n2. Upload: data/train_energy_data.csv\n3. Target column: Building Type\n4. Features: tick Energy Consumption + Square Footage + Number of Occupants + Appliances Used\n5. Click "Train Models" — the pipeline adds energy_per_sqft etc. automatically in the preprocessing step.\n6. Compare the CV score here (4 features) with the 2-feature score on the GradCurve Overview page. You should see +3–5 percentage points from the engineered ratios.'
));

/* 3 — Feature Scaling */
(window.BLOCKS[3] || (window.BLOCKS[3] = [])).push(ST.tip(
  'GradCurve → Decision Boundaries',
  'Run: streamlit run dashboard.py\n1. Sidebar: Mode = EnergyTypeNet\n2. Sidebar: Page = Decision Boundaries\n3. The axes are labelled "Energy Consumption (scaled)" and "Square Footage (scaled)" — these are the StandardScaler outputs.\n4. Notice that without scaling the Attention Classifier would use raw distances of 50 000 kWh vs 500 sqft — the energy axis would dominate completely. Scaled features give each axis equal weight.'
));

/* 4 — OvR */
(window.BLOCKS[4] || (window.BLOCKS[4] = [])).push(ST.tip(
  'GradCurve → Decision Boundaries',
  'Run: streamlit run dashboard.py\n1. Sidebar: Page = Decision Boundaries\n2. Find the "LogisticRegressionOvR" panel.\n3. Observe: the boundary between Residential and Commercial is a straight line — OvR is a linear classifier.\n4. Slide the "bandwidth" slider on the Attention panel — notice the OvR boundary never changes shape. OvR\'s boundary depends only on its learned weight vector, not on any hyperparameter slider.'
));

/* 5 — Softmax */
(window.BLOCKS[5] || (window.BLOCKS[5] = [])).push(ST.tip(
  'GradCurve → Decision Boundaries',
  'Run: streamlit run dashboard.py\n1. Sidebar: Page = Decision Boundaries\n2. Compare "LogisticRegressionSoftmax" with "LogisticRegressionOvR".\n3. Both draw straight-line boundaries because both are linear classifiers.\n4. Key difference: Softmax probabilities always sum to exactly 1.0. Go to Live Prediction — set features to a Commercial building — compare the probability rows between OvR and Softmax. OvR numbers are normalised post-hoc; Softmax numbers come from a single joint model.'
));

/* 6 — Attention */
(window.BLOCKS[6] || (window.BLOCKS[6] = [])).push(ST.tip(
  'GradCurve → Decision Boundaries + Live Prediction',
  'Run: streamlit run dashboard.py\n1. Decision Boundaries → "AttentionClassifier" panel: the boundary is curved, not straight.\n2. Live Prediction page: set Energy=5000, Sqft=2000 — a borderline building.\n3. Attention gives the widest probability spread (most uncertainty) because it blends votes from all nearby training points.\n4. Try Energy=50000, Sqft=25000 (clear Industrial) — all three models agree with high confidence. The disagreement only appears near the class boundary.'
));

/* 7 — XGBoost */
(window.BLOCKS[7] || (window.BLOCKS[7] = [])).push(ST.tip(
  'GradCurve → Model Comparison + Decision Boundaries',
  'Run: streamlit run dashboard.py\n1. Model Comparison page: find the XGBoost row — it typically has the highest CV mean on this dataset.\n2. Decision Boundaries → "XGBoost" panel: notice axis-aligned rectangular regions — these are tree split thresholds (e.g. Energy > 12 000).\n3. Compare with LogisticRegressionOvR: OvR draws a diagonal line; XGBoost draws staircase-shaped regions. Same class, very different decision geometry.'
));

/* 8 — MLP */
(window.BLOCKS[8] || (window.BLOCKS[8] = [])).push(ST.tip(
  'GradCurve → Learning Curves',
  'Run: streamlit run dashboard.py\n1. Sidebar: Page = Learning Curves\n2. Find the MLP panel. The blue "Train" line starts near 1.0 even with only 100 training rows — classic overfitting.\n3. The orange "CV val" line rises slowly and plateaus around 63%.\n4. The gap between train and val is the overfitting gap — larger gap = more overfitting. Compare with XGBoost: XGBoost\'s gap is usually smaller because tree splits generalise better on this small dataset.'
));

/* 9 — Ensemble */
(window.BLOCKS[9] || (window.BLOCKS[9] = [])).push(ST.tip(
  'GradCurve → Model Comparison',
  'Run: streamlit run dashboard.py\n1. Model Comparison page: look at the "soft_voting" and "stacking" rows.\n2. Does either beat the best single model (usually XGBoost)? On this small dataset it is common for ensembles to match but not exceed the best base model — there is not enough diversity when the dataset is small.\n3. Click the CV scores bar chart: the error bars (±std) show how consistent each model is across folds. Wide bars = sensitive to which buildings ended up in training.'
));

/* 10 — Cross-Validation */
(window.BLOCKS[10] || (window.BLOCKS[10] = [])).push(ST.tip(
  'GradCurve → Model Comparison',
  'Run: streamlit run dashboard.py\n1. Model Comparison page: the "CV Mean" column is the mean of 5 fold accuracies.\n2. The "CV Std" column tells you how much accuracy varied across folds — a std of 0.08 means some folds gave 55%, others gave 71%.\n3. Rule of thumb: std > 0.06 on this dataset means the model is sensitive to which 200 rows ended up in validation. XGBoost usually has the lowest std here.'
));

/* 11 — Metrics */
(window.BLOCKS[11] || (window.BLOCKS[11] = [])).push(ST.tip(
  'GradCurve → Confusion Matrices',
  'Run: streamlit run dashboard.py\n1. Sidebar: Page = Confusion Matrices\n2. Look at the diagonal — these are recall values per class.\n3. Find the cell (Commercial → Residential): this is the most common error because low-energy commercial buildings look like large residential ones in the 2-feature space.\n4. Which model has the most balanced diagonal? Usually XGBoost — it handles the overlap best.'
));

/* 12 — Decision Boundaries */
(window.BLOCKS[12] || (window.BLOCKS[12] = [])).push(ST.tip(
  'GradCurve → Decision Boundaries',
  'Run: streamlit run dashboard.py\n1. All five model boundaries are shown side by side.\n2. Key observation: the Industrial class (top-right) is always cleanly separated. The Residential/Commercial boundary (bottom-left) is where all models struggle — the data clouds overlap.\n3. Count how many coloured dots land in the wrong region — those are training errors. XGBoost usually has the fewest misclassified training points but a complex, staircase boundary.'
));

/* 13 — MLflow */
(window.BLOCKS[13] || (window.BLOCKS[13] = [])).push(ST.tip(
  'Terminal → mlflow ui',
  'In your terminal:\n1. python -m src.train --feature-set core\n   (this creates mlruns/ directory and logs the run)\n2. mlflow ui\n   (opens http://localhost:5000)\n3. Click "EnergyTypeNet" experiment\n4. You see one run. Click it.\n5. Left panel: Params — shows feature_set=core, best_model=xgboost\n6. Right panel: Metrics — shows cv_mean per model\n7. Run again with --feature-set all and compare the two runs side by side.'
));

/* 14 — FastAPI */
(window.BLOCKS[14] || (window.BLOCKS[14] = [])).push(ST.tip(
  'Terminal → uvicorn',
  'In your terminal (after training):\n1. python -m src.train --feature-set core --no-mlflow\n2. uvicorn src.api:app --reload\n3. Open http://localhost:8000/docs  ← Swagger UI auto-generated by FastAPI\n4. Click POST /predict → "Try it out" → paste example JSON:\n   {"square_footage":1500,"number_of_occupants":4,"appliances_used":10,"average_temperature":20,"day_of_week":"Weekday","energy_consumption":5000}\n5. Click Execute — see the live prediction response.\n6. Try energy_consumption=-1 — FastAPI returns 422 automatically (Pydantic ge=0 constraint).'
));

/* 15 — Docker */
(window.BLOCKS[15] || (window.BLOCKS[15] = [])).push(ST.tip(
  'Terminal → docker build',
  'In your terminal:\n1. docker build -t energytypenet .\n   Watch the layers: "pip install" is fast on rebuild if you only changed src/*.py\n2. docker run -p 8000:8000 energytypenet\n3. curl http://localhost:8000/health  → {"status":"ok"}\n4. Test prediction: curl -X POST http://localhost:8000/predict -H "Content-Type: application/json" -d \'{"square_footage":1500,...}\'\n5. Stop container: Ctrl+C\n6. Edit src/data.py (add a comment), rebuild: docker build -t energytypenet . — notice the pip install layer is CACHED (< 1s), only the COPY . . and RUN train steps re-run.'
));

/* 16 — Streamlit */
(window.BLOCKS[16] || (window.BLOCKS[16] = [])).push(ST.tip(
  'All three modes',
  'Run: streamlit run dashboard.py\nMode 1 — EnergyTypeNet: fixed dataset, pre-trained models. Best for exploring the visualizations.\nMode 2 — Custom Dataset: upload any CSV.\n  Try: data/sample_building_operations.csv\n  Select target = Building Type, features = all others\n  Click Train — see confusion matrix for YOUR feature selection\nMode 3 — AI Dataset Assistant:\n  Upload data/train_energy_data.csv\n  Click "Profile" — see missing values, duplicates, column types\n  Click "Suggest Target" — Building Type should be ranked #1\n  Click "Train Baselines" — 8 models trained automatically\n  Ask: "Is the model overfitting?" — the assistant compares CV vs test accuracy'
));

/* 17 — GitHub Actions */
(window.BLOCKS[17] || (window.BLOCKS[17] = [])).push(ST.tip(
  'GitHub → Actions tab',
  'After pushing any commit to GitHub:\n1. Go to your repository on GitHub\n2. Click the Actions tab\n3. Open the test job for the configured Python version\n4. Expand "Run tests" to see pytest output\n5. Expand the import/deploy checks if a module fails to load\n6. Locally, introduce and immediately undo a harmless syntax error in a model module such as src/models/linear.py to understand the failure message—do not push intentionally broken code\n7. Run the checks again and confirm they return green'
));

/* 18 — AutoML */
(window.BLOCKS[18] || (window.BLOCKS[18] = [])).push(ST.tip(
  'Streamlit → AI Dataset Assistant',
  'Run: streamlit run dashboard.py → Mode: AI Dataset Assistant\nExample dataset: data/train_energy_data.csv (1 000 rows, 7 columns)\n1. Upload the CSV\n2. Click "Profile Dataset" — see n_rows=1000, missing_cells=0, duplicate_rows=X\n3. "Suggest Target" — Building Type scores highest (it\'s the last column + "type" keyword)\n4. Select target = Building Type, keep all other features\n5. "Train Baselines" — 8 models in ~10s. XGBoost is usually best.\n6. Questions to ask the assistant:\n   "Is the model overfitting?" → compares CV vs test gap\n   "Which features are most important?" → mutual information ranking\n   "What is the task type?" → classification (3 unique string values)'
));

/* 19 — Codebase Tour */
(window.BLOCKS[19] || (window.BLOCKS[19] = [])).push(ST.tip(
  'GradCurve → Overview',
  'Run: streamlit run dashboard.py → Mode: EnergyTypeNet → Page: Overview\nThe current Overview uses preloaded comparison artifacts so the hosted app does not retrain models on every rerun. The production trainer in src/train.py separately compares 9 candidates with 5-fold CV, refits the CV winner, evaluates it on data/test_energy_data.csv, and writes artifacts/model.joblib. Trace both paths and notice that dashboard display-time caching and offline production training solve different problems.'
));


