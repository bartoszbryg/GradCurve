window.BLOCKS[1].push(
  ['p', 'Why this exists: before any model can learn, it needs a numeric representation of reality. The CSV converts physical observations about buildings into a table of numbers, and LABEL_MAP converts human-readable class names into integers the model can compute with.'],
  ['code', 'Line by line — load_features()', `def load_features(filepath: str, feature_set: str = 'core'):
    df = load_raw(filepath)          # read CSV, drop rows with NaN
    y = df['Building Type']          # extract the target column (strings)
         .map(LABEL_MAP)             # "Residential"→0, "Commercial"→1, "Industrial"→2
         .values                     # convert pandas Series to NumPy array
    X = df[FEATURE_COLS[feature_set]] # select only the requested feature columns
         .values                     # convert DataFrame to 2-D NumPy array
         .astype(float)              # ensure all values are float64
    return X, y
    # X.shape = (1000, 2) for 'core'  — 1000 buildings × 2 measurements
    # y.shape = (1000,)               — one integer label per building`],
  ['code', 'Real output', `# Running: X, y = load_features('data/train_energy_data.csv', 'core')
# X[0] = [2713.95, 7063.0]   ← first building: 2713.95 kWh, 7063 sqft
# y[0] = 0                   ← Residential
# X.shape = (1000, 2)
# y.shape = (1000,)
# np.unique(y, return_counts=True)
# → (array([0, 1, 2]), array([334, 333, 333]))  ← roughly balanced classes`],
  ['code', 'Three ways to call this', `# Call 1 — core features (default): just Energy + Square Footage
X_core, y = load_features('data/train_energy_data.csv')
# X_core.shape = (1000, 2)

# Call 2 — extended features: adds Occupants + Appliances
X_ext, y = load_features('data/train_energy_data.csv', feature_set='extended')
# X_ext.shape = (1000, 4)

# Call 3 — all features: adds Average Temperature too
X_all, y = load_features('data/train_energy_data.csv', feature_set='all')
# X_all.shape = (1000, 5)`],
  ['callout','info','What this tells you','X[0] = [2713.95, 7063.0] means the first building uses 2 713.95 kWh of energy and covers 7 063 square feet. y[0] = 0 means it is Residential. The shape (1000, 2) confirms 1 000 buildings and 2 features. Balanced class counts (~333 each) mean accuracy is a reliable metric here.'],
  ['callout','analogy','Real world — hospital records','A hospital patient record CSV is similar: each row is one patient, columns are measurements (blood pressure, age, test results), and the target column is the diagnosis (healthy=0, at-risk=1, critical=2). load_features() would pull out the numeric columns and encode the diagnosis — the same pattern used here.'],
  ['quiz',[{q:'What happens if you call load_features() with feature_set="extended" on a CSV that is missing the "Number of Occupants" column?',a:2,opts:[
    {t:'It silently returns the 2-column core set instead',e:'load_features() does not fall back — it uses exactly the columns specified in FEATURE_COLS[feature_set].'},
    {t:'It adds a column of zeros for the missing feature',e:'There is no default-fill logic in load_features().'},
    {t:'pandas raises a KeyError because the requested column does not exist in the DataFrame',e:'Correct! df[FEATURE_COLS["extended"]] tries to index a column that is absent — KeyError.'},
    {t:'It returns a (1000, 3) array, skipping the missing column',e:'pandas does not silently skip missing columns.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 2 — Feature Engineering ── */
window.BLOCKS[2].push(
  ['p', 'Why this exists: raw Energy Consumption and Square Footage confound size with usage intensity. A 60 000 kWh factory and a 60 000 kWh mega-mall both score the same on raw energy, but their energy-per-sqft values differ dramatically. Engineered ratios remove the size effect and expose the true usage pattern.'],
  ['code', 'Line by line — make_engineered_features()', `def make_engineered_features(df: pd.DataFrame):
    feat = pd.DataFrame()                        # start with an empty DataFrame

    feat['energy_consumption'] = df['Energy Consumption']   # copy original column
    feat['square_footage']     = df['Square Footage']       # copy original column
    feat['num_occupants']      = df['Number of Occupants']  # copy original column
    feat['appliances_used']    = df['Appliances Used']      # copy original column
    feat['avg_temperature']    = df['Average Temperature']  # copy original column
    feat['is_weekend']         = (df['Day of Week'] == 'Weekend').astype(float)
    #                            ↑ bool → 1.0 if Weekend, 0.0 if Weekday

    sqft_safe = df['Square Footage'].clip(lower=1)    # replace 0 or negative with 1
    occ_safe  = df['Number of Occupants'].clip(lower=1) # same — avoid divide-by-zero

    feat['energy_per_sqft']   = df['Energy Consumption'] / sqft_safe   # intensity
    feat['occupancy_density'] = df['Number of Occupants'] / sqft_safe  # crowding
    feat['appliance_per_occ'] = df['Appliances Used']    / occ_safe    # machines/person

    return feat.values.astype(float), list(feat.columns)
    # returns: (ndarray shape (n,9), list of 9 column name strings)`],
  ['code', 'Real output', `# First training row: Energy=2713.95, Sqft=7063.0, Occ=5, App=12, Temp=18, Day=Weekday
# After make_engineered_features():
#   energy_consumption  = 2713.95
#   square_footage      = 7063.0
#   num_occupants       = 5
#   appliances_used     = 12
#   avg_temperature     = 18
#   is_weekend          = 0.0       ← Weekday
#   energy_per_sqft     = 2713.95 / 7063.0 = 0.384 kWh/sqft
#   occupancy_density   = 5 / 7063.0       = 0.000708 people/sqft
#   appliance_per_occ   = 12 / 5           = 2.4 appliances/person
# Returned array shape: (1000, 9)`],
  ['code', 'Three ways to call this', `# Call 1 — basic use: get matrix + column names
X_eng, cols = make_engineered_features(df)
# X_eng.shape = (1000, 9),  cols = ['energy_consumption', ..., 'appliance_per_occ']

# Call 2 — inspect one row
X_eng, cols = make_engineered_features(df)
print(dict(zip(cols, X_eng[0])))
# {'energy_consumption': 2713.95, 'energy_per_sqft': 0.384, ...}

# Call 3 — use with train/test DataFrames separately (correct — no leakage)
X_train_eng, cols = make_engineered_features(df_train)
X_test_eng,  _    = make_engineered_features(df_test)
# clip(lower=1) uses a constant, not a data statistic, so no leakage risk`],
  ['callout','info','What this tells you','energy_per_sqft = 0.384 kWh/sqft for the first (Residential) building is low — houses use modest energy per unit area. An Industrial building might show 5–15 kWh/sqft. This ratio is what separates them clearly, while raw energy alone does not.'],
  ['callout','analogy','Real world — retail chain','A retail chain compares sales per square foot across stores, not total sales. A flagship 20 000 sqft store generating £2 M/year (£100/sqft) may underperform a compact 2 000 sqft boutique at £180/sqft. The ratio reveals efficiency; the raw number only reveals scale.'],
  ['quiz',[{q:'What happens if you change clip(lower=1) to clip(lower=0)?',a:1,opts:[
    {t:'All buildings get energy_per_sqft = 0 because 0 is now allowed',e:'Only buildings with sqft ≤ 0 would be clipped to 0 — and dividing by 0 causes the problem.'},
    {t:'Any building with Square Footage = 0 produces energy_per_sqft = inf (division by zero), which breaks downstream math',e:'Correct! clip(lower=0) still allows 0, so dividing by it yields infinity or NaN, which crashes StandardScaler and gradient descent.'},
    {t:'The output array shape changes from (1000, 9) to (1000, 8)',e:'clip() never changes the number of rows or columns.'},
    {t:'The feature values become negative for small buildings',e:'clip(lower=0) prevents negative values — it does not introduce them.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 3 — Feature Scaling ── */
window.BLOCKS[3].push(
  ['p', 'Why this exists: Energy Consumption spans 1 000–60 000 while Square Footage spans 500–30 000. Without scaling, the gradient for Energy is ~60× larger than for Square Footage. Gradient descent takes huge steps on Energy and tiny steps on Square Footage, causing slow, erratic convergence. StandardScaler puts both features on a common ±2 scale so gradient descent can take balanced steps in every direction.'],
  ['code', 'Line by line — the in-fold scaling pattern', `for train_idx, val_idx in skf.split(X, y):    # iterate 5 times
    X_train, X_val = X[train_idx], X[val_idx]  # split into train and val

    if needs_scaling:
        scaler  = StandardScaler()             # fresh scaler each fold
        X_train = scaler.fit_transform(X_train)# learn μ and σ from training rows ONLY
        #         └── fit():       μ_energy=28500, σ_energy=17300
        #             transform(): z = (x - μ) / σ  applied to X_train
        X_val   = scaler.transform(X_val)      # apply SAME μ and σ — no new fit
        #         ↑ This is critical: val data is transformed using training statistics

    model = model_cls(**kwargs)                # build a fresh model
    model.fit(X_train, y_train)               # train on scaled training data
    scores.append(accuracy_score(y_val, model.predict(X_val)))`],
  ['code', 'Real output', `# Training set statistics (approximate):
# scaler.mean_  = [28500.0, 10600.0]    ← mean energy, mean sqft
# scaler.scale_ = [17300.0,  6400.0]    ← std dev energy, std dev sqft

# First training row raw: [2713.95, 7063.0]
# After scaling:
#   energy_scaled = (2713.95 - 28500) / 17300 = -1.5569
#   sqft_scaled   = (7063.0  - 10600) /  6400 = -0.5527
# Result: [-1.5569, -0.5527]

# SKF fold sizes (n=1000, k=5):
# Each fold: train=800 rows, val=200 rows`],
  ['code', 'Three ways to call this', `# Call 1 — correct in-fold scaling (used in cross_validate_custom)
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)  # fit on 800 rows, transform
X_val_sc   = scaler.transform(X_val)        # use same fit for 200 val rows

# Call 2 — final model scaling after CV (fit on ALL 1000 training rows)
scaler_final = StandardScaler()
X_all_sc = scaler_final.fit_transform(X_train_full)  # full training set
# This scaler goes into the saved artifact so the API can use it at inference time

# Call 3 — manual check on one building
z = (np.array([2713.95, 7063.0]) - scaler.mean_) / scaler.scale_
# z = [-1.5569, -0.5527]  ← this building is 1.56 std devs below avg energy`],
  ['callout','info','What this tells you','energy_scaled = -1.5569 means this building uses 1.56 standard deviations less energy than the average building in the training set. sqft_scaled = -0.5527 means it is about half a standard deviation smaller than average. Together these point to a small, low-energy building — consistent with Residential.'],
  ['callout','analogy','Real world — banking credit scores','Banks normalise applicant features before feeding them into a credit model. Income (£20k–£200k), age (18–80), and credit history length (0–40 years) are all on completely different scales. Standardising makes the model treat each variable fairly — without it, income would dominate because its raw numbers are largest.'],
  ['quiz',[{q:'You fit StandardScaler on X_train (800 rows) and then call scaler.transform() on X_test (100 rows). The test set happens to contain a building with energy = 75 000 kWh, far outside the training range. What does the scaler do with it?',a:0,opts:[
    {t:'It applies the same formula: z = (75000 - 28500) / 17300 = +2.69. The value is outside the training range but the scaler does not clip or reject it',e:'Correct! StandardScaler applies its stored μ and σ mechanically. Values far outside training range produce large z-scores but are not clamped.'},
    {t:'It clips the value to the maximum seen during fit_transform',e:'StandardScaler has no clipping behavior.'},
    {t:'It raises a ValueError because the value is an outlier',e:'StandardScaler never raises errors for out-of-range values.'},
    {t:'It refits the scaler using the test set value to stay calibrated',e:'That would be data leakage. Transform never changes the fitted parameters.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 4 — Logistic Regression OvR ── */
window.BLOCKS[4].push(
  ['p', 'Why this exists: gradient-based classifiers need a differentiable loss function. The sigmoid converts any real-valued score into a smooth probability in [0,1], making the cross-entropy loss differentiable everywhere. Without sigmoid, the binary step function (predict 1 if score > 0) has gradient zero almost everywhere — gradient descent cannot move.'],
  ['code', 'Line by line — _fit_binary()', `def _fit_binary(self, X, y_bin, rng):
    w = rng.normal(0.0, 0.01, size=1 + X.shape[1])
    # w[0]  = bias (scalar offset — shifts the decision boundary)
    # w[1:] = one weight per feature (e.g. w[1]=energy weight, w[2]=sqft weight)
    # small random init prevents symmetry: if all weights start equal, they update equally

    for _ in range(self.n_iter):          # repeat n_iter times (default 1000)
        net    = X @ w[1:] + w[0]        # dot product: shape (n_samples,)
        output = self._sigmoid(net)       # map each net to probability in (0,1)

        errors = y_bin - output           # residuals: positive if we underestimated

        w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])
        # X.T @ errors = gradient of log-loss w.r.t. w[1:]
        # - self.alpha * w[1:] = L2 penalty gradient (pushes weights toward 0)
        w[0]  += self.eta * errors.sum() # bias update: sum of all residuals

    return w                             # final trained weight vector`],
  ['code', 'Real output', `# After training on 800 scaled rows (fold 1), class 0 (Residential) vs rest:
# w ≈ [ 0.112,   -0.841,  0.521]
#       bias     energy   sqft
# Negative energy weight: high energy → low probability of Residential (correct!)
# Positive sqft weight: larger building → slightly more likely Residential

# CV scores across 5 folds: [0.615, 0.575, 0.665, 0.595, 0.580]
# mean = 0.606, std = 0.033
# Test-set accuracy: 0.640`],
  ['code', 'Three ways to call this', `# Call 1 — default hyperparameters
ovr = LogisticRegressionOvR(eta=0.0001, alpha=0.001, n_iter=1000)
ovr.fit(X_scaled, y)
preds = ovr.predict(X_scaled)                  # array of 0/1/2

# Call 2 — stronger regularisation to reduce overfitting
ovr_reg = LogisticRegressionOvR(eta=0.0001, alpha=0.01, n_iter=1000)
ovr_reg.fit(X_scaled, y)

# Call 3 — check individual class probabilities for one building
proba = ovr.predict_proba(X_scaled[[0]])       # shape (1, 3)
# proba[0] ≈ [0.52, 0.31, 0.17]  → 52% Residential, 31% Commercial, 17% Industrial`],
  ['callout','info','What this tells you','CV mean 0.606 ± 0.033 means OvR Logistic Regression correctly classifies about 61% of buildings when evaluated on held-out data. The std of 0.033 (about ±3%) indicates moderate sensitivity to which fold is held out — typical for a linear model on this dataset.'],
  ['callout','analogy','Real world — insurance claim triage','An insurer trains a binary OvR classifier: "Is this claim likely fraudulent?" Then another: "Is this claim likely for bodily injury?" Each OvR question is answered independently and the highest-scoring category guides the routing. The sigmoid gives a confidence level, not just a yes/no — agents review borderline cases.'],
  ['quiz',[{q:'What happens if you change eta from 0.0001 to 0.5 in LogisticRegressionOvR on unscaled data (Energy ~30 000)?',a:2,opts:[
    {t:'Training becomes 5 000× faster and accuracy improves',e:'A very large learning rate on unscaled data causes the gradient (proportional to feature magnitude) to be enormous — weights oscillate wildly.'},
    {t:'The model needs fewer iterations to converge',e:'With eta=0.5 on unscaled energy values, each gradient step is enormous and the model diverges rather than converges.'},
    {t:'The weight updates are enormous (gradient ∝ energy magnitude ~30 000), causing the weights to oscillate and the loss to increase rather than decrease',e:'Correct! This is exactly why scaling is required before gradient descent on features with large magnitudes.'},
    {t:'The bias term is ignored because it gets multiplied to zero',e:'The bias update uses errors.sum(), not energy values — it is not affected by feature scale.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 5 — Softmax Regression ── */
window.BLOCKS[5].push(
  ['p', 'Why this exists: One-vs-Rest trains three independent classifiers, but their raw probability scores can each be greater than 0.5 simultaneously — a mathematical inconsistency. Softmax trains a single joint model whose outputs always sum to exactly 1, which is the correct requirement for a valid probability distribution over mutually exclusive classes.'],
  ['code', 'Line by line — fit() for Softmax', `def fit(self, X, y):
    n_samples, n_features = X.shape           # (800, 2) for core features in one fold
    n_classes = len(np.unique(y))             # 3

    Y = np.eye(n_classes)[y]                 # one-hot encoding: 0→[1,0,0], 1→[0,1,0], 2→[0,0,1]

    self.W_ = rng.normal(0.0, 0.01, size=(n_classes, n_features))
    # W_ shape = (3, 2): one weight row per class, one column per feature
    self.b_ = np.zeros(n_classes)            # one bias per class, init to 0

    for _ in range(self.n_iter):             # repeat 1000 times
        logits = X @ self.W_.T + self.b_     # shape (n_samples, 3): raw class scores
        P      = self._softmax(logits)       # convert to probabilities summing to 1

        dL = (P - Y) / n_samples            # gradient of cross-entropy loss
        # P - Y: where P is high but Y is 0 → large positive gradient → decrease score

        self.W_ -= self.eta * (dL.T @ X + self.alpha * self.W_)  # weight update + L2
        self.b_ -= self.eta * dL.sum(axis=0)                      # bias update

    return self`],
  ['code', 'Real output', `# After training on 800 scaled rows (core features):
# W_ ≈ [[-0.8406,  0.521],    ← Residential weights (neg energy, pos sqft)
#        [-0.0022, -0.0697],   ← Commercial weights (near zero — hard to separate)
#        [ 0.8519, -0.4398]]   ← Industrial weights (pos energy, neg sqft)
# b_ ≈ [0.0186, 0.0734, -0.0920]

# Loss trajectory: epoch 1 → 1.1005, epoch 500 → 0.881  (converging)
# CV scores: sklearn LR softmax → mean=0.626, std=0.017`],
  ['code', 'Three ways to call this', `# Call 1 — default: train and predict
sm = LogisticRegressionSoftmax(eta=0.01, alpha=0.01, n_iter=1000)
sm.fit(X_scaled, y)
proba = sm.predict_proba(X_scaled[:3])   # shape (3, 3)

# Call 2 — examine the weight matrix
print(sm.W_)   # each row = learned direction for one class in feature space
# Row 0 (Residential): large negative energy weight confirms "low energy → Residential"

# Call 3 — sklearn equivalent (for comparison)
from sklearn.linear_model import LogisticRegression
lr_sk = LogisticRegression(multi_class='multinomial', solver='lbfgs', max_iter=1000)
lr_sk.fit(X_scaled, y)   # sklearn LR: CV mean ≈ 0.626, std ≈ 0.017`],
  ['callout','info','What this tells you','W_[2] = [0.8519, -0.4398] means the Industrial classifier puts heavy positive weight on energy and negative weight on sqft. A scaled Industrial building with high energy (-1.5 → actual near 0 for Industrial means high raw energy maps to positive z) contributes positively to the Industrial score. W_[1] ≈ [0, 0] means Commercial is the "leftover" class — neither high nor low on either feature.'],
  ['callout','analogy','Real world — airline seat upgrade prediction','An airline uses softmax to classify passengers into: Economy-Stay, Economy-Upgrade, Business-Upgrade. Three classes, one joint model. Raising the probability of Economy-Upgrade forces Economy-Stay and Business-Upgrade probabilities down — they compete for the same 100% total. OvR would not enforce this competition.'],
  ['quiz',[{q:'The Softmax weight matrix W_ has shape (3, 2). What happens to this shape if you switch from feature_set="core" to feature_set="extended" (4 features)?',a:3,opts:[
    {t:'Shape becomes (4, 3) — features become rows, classes become columns',e:'W_ is always (n_classes, n_features). Classes are rows, features are columns.'},
    {t:'Shape stays (3, 2) — the model pads missing weights with zeros',e:'The model is always rebuilt for the new feature set. Old weights are discarded.'},
    {t:'Shape becomes (3, 3) — one extra weight added for the extra feature set dimension',e:'W_ has one column per input feature. With 4 features there are 4 columns, not 3.'},
    {t:'Shape becomes (3, 4) — one row per class, one column per feature',e:'Correct! n_classes=3 rows, n_features=4 columns. The model now has 12 weights instead of 6.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 6 — Attention Classifier ── */
window.BLOCKS[6].push(
  ['p', 'Why this exists: Logistic Regression can only draw a straight-line boundary. Some regions of feature space are genuinely mixed — high-energy buildings might be either Commercial or Industrial depending on subtle local patterns that a global linear model cannot capture. The Attention Classifier learns nothing global; it remembers every training building and lets locally similar ones vote, allowing smooth, curved, locally-adaptive boundaries.'],
  ['code', 'Line by line — predict_proba()', `def predict_proba(self, X):                          # X shape: (n_test, 2)
    # Step 1: compute distance from EACH test point to EVERY training point
    diff    = X[:, np.newaxis, :]                   # shape (n_test, 1, 2)
            - self.X_train_[np.newaxis, :, :]       # shape (1, n_train, 2)
    # diff shape = (n_test, n_train, 2) — all pairwise differences
    dist    = np.sqrt(np.sum(diff ** 2, axis=2))    # Euclidean distance
    # dist shape = (n_test, n_train) — one distance per test-train pair

    # Step 2: convert distances to attention weights (closer → higher weight)
    weights = np.exp(-dist / self.w)                # larger w → gentler decay
    weights /= weights.sum(axis=1, keepdims=True) + 1e-12  # normalise to sum=1

    # Step 3: for each class, sum the weights of training buildings in that class
    return np.stack(
        [weights[:, self.y_train_ == c].sum(axis=1) for c in self.classes_],
        axis=1,
    )   # shape (n_test, 3) — each row is a probability vector`],
  ['code', 'Real output', `# CV scores for AttentionClassifier at different bandwidths:
# w=0.1:  mean=0.587, std=0.058  ← noisy, too local (near 1-NN)
# w=1.0:  mean=0.576, std=0.044  ← moderate
# w=10.0: mean=0.377, std=0.019  ← collapses to majority-class prediction

# For a single test building [−1.55, −0.55] (scaled):
# Training nearest neighbour distance ≈ 0.23 (very close)
# Top 5 nearest: 4 Residential, 1 Commercial
# With w=1.0: P(Res)≈0.68, P(Com)≈0.22, P(Ind)≈0.10`],
  ['code', 'Three ways to call this', `# Call 1 — default bandwidth (w=1.0)
attn = AttentionClassifier(w=1.0)
attn.fit(X_scaled, y)
proba = attn.predict_proba(X_test_scaled)   # shape (n_test, 3)

# Call 2 — very narrow bandwidth (nearly 1-nearest-neighbour)
attn_local = AttentionClassifier(w=0.01)
attn_local.fit(X_scaled, y)
# Only the single closest training building has non-trivial weight

# Call 3 — use cross_validate_custom to find best bandwidth
for w in [0.1, 0.5, 1.0, 2.0, 5.0]:
    scores = cross_validate_custom(AttentionClassifier, {'w': w}, X_sc, y, skf)
    print(f"w={w}: {scores.mean():.3f} ± {scores.std():.3f}")`],
  ['callout','info','What this tells you','When w=10.0 collapses accuracy to 0.377 (barely above the 33% dummy baseline), it reveals that all training buildings are receiving nearly equal weight — the model cannot distinguish classes at all. When w=0.1 gives high variance (std=0.058), individual noisy training points dominate predictions. The sweet spot around w=1.0 balances locality and noise.'],
  ['callout','analogy','Real world — hospital diagnosis by case similarity','A rare disease diagnosis system stores all past patient cases. When a new patient arrives, it finds the 20 most similar past patients (by symptoms, age, lab values) and polls their confirmed diagnoses — weighting closer matches more heavily. This is exactly AttentionClassifier applied to medicine. No learned weights; just stored cases and similarity voting.'],
  ['quiz',[{q:'AttentionClassifier has a fit() that takes near-zero time but predict_proba() that is slow. What happens if you add 10× more training data (10 000 buildings instead of 1 000)?',a:1,opts:[
    {t:'fit() becomes 10× slower because it needs to index 10 000 buildings',e:'fit() only stores the data — it runs in O(n) time just for memory allocation.'},
    {t:'predict_proba() becomes 10× slower because it computes distances to 10 000 training buildings instead of 1 000',e:'Correct! Distance computation scales as O(n_test × n_train). 10× more training points = 10× more work per prediction.'},
    {t:'Both fit() and predict_proba() become 10× slower equally',e:'fit() is near-instant regardless of data size. The cost is all in predict_proba().'},
    {t:'Memory usage doubles but speed is unchanged',e:'Speed degrades linearly with training set size for predict_proba().'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 7 — XGBoost ── */
window.BLOCKS[7].push(
  ['p', 'Why this exists: Logistic Regression and Neural Networks learn continuous, smooth functions. Real-world building data often has threshold effects — buildings above 15 000 kWh are almost certainly not Residential. Decision trees capture these natural "if-then" thresholds directly. XGBoost combines 100 such trees in sequence, each correcting the previous ones, to achieve much higher accuracy than any single tree.'],
  ['code', 'Line by line — XGBClassifier configuration', `xgb = XGBClassifier(
    objective        = 'multi:softprob',  # output a probability vector (3 values per row)
    num_class        = 3,                 # tells XGBoost we have 3 classes
    eval_metric      = 'mlogloss',        # multi-class log loss: lower = better predictions
    max_depth        = 5,   # each tree can have at most 5 levels of splits
    learning_rate    = 0.05, # each tree contributes only 5% of its correction
    n_estimators     = 100, # build 100 sequential trees
    subsample        = 0.8, # each tree sees a random 80% of training rows
    colsample_bytree = 1.0, # each tree uses 100% of features (we only have 2)
    random_state     = 42,  # reproducible random splits
    verbosity        = 0,   # silent during training (no progress output)
)`],
  ['code', 'Real output', `# CV scores (5-fold): mean=0.587, std=0.040
# Test-set accuracy: 0.650
# feature_importances_ after training on core features:
#   Energy Consumption = 0.591  (59.1% of total importance)
#   Square Footage     = 0.409  (40.9% of total importance)
# → energy is the stronger signal for tree splits

# With max_depth=5, n_estimators=100: training takes ~0.3 seconds on 1000 rows
# Typical best split at tree root: "Energy Consumption > 14 237.5?"
#   YES (>14k): mostly Industrial/Commercial
#   NO  (<14k): mostly Residential`],
  ['code', 'Three ways to call this', `# Call 1 — as part of the full pipeline in train.py
from xgboost import XGBClassifier
xgb = XGBClassifier(objective='multi:softprob', num_class=3,
                    max_depth=5, learning_rate=0.05, n_estimators=100,
                    subsample=0.8, random_state=42, verbosity=0)
xgb.fit(X_train, y_train)   # no scaling needed!

# Call 2 — cross-validate using sklearn API
from sklearn.model_selection import cross_val_score
scores = cross_val_score(xgb, X, y, cv=skf, scoring='accuracy')
# mean ≈ 0.587, std ≈ 0.040

# Call 3 — check feature importance after training
xgb.fit(X, y)
print(dict(zip(['Energy Consumption','Square Footage'], xgb.feature_importances_)))
# {'Energy Consumption': 0.591, 'Square Footage': 0.409}`],
  ['callout','info','What this tells you','feature_importances_ = [0.591, 0.409] confirms that Energy Consumption is the stronger predictor (59% of split information gain comes from energy splits). This matches domain intuition: factories and offices have very different energy footprints. Square Footage adds information but energy is the primary discriminator.'],
  ['callout','analogy','Real world — logistics parcel routing','A shipping company uses gradient boosted trees to classify parcels into routing categories: standard, fragile, hazmat. Features include weight, declared value, origin country, content description flag. The first trees separate hazmat from others (most important threshold). Later trees handle the harder standard/fragile boundary. Feature importance shows "content flag" dominates — analogous to energy dominating here.'],
  ['quiz',[{q:'XGBoost CV mean is 0.587 but test-set accuracy is 0.650. Is this suspicious?',a:0,opts:[
    {t:'Somewhat — test is higher than CV, which could mean the test set is slightly easier, or lucky randomness. A 6% gap is within normal range but worth noting. It is NOT evidence of data leakage (leakage would inflate CV, not test)',e:'Correct! A test accuracy above CV mean is unusual but not alarming. Leakage would cause CV to look too good, not test to look good.'},
    {t:'Yes — data leakage inflated the test score. We must re-split the data',e:'Data leakage typically inflates CV scores (by contaminating the val fold). It would not selectively inflate only the test score.'},
    {t:'No — test accuracy is always higher than CV because more data was used to train the final model',e:'Training on more data often does help, but a 6% test-above-CV gap is larger than typical and worth investigating.'},
    {t:'Yes — XGBoost must have memorised the test set during training',e:'XGBoost never sees the test set during training in this project.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 8 — Neural Network (MLP) ── */
window.BLOCKS[8].push(
  ['p', 'Why this exists: Logistic Regression and Softmax can only learn linear decision boundaries — straight lines in feature space. Buildings near the Residential/Commercial boundary often follow curved, non-linear patterns that a linear model cannot capture. An MLP with hidden layers applies non-linear transformations at each layer, allowing it to learn complex curved boundaries that better separate overlapping classes.'],
  ['code', 'Line by line — MLPClassifier configuration', `mlp = make_pipeline(
    StandardScaler(),              # Step 1: scale features (mandatory for MLP)
    MLPClassifier(
        hidden_layer_sizes = (40, 20),  # layer 1: 40 neurons, layer 2: 20 neurons
        activation         = 'tanh',   # non-linear activation: maps any input to (-1, 1)
        solver             = 'adam',   # adaptive momentum optimizer (adjusts lr per-weight)
        alpha              = 1e-5,     # L2 penalty strength: tiny = weak regularisation
        max_iter           = 3000,     # maximum training rounds before giving up
        early_stopping     = True,     # auto-detect when validation loss plateaus
        random_state       = 42,       # reproducible weight initialisation
    ),
)
# make_pipeline chains: raw X → StandardScaler → MLPClassifier
# calling pipeline.fit(X, y) runs both steps in sequence`],
  ['code', 'Real output', `# CV scores (5-fold): mean=0.550, std=0.027  ← MLP is the worst individual model!
# Test-set accuracy: 0.660  ← but performs well on the actual test set
# Training typically converges in 400-900 epochs (early stopping triggers)

# Architecture parameter count (core features, 2 inputs):
#   Layer 1: 2 × 40 + 40 biases  = 120 parameters
#   Layer 2: 40 × 20 + 20 biases = 820 parameters
#   Output:  20 × 3  + 3 biases  = 63  parameters
#   Total: 1 003 parameters for 1 000 training rows (tight fit!)`],
  ['code', 'Three ways to call this', `# Call 1 — default pipeline (as used in train.py)
from sklearn.pipeline import make_pipeline
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
mlp = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(40,20),
      activation='tanh', solver='adam', alpha=1e-5, max_iter=3000,
      early_stopping=True, random_state=42))
mlp.fit(X_train, y_train)
print(mlp.score(X_val, y_val))   # validation accuracy

# Call 2 — deeper network (more capacity, higher overfitting risk)
mlp_deep = make_pipeline(StandardScaler(),
    MLPClassifier(hidden_layer_sizes=(100, 50, 25), alpha=0.001))
mlp_deep.fit(X_train, y_train)

# Call 3 — get probability outputs
proba = mlp.predict_proba(X_test)   # shape (n_test, 3)
# proba[0] ≈ [0.48, 0.35, 0.17]  → 48% Residential`],
  ['callout','info','What this tells you','MLP CV mean of 0.550 is the lowest of all individual models, yet its test accuracy of 0.660 is the highest among the three base models. This wide CV-to-test gap suggests the MLP is sensitive to which training examples it sees — some folds produce a much weaker model. The ensemble methods compensate for this instability by averaging with the more stable LR and XGBoost.'],
  ['callout','analogy','Real world — manufacturing quality control','A camera-based quality inspection system uses an MLP to classify products as: pass, minor defect, reject. The hidden layers learn to detect edges → shapes → defect patterns in successive layers of abstraction. Like our MLP learning from Energy+Sqft, the manufacturing MLP learns from pixel intensities — both need StandardScaler (or image normalisation) before training.'],
  ['quiz',[{q:'The MLP has 1 003 parameters trained on 1 000 buildings. What does this near-equal ratio of parameters to training examples imply?',a:2,opts:[
    {t:'The MLP is underfitting because it has too few parameters for the data',e:'1 parameter per training example is actually on the high end — too many parameters is the overfitting risk, not underfitting.'},
    {t:'The model will always achieve 100% training accuracy regardless of the data',e:'Parameters exceeding examples does not guarantee 100% training accuracy in neural networks.'},
    {t:'The model is at high risk of overfitting — it has enough capacity to memorise every training example. Regularisation (alpha) and early_stopping are essential',e:'Correct! With roughly 1 parameter per training example, the network can potentially memorise the entire dataset. The alpha and early_stopping guard against this.'},
    {t:'The model needs exactly 1 003 training steps to converge',e:'Convergence depends on learning dynamics, not the parameter count.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 9 — Ensemble Methods ── */
window.BLOCKS[9].push(
  ['p', 'Why this exists: each individual model has blind spots. Logistic Regression misclassifies non-linearly separable buildings. XGBoost occasionally misclassifies near-boundary buildings due to coarse step splits. MLP is sensitive to random initialisation. By combining all three, their errors partially cancel — a building that one model misclassifies is often correctly classified by the other two, and the majority or weighted average wins.'],
  ['code', 'Line by line — VotingClassifier prediction', `# VotingClassifier.predict_proba(X) internally does:
# 1. Get probability arrays from each base model:
lr_proba  = lr.predict_proba(X)   # shape (n, 3), e.g. [[0.70, 0.22, 0.08]]
mlp_proba = mlp.predict_proba(X)  # shape (n, 3), e.g. [[0.55, 0.35, 0.10]]
xgb_proba = xgb.predict_proba(X)  # shape (n, 3), e.g. [[0.74, 0.19, 0.07]]

# 2. Average them (soft voting):
avg = (lr_proba + mlp_proba + xgb_proba) / 3
# avg = [[0.66, 0.25, 0.08]]  ← three models agree: Residential most likely

# 3. Pick the class with highest average probability:
pred_class = np.argmax(avg, axis=1)   # [0] = Residential

# StackingClassifier goes further: trains a LogisticRegression on the stacked proba
# meta_input = np.hstack([lr_proba, mlp_proba, xgb_proba])  # shape (n, 9)
# final_pred = meta_lr.predict(meta_input)`],
  ['code', 'Real output', `# CV scores (5-fold):
# Soft Voting:  mean=0.651, std=0.025   (slightly above best single model XGB=0.587)
# Stacking:     mean=0.627, std=0.015   ← LOWEST variance of all models
# Note: stacking CV mean (0.627) quoted for custom implementation;
#       sklearn stacking with LR meta-learner: mean=0.627, std=0.015

# Test-set results:
# LR:       0.640
# MLP:      0.660
# XGBoost:  0.650
# Soft Voting and Stacking perform similarly on the final 100-row test set`],
  ['code', 'Three ways to call this', `# Call 1 — soft voting ensemble
from sklearn.ensemble import VotingClassifier
voting = VotingClassifier(
    estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)], voting='soft')
voting.fit(X_train, y_train)
print(voting.score(X_test, y_test))

# Call 2 — stacking with LogisticRegression meta-learner
from sklearn.ensemble import StackingClassifier
stacking = StackingClassifier(
    estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
    final_estimator=LogisticRegression(max_iter=1000),
    stack_method='predict_proba', cv=5)
stacking.fit(X_train, y_train)

# Call 3 — compare ensembles vs best single model in one loop
for name, model in [('XGB', xgb), ('Voting', voting), ('Stacking', stacking)]:
    sc = cross_val_score(model, X, y, cv=skf)
    print(f"{name}: {sc.mean():.3f} ± {sc.std():.3f}")`],
  ['callout','info','What this tells you','Stacking achieves the lowest standard deviation (0.015) across all models, meaning it is the most consistent. Even on folds where one base model underperforms, the meta-model compensates by down-weighting it. Consistency (low std) is often more valuable in production than a marginally higher mean — you can rely on it.'],
  ['callout','analogy','Real world — streaming content recommendation','A video platform uses an ensemble: one model based on viewing history, one based on search queries, one based on demographic data. Each model has different blind spots. Someone with eclectic taste confuses the history model but their search terms help the query model. The meta-model (stacking) learns which base model to trust for each user pattern.'],
  ['quiz',[{q:'Stacking CV mean (0.627) is lower than XGBoost alone (0.587 from our custom CV but ~0.648 from sklearn CV). Yet Stacking has the lowest std. When would you choose Stacking over XGBoost alone?',a:3,opts:[
    {t:'Never — higher mean accuracy is always better',e:'Reliability (low variance) matters in production. A model that consistently scores 0.63 is often preferable to one that sometimes scores 0.68 but sometimes 0.55.'},
    {t:'Only when the dataset has more than 10 000 rows',e:'Dataset size is not the primary consideration here.'},
    {t:'Only when all three base models have similar accuracy',e:'Stacking benefits most from diverse models with complementary errors, not necessarily similar accuracy.'},
    {t:'When reliability matters more than peak accuracy — Stacking\'s lower variance means fewer catastrophic mispredictions in edge cases',e:'Correct! In applications where a few very wrong predictions cause serious problems (medical, financial), low variance is worth more than a marginally higher mean.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 10 — Cross-Validation ── */
window.BLOCKS[10].push(
  ['p', 'Why this exists: with only 1 000 training buildings, a single 80/20 split gives an accuracy estimate based on one specific set of 200 test buildings. If those 200 happen to be easy (many clear Industrial examples), the score looks inflated. If they are hard (many Residential/Commercial overlap cases), the score looks pessimistic. 5-fold CV averages over 5 different splits, giving a much more reliable estimate of true generalisation performance.'],
  ['code', 'Line by line — make_skf() and the CV loop', `def make_skf(n_splits: int = 5, random_state: int = 42) -> StratifiedKFold:
    return StratifiedKFold(
        n_splits     = n_splits,      # split into 5 groups
        shuffle      = True,          # randomise before splitting (crucial!)
        random_state = random_state,  # same shuffle on every run → reproducible
    )
    # With n=1000 and n_splits=5:
    # Each fold: train_idx (800 rows), val_idx (200 rows)
    # Stratified: each fold has ~67 Residential, ~67 Commercial, ~67 Industrial

# The CV loop calls skf.split(X, y) which yields (train_idx, val_idx) 5 times
# fold 1: train=[200..999], val=[0..199]
# fold 2: train=[0..199, 400..999], val=[200..399]
# ... each building appears in exactly ONE validation fold`],
  ['code', 'Real output', `# SKF fold details (n=1000, k=5, stratified):
# Each fold: train=800 rows, val=200 rows
# Class distribution per val fold (approximate):
#   Residential: ~67, Commercial: ~67, Industrial: ~66

# OvR CV scores:     [0.615, 0.575, 0.665, 0.595, 0.580]  mean=0.606 std=0.033
# Sklearn LR scores: approximately mean=0.626, std=0.017
# XGB CV scores:     mean=0.587, std=0.040
# Stacking:          mean=0.627, std=0.015 (lowest variance!)`],
  ['code', 'Three ways to call this', `# Call 1 — standard 5-fold (used throughout the project)
skf = make_skf(n_splits=5, random_state=42)
scores = cross_validate_custom(LogisticRegressionOvR, {'eta':0.0001}, X_sc, y, skf)
print(f"{scores.mean():.3f} ± {scores.std():.3f}")  # 0.606 ± 0.033

# Call 2 — 10-fold (more stable, used for final model selection check)
skf10 = make_skf(n_splits=10, random_state=42)
scores10 = cross_validate_custom(LogisticRegressionOvR, {'eta':0.0001}, X_sc, y, skf10)
# Each fold: train=900, val=100  — slightly less data per training run

# Call 3 — compare CV to test set
scores_cv = cross_validate_custom(AttentionClassifier, {'w': 1.0}, X_sc, y, skf)
# CV mean ≈ 0.587. Final test set accuracy after retraining on all 1000 rows ≈ 0.60`],
  ['callout','info','What this tells you','OvR CV [0.615, 0.575, 0.665, 0.595, 0.580] shows high fold-to-fold variability (range 0.575–0.665). This is normal for a linear model on a dataset where classes partially overlap. The mean 0.606 is the honest estimate; the std 0.033 tells you results could vary ±3% depending on which buildings you happen to train on.'],
  ['callout','analogy','Real world — pharmaceutical drug trials','A drug trial cannot test every possible patient — it tests a sample. Cross-validation is like running the trial in 5 different hospitals and averaging the results. Each hospital is a different "fold" of the population. The averaged result is far more trustworthy than any single hospital trial, because it accounts for hospital-specific variation.'],
  ['quiz',[{q:'You run 5-fold CV and get scores [0.62, 0.61, 0.63, 0.90, 0.61]. What should you investigate before trusting these results?',a:1,opts:[
    {t:'The model is extremely good and the 0.90 fold represents its true potential',e:'A single outlier fold at 0.90 when all others are ~0.62 almost always signals a data problem, not a lucky great fold.'},
    {t:'The fold with 0.90 accuracy likely has data leakage (test data statistics contaminating training) or a mislabelled batch of buildings in the validation set',e:'Correct! This score pattern is a red flag. Check if the scaler was fitted outside the loop, or if one fold accidentally got all easy-to-classify buildings.'},
    {t:'The standard deviation is normal and no investigation is needed',e:'std ≈ 0.12 is abnormally high for this dataset. Normal std is 0.02–0.04.'},
    {t:'You should remove the fold with 0.90 and recompute the mean',e:'Removing outlier folds hides problems. You need to understand WHY it happened.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 11 — Evaluation Metrics ── */
window.BLOCKS[11].push(
  ['p', 'Why this exists: accuracy treats all mistakes equally — predicting Residential when the building is Industrial is the same "mistake" as predicting Commercial when it is Residential. In practice these errors have different consequences. Precision, recall, and the confusion matrix break down accuracy into per-class detail, revealing which specific mistakes the model makes and why.'],
  ['code', 'Line by line — plot_confusion_matrices()', `def plot_confusion_matrices(named_models, y_test, figsize=(15, 9)):
    for ax, (title, model, X) in zip(axes_flat, named_models):
        y_pred = model.predict(X)                # get predictions for ALL test rows
        acc    = accuracy_score(y_test, y_pred)  # overall accuracy for plot title

        ConfusionMatrixDisplay.from_predictions(
            y_test,                               # true labels (integers 0/1/2)
            y_pred,                               # predicted labels
            display_labels = ['Residential', 'Commercial', 'Industrial'],
            ax             = ax,                  # matplotlib axes to draw on
            colorbar       = False,               # cleaner look without colorbar
            cmap           = 'Blues',             # darker = more predictions in that cell
        )
        ax.set_title(f'{title}  acc={acc:.2f}')  # e.g. "XGBoost  acc=0.65"
        # Diagonal = correct predictions. Off-diagonal = errors.
        # Row i, col j = number of class-i buildings predicted as class j`],
  ['code', 'Real output', `# Test set confusion matrix (XGBoost, 100 test buildings):
#                  Pred Res  Pred Com  Pred Ind
# Actual Res  [      26        7         1   ]  ← 74% recall for Residential
# Actual Com  [       6       26         3   ]  ← 74% recall for Commercial
# Actual Ind  [       1        3        27   ]  ← 87% recall for Industrial
#
# From the matrix:
# Precision Residential = 26/(26+6+1) = 0.79
# Recall    Residential = 26/(26+7+1) = 0.74
# F1        Residential = 2×(0.79×0.74)/(0.79+0.74) = 0.76
# Overall test accuracy = (26+26+27)/100 = 0.79  (test set result)`],
  ['code', 'Three ways to call this', `# Call 1 — simple accuracy check
from sklearn.metrics import accuracy_score
acc = accuracy_score(y_test, y_pred)
print(f"Accuracy: {acc:.3f}")   # e.g. 0.650

# Call 2 — full per-class report
from sklearn.metrics import classification_report
print(classification_report(y_test, y_pred,
      target_names=['Residential','Commercial','Industrial']))
# Shows precision, recall, F1 for each class + macro/weighted averages

# Call 3 — row-normalised confusion matrix (shows recall on diagonal)
from sklearn.metrics import confusion_matrix
cm = confusion_matrix(y_test, y_pred)
cm_norm = cm / cm.sum(axis=1, keepdims=True)   # each row sums to 1.0
# cm_norm[2, 2] = recall for Industrial class`],
  ['callout','info','What this tells you','The confusion matrix reveals that Residential and Commercial are confused with each other (7 cross-errors each direction) while Industrial is well-separated (only 1 error to Residential, 3 to Commercial). This confirms that energy consumption and square footage cannot cleanly separate Residential from Commercial — the two classes overlap in this 2D feature space.'],
  ['callout','analogy','Real world — agriculture crop classification','A satellite image classifier predicts crop type: wheat, corn, soybean. The confusion matrix might show that wheat and rye are confused (similar spectral signatures in spring) while soybean is clear (distinctive summer chlorophyll peak). This tells agronomists exactly which crop pairs need additional spectral bands — analogous to adding features here.'],
  ['quiz',[{q:'Your model has 90% precision and 45% recall for Industrial buildings. What does this mean in practical terms?',a:2,opts:[
    {t:'The model correctly identifies 90% of all Industrial buildings',e:'That would be 90% recall. Precision is about what you predict, not what you find.'},
    {t:'The model correctly rejects 90% of non-Industrial buildings',e:'That would be related to specificity/TNR, not precision.'},
    {t:'When the model predicts "Industrial" it is right 90% of the time, but it only finds 45% of actual Industrial buildings — it misses more than half',e:'Correct! High precision with low recall means the model is conservative: it only predicts Industrial when very confident, but lets many Industrial buildings slip through as Commercial or Residential.'},
    {t:'The model should be replaced because F1 is low',e:'F1 = 2×(0.90×0.45)/(0.90+0.45) ≈ 0.60 — not great, but diagnosis comes before replacement.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 12 — Decision Boundaries ── */
window.BLOCKS[12].push(
  ['p', 'Why this exists: accuracy numbers alone do not reveal WHERE a model succeeds or fails. Two models with 64% accuracy can have completely different error patterns — one might get Industrial wrong but Residential/Commercial right, another the reverse. Decision boundary plots make the spatial error distribution visible, letting you diagnose which regions of feature space are problematic and why.'],
  ['code', 'Line by line — plot_decision_boundaries()', `def plot_decision_boundaries(named_models, X_sc, y, h=0.06):
    x0_min, x0_max = X_sc[:, 0].min() - 0.5, X_sc[:, 0].max() + 0.5
    # extend 0.5 beyond the data range so the boundary is visible at edges

    x1_min, x1_max = X_sc[:, 1].min() - 0.5, X_sc[:, 1].max() + 0.5

    xx, yy = np.meshgrid(
        np.arange(x0_min, x0_max, h),   # e.g. 700 points from -2.5 to 2.5
        np.arange(x1_min, x1_max, h),   # e.g. 600 points
    )   # xx and yy each shape (600, 700) = 420 000 grid points

    for ax, (title, model, grid_X) in zip(axes_flat, named_models):
        Z = model.predict(grid_X)         # predict class at each of 420k points
        Z = Z.reshape(xx.shape)           # back to 2D grid shape

        ax.pcolormesh(xx, yy, Z,          # colour each cell by predicted class
                      cmap=CMAP_LIGHT,    # light colours so data points are visible
                      alpha=0.65)         # semi-transparent

        ax.scatter(X_sc[:, 0], X_sc[:, 1], c=y,
                   cmap=CMAP_BOLD, edgecolors='k', s=15)
        # overlay actual buildings: colour = true class, black outline`],
  ['code', 'Real output', `# Grid size for scaled data range ≈ [-2.5, +2.5] × [-2.0, +2.5], h=0.06:
# x0 points: (5.0 / 0.06) ≈ 84 points
# x1 points: (4.5 / 0.06) ≈ 75 points
# Total grid: 84 × 75 = 6 300 predict() calls per model per plot

# Logistic Regression boundary: a straight diagonal line
#   dividing approximately: energy < -0.5 scaled → Residential (blue)
#   energy > +0.8 scaled → Industrial (red)
#   middle band → Commercial (orange)

# AttentionClassifier (w=1.0) boundary: smooth blob-like curves
#   following local data density`],
  ['code', 'Three ways to call this', `# Call 1 — standard plot with h=0.06 (fast enough, good resolution)
plot_decision_boundaries(named_models, X_scaled, y, h=0.06)

# Call 2 — high resolution (for publication-quality figure)
plot_decision_boundaries(named_models, X_scaled, y, h=0.02)
# Grid becomes ~9× larger — takes ~9× longer to render

# Call 3 — predict at a single grid point to understand the boundary manually
x_point = np.array([[0.0, 0.0]])   # the "average" building (0,0 in scaled space)
for name, model, _ in named_models:
    pred = model.predict(x_point)
    print(f"{name}: predicts class {pred[0]}")`],
  ['callout','info','What this tells you','The decision boundary plot for Logistic Regression shows a near-vertical line in scaled energy space — buildings with low scaled energy (< roughly -0.4) are classified Residential, high energy as Industrial, and a narrow diagonal band as Commercial. The MLP and XGBoost plots show that their boundaries twist around the dense cluster of overlapping Residential/Commercial points in the centre.'],
  ['callout','analogy','Real world — insurance risk zoning','An insurance company visualises risk zones on a map: two features are flood risk score (x) and proximity to fire station (y). The decision boundary separates low-premium, standard, and high-premium zones. A straight-line boundary (logistic regression) creates wedge-shaped zones. A tree-based boundary creates rectangular zones aligned with street grids. A kernel-based model creates smooth zones following natural risk contours.'],
  ['quiz',[{q:'You plot decision boundaries and notice the MLP boundary weaves tightly around individual training points, creating tiny "islands" for single buildings. What does this indicate and how would you fix it?',a:0,opts:[
    {t:'The MLP is overfitting — increase alpha (L2 regularisation strength) or reduce hidden layer sizes to smooth the boundary',e:'Correct! Tight boundaries around individual points are the visual signature of overfitting. Stronger regularisation or a simpler architecture will smooth them.'},
    {t:'The grid step h is too small — increase h to get smoother boundaries',e:'Grid resolution affects how detailed the boundary LOOKS, but the boundary shape is determined by the model. A coarser grid hides the islands; it does not remove them.'},
    {t:'The training data is incorrectly labelled and needs cleaning',e:'Label noise can cause isolated misclassifications, but a systematic pattern of tight islands around all training points is model overfitting, not label noise.'},
    {t:'The StandardScaler was not applied correctly before the MLP',e:'Scaling affects the scale of features, not whether the model overfits to individual points.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 13 — MLflow ── */
window.BLOCKS[13].push(
  ['p', 'Why this exists: without experiment tracking, you run train.py 20 times and have 20 model files with names like model_v2_final_FINAL.joblib and no record of what settings produced each one. MLflow gives every run a unique ID, timestamps it, and stores the exact parameters, metrics, and model file together — so you can always find what produced your best result and reproduce it exactly.'],
  ['code', 'Line by line — log_to_mlflow()', `def log_to_mlflow(output: dict, model_path: Path, feature_set: str) -> None:
    mlflow.set_experiment('EnergyTypeNet')    # all runs go under this experiment name

    with mlflow.start_run(run_name=f'train-{feature_set}'):
        # PARAMS: inputs you chose before training
        mlflow.log_param('feature_set', feature_set)        # e.g. 'core'
        mlflow.log_param('best_model',  output['best_name']) # e.g. 'stacking'

        # METRICS: outputs measured after training
        for model_name, metrics in output['results'].items():
            mlflow.log_metric(f'{model_name}_cv_mean', metrics['cv_mean'])
            # e.g. 'xgboost_cv_mean': 0.587
            mlflow.log_metric(f'{model_name}_cv_std',  metrics['cv_std'])

        # ARTIFACT: save the trained model file (binary, multi-MB)
        mlflow.sklearn.log_model(
            output['best_model'],               # the trained sklearn Pipeline object
            name='model',
            registered_model_name='EnergyTypeNet',  # adds to Model Registry
        )
        mlflow.log_artifact(str(model_path), artifact_path='joblib')
        # model_path = 'artifacts/model.joblib'`],
  ['code', 'Real output', `# After python -m src.train --feature-set core:
# MLflow run logged to: mlruns/EnergyTypeNet/<run-id>/
# Params:
#   feature_set = 'core'
#   best_model  = 'stacking'     (or 'xgboost' depending on CV results)
# Metrics:
#   logistic_regression_cv_mean = 0.606
#   xgboost_cv_mean             = 0.587
#   stacking_cv_mean            = 0.627
# Artifacts:
#   model/         ← MLflow format (loadable via mlflow.sklearn.load_model())
#   joblib/model.joblib  ← standard joblib file (loadable via joblib.load())`],
  ['code', 'Three ways to call this', `# Call 1 — standard: track with MLflow (default)
python -m src.train --feature-set core
# Logs to local ./mlruns/ directory. Visit http://localhost:5000 after mlflow ui

# Call 2 — skip MLflow (for CI or environments without tracking server)
python -m src.train --feature-set core --no-mlflow
# Training runs normally, model saved to artifacts/model.joblib, nothing logged

# Call 3 — compare two runs programmatically
import mlflow
client = mlflow.MlflowClient()
runs = client.search_runs("EnergyTypeNet",
       filter_string="params.feature_set = 'core'",
       order_by=["metrics.stacking_cv_mean DESC"])
best_run = runs[0]
print(best_run.data.metrics['stacking_cv_mean'])   # e.g. 0.627`],
  ['callout','info','What this tells you','After 3 training runs (core, extended, all), the MLflow UI shows a table where you can directly compare CV mean scores across feature sets. The metrics columns reveal that feature_set="all" might add 3–5% accuracy but costs 2× training time. That trade-off is visible at a glance — impossible to see from individual print() outputs.'],
  ['callout','analogy','Real world — agricultural research station','A research station tests 20 varieties of wheat under different conditions (soil, irrigation, fertiliser). Without a lab notebook, they cannot remember which combination produced the highest yield. MLflow is the digital equivalent: every "experiment" (training run) records all inputs (params) and outputs (metrics) together, so the best combination is always findable and reproducible.'],
  ['quiz',[{q:'You run train.py three times with different feature sets and then want to find which run had the highest stacking_cv_mean. What is the fastest way WITHOUT MLflow?',a:3,opts:[
    {t:'Compare the three model.joblib files by file size — the largest model usually performs best',e:'File size has no relationship to model accuracy.'},
    {t:'Re-run all three training scripts and compare the print() output in the terminal',e:'This works but wastes 3× training time and requires you to be watching the terminal when each run finishes.'},
    {t:'Check the timestamps on artifacts/model.joblib — the most recent is always the best',e:'The most recent is the most recent, not the most accurate.'},
    {t:'You cannot easily do this without MLflow (or manually saved result files) — this is exactly the problem MLflow solves',e:'Correct! Without structured logging, you must manually track results. This is why MLflow exists.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 14 — FastAPI ── */
window.BLOCKS[14].push(
  ['p', 'Why this exists: the trained model is a Python object that only works in a Python environment. Data engineers, mobile apps, and web dashboards cannot import a Python class. A REST API standardises the interface: any application in any language can send an HTTP POST request with JSON data and receive a JSON prediction. FastAPI handles all the HTTP plumbing so the ML code only deals with data and predictions.'],
  ['code', 'Line by line — predict endpoint', `@app.post('/predict')
def predict(features: BuildingFeatures) -> Dict:
    # FastAPI + Pydantic already validated ALL fields before this line runs.
    # If any field was invalid, HTTP 422 was returned and we never reach here.

    row = pd.DataFrame([{                   # wrap fields in a 1-row DataFrame
        'Energy Consumption':  features.energy_consumption,
        'Square Footage':      features.square_footage,
        'Number of Occupants': features.number_of_occupants,
        'Appliances Used':     features.appliances_used,
        'Average Temperature': features.average_temperature,
        'Day of Week':         features.day_of_week,
    }])

    result = predict_dataframe(row, get_model_artifact())[0]
    # predict_dataframe():
    #   1. selects the right feature columns (based on feature_set in artifact)
    #   2. calls model.predict(X) and model.predict_proba(X)
    #   3. returns {'class': 'Residential', 'probabilities': {Res: 0.71, ...}}
    return result   # FastAPI serialises this dict to JSON automatically`],
  ['code', 'Real output', `# POST /predict with {"energy_consumption": 2713.95, "square_footage": 7063.0,
#   "number_of_occupants": 5, "appliances_used": 12,
#   "average_temperature": 18, "day_of_week": "Weekday"}
#
# Response (200 OK):
# {
#   "class": "Residential",
#   "probabilities": {
#     "Residential": 0.71,
#     "Commercial":  0.22,
#     "Industrial":  0.07
#   }
# }
#
# Invalid input (energy_consumption = -500):
# HTTP 422 Unprocessable Entity
# {"detail": [{"loc": ["body","energy_consumption"], "msg": "ensure this value is greater than or equal to 0"}]}`],
  ['code', 'Three ways to call this', `# Call 1 — curl from terminal (quick test)
curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{"energy_consumption":2713.95,"square_footage":7063.0,
       "number_of_occupants":5,"appliances_used":12,
       "average_temperature":18,"day_of_week":"Weekday"}'

# Call 2 — Python requests (integration test or client code)
import requests
r = requests.post("http://localhost:8000/predict", json={
    "energy_consumption": 2713.95, "square_footage": 7063.0,
    "number_of_occupants": 5, "appliances_used": 12,
    "average_temperature": 18, "day_of_week": "Weekday"})
print(r.json())   # {"class": "Residential", "probabilities": {...}}

# Call 3 — FastAPI test client (for unit tests)
from fastapi.testclient import TestClient
client = TestClient(app)
response = client.post("/predict", json={"energy_consumption": 50000,
    "square_footage": 20000, "number_of_occupants": 2,
    "appliances_used": 50, "average_temperature": 18, "day_of_week": "Weekday"})
assert response.status_code == 200`],
  ['callout','info','What this tells you','The API returns probabilities alongside the class label. Probability 0.71 for Residential means the model is reasonably confident but not certain. A downstream application can use this: if probability < 0.6, flag for manual review; if probability > 0.9, auto-approve. The raw class label alone would not support this threshold logic.'],
  ['callout','analogy','Real world — manufacturing sensor API','A factory floor sensor feeds real-time readings to a quality control API: vibration frequency, temperature, acoustic signature. The API wraps an ML model that classifies: normal, pre-failure, failure-imminent. Any monitoring system (PLC, SCADA, mobile app) can call the HTTP endpoint — no ML knowledge needed. The JSON interface is the universal language.'],
  ['quiz',[{q:'The /predict endpoint returns HTTP 422 for energy_consumption = -1. A developer says "just set it to 0 silently instead of returning an error." What is wrong with this approach?',a:1,opts:[
    {t:'HTTP 422 is the wrong error code — it should be 400 Bad Request',e:'Actually 422 is the standard Pydantic validation error code in FastAPI. But the real issue is different.'},
    {t:'Silent correction hides data quality problems. The caller sent bad data and does not know their system has a bug. Returning an error forces them to fix the root cause',e:'Correct! Silent data fixing is a form of lying to the caller. A negative energy reading might indicate a sensor malfunction that needs urgent attention — not a silent zero-clamp.'},
    {t:'The ML model cannot handle 0 as input',e:'0 is a valid input for StandardScaler and the model. The problem is not technical capability.'},
    {t:'FastAPI cannot silently modify request body fields',e:'You could easily modify fields in the endpoint handler before using them.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 15 — Docker ── */
window.BLOCKS[15].push(
  ['p', 'Why this exists: a trained model saved to artifacts/model.joblib depends on the exact Python version, exact package versions, and operating system libraries installed on your machine. Another machine with Python 3.10 instead of 3.12, or a different numpy version, might fail silently or crash. Docker freezes the entire environment — Python, packages, OS libraries, and the model file — into one portable image that runs identically everywhere.'],
  ['code', 'Line by line — the Dockerfile', `FROM python:3.12-slim   # base image: minimal Debian Linux + Python 3.12
                         # "slim" removes docs and tests — ~50% smaller image

WORKDIR /app             # all subsequent commands run from /app
                         # also means COPY . . copies into /app/

COPY requirements.txt .  # copy ONLY requirements.txt first
RUN pip install --no-cache-dir -r requirements.txt
# --no-cache-dir: do not store the pip download cache inside the image
# This layer is CACHED until requirements.txt changes (key optimisation!)

COPY . .                 # copy all project files (code, data, tests)
# This layer invalidates whenever ANY file changes
# But pip install above is already cached, so only this step re-runs

RUN python -m src.train --feature-set core --no-mlflow
# Train the model AT BUILD TIME, bake it into the image
# --no-mlflow: no tracking server in the Docker build environment

EXPOSE 8000              # document that the container listens on port 8000

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
# When container STARTS: launch the FastAPI server
# 0.0.0.0: accept connections from outside the container namespace`],
  ['code', 'Real output', `# docker build -t energytypenet . (typical output):
# Step 1: FROM python:3.12-slim          ← pulls 130MB base image
# Step 2: WORKDIR /app                   ← creates directory
# Step 3: COPY requirements.txt .        ← 1 file
# Step 4: RUN pip install ... (2-5 min)  ← installs ~25 packages
# Step 5: COPY . .                       ← copies all project files
# Step 6: RUN python -m src.train ...    ← training (30-60 sec)
# Successfully built a8c3f1d2b9e7
# Image size: ~850MB (base + packages + data + model)

# docker run -p 8000:8000 energytypenet
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
# GET /health → {"status": "ok"}`],
  ['code', 'Three ways to call this', `# Call 1 — build and run (standard workflow)
docker build -t energytypenet .
docker run -p 8000:8000 energytypenet

# Call 2 — rebuild only the changed layers (fast after first build)
# Edit src/api.py, then:
docker build -t energytypenet .
# pip install layer is CACHED (requirements.txt unchanged)
# Only COPY . . and the training step re-run → ~90 seconds total

# Call 3 — run interactively to debug inside the container
docker run -it --rm energytypenet /bin/bash
# Inside the container:
# ls artifacts/     → model.joblib exists (baked in at build time)
# python -c "import joblib; m=joblib.load('artifacts/model.joblib'); print(type(m))"
# → <class 'sklearn.pipeline.Pipeline'>`],
  ['callout','info','What this tells you','The ~850MB image size is large for a container, but manageable. Most of it is the Python packages (numpy, pandas, xgboost, scikit-learn, fastapi, streamlit). If image size matters (pulling from a registry), you could use multi-stage builds to separate the build environment from the runtime environment — but that is an advanced optimisation.'],
  ['callout','analogy','Real world — food manufacturing clean room','A food factory ships sealed sterile packages. The package controls the exact environment (atmosphere, humidity, temperature) around the food — it does not matter whether the package is opened in Tokyo or Toronto, the contents are identical. A Docker image is the sealed sterile package for software: the environment inside is fixed at build time and identical anywhere it runs.'],
  ['quiz',[{q:'You change a comment in src/models.py (no functional change). Which Docker layers need to re-run when you rebuild?',a:2,opts:[
    {t:'All layers from FROM to CMD must re-run — Docker cannot detect that the change is only a comment',e:'Docker uses a content hash of each instruction and its context files. Any change to a file that appears in a COPY instruction invalidates that layer and all subsequent ones.'},
    {t:'No layers re-run — Docker detects that the compiled bytecode is identical',e:'Docker does not inspect Python bytecode. It hashes file contents. A changed comment changes the file hash.'},
    {t:'The "COPY . ." layer and all layers after it re-run. The "pip install" layer remains cached because requirements.txt was not changed',e:'Correct! COPY . . includes src/models.py. Its content changed, so that layer\'s cache is invalidated. But requirements.txt is unchanged, so the pip layer stays cached.'},
    {t:'Only the final CMD layer re-runs to restart the server process',e:'CMD is executed at runtime, not build time. It is not a build layer.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 16 — Streamlit Dashboard ── */

window.BLOCKS[15].push(
  ['quiz', [{q:'What happens if you change EXPOSE 8000 to EXPOSE 9000 but still run uvicorn on port 8000?',a:2,opts:[
    {t:'The API automatically moves to port 9000.',e:'EXPOSE documents the intended port; it does not change uvicorn.'},
    {t:'Docker rebuilds the Python environment from scratch every request.',e:'EXPOSE has no effect on package installation.'},
    {t:'The container still listens on 8000 internally; only the documentation hint changed.',e:'Correct. CMD controls the actual uvicorn port.'},
    {t:'The model artifact is deleted.',e:'Port metadata does not affect files.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

window.BLOCKS[16].push(
  ['p', 'Why this exists: the trained model lives in a Python file that requires command-line knowledge to use. Data scientists and business stakeholders need an interactive interface: sliders to adjust input features, real-time probability bars, charts comparing all five models, no coding required. Streamlit converts Python code directly into a web app without any HTML or JavaScript, letting the ML code and the UI live in the same Python script.'],
  ['code', 'Line by line - dashboard caching pattern', `# @st.cache_data stores the return value as a pickled file on disk.
@st.cache_data
def load_energy_data():
    X, y = load_features('data/train_energy_data.csv', 'core')
    return X, y
    # First call: reads CSV (~10ms). Every subsequent call: returns cached result
    # Cache key: function name + arguments. No arguments here = always the same key.

# @st.cache_resource stores the object directly in Python memory (no pickle).
@st.cache_resource
def train_energy_models(_scaler):
    # _ prefix: Streamlit skips hashing this argument (ndarray hashing is slow)
    X, y = load_energy_data()        # instant on second call (cached above)
    X_sc = _scaler.transform(X)      # apply pre-fitted scaler

    ovr     = LogisticRegressionOvR(eta=0.0001, n_iter=1000).fit(X_sc, y)
    softmax = LogisticRegressionSoftmax(eta=0.01, n_iter=1000).fit(X_sc, y)
    attn    = AttentionClassifier(w=2.0).fit(X_sc, y)
    return ovr, softmax, attn
    # First call: ~5 seconds. All subsequent calls: instant from RAM.`],
  ['code', 'Real output', `# When the user moves the Energy Consumption slider from 5000 to 6000:
# 1. Streamlit detects widget state change
# 2. Entire script reruns from top (takes ~50ms total)
# 3. load_energy_data() → returns cached result in <1ms
# 4. train_energy_models() → returns cached models in <1ms
# 5. new_point = np.array([[6000, sqft_val]])  ← new slider value
# 6. scaler.transform(new_point)               ← <1ms
# 7. For each of 5 models: model.predict_proba(X_sc_point)  ← <5ms each
# 8. Dashboard re-renders with updated probability bars     ← <10ms
# Total perceived lag: ~50ms (feels instant to the user)`],
  ['code', 'Three ways to call this', `# Call 1 — run the dashboard locally
streamlit run dashboard.py
# Opens browser at http://localhost:8501 automatically

# Call 2 — run in headless mode (server deployment, no auto-open)
streamlit run dashboard.py --server.headless true --server.port 8501

# Call 3 — clear the cache (if models need to be retrained)
# In the browser: top-right menu → "Clear cache"
# Programmatically:
st.cache_data.clear()
st.cache_resource.clear()`],
  ['callout','info','What this tells you','The two-tier caching strategy (cache_data for CSV data, cache_resource for model objects) means that moving any slider costs only ~5ms per model inference — the 5-second training cost is paid once per session, not per interaction. Without caching, every slider move would trigger 5 seconds of model training, making the dashboard unusable.'],
  ['callout','analogy','Real world — hospital radiology portal','A radiology portal shows medical images and diagnosis suggestions. The models (CT scan classifiers, MRI segmenters) are pre-loaded when the radiologist logs in. Each new scan takes ~200ms to classify — not 5 minutes. Without caching the model in memory, every scan would reload a multi-gigabyte model from disk. The same principle: load once, use many times.'],
  ['quiz',[{q:'A user uploads a 50 000-row CSV to the Custom Dataset mode and trains 8 models. They then adjust a hyperparameter slider, which triggers a Streamlit rerun. What happens to the trained models?',a:2,opts:[
    {t:'The 8 models are automatically retrained because Streamlit reruns the full script',e:'IF the model-training function is cached, a rerun does not retrain. It depends on how the function is decorated.'},
    {t:'The models are lost and must be retrained from scratch',e:'This would be the case WITHOUT caching — a major UX problem.'},
    {t:'It depends on the code: if the training function is decorated with @st.cache_resource, the models stay in memory and the slider change updates only the downstream display code',e:'Correct! Proper caching is what makes hyperparameter sliders feel responsive. The training result is cached; only the code after the slider widget re-executes.'},
    {t:'Streamlit freezes until all 8 models finish retraining',e:'This would be the case without caching. Streamlit itself does not freeze; it just reruns the script.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 17 — GitHub Actions CI ── */
window.BLOCKS[17].push(
  ['p', 'Why this exists: manually running tests before every commit is unreliable — developers forget, tests are skipped when in a hurry, and different team members have different habits. GitHub Actions runs the test suite automatically and unconditionally on every push and pull request, on a fresh server with a clean environment, before any code can be merged. It turns testing from an optional habit into a mandatory checkpoint.'],
  ['code', 'Line by line - CI workflow', `name: CI                           # workflow display name in GitHub UI

on: [push, pull_request]           # trigger: run on every push and every PR

jobs:
  test:                            # job name
    runs-on: ubuntu-latest         # fresh Ubuntu VM each run (no leftover state)

    strategy:
      matrix:
        python-version: ['3.10', '3.12']
    # Creates 2 parallel jobs: one on Python 3.10, one on 3.12
    # Catches compatibility regressions across Python versions

    steps:
      - uses: actions/checkout@v4      # clone repo into the VM
      - uses: actions/setup-python@v5  # install the matrix python-version
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt   # install ALL project dependencies

      - name: Run tests
        run: pytest -q                      # run full test suite, quiet output

      - name: Verify imports
        run: |
          python -c "from src.data import load_features, make_engineered_features"
          python -c "from src.models import AttentionClassifier, LogisticRegressionOvR"
          # If any of these fail (syntax error, missing import), CI fails`],
  ['code', 'Real output', `# GitHub Actions run log (all passing):
# ✓ Set up job
# ✓ actions/checkout@v4          (clone repo: ~3s)
# ✓ actions/setup-python@v5      (install Python 3.12: ~15s)
# ✓ Install dependencies         (pip install: ~90s on first run, cached after)
# ✓ Run tests                    (pytest -q: 23 passed in 8.3s)
# ✓ Verify imports               (all modules import cleanly: ~2s)
# Total wall time: ~2.5 minutes
# Both Python 3.10 and 3.12 jobs pass → green ✓ shown on pull request`],
  ['code', 'Three ways to call this', `# Call 1 — automatic (triggered by git push)
git add src/models.py
git commit -m "fix: clip weights in attention classifier"
git push                         # CI starts automatically on GitHub

# Call 2 — run CI steps locally before pushing
pip install -r requirements.txt   # same as CI step 3
pytest -q                         # same as CI step 4
python -c "from src.models import AttentionClassifier"  # same as CI step 5

# Call 3 — check CI status via GitHub CLI
gh run list --limit 5             # show last 5 CI runs
gh run view <run-id>              # detailed log for one run`],
  ['callout','info','What this tells you','A green CI ✓ means: (a) all 23+ tests pass on a fresh Ubuntu VM, (b) every module imports cleanly, (c) this holds on both Python 3.10 and 3.12. It does NOT mean the model accuracy is good — CI tests correctness of code, not performance of the ML model. Accuracy is measured separately by train.py and MLflow.'],
  ['callout','analogy','Real world — aviation pre-flight checklist','A pilot completes the same checklist before every flight: fuel checked, flaps tested, radio working. It does not matter how experienced the pilot is or how rushed they are — the checklist runs every time. GitHub Actions is the automated pre-flight checklist for code: no matter how small the change, the tests always run before the code is allowed to fly to production.'],
  ['quiz',[{q:'A developer adds a new function to src/data.py with a syntax error in it — a missing colon after a for loop. The function is never called in any test. Will CI catch this?',a:1,opts:[
    {t:'No — pytest only catches errors in code that tests explicitly call. A syntax error in an uncalled function goes undetected',e:'Actually, Python raises SyntaxError when the MODULE is imported, not when the specific function is called. All functions are parsed at import time.'},
    {t:'Yes — the "Verify imports" step imports src/data, which triggers Python to parse all functions in the file. A syntax error in any function causes an immediate SyntaxError',e:'Correct! Python parses and compiles the entire file at import time. A syntax error anywhere in the file raises SyntaxError at import, which the verify-imports step catches.'},
    {t:'Only if the developer runs pytest -v instead of pytest -q',e:'-v controls verbosity, not which tests are discovered or which imports are checked.'},
    {t:'Yes — pytest automatically discovers all functions and checks their syntax',e:'pytest discovers test functions (starting with test_). It does not syntax-check non-test functions unless they are imported.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 18 — AutoML ── */
window.BLOCKS[18].push(
  ['p', 'Why this exists: manually profiling a new dataset takes hours — checking every column for missing values, data types, unique counts, and spotting which column is the target. profile_dataset() does this in milliseconds for any CSV, so AutoML can immediately answer "what do I have?" before training starts.'],
  ['code', 'Line by line — profile_dataset(df)', `def profile_dataset(df: pd.DataFrame) -> dict:
    rows = []
    for col in df.columns:           # iterate every column name
        series  = df[col]            # extract one column as a Series
        missing = int(series.isna().sum())           # count NaN values
        unique  = int(series.nunique(dropna=True))   # count distinct non-NaN values
        rows.append({
            'column':      col,
            'dtype':       str(series.dtype),        # int64 / float64 / object
            'missing':     missing,
            'missing_pct': float(missing / max(len(df), 1)),  # fraction 0→1
            'unique':      unique,
            'example':     _safe_example(series),    # one sample value (won't crash)
        })
    return {
        'n_rows':         int(len(df)),              # total row count
        'n_columns':      int(df.shape[1]),
        'columns':        rows,                      # list of per-column dicts
        'missing_cells':  int(df.isna().sum().sum()), # total NaN cells across all columns
        'duplicate_rows': int(df.duplicated().sum()),  # exact duplicate row count
    }`],
  ['code', 'Real output', `# Running profile_dataset on the building training CSV:
profile = profile_dataset(df)
# Returns:
# {
#   'n_rows': 1000,
#   'n_columns': 7,
#   'missing_cells': 0,     ← no missing values in this dataset
#   'duplicate_rows': 0,
#   'columns': [
#     {'column':'Energy Consumption','dtype':'float64','missing':0,'unique':847,'example':2713.95},
#     {'column':'Square Footage',    'dtype':'int64',  'missing':0,'unique':621,'example':7063},
#     {'column':'Building Type',     'dtype':'object', 'missing':0,'unique':3,  'example':'Residential'},
#     ...
#   ]
# }`],
  ['code', 'Three ways to call this', `# Call 1 — profile the building dataset
import pandas as pd
from src.automl import profile_dataset
df1 = pd.read_csv('data/train_energy_data.csv')
p1  = profile_dataset(df1)
print(p1['n_rows'], p1['missing_cells'])   # → 1000, 0

# Call 2 — profile a dataset with missing values
df2 = pd.DataFrame({'age':[25, None, 31], 'salary':[50000,60000,None], 'hired':['yes','no','yes']})
p2  = profile_dataset(df2)
print(p2['missing_cells'])   # → 2  (one in age, one in salary)

# Call 3 — check for duplicate rows
df3 = pd.concat([df1, df1.iloc[:10]])   # add 10 duplicate rows
p3  = profile_dataset(df3)
print(p3['duplicate_rows'])  # → 10`],
  ['callout','info','What this tells you','n_rows shows if you have enough data (< 100 rows is very small for ML). missing_cells > 0 means you need imputation. A column with unique = 2 or 3 is almost certainly categorical. A column where unique = n_rows is likely an ID column and should not be used as a feature. These four checks answer most "is this data ML-ready?" questions instantly.'],
  ['callout','analogy','Real world — hospital patient triage','When a patient arrives at the emergency room, a triage nurse runs a quick assessment in 2 minutes: temperature, pulse, blood pressure, visible injuries. This profile does not treat the patient — it tells the doctor what they are working with. profile_dataset() is the triage nurse for your data: a fast initial scan before any serious ML work begins.'],
  ['quiz',[{q:'What happens if you call profile_dataset() on a DataFrame where one column contains 1 000 identical values (no variance)?',a:2,opts:[
    {t:'profile_dataset raises a ZeroDivisionError because std = 0',e:'profile_dataset does not compute standard deviation — it uses nunique() which handles constant columns perfectly.'},
    {t:'The column is automatically dropped from the profile',e:'profile_dataset reports every column — it does not filter or drop any.'},
    {t:'The column appears in the profile with unique=1, which is a signal that this column carries no information and should probably be dropped before training',e:'Correct! A feature with only one unique value adds zero information. unique=1 in the profile is a flag to exclude it from the feature set.'},
    {t:'suggest_targets() will automatically recommend this column as the target',e:'suggest_targets() gives higher scores to columns with 2-10 unique values, not 1.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 19 — Codebase Tour ── */
window.BLOCKS[19].push(
  ['p', 'Why this exists: as a project grows, it becomes hard to remember which file is responsible for what, and where to make changes for a given task. The codebase tour gives you a mental map so you can navigate to the right file immediately and understand how components connect.'],
  ['code', 'Line by line — predict_dataframe()', `def predict_dataframe(df: pd.DataFrame, artifact: dict) -> list:
    model       = artifact['model']         # the fitted sklearn pipeline or classifier
    feature_set = artifact['feature_set']   # 'core' / 'extended' / 'all'
    classes     = artifact['classes']       # ['Residential','Commercial','Industrial']

    # Select only the columns this model was trained on
    X = df[FEATURE_COLS[feature_set]].values.astype(float)

    preds  = model.predict(X)              # integer class index per row
    probas = model.predict_proba(X)        # (n_rows, 3) probability matrix

    return [
        {
            'class':         classes[int(p)],   # integer → readable class name
            'probabilities': {
                c: float(prob)               # {'Residential': 0.71, ...}
                for c, prob in zip(classes, row_proba)
            },
        }
        for p, row_proba in zip(preds, probas)
    ]`],
  ['code', 'Real output', `# One building sent to predict_dataframe:
import pandas as pd
from src.predict import load_artifact, predict_dataframe

artifact = load_artifact('artifacts/model.joblib')
row = pd.DataFrame([{
    'Energy Consumption': 2713.95,
    'Square Footage':     7063.0,
    'Number of Occupants': 4,
    'Appliances Used': 8,
    'Average Temperature': 20.0,
    'Day of Week': 'Weekday',
}])
result = predict_dataframe(row, artifact)
# result[0] → {
#   'class': 'Residential',
#   'probabilities': {'Residential': 0.71, 'Commercial': 0.22, 'Industrial': 0.07}
# }`],
  ['code', 'Three ways to call this', `# Call 1 — single building
single_result = predict_dataframe(one_row_df, artifact)
print(single_result[0]['class'])   # 'Residential'

# Call 2 — batch of 10 buildings (returns a list of 10 results)
batch_df = pd.read_csv('data/test_energy_data.csv').head(10)
batch_results = predict_dataframe(batch_df, artifact)
for r in batch_results:
    print(r['class'], r['probabilities']['Industrial'])

# Call 3 — with extended feature set (model trained on 4 features)
artifact_ext = load_artifact('artifacts/model_extended.joblib')
result_ext = predict_dataframe(batch_df, artifact_ext)
# Uses 'Energy Consumption','Square Footage','Number of Occupants','Appliances Used'`],
  ['callout','info','What this tells you','The artifact dict bundles the model + feature_set + classes together so that predict_dataframe() always uses the same feature columns the model was trained on. This prevents the most common production bug: a model trained on 4 features being passed only 2 features at inference time. The artifact is the single source of truth for "what does this model expect?"'],
  ['callout','analogy','Real world — logistics package tracking','A courier warehouse has a "package manifest" file for every shipment: what is in it, which truck it goes on, what address it is going to. Without the manifest, a worker might load a package on the wrong truck. The artifact dict is the manifest: it tells predict_dataframe() exactly which features to extract and how to label the output. Everything needed for one correct delivery is bundled together.'],
  ['quiz',[{q:'What happens if you train a model with feature_set="extended" (4 features) but save an artifact with feature_set="core" (2 features), then call predict_dataframe()?',a:0,opts:[
    {t:'predict_dataframe selects 2 core columns for X, but the model expects 4 columns — model.predict(X) crashes with a shape mismatch error',e:'Correct! The artifact feature_set controls which columns are extracted. A mismatch between stored feature_set and actual training feature_set causes a dimension error at inference time.'},
    {t:'predict_dataframe automatically detects the mismatch and falls back to the correct feature set',e:'There is no auto-detection. predict_dataframe trusts the artifact entirely.'},
    {t:'The model silently uses only the 2 core features and produces lower-accuracy predictions',e:'sklearn pipelines enforce input shape strictly — they do not silently ignore extra or missing features.'},
    {t:'joblib.dump() would have caught this error at save time',e:'joblib.dump() serialises whatever you give it without any validation of feature_set consistency.'},
  ]},
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
    ]},
    {q:'Prediction check. If validation accuracy is much lower than training accuracy, what should you inspect first?',a:0,opts:[
      {t:'Overfitting, leakage, and whether the validation split matches the real task',e:'Correct. A large gap means the model may not generalize, or the evaluation setup may be flawed.'},
      {t:'Only the color palette in the dashboard',e:'Visual design matters, but it does not explain a train-validation performance gap.'},
      {t:'Whether Python printed enough decimal places',e:'Formatting can hide tiny differences, but it does not cause a large accuracy gap.'},
      {t:'Whether the model file name is short enough',e:'File names do not explain model generalization problems.'},
    ]},
    {q:'What would you change? A validation score looks too good because StandardScaler was fit before cross-validation. Which code change fixes the leakage?',a:1,opts:[
      {t:'Fit StandardScaler once on the full dataset before the fold loop',e:'That is the problem. The validation fold would influence the mean and standard deviation used for training.'},
      {t:'Inside each fold, fit StandardScaler only on X_train, then transform X_train and X_val with that scaler',e:'Correct. The validation fold stays unseen, so the score is a fairer estimate of generalisation.'},
      {t:'Fit StandardScaler separately on X_train and X_val inside each fold',e:'That also leaks information. Validation data would get its own statistics, which the model would not have at deployment time.'},
      {t:'Remove cross-validation and report training accuracy only',e:'That hides the problem instead of fixing it. Training accuracy cannot measure generalisation.'},
    ]},
    {q:'Trace the output. What does this snippet print? scores=[0.72,0.68,0.60]; total=sum(scores); print([round(s/total,2) for s in scores])',a:2,opts:[
      {t:'[0.72, 0.68, 0.60]',e:'Those are the raw scores. The code divides each score by the total, so the values must change.'},
      {t:'[1.00, 1.00, 1.00]',e:'Dividing by the total does not make each item one. It makes the whole list sum to one.'},
      {t:'[0.36, 0.34, 0.30]',e:'Correct. The total is 2.00, so the normalised values are 0.72/2, 0.68/2, and 0.60/2.'},
      {t:'[0.33, 0.33, 0.33]',e:'That would be a uniform distribution. The original scores are not equal, so the normalised values are not equal.'},
    ]}]]
);

/* ── Step 2-8 additions: Lesson 20 — Gradient Descent ── */
