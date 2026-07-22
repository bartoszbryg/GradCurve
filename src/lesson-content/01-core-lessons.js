/* ── BLOCKS[1] = Dataset ──────────────────────────────────────────── */
window.BLOCKS[1] = [
  ['p', 'Before you can train any model, you need data. In this project, the data is a CSV file with 1 000 rows — one row per building.'],
  ['p', 'Each row has 7 columns: Energy Consumption, Square Footage, Number of Occupants, Appliances Used, Average Temperature, Day of Week, and Building Type. The last column is the answer we want to predict.'],
  ['callout','analogy','Think of it like a spreadsheet','Imagine a spreadsheet where each row is one building and each column is something you measured about it. The "Building Type" column is what you want to learn to guess — Residential, Commercial, or Industrial.'],
  ['p', 'Machine learning needs numbers, not words. So we convert "Residential" to 0, "Commercial" to 1, and "Industrial" to 2. This mapping is called LABEL_MAP.'],
  ['h2','The label map and feature columns'],
  ['code','src/data.py',
`LABEL_MAP = {
    'Residential': 0,   # apartment, house
    'Commercial':  1,   # office, shop, restaurant
    'Industrial':  2,   # factory, warehouse
}

CLASSES = ['Residential', 'Commercial', 'Industrial']

# We can use different groups of features:
# 'core'     = just 2 features (Energy + Square Footage) — simple and fast
# 'extended' = 4 features  (add Occupants + Appliances)
# 'all'      = 5 features  (add Temperature too)
FEATURE_COLS = {
    'core':     ['Energy Consumption', 'Square Footage'],
    'extended': ['Energy Consumption', 'Square Footage',
                 'Number of Occupants', 'Appliances Used'],
    'all':      ['Energy Consumption', 'Square Footage',
                 'Number of Occupants', 'Appliances Used',
                 'Average Temperature'],
}`],
  ['p', 'The load_features() function reads the CSV, picks the right columns, and returns two things: X (the features — the inputs) and y (the labels — the answers).'],
  ['callout','info','X and y — the two things every ML model needs','X is a table of numbers (one row per building, one column per feature). y is a list of numbers (0, 1, or 2 for each building). The model learns the pattern that connects X to y.'],
  ['h2','Loading the data'],
  ['code','src/data.py',
`def load_raw(filepath: str) -> pd.DataFrame:
    # Read the CSV and remove any rows with missing values.
    # A missing value would crash the math later, so we drop it now.
    return pd.read_csv(filepath).dropna()

def load_features(filepath: str, feature_set: str = 'core'):
    df = load_raw(filepath)

    # Convert "Residential" / "Commercial" / "Industrial" → 0 / 1 / 2
    y = df['Building Type'].map(LABEL_MAP).values

    # Pick only the feature columns we want (e.g. just Energy + Sqft)
    X = df[FEATURE_COLS[feature_set]].values.astype(float)

    return X, y
    # X.shape = (1000, 2) for 'core'   — 1000 buildings, 2 measurements each
    # y.shape = (1000,)                 — one answer per building`],
  ['callout','warning','Never use the test set for training','We have two files: train_energy_data.csv (1 000 rows) and test_energy_data.csv (100 rows). The model learns from the training file. The test file is locked away and only used once at the end to measure how well the model does on buildings it has never seen.'],
  ['quiz',[
    {q:'What does LABEL_MAP do?',a:1,opts:[
      {t:'It maps numbers back to class name strings like "Residential"',e:'That is what CLASSES[i] does — indexing the list.'},
      {t:'It converts string labels ("Residential", "Commercial") into numbers (0, 1, 2) that NumPy can use',e:'Correct! Models need numbers, not strings.'},
      {t:'It normalises feature values to [0, 1]',e:'That is the job of StandardScaler.'},
      {t:'It selects which columns from the CSV to use as features',e:'That is FEATURE_COLS.'},
    ]},
    {q:'load_features("train.csv", feature_set="core") returns X with how many columns?',a:0,opts:[
      {t:'2 — Energy Consumption and Square Footage',e:'Correct! "core" means just these two columns.'},
      {t:'4 — adding Occupants and Appliances',e:'That is feature_set="extended".'},
      {t:'5 — all five numeric columns',e:'That is feature_set="all".'},
      {t:'7 — every column in the CSV',e:'Day of Week and Building Type are excluded.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[2] = Feature Engineering ─────────────────────────────── */
window.BLOCKS[2] = [
  ['p', 'Raw numbers from the CSV are useful, but sometimes you can make them even more useful by creating new columns from them. This is called feature engineering.'],
  ['p', 'For example: a factory uses 50 000 kWh and covers 20 000 sqft. A house uses 5 000 kWh and covers 1 000 sqft. The factory uses 10× more energy AND has 20× more space — so the raw numbers alone are not the most informative. But if you divide energy by area, you get energy density: factory = 2.5 kWh/sqft, house = 5 kWh/sqft. Suddenly the numbers tell a clearer story.'],
  ['callout','analogy','Why engineer features?','Imagine trying to tell apart a small café from a large hotel just by knowing the total electricity bill. The hotel pays more, but it is also much bigger. Dividing the bill by the number of rooms (energy per room) instantly reveals the usage pattern — that is feature engineering.'],
  ['p', 'make_engineered_features() takes the raw DataFrame and creates 9 columns: the 5 original ones plus 3 new ratio columns plus a weekend flag.'],
  ['h2','The engineered feature function'],
  ['code','src/data.py',
`def make_engineered_features(df: pd.DataFrame):
    feat = pd.DataFrame()

    # --- original 5 columns (same numbers, just renamed) ---
    feat['energy_consumption'] = df['Energy Consumption']
    feat['square_footage']     = df['Square Footage']
    feat['num_occupants']      = df['Number of Occupants']
    feat['appliances_used']    = df['Appliances Used']
    feat['avg_temperature']    = df['Average Temperature']
    feat['is_weekend']         = (df['Day of Week'] == 'Weekend').astype(float)
    #                            ↑ True/False converted to 1.0 / 0.0

    # --- 3 new ratio columns (the interesting new signals) ---
    sqft_safe = df['Square Footage'].clip(lower=1)      # avoid dividing by 0
    occ_safe  = df['Number of Occupants'].clip(lower=1)

    feat['energy_per_sqft']   = df['Energy Consumption'] / sqft_safe
    feat['occupancy_density'] = df['Number of Occupants'] / sqft_safe
    feat['appliance_per_occ'] = df['Appliances Used']    / occ_safe

    return feat.values.astype(float), list(feat.columns)`],
  ['h2','What each new column tells us'],
  ['callout','info','energy_per_sqft — the most useful ratio','A factory uses a huge amount of energy per square foot (heavy machines). A house uses moderate energy per square foot (TV, fridge, lights). This ratio is much better at telling them apart than raw energy consumption.'],
  ['callout','info','occupancy_density — people per square foot','A busy office has many people in a small space (high density). A warehouse has few workers in a giant space (very low density). This helps separate Commercial from Industrial.'],
  ['callout','info','appliance_per_occ — machines per person','A factory has hundreds of machines but only a few technicians → very high ratio. A house has a few appliances per many people → low ratio. This is a strong Industrial signal.'],
  ['callout','warning','Why clip(lower=1)?','If a building has 0 square footage recorded (a data entry error), dividing by it produces infinity — which breaks every calculation downstream. clip(lower=1) replaces any value below 1 with 1, silently fixing the error without deleting the row.'],
  ['quiz',[
    {q:'Why does make_engineered_features() create energy_per_sqft instead of just using raw Energy Consumption?',a:2,opts:[
      {t:'To reduce memory usage by replacing two columns with one',e:'We keep all columns — this adds a new one.'},
      {t:'StandardScaler requires ratio features to work correctly',e:'StandardScaler works on any numeric values.'},
      {t:'A large house and a small factory might have similar total energy, but very different energy per sqft — the ratio separates them better',e:'Correct! Ratios remove the confounding effect of building size.'},
      {t:'It reduces the number of training examples needed',e:'Feature engineering does not change the number of rows.'},
    ]},
    {q:'is_weekend is stored as 0.0 or 1.0, not True/False. Why?',a:1,opts:[
      {t:'Pandas DataFrames cannot store boolean values',e:'Pandas supports bool dtype natively.'},
      {t:'All features need to be numbers. feat.values.astype(float) converts the whole table to a numeric NumPy array — booleans would cause issues',e:'Correct! The model receives a uniform numeric matrix, not a mixed-type table.'},
      {t:'Weekend buildings use more energy so 1.0 gives them more mathematical weight',e:'The numeric value has no inherent weight — the model learns its own.'},
      {t:'True/False cannot be written to a CSV file',e:'CSV files can store True/False as strings.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[3] = Feature Scaling ──────────────────────────────────── */
window.BLOCKS[3] = [
  ['p', 'Here is a problem: Energy Consumption ranges from 1 000 to 60 000. Square Footage ranges from 500 to 30 000. These numbers are on very different scales.'],
  ['p', 'This causes issues for models that use gradient descent (like Logistic Regression and Neural Networks). Imagine rolling a ball down a hill where the x-axis is stretched 100× wider than the y-axis — the ball rolls crookedly and slowly. Scaling makes both axes the same size.'],
  ['callout','analogy','Scaling = making a fair playing field','Imagine comparing the weight of a feather (0.01g) to the weight of a car (1 500 000g). If you try to find the "middle" measurement, the car completely dominates. StandardScaler converts both to the same unit: "how many standard deviations from average?" Now both contribute equally.'],
  ['p', 'StandardScaler subtracts the mean and divides by the standard deviation. The result: every feature has mean = 0 and standard deviation = 1.'],
  ['math', 'z = (x − μ) / σ      where μ = mean of training set, σ = std of training set'],
  ['p', 'After scaling, Energy Consumption becomes a number like -1.2 or +0.8 (standard deviations from average). Square Footage becomes a similar small number. Both are now on the same scale.'],
  ['h2','The golden rule of scaling'],
  ['callout','warning','Fit on training data only — NEVER on test or validation data','You learn μ and σ from the training set. Then you apply those same μ and σ to scale the validation and test sets. If you calculate μ and σ from all the data including test rows, you are cheating — the model gets hints about test data it is not supposed to see. This is called data leakage.'],
  ['h2','How cross_validate_custom() does scaling correctly'],
  ['code','src/evaluation.py',
`def cross_validate_custom(model_cls, kwargs, X, y, skf=None, needs_scaling=True):

    scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X[train_idx], X[val_idx]

        if needs_scaling:
            scaler  = StandardScaler()
            X_train = scaler.fit_transform(X_train)  # ✓ learn μ, σ from train only
            X_val   = scaler.transform(X_val)        # ✓ apply same μ, σ — no new fit

        model = model_cls(**kwargs)
        model.fit(X_train, y_train)
        scores.append(accuracy_score(y_val, model.predict(X_val)))

    return np.array(scores)
    # WRONG (data leakage):  scaler.fit_transform(X)  ← before the loop
    # CORRECT:               fit inside each fold on X_train only`],
  ['callout','danger','Common beginner mistake','Calling scaler.fit_transform(X) once before the loop passes validation data statistics into the scaler. Your CV score looks great but the model is actually cheating — it has already "seen" the validation set statistics. In practice this inflates scores by 2–5 percentage points.'],
  ['h2','What scaled numbers look like'],
  ['code','Before and after StandardScaler',
`Feature               Raw range          After scaling
─────────────────────────────────────────────────────
Energy Consumption    1 000 – 60 000     −1.4  to  +2.1
Square Footage          500 – 30 000     −1.2  to  +2.3

Both features now live in the same −2 to +2 range.
Gradient descent can now take equal-sized steps in both directions.`],
  ['quiz',[
    {q:'Where must StandardScaler.fit() be called in the cross-validation loop?',a:2,opts:[
      {t:'Once on the full X before the fold loop begins',e:'This leaks validation statistics into training — data leakage.'},
      {t:'On both X_train and X_val inside each fold',e:'Fitting on X_val leaks future statistics. Only fit on X_train.'},
      {t:'Inside each fold on X_train only — then use .transform() (not .fit_transform()) on X_val',e:'Correct! The scaler learns from training data and applies the same transformation to validation data.'},
      {t:'On the test set after training to align train/test distributions',e:'Never fit any preprocessor on the test set.'},
    ]},
    {q:'After StandardScaler, a building has energy_consumption = +2.1. What does this mean?',a:0,opts:[
      {t:'This building uses 2.1 standard deviations more energy than the average building in the training set',e:'Correct! Positive values are above average, negative values are below average.'},
      {t:'This building uses 2.1 times the median energy',e:'StandardScaler uses mean and std deviation, not median.'},
      {t:'The raw energy value was divided by 2.1',e:'StandardScaler subtracts the mean then divides by std deviation, not a fixed number.'},
      {t:'The building is in the top 2.1% of energy users',e:'Standard deviations and percentiles are different concepts.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[4] = Logistic Regression OvR ─────────────────────────── */
window.BLOCKS[4] = [
  ['p', 'Logistic Regression is one of the simplest machine learning models. It draws a straight line (or plane) to separate classes. Despite its name, it is a classification model, not a regression model.'],
  ['p', 'We have three classes (Residential, Commercial, Industrial). The simplest approach: train three separate questions. Question 1: "Is this building Residential or not?" Question 2: "Is this building Commercial or not?" Question 3: "Is this building Industrial or not?" This strategy is called One-vs-Rest (OvR).'],
  ['callout','analogy','OvR is like three separate yes/no votes','Imagine three friends, each an expert in one building type. Friend 1 says "60% chance it is Residential". Friend 2 says "70% chance it is Commercial". Friend 3 says "20% chance it is Industrial". The highest vote wins: Commercial.'],
  ['p', 'Each binary classifier uses the sigmoid function to convert any number into a probability between 0 and 1.'],
  ['math', 'σ(z) = 1 / (1 + e^{−z})      z = w₁×energy + w₂×sqft + bias'],
  ['p', 'The model learns the weights (w₁, w₂, bias) through gradient descent — it starts with random weights, checks how wrong it is, and nudges the weights in the right direction, 1 000 times.'],
  ['h2','The sigmoid function — with a safety fix'],
  ['code','src/models/linear.py',
`class LogisticRegressionOvR:

    @staticmethod
    def _sigmoid(z):
        # Clip z to avoid overflow: exp(-1000) = inf which crashes Python
        # Clipping to [-250, 250] keeps all values in a safe range
        return 1.0 / (1.0 + np.exp(-np.clip(z, -250, 250)))`],
  ['h2','Training one binary classifier — step by step'],
  ['code','src/models/linear.py',
`    def _fit_binary(self, X, y_bin, rng):
        # Start with tiny random weights near zero
        w = rng.normal(0.0, 0.01, size=1 + X.shape[1])
        # w[0] = bias (a constant offset), w[1:] = one weight per feature

        for _ in range(self.n_iter):           # repeat 1 000 times
            net    = X @ w[1:] + w[0]         # linear combination: w·x + bias
            output = self._sigmoid(net)         # convert to probability 0→1

            errors = y_bin - output            # how wrong are we? (residuals)

            # Move weights in the direction that reduces errors
            # alpha * w[1:] is L2 regularisation — keeps weights small
            w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])
            w[0]  += self.eta * errors.sum()   # update bias

        return w`],
  ['callout','info','What is L2 regularisation?','Without regularisation, the model might make its weights extremely large to perfectly fit the training data — but then it fails on new data (overfitting). L2 regularisation (alpha × w) is a gentle penalty that says "keep the weights small unless there is a really good reason to make them big." It improves generalisation.'],
  ['h2','Training all three classifiers and combining predictions'],
  ['code','src/models/linear.py',
`    def fit(self, X, y):
        self.classes_ = np.unique(y)   # [0, 1, 2]

        self.weights_ = []
        for c in self.classes_:
            # Convert "is this class c?" to 1.0, everything else to 0.0
            y_binary = (y == c).astype(float)
            w, _ = self._fit_binary(X, y_binary, rng)
            self.weights_.append(w)

    def predict_proba(self, X):
        # Get one probability per class, then normalise so they sum to 1
        scores = np.column_stack([
            self._sigmoid(X @ w[1:] + w[0])
            for w in self.weights_
        ])
        # Example raw scores: [0.72, 0.68, 0.69]  ← sum = 2.09 (wrong!)
        # After normalisation: [0.35, 0.33, 0.33]  ← sum = 1.00 (correct)
        scores /= scores.sum(axis=1, keepdims=True) + 1e-12
        return scores`],
  ['quiz',[
    {q:'How many binary classifiers does LogisticRegressionOvR train for 3 classes?',a:1,opts:[
      {t:'1 — a single classifier that outputs 0, 1, or 2',e:'That would be a multi-class classifier — harder to implement from scratch.'},
      {t:'3 — one per class ("is this Residential or not?", "is this Commercial or not?", ...)',e:'Correct! Each classifier focuses on one class vs all others.'},
      {t:'6 — one for every pair of classes (Residential vs Commercial, etc.)',e:'That is One-vs-One (OvO), a different strategy.'},
      {t:'9 — one for each feature-class combination',e:'Features and classifiers are not related this way.'},
    ]},
    {q:'The weight update includes "- alpha * w[1:]". What does this term do?',a:3,opts:[
      {t:'It sets the learning rate for the bias term',e:'The learning rate is self.eta.'},
      {t:'It calculates the binary cross-entropy gradient',e:'The BCE gradient is X.T @ errors.'},
      {t:'It remembers the previous step to speed up convergence (momentum)',e:'This is plain gradient descent — no momentum here.'},
      {t:'It is L2 regularisation — it gently pushes weights toward zero to prevent overfitting',e:'Correct! Large weights are penalised, which helps the model generalise to new buildings.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[5] = Softmax Regression ──────────────────────────────── */
window.BLOCKS[5] = [
  ['p', 'Softmax Regression is a cleaner approach to multi-class classification than OvR. Instead of three separate classifiers that each ignore the others, Softmax trains one joint model where all three class scores are computed together.'],
  ['p', 'The key insight: if the probability of "Residential" goes up, the probabilities of "Commercial" and "Industrial" must go down to compensate. They are not independent. The softmax function enforces this — its outputs always sum to exactly 1.'],
  ['callout','analogy','Softmax is like a vote where everyone gets exactly 100 points to distribute','OvR: three independent voters each give a score from 0-100%. They might all give 70% — which makes no sense for probabilities. Softmax: one joint decision where every extra point for Residential comes directly from Commercial or Industrial. The total is always 100%.'],
  ['math', 'P(class k) = exp(score_k) / (exp(score_0) + exp(score_1) + exp(score_2))'],
  ['p', 'The exp() function makes all scores positive. Dividing by the total makes them sum to 1. Simple and elegant.'],
  ['h2','Numerically safe softmax — avoiding overflow'],
  ['code','src/models/linear.py',
`    @staticmethod
    def _softmax(z):
        # Problem: exp(1000) = infinity. This crashes Python.
        # Solution: subtract the largest value in each row first.
        # Math fact: softmax(z) = softmax(z - c) for ANY constant c.
        # So subtracting the max is mathematically identical but numerically safe.
        z     = z - z.max(axis=1, keepdims=True)  # now all values ≤ 0
        exp_z = np.exp(z)                          # exp of negative = safe!
        return exp_z / exp_z.sum(axis=1, keepdims=True)`],
  ['h2','The weight matrix and training'],
  ['code','src/models/linear.py',
`    def fit(self, X, y):
        # One row of weights per class — shape is (3 classes, 2 features for core)
        self.W_ = rng.normal(0.0, 0.01, size=(n_classes, n_features))
        self.b_ = np.zeros(n_classes)    # one bias per class

        for _ in range(self.n_iter):
            # Compute scores for all 3 classes at once: shape (n_samples, 3)
            P  = self._softmax(X @ self.W_.T + self.b_)

            # Gradient: how different is P from the true one-hot labels Y?
            dL = (P - Y) / n_samples

            # Update: move weights to reduce the error
            self.W_ -= self.eta * (dL.T @ X + self.alpha * self.W_)
            self.b_ -= self.eta * dL.sum(axis=0)`],
  ['callout','info','OvR vs Softmax — which is better?','On this dataset they achieve similar accuracy (~63%). But Softmax is more principled: its probabilities are guaranteed to sum to 1 by construction, while OvR needs a manual normalisation step. For a new multi-class problem, start with Softmax.'],
  ['quiz',[
    {q:'_softmax() subtracts z.max() before calling np.exp(). Why?',a:1,opts:[
      {t:'To normalise values to the range [0, 1] before exponentiation',e:'Division by the row sum handles normalisation — the subtraction is purely for numerical safety.'},
      {t:'exp(large number) overflows to infinity; subtracting the row max keeps all inputs ≤ 0 — and exp of a negative number is always safe',e:'Correct! And mathematically, softmax(z) = softmax(z - c) for any constant c, so the result is identical.'},
      {t:'To apply L2 regularisation to the logits',e:'L2 regularisation is in the weight update step, not in _softmax.'},
      {t:'To speed up matrix multiplication',e:'No speed benefit — this is purely for avoiding numerical overflow.'},
    ]},
    {q:'The weight matrix W_ has shape (3, 2) for the core feature set. Why 3 rows?',a:0,opts:[
      {t:'One row of weights per class — each row is a separate linear function for that class',e:'Correct! Row 0 computes the Residential score, row 1 the Commercial score, row 2 the Industrial score.'},
      {t:'The 3 rows correspond to the 3 cross-validation folds used during training',e:'CV folds are separate from model parameters.'},
      {t:'One row per hidden layer (but Softmax has no hidden layers — this is wrong)',e:'Softmax is a linear model with no hidden layers.'},
      {t:'Because 3 × 2 = 6 and we need 6 parameters to separate 3 classes',e:'The number of parameters is not the reason for the shape.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[6] = Attention Classifier ────────────────────────────── */
window.BLOCKS[6] = [
  ['p', 'The Attention Classifier works very differently from Logistic Regression. It does not learn any weights during training. Instead, it memorises every single training example.'],
  ['p', 'When you ask it to classify a new building, it looks at ALL training buildings, figures out which ones are most similar to the new one, and lets the similar ones "vote" on the class. Similar buildings vote louder; distant buildings vote quietly.'],
  ['callout','analogy','Like asking your neighbours','You move to a new city and wonder what type of neighbourhood your street is. Instead of learning rules, you walk outside and ask nearby houses: "What type of building are you?" Houses one street away shout their answer. Houses 10 km away whisper. The Attention Classifier does exactly this — in feature space.'],
  ['p', 'The "loudness" of each vote is controlled by a bandwidth parameter w. Small w = only very close neighbours matter. Large w = all neighbours vote equally.'],
  ['math', 'weight_i = exp(−distance(building_i, query) / w)      then normalise so all weights sum to 1'],
  ['h2','The full implementation in 27 lines'],
  ['code','src/models/linear.py',
`class AttentionClassifier:

    def __init__(self, w: float = 1.0):
        self.w = w   # bandwidth — controls the "attention radius"

    def fit(self, X, y):
        # Training is instant: just store everything!
        self.X_train_ = X
        self.y_train_ = y.ravel()
        self.classes_ = np.unique(self.y_train_)
        return self

    def predict_proba(self, X):
        # Step 1: compute distance from each query to every training building
        diff    = X[:, np.newaxis, :] - self.X_train_[np.newaxis, :, :]
        dist    = np.sqrt(np.sum(diff ** 2, axis=2))   # Euclidean distance

        # Step 2: convert distances to weights (closer = higher weight)
        weights = np.exp(-dist / self.w)
        weights /= weights.sum(axis=1, keepdims=True) + 1e-12  # normalise to sum=1

        # Step 3: sum weights for each class → probability vector
        return np.stack(
            [weights[:, self.y_train_ == c].sum(axis=1) for c in self.classes_],
            axis=1,
        )   # shape: (n_queries, 3)`],
  ['callout','info','Two extremes of bandwidth w','w = 0.001: only the single nearest building gets any weight — 1-nearest-neighbour. w = 1 000 000: every building gets equal weight — the model just predicts the most common class. The sweet spot (w ≈ 1–3 on scaled data) gives smooth predictions that generalise well.'],
  ['callout','warning','Slow at prediction time','fit() is instant — just stores data. But predict_proba() on n_test buildings computes distances to ALL n_train buildings. With 1 000 training buildings, each prediction requires 1 000 distance calculations. Fine here; too slow for millions of training examples.'],
  ['quiz',[
    {q:'What does fit() actually do in AttentionClassifier?',a:2,opts:[
      {t:'It learns a weight matrix W through gradient descent',e:'There is no gradient descent — Attention is non-parametric.'},
      {t:'It clusters training buildings into groups by class',e:'No clustering occurs; every individual training point is stored.'},
      {t:'It stores the training data (X_train_ and y_train_) — all the real work happens at prediction time',e:'Correct! fit() is essentially just saving data to memory.'},
      {t:'It precomputes all pairwise distances to speed up prediction',e:'Distances are computed fresh at each predict_proba call.'},
    ]},
    {q:'If bandwidth w is set very large (e.g. w = 1 000 000), what happens?',a:3,opts:[
      {t:'The model only looks at the single nearest neighbour',e:'Very small w gives you 1-nearest-neighbour behaviour.'},
      {t:'The model completely ignores the training data',e:'The training data is still used — the weights just become equal.'},
      {t:'The model becomes more accurate because it considers more training examples',e:'More examples considered does not mean more accuracy — it washes out local patterns.'},
      {t:'All training buildings get nearly equal weight, so the model just predicts the most common class (majority vote)',e:'Correct! When w is huge, exp(-dist/w) ≈ 1 for all buildings, so they all vote equally.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[7] = XGBoost ──────────────────────────────────────────── */
window.BLOCKS[7] = [
  ['p', 'XGBoost is one of the most powerful and widely used machine learning algorithms. It builds a collection of decision trees, one at a time, where each new tree specifically tries to fix the mistakes made by all previous trees.'],
  ['p', 'This is called gradient boosting — you are "boosting" performance by iteratively correcting errors. The word "gradient" comes from the fact that you find the direction to reduce errors using calculus (gradients).'],
  ['callout','analogy','A team of specialists fixing each other\'s mistakes','Tree 1: a generalist who classifies most buildings correctly but struggles with mixed-use buildings. Tree 2: focuses entirely on the buildings Tree 1 got wrong. Tree 3: focuses on the remaining mistakes. After 100 trees, even the trickiest buildings are handled by a specialist.'],
  ['p', 'Unlike Logistic Regression and Neural Networks, XGBoost does NOT need feature scaling. Decision trees split on one feature at a time using comparisons like "energy > 5000" — the actual scale of the numbers does not matter, only their order.'],
  ['h2','Configuration in train.py'],
  ['code','src/train.py',
`xgb = XGBClassifier(
    objective        = 'multi:softprob',  # output probabilities for 3 classes
    num_class        = 3,
    eval_metric      = 'mlogloss',        # loss function to minimize
    max_depth        = 5,      # each tree can be at most 5 decisions deep
    learning_rate    = 0.05,   # each tree contributes only 5% of its prediction
    n_estimators     = 100,    # build 100 trees sequentially
    subsample        = 0.8,    # each tree only sees 80% of training rows (random)
    colsample_bytree = 1.0,    # use all features (we only have 2 in core mode)
    random_state     = 42,
    verbosity        = 0,      # suppress all output during training
)`],
  ['callout','info','Why learning_rate = 0.05?','If each tree contributed 100% of its correction, the model would overfit badly — it would just memorise the first few trees. Using 5% per tree means you need many trees (100) to reach good performance, but each one adds a gentle, general correction. Lower learning rate + more trees = better generalisation.'],
  ['callout','info','Why subsample = 0.8?','Each tree only sees 80% of the data (chosen randomly). This forces different trees to see slightly different data, so they disagree on some cases. Their disagreement acts as a safety check — the ensemble is more robust when no single tree dominates.'],
  ['h2','How XGBoost fits into the project'],
  ['code','src/train.py',
`def build_models(random_state: int = 42) -> dict:
    lr  = make_pipeline(StandardScaler(), LogisticRegression(...))  # needs scaling
    mlp = make_pipeline(StandardScaler(), MLPClassifier(...))       # needs scaling
    xgb = XGBClassifier(...)                                        # no scaling needed

    # Two ensemble methods built on top of the three base models:
    voting   = VotingClassifier([('lr', lr), ('mlp', mlp), ('xgb', xgb)], voting='soft')
    stacking = StackingClassifier([('lr', lr), ('mlp', mlp), ('xgb', xgb)], ...)

    return {'logistic_regression': lr, 'mlp': mlp, 'xgboost': xgb,
            'soft_voting': voting, 'stacking': stacking}`],
  ['quiz',[
    {q:'Why does XGBClassifier not need a StandardScaler?',a:0,opts:[
      {t:'Tree splits compare a feature to a threshold ("energy > 5000"). Multiplying energy by 100 shifts the threshold to 500 000 but the split is identical — order is preserved, scale is irrelevant',e:'Correct! Decision trees only care about the ordering of values, not their magnitude.'},
      {t:'XGBoost applies StandardScaler internally before training',e:'XGBoost has no built-in feature scaling.'},
      {t:'XGBoost uses cosine similarity as its distance metric',e:'XGBoost uses tree splits, not distance metrics.'},
      {t:'XGBoost only uses binary (0/1) features',e:'XGBoost handles continuous features directly.'},
    ]},
    {q:'learning_rate = 0.05 and n_estimators = 100. If you reduce learning_rate to 0.001 but keep n_estimators = 100, what happens?',a:2,opts:[
      {t:'Training becomes much faster because each tree does less work',e:'Smaller learning rate means more trees are needed to converge — it often gets slower overall.'},
      {t:'The model overfits more because small steps keep it close to the training data',e:'A small learning rate usually reduces overfitting.'},
      {t:'The model underfits — 100 trees each contributing 0.1% is not enough to reach good accuracy',e:'Correct! You would need thousands of trees with such a small learning rate.'},
      {t:'The model ignores the subsample setting',e:'Subsampling is independent of learning rate.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[8] = Neural Network (MLP) ────────────────────────────── */
window.BLOCKS[8] = [
  ['p', 'A Neural Network (specifically an MLP — Multi-Layer Perceptron) is loosely inspired by how the brain works. It has layers of artificial neurons, where each neuron receives inputs, combines them, applies a non-linear transformation, and passes the result to the next layer.'],
  ['p', 'The word "deep" in "deep learning" refers to having many layers. Our MLP has 2 hidden layers: first 40 neurons, then 20 neurons. The more layers, the more complex patterns the network can learn.'],
  ['callout','analogy','Layers of abstraction','Layer 1 (40 neurons): detects basic patterns — "high energy" or "large building". Layer 2 (20 neurons): combines those patterns — "high energy + large building = probably industrial". Output layer (3 neurons): makes the final class decision. Each layer builds on the previous one.'],
  ['math', 'h₁ = tanh(W₁ × input + b₁)      h₂ = tanh(W₂ × h₁ + b₂)      output = softmax(W₃ × h₂ + b₃)'],
  ['p', 'tanh is the activation function — it takes any number and squashes it to between -1 and 1. Without activation functions, stacking layers is the same as having just one layer (the math collapses to a single matrix multiplication).'],
  ['h2','Configuration in train.py'],
  ['code','src/train.py',
`mlp = make_pipeline(
    StandardScaler(),           # MUST scale: MLP uses gradient descent
    MLPClassifier(
        hidden_layer_sizes = (40, 20),  # 2 hidden layers: 40 then 20 neurons
        activation         = 'tanh',    # squash to (-1, 1) — smooth and stable
        solver             = 'adam',    # smart learning rate (adapts per-parameter)
        alpha              = 1e-5,      # L2 regularisation strength
        max_iter           = 3000,      # maximum training epochs
        early_stopping     = True,      # stop if validation loss stops improving
        random_state       = 42,
    ),
)`],
  ['callout','warning','Always scale inputs for neural networks','Adam adjusts learning rates per parameter using gradient magnitudes. If Energy Consumption is ~10 000 and Square Footage is ~1 000, their gradients differ by 10×. Even Adam struggles — the network converges slowly and inconsistently. StandardScaler eliminates this problem.'],
  ['callout','info','Why tanh and not ReLU?','ReLU (a common alternative) outputs 0 for all negative inputs. If a neuron always receives negative inputs during training, its output is always 0 — it never updates. This "dead neuron" problem is more likely on small datasets. tanh is always smooth and always active, which is more reliable here.'],
  ['callout','info','early_stopping = True','The MLP automatically holds back 10% of training data as a validation set. If the validation loss does not improve for 10 consecutive training rounds, training stops early. This prevents the network from memorising training examples while performing poorly on new ones.'],
  ['h2','How many parameters does this network have?'],
  ['code','Architecture for the core feature set (2 input features)',
`Input (2 features)  →  Hidden 1 (40 neurons)  →  Hidden 2 (20 neurons)  →  Output (3 classes)

Parameters:
  Layer 1: 2 inputs × 40 neurons + 40 biases  =  120
  Layer 2: 40 inputs × 20 neurons + 20 biases  =  820
  Layer 3: 20 inputs × 3 outputs + 3 biases    =  63
  ──────────────────────────────────────────────────
  Total: 1 003 parameters learned from 1 000 buildings.
  (This is why early stopping and regularisation are critical!)`],
  ['quiz',[
    {q:'Why must StandardScaler be applied before the MLP?',a:2,opts:[
      {t:'MLPClassifier raises an error if it receives unscaled input',e:'MLPClassifier silently accepts any numeric input — it does not check scaling.'},
      {t:'Scaling reduces the number of parameters in the network',e:'The network architecture is the same regardless of scaling.'},
      {t:'Adam adapts learning rates based on gradient magnitudes; unequal feature scales cause unequal gradients, leading to slow and unstable convergence',e:'Correct! Scaling makes all feature gradients comparable in magnitude.'},
      {t:'StandardScaler removes outliers that would confuse backpropagation',e:'StandardScaler rescales but does not remove outliers.'},
    ]},
    {q:'early_stopping=True holds back 10% of training data for validation. What risk does this create on a small dataset?',a:1,opts:[
      {t:'The model trains for exactly 10 epochs regardless',e:'Early stopping halts after 10 non-improving epochs, not after exactly 10 total.'},
      {t:'Only ~900 rows remain for actual training (10% = ~100 rows used for early-stop validation). Less data + early stopping is a trade-off between overfitting prevention and learning enough',e:'Correct! On a 1 000-row dataset, the 10% early-stop holdout meaningfully reduces training data.'},
      {t:'early_stopping disables L2 regularisation (alpha)',e:'Both early stopping and L2 regularisation apply independently.'},
      {t:'The model cannot be retrained on the full dataset afterward',e:'train_best_model() retrains on the full training set after cross-validation.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[9] = Ensemble Methods ────────────────────────────────── */
window.BLOCKS[9] = [
  ['p', 'The wisdom of the crowd: no single model is perfect, but combining multiple models often gives better predictions than any individual model alone. This is the core idea behind ensembles.'],
  ['p', 'Think about it: Logistic Regression makes linear splits. XGBoost makes complex tree-based splits. Neural Networks make smooth curved splits. They make different mistakes. When they agree, we can be confident. When they disagree, we can weigh their confidence levels.'],
  ['callout','analogy','The doctor analogy','You have a mysterious symptom. You visit three specialist doctors. Each gives a diagnosis with a confidence percentage. Instead of picking one doctor\'s opinion, you weight their answers by how confident each was. That is ensemble voting.'],
  ['h2','Method 1: Soft Voting (average the probabilities)'],
  ['code','src/train.py',
`voting = VotingClassifier(
    estimators = [
        ('lr',  lr),   # LogisticRegression → P(class) = [0.10, 0.85, 0.05]
        ('mlp', mlp),  # Neural Network     → P(class) = [0.30, 0.60, 0.10]
        ('xgb', xgb),  # XGBoost            → P(class) = [0.08, 0.87, 0.05]
    ],
    voting = 'soft',   # average the probability vectors, not just the class labels
)
# Average: [(0.10+0.30+0.08)/3, (0.85+0.60+0.87)/3, (0.05+0.10+0.05)/3]
#        = [0.16, 0.77, 0.07]
# Winner: class 1 (Commercial) — and we can see it was a confident call`],
  ['callout','info','Why "soft" is better than "hard" voting','Hard voting: each model votes for its top class (like an election). If LR is 99% sure and MLP is 51% sure, both count equally. Soft voting: the 99%-confident model gets much more influence because its probability vector is extreme. Soft almost always beats hard.'],
  ['h2','Method 2: Stacking (train a meta-model)'],
  ['p', 'Stacking goes further: instead of simply averaging, it trains a second model (the meta-model) to learn HOW to combine the base model predictions. The meta-model learns: "when XGBoost is very confident but Logistic Regression disagrees, trust XGBoost."'],
  ['code','src/train.py',
`stacking = StackingClassifier(
    estimators = [('lr', lr), ('mlp', mlp), ('xgb', xgb)],
    final_estimator = LogisticRegression(max_iter=1000),  # the meta-model
    stack_method    = 'predict_proba',
    cv              = 5,   # use 5-fold cross-validation to generate training data
                           # for the meta-model (prevents data leakage)
)`],
  ['callout','warning','Why cv=5 in stacking? Preventing data leakage','The meta-model trains on the base models\' predictions. If the base models saw the training rows when generating those predictions, they would be overfitted to them — giving the meta-model unrealistically good signals. cv=5 ensures each row is predicted by a base model fold that never trained on it.'],
  ['code','How stacking works step by step',
`Step 1 — Generate out-of-fold predictions:
  Fold 1: base models train on rows 2-5, then predict rows in fold 1
  Fold 2: base models train on rows 1,3-5, then predict rows in fold 2
  ... repeat for all 5 folds ...
  Result: every training row has a base-model prediction from a model that never saw it

Step 2 — Train meta-model:
  LogisticRegression.fit(base_model_predictions, true_labels)
  It learns which base model to trust in which situations

Step 3 — At test time:
  All 3 base models (now trained on ALL training data) make predictions
  Meta-model combines those predictions → final answer`],
  ['quiz',[
    {q:'VotingClassifier uses voting="soft". What does "soft" mean?',a:1,opts:[
      {t:'Each model votes for one class and the majority wins (like a standard election)',e:'That is voting="hard".'},
      {t:'The probability vectors from each model are averaged; the class with the highest average probability wins',e:'Correct! Averaging preserves how confident each model was — a more informative signal than just a vote.'},
      {t:'Only models with cross-validation accuracy above 0.65 are included',e:'All listed models are included regardless of their individual accuracy.'},
      {t:'Predictions are weighted by training time',e:'VotingClassifier has no such concept.'},
    ]},
    {q:'In StackingClassifier, why is cv=5 used when generating meta-model training data?',a:0,opts:[
      {t:'To ensure the meta-model trains on base-model predictions from buildings those base models never saw — preventing data leakage',e:'Correct! Without out-of-fold generation, base models would predict perfectly on training rows they memorised, giving the meta-model unrealistically optimistic signals.'},
      {t:'It creates 5 separate final stacking models and picks the best one',e:'There is one final stacking model. cv=5 only controls how training data for the meta-model is generated.'},
      {t:'It evaluates stacking on 5 held-out test sets',e:'That would be cross_val_score — a separate evaluation step.'},
      {t:'It selects the best 3 base models from 5 candidates',e:'All three base models are always used.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[10] = Cross-Validation ───────────────────────────────── */
window.BLOCKS[10] = [
  ['p', 'How do you know if your model is actually good, or just got lucky? A single train/test split depends entirely on which buildings happened to end up in the test set. If those 200 buildings are particularly easy, your accuracy looks great. If they are hard, it looks bad.'],
  ['p', 'Cross-validation solves this by splitting the data multiple times. In 5-fold CV: split 1000 buildings into 5 groups of 200. Train on groups 1-4, test on group 5. Then train on 1,2,3,5 and test on group 4. Repeat 5 times. Every building gets tested exactly once. Average the 5 scores.'],
  ['callout','analogy','Five separate exams instead of one','A student who scores 95% on one exam might have just been lucky with the questions. Make them take five different exams — the average is a much more reliable measure of their true ability. Cross-validation is the same idea.'],
  ['math', '5-fold CV: 5 × (train on 800 rows → evaluate on 200 rows) → report mean accuracy ± std'],
  ['h2','Stratified K-Fold — the right way to split imbalanced data'],
  ['p', 'Plain K-Fold might put all the Industrial buildings into one fold by accident. Stratified K-Fold guarantees that each fold has roughly the same proportion of Residential/Commercial/Industrial — the same balance as the full dataset.'],
  ['code','src/evaluation.py',
`def make_skf(n_splits: int = 5, random_state: int = 42) -> StratifiedKFold:
    return StratifiedKFold(
        n_splits     = n_splits,     # 5 folds → 80/20 split each time
        shuffle      = True,         # randomise before splitting (important!)
        random_state = random_state, # same shuffle every run = reproducible
    )
    # If we used plain KFold instead:
    # → some folds might have 0 Industrial buildings in the training set
    # → the model never learns to predict Industrial in that fold
    # → accuracy for that fold is artificially low`],
  ['h2','The complete cross-validation loop'],
  ['code','src/evaluation.py',
`def cross_validate_custom(model_cls, kwargs, X, y, skf=None, needs_scaling=True):

    scores = []

    for train_idx, val_idx in skf.split(X, y):
        # Split data into training and validation for this fold
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        # Scale INSIDE the fold (correct!) — not outside (data leakage!)
        if needs_scaling:
            scaler  = StandardScaler()
            X_train = scaler.fit_transform(X_train)
            X_val   = scaler.transform(X_val)

        # Train a fresh model on this fold
        model = model_cls(**kwargs)
        model.fit(X_train, y_train)

        # Evaluate on the held-out validation fold
        scores.append(accuracy_score(y_val, model.predict(X_val)))

    return np.array(scores)   # e.g. [0.61, 0.64, 0.58, 0.66, 0.62]

# Report: mean ± std
scores = cross_validate_custom(AttentionClassifier, {'w': 2.0}, X, y, skf)
print(f"{scores.mean():.3f} ± {scores.std():.3f}")
# → "0.622 ± 0.028"  ← reliable, low-variance estimate`],
  ['callout','info','What accuracy and std tell you','0.62 ± 0.03 means: the model correctly classifies 62% of buildings on average, with a standard deviation of 3 percentage points across 5 folds. Low std = the model is consistent regardless of which buildings it trains on. High std = the model is sensitive to which data it sees.'],
  ['callout','warning','The accuracy ceiling on this dataset','The EnergyTypeNet model powering GradCurve achieves ~60–67% CV accuracy on the core (2-feature) set. This is not a bug or a weak model. Residential and Commercial buildings overlap heavily in Energy × Sqft space. No classifier — not even XGBoost — can separate them perfectly. The ceiling is caused by the data, not the models.'],
  ['quiz',[
    {q:'What does each number in the array returned by cross_validate_custom() represent?',a:2,opts:[
      {t:'The training accuracy on one fold',e:'Training accuracy is not computed — only validation (held-out) accuracy matters.'},
      {t:'The cross-entropy loss on the validation set',e:'accuracy_score computes accuracy (proportion correct), not loss.'},
      {t:'The accuracy on the held-out validation fold for that split',e:'Correct! Each of the 5 numbers is from a different train/test split.'},
      {t:'The mean accuracy across all folds so far',e:'The mean is computed afterward with scores.mean().'},
    ]},
    {q:'Why use StratifiedKFold instead of plain KFold?',a:1,opts:[
      {t:'StratifiedKFold runs 10× faster due to a more efficient splitting algorithm',e:'Speed is not the reason — both are fast.'},
      {t:'Stratification ensures each fold has the same class proportion (Res/Com/Ind ratio), preventing a fold from accidentally having 0 Industrial buildings to train on',e:'Correct! On imbalanced datasets, plain KFold can create folds with almost no examples of the rare class.'},
      {t:'StratifiedKFold uses more training data per fold than plain KFold',e:'Both use the same 80/20 split — same amount of training data.'},
      {t:'StratifiedKFold applies SMOTE oversampling automatically inside each fold',e:'SMOTE is a separate step that must be applied manually.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[11] = Evaluation Metrics ─────────────────────────────── */
window.BLOCKS[11] = [
  ['p', 'Accuracy (% correct) is a great starting point, but it hides important details. A model that always guesses "Commercial" achieves 33% accuracy — but it completely fails at identifying Residential and Industrial buildings.'],
  ['p', 'We need per-class metrics. For each class (say, Industrial), we ask three questions: Of all Industrial buildings we predicted, how many were actually Industrial? (Precision). Of all actual Industrial buildings, how many did we find? (Recall). A single score combining both? (F1).'],
  ['callout','analogy','Precision and Recall with a fishing net','Precision: of all the fish you caught, what fraction were the right species? (Low precision = lots of wrong fish.) Recall: of all the right species in the lake, what fraction did you catch? (Low recall = missed many.) A good net is both precise AND has high recall.'],
  ['math', 'Precision_k = TP / (TP + FP)      Recall_k = TP / (TP + FN)      F1_k = 2 × P × R / (P + R)'],
  ['p', 'TP (True Positive): you predicted Industrial and the building IS Industrial. FP (False Positive): you predicted Industrial but the building is NOT (false alarm). FN (False Negative): the building IS Industrial but you predicted something else (a miss).'],
  ['h2','The confusion matrix — seeing all errors at once'],
  ['p', 'A confusion matrix is a grid showing every type of mistake. Rows = actual class. Columns = predicted class. The diagonal (top-left to bottom-right) = correct predictions. Every off-diagonal cell = a type of mistake.'],
  ['code','Example confusion matrix — row-normalised (each row sums to 1.0)',
`                 Predicted →
                 Residential  Commercial  Industrial
Actual ↓  Res  [    0.72         0.21        0.07   ]  ← 72% correctly identified
          Com  [    0.18         0.69        0.13   ]  ← 69% correctly identified
          Ind  [    0.05         0.11        0.84   ]  ← 84% correctly identified

Reading off-diagonal errors:
  Row 0, Col 1 = 0.21 → 21% of Residential buildings were mislabelled as Commercial
  Row 1, Col 0 = 0.18 → 18% of Commercial buildings were mislabelled as Residential
  These two classes overlap heavily in the Energy × Sqft feature space.

The diagonal of a row-normalised confusion matrix = per-class RECALL.`],
  ['h2','How it is computed'],
  ['code','src/evaluation.py',
`def plot_confusion_matrices(named_models, y_test, figsize=(15, 9)):

    for ax, (title, model, X) in zip(axes_flat, named_models):
        y_pred = model.predict(X)
        acc    = accuracy_score(y_test, y_pred)

        # Show raw counts in the confusion matrix grid
        ConfusionMatrixDisplay.from_predictions(
            y_test, y_pred,
            display_labels = ['Residential', 'Commercial', 'Industrial'],
            ax             = ax,
            colorbar       = False,
            cmap           = 'Blues',    # darker = more predictions
        )
        ax.set_title(f'{title}  acc={acc:.2f}')

        # To see recall on the diagonal instead of raw counts:
        # cm_normalised = cm / cm.sum(axis=1, keepdims=True)`],
  ['quiz',[
    {q:'A model always predicts "Commercial" for every building. What is its Recall for the Residential class?',a:0,opts:[
      {t:'0.0 — the model never predicts Residential, so TP = 0 and Recall = 0 / (0 + FN) = 0',e:'Correct! Recall measures how many actual Residentials you found. If you never predict Residential, you find zero of them.'},
      {t:'1.0 — the model makes a prediction for every building, so it never misses one',e:'Recall is about whether you correctly IDENTIFIED the class, not just made a prediction.'},
      {t:'0.33 — equal to the class frequency in a balanced 3-class problem',e:'0.33 is the naive baseline ACCURACY, not Recall for a specific class.'},
      {t:'Undefined — you cannot compute Recall when a class is never predicted',e:'Recall = TP / (TP + FN). FN is definitely non-zero here, so the formula gives 0.'},
    ]},
    {q:'Dividing a confusion matrix row by its row sum converts it to a "row-normalised" matrix. What does the diagonal of this normalised matrix show?',a:3,opts:[
      {t:'Precision per class — of all buildings predicted as class k, what fraction was actually class k',e:'Precision uses column sums. Row normalisation gives Recall, not Precision.'},
      {t:'The raw count of correct predictions per class',e:'Dividing by row sums converts counts to proportions — no longer raw counts.'},
      {t:'The F1 score per class',e:'F1 requires both Precision and Recall; it is not computed by simple row normalisation.'},
      {t:'Recall per class — of all actual class-k buildings, what fraction was correctly identified',e:'Correct! Row sum = total actual class-k buildings. Diagonal = TP. So diagonal / row sum = TP / (TP + FN) = Recall.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[12] = Decision Boundaries ────────────────────────────── */
window.BLOCKS[12] = [
  ['p', 'A decision boundary is a line (or curve) in feature space that separates the classes. On one side of the line, the model predicts "Residential". On the other side, "Commercial". Visualising this line tells you a LOT about what a model has learned.'],
  ['p', 'We draw the boundary by asking the model: "what would you predict for EVERY possible combination of Energy Consumption and Square Footage?" We colour each point in a 2D grid by the predicted class, then overlay the real training buildings. The result shows the decision surface.'],
  ['callout','analogy','Colouring a map','Imagine a map where blue = ocean, green = land, yellow = desert. The borders between colours are the "decision boundaries". In our case, blue = Residential, orange = Commercial, red = Industrial — and we are mapping Energy vs. Square Footage space.'],
  ['h2','Different models draw very different boundaries'],
  ['callout','info','Linear classifiers (Logistic Regression)','LogisticRegressionOvR and Softmax draw straight lines. They can only separate classes that are linearly separable. On our data, Commercial and Residential overlap — a straight line cannot perfectly separate them.'],
  ['callout','info','Non-linear classifiers (XGBoost, Attention, MLP)','XGBoost draws staircase-shaped boundaries (axis-aligned rectangle cuts). AttentionClassifier draws smooth curves that follow local data density. MLP draws smooth curved boundaries. All of them can capture more complex shapes than a straight line.'],
  ['h2','How the boundary plot is built'],
  ['code','src/evaluation.py',
`def plot_decision_boundaries(named_models, X_sc, y, h=0.06):
    # h = grid step size (smaller h = finer resolution = slower plot)

    # Find the range of scaled energy and sqft values
    x0_min, x0_max = X_sc[:, 0].min() - 0.5, X_sc[:, 0].max() + 0.5
    x1_min, x1_max = X_sc[:, 1].min() - 0.5, X_sc[:, 1].max() + 0.5

    # Create a dense grid covering the whole feature space
    xx, yy = np.meshgrid(
        np.arange(x0_min, x0_max, h),   # e.g. [-2.0, -1.94, -1.88, ..., +2.5]
        np.arange(x1_min, x1_max, h),
    )

    for ax, (title, model, grid_X) in zip(axes_flat, named_models):
        # Ask the model to predict the class at EVERY grid point
        Z = model.predict(grid_X).reshape(xx.shape)

        # Colour each grid point by predicted class
        ax.pcolormesh(xx, yy, Z, cmap=CMAP_LIGHT, alpha=0.65)

        # Overlay the actual training buildings (coloured by true class)
        ax.scatter(X_sc[:, 0], X_sc[:, 1], c=y, cmap=CMAP_BOLD,
                   edgecolors='k', s=15)`],
  ['callout','warning','Why accuracy saturates at ~65% on core features','Looking at the decision boundary plot, you will see the blue (Residential) and orange (Commercial) regions overlapping heavily in the centre. No matter how complex your boundary is, buildings in that overlapping region are genuinely ambiguous. Adding more features (energy per sqft, occupancy density) moves those buildings apart and raises the accuracy ceiling.'],
  ['quiz',[
    {q:'The grid step h=0.06 in plot_decision_boundaries controls resolution. What happens if you set h=0.001?',a:1,opts:[
      {t:'The model becomes more accurate because it evaluates more points',e:'The grid resolution only affects how the boundary is DRAWN — not the model\'s actual decision function.'},
      {t:'The grid becomes enormous — millions of points — making the plot take minutes to render',e:'Correct! Grid size scales as (range/h)². Reducing h from 0.06 to 0.001 makes the grid 3 600× larger.'},
      {t:'The boundary becomes straight because there are too many grid points',e:'The boundary shape comes entirely from the model, not the grid resolution.'},
      {t:'X_sc needs to be re-normalised to work with a finer grid',e:'The grid is already in scaled space.'},
    ]},
    {q:'AttentionClassifier draws curved boundaries that follow local data clusters. What happens to those boundaries as bandwidth w increases?',a:2,opts:[
      {t:'The boundaries become more jagged and irregular',e:'More jagged is the small-w (very local) behaviour.'},
      {t:'The model only looks at the single nearest training point at each grid location',e:'That is w → 0 (1-nearest-neighbour) behaviour.'},
      {t:'The boundaries smooth out until they reflect only the global class proportions — nearly flat boundaries with no local curves',e:'Correct! Large w = all training buildings get equal weight = no local sensitivity = smooth, near-straight boundary.'},
      {t:'The coloured regions collapse to a single class (the majority)',e:'The model still predicts all three classes; the regions just become equal-weighted averages.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[13] = MLflow ──────────────────────────────────────────── */
window.BLOCKS[13] = [
  ['p', 'Imagine you run your training script 20 times with different settings — different feature sets, different model types, different hyperparameters. How do you remember which settings gave you 68% accuracy vs 63%? Which model file came from which run?'],
  ['p', 'MLflow is an experiment tracker. Every time you run train.py, MLflow automatically records: (1) the settings you used (params), (2) the accuracy you achieved (metrics), and (3) the trained model file (artifact). You can then compare all runs in a web UI.'],
  ['callout','analogy','A lab notebook for your ML experiments','A chemist writes down every experiment: what chemicals they used, what temperature, what the result was. MLflow is your digital lab notebook for ML: what settings you used, what accuracy you achieved, where the model is saved.'],
  ['h2','The three things MLflow records'],
  ['code','src/train.py',
`def log_to_mlflow(output: dict, model_path: Path, feature_set: str) -> None:
    mlflow.set_experiment('EnergyTypeNet')   # group all runs under one project name

    with mlflow.start_run(run_name=f'train-{feature_set}'):

        # PARAMS: what did you set BEFORE training? (inputs)
        mlflow.log_param('feature_set', feature_set)  # e.g. 'core', 'all'
        mlflow.log_param('best_model',  output['best_name'])

        # METRICS: what did the model ACHIEVE? (outputs — measured after training)
        for model_name, metrics in output['results'].items():
            mlflow.log_metric(f'{model_name}_cv_mean', metrics['cv_mean'])
            mlflow.log_metric(f'{model_name}_cv_std',  metrics['cv_std'])

        # ARTIFACT: save the trained model file so you can reload it later
        mlflow.sklearn.log_model(
            output['best_model'],
            name='model',
            registered_model_name='EnergyTypeNet',
        )
        mlflow.log_artifact(str(model_path), artifact_path='joblib')`],
  ['h2','Running it and viewing the results'],
  ['code','Terminal commands',
`# 1. Train the model and log everything to MLflow
python -m src.train --feature-set core

# 2. Open the MLflow web UI (shows all your experiments)
mlflow ui
# → visit http://localhost:5000 in your browser
# → see a table: Run Name | feature_set | best_model | cv_mean | cv_std
# → click any run to see detailed metrics and download the model

# 3. Train without MLflow (used in CI/CD where no server is running)
python -m src.train --feature-set core --no-mlflow`],
  ['callout','info','Params vs Metrics — the key distinction','Params are things you CHOOSE before training: which feature set, which model type, how many trees. Metrics are things you MEASURE after training: accuracy, loss, F1 score. In the MLflow UI, params appear in one column and metrics in another — so you can easily ask "which settings gave the best accuracy?"'],
  ['callout','warning','The --no-mlflow flag for CI','GitHub Actions CI runs in the cloud with no MLflow tracking server. Without the --no-mlflow flag, train.py would try to connect to a server that does not exist and crash. The flag simply skips all mlflow.* calls so the training pipeline runs cleanly in CI.'],
  ['quiz',[
    {q:'What is the difference between mlflow.log_param() and mlflow.log_metric()?',a:0,opts:[
      {t:'log_param records inputs you set before training (e.g. feature_set="core"). log_metric records outputs measured after training (e.g. cv_mean=0.64)',e:'Correct! The distinction is input vs. output — or "what you chose" vs. "what you measured".'},
      {t:'log_param only accepts strings; log_metric only accepts numbers',e:'Both can accept numbers. The distinction is conceptual, not about data types.'},
      {t:'They are interchangeable — MLflow treats them identically',e:'MLflow stores and displays them in separate columns in the UI.'},
      {t:'Only log_metric supports comparing across multiple runs',e:'Both params and metrics can be compared across runs in the MLflow UI.'},
    ]},
    {q:'Why does train.py have a --no-mlflow flag?',a:2,opts:[
      {t:'MLflow is not installed in the Docker container',e:'requirements.txt includes mlflow — it is installed everywhere.'},
      {t:'MLflow logging doubles training time',e:'Logging is negligible compared to the time spent training models.'},
      {t:'GitHub Actions CI has no MLflow tracking server running — mlflow.* calls would fail trying to connect to a non-existent server',e:'Correct! The flag makes the full training pipeline work in server-less environments like CI.'},
      {t:'--no-mlflow also skips joblib.dump() to save disk space',e:'joblib.dump() always runs — only the mlflow.* calls are skipped.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[14] = FastAPI ─────────────────────────────────────────── */
window.BLOCKS[14] = [
  ['p', 'You trained a model and saved it as a file. Now how do other applications use it? They should not need to know Python or ML — they just want to send some building data and get a prediction back.'],
  ['p', 'FastAPI creates a web service (REST API) around the model. Other applications send a JSON request over HTTP, and the API returns a JSON response with the predicted class and probabilities. This is how the trained model becomes a usable service.'],
  ['callout','analogy','The model becomes a vending machine','Before FastAPI: you need a Python environment and ML knowledge to use the model. After FastAPI: anyone sends a request (insert features), the vending machine processes it (runs the model), and spits out an answer (predicted class + probabilities). No Python knowledge needed.'],
  ['h2','Validating inputs with Pydantic'],
  ['p', 'Before the model ever sees the data, Pydantic checks every field. If square_footage is negative, or energy_consumption is missing, FastAPI automatically returns an error before calling predict(). This makes the API robust to bad inputs.'],
  ['code','src/api.py',
`class BuildingFeatures(BaseModel):
    square_footage:      float = Field(..., gt=0)   # required, must be > 0
    number_of_occupants: float = Field(..., ge=0)   # required, must be ≥ 0
    appliances_used:     float = Field(..., ge=0)   # required, must be ≥ 0
    average_temperature: float                       # required, any value
    day_of_week:         str   = 'Weekday'           # optional, defaults to Weekday
    energy_consumption:  float = Field(..., ge=0)   # required, must be ≥ 0

# If a client sends: {"square_footage": -50, "energy_consumption": 5000, ...}
# FastAPI automatically returns:
# HTTP 422 Unprocessable Entity
# {"detail": [{"loc": ["body","square_footage"], "msg": "ensure this value is greater than 0"}]}`],
  ['h2','Loading the model once at startup'],
  ['code','src/api.py',
`artifact = None

def get_model_artifact() -> dict:
    global artifact
    if artifact is None:
        # Load model file from disk — only happens ONCE when the server starts
        # Loading takes ~500ms. We do NOT want this on every request!
        artifact = load_artifact()
    return artifact

@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model_artifact()   # load model when server starts
    yield                  # server runs here (handles requests)

app = FastAPI(title='EnergyTypeNet API', version='1.0.0', lifespan=lifespan)`],
  ['h2','The prediction endpoint'],
  ['code','src/api.py',
`@app.post('/predict')
def predict(features: BuildingFeatures) -> Dict:
    # FastAPI + Pydantic already validated all fields before we get here
    row = pd.DataFrame([{
        'Energy Consumption':  features.energy_consumption,
        'Square Footage':      features.square_footage,
        'Number of Occupants': features.number_of_occupants,
        'Appliances Used':     features.appliances_used,
        'Average Temperature': features.average_temperature,
        'Day of Week':         features.day_of_week,
    }])
    result = predict_dataframe(row, get_model_artifact())[0]
    return result

# Example request and response:
# POST /predict with body:  {"square_footage": 1500, "energy_consumption": 5000, ...}
# Response:
# {
#   "class": "Residential",
#   "probabilities": {"Residential": 0.71, "Commercial": 0.22, "Industrial": 0.07}
# }`],
  ['quiz',[
    {q:'Why does get_model_artifact() use a global variable and only load the model if it is None?',a:1,opts:[
      {t:'FastAPI route handlers cannot access the file system',e:'File I/O is perfectly valid in route handlers.'},
      {t:'joblib.load() reads a multi-MB file from disk in ~500ms. Loading it fresh on every request would make the API unusably slow',e:'Correct! Load once at startup, reuse for every request. Same concept as database connection pooling.'},
      {t:'Two concurrent requests might both load the file and cause a conflict',e:'Model objects are read-only at inference — concurrent reads are perfectly safe.'},
      {t:'The lifespan context manager forbids file I/O after the yield statement',e:'File I/O after yield is allowed. That section is for cleanup like closing database connections.'},
    ]},
    {q:'BuildingFeatures declares energy_consumption = Field(..., ge=0). A client sends energy_consumption = -500. What happens?',a:0,opts:[
      {t:'FastAPI returns HTTP 422 Unprocessable Entity. The predict() function body never runs',e:'Correct! Pydantic validates fields BEFORE the route handler runs. Invalid input is rejected automatically.'},
      {t:'model.predict() receives -500 and returns a garbage prediction',e:'Pydantic rejects invalid input before predict() is called.'},
      {t:'FastAPI returns HTTP 400 Bad Request',e:'Pydantic validation errors return 422, not 400.'},
      {t:'The negative value is silently replaced with 0',e:'Field(..., ge=0) rejects the value with an error — it does not silently fix it.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[15] = Docker ──────────────────────────────────────────── */
window.BLOCKS[15] = [
  ['p', 'You have a working ML service on your laptop. Now you want to deploy it to a server in the cloud. The problem: the server runs a different operating system, different Python version, different packages. "It works on my machine" is not good enough.'],
  ['p', 'Docker solves this by packaging everything into a container: the operating system layer, Python, all packages, your code, and even the trained model. The container runs identically everywhere — your laptop, GitHub CI, AWS, or your colleague\'s machine.'],
  ['callout','analogy','Docker is like a shipping container','Before shipping containers, cargo was loaded differently on every ship — chaotic and unreliable. Shipping containers standardised everything: same size, same locks, fits on any ship or truck. Docker is the shipping container for software. Your application is packed in a standard container that runs the same way everywhere.'],
  ['h2','The Dockerfile — building the container step by step'],
  ['code','Dockerfile',
`FROM python:3.12-slim    # start with a minimal Linux + Python 3.12 image

WORKDIR /app             # all commands run from /app inside the container

# Step 1: Install Python packages
# We copy ONLY requirements.txt first (not the code)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Why copy requirements.txt separately? DOCKER LAYER CACHING!
# If you later change only your Python code (not requirements.txt),
# Docker skips this slow step (2-5 min) and reuses the cached layer.

# Step 2: Copy the rest of the code
COPY . .

# Step 3: Train the model and save it inside the container
# (at BUILD time, not at runtime — container starts instantly)
RUN python -m src.train --feature-set core --no-mlflow

# Declare that the container listens on port 8000
EXPOSE 8000

# Step 4: When the container STARTS, launch the API server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
#                                        ^^^^^^^^
#              0.0.0.0 = accept connections from outside the container
#              127.0.0.1 would only accept connections from inside (unusable!)`],
  ['h2','Building and running the container'],
  ['code','Terminal',
`# Build the image (runs pip install + model training — takes 2-5 minutes)
docker build -t energytypenet .

# Run a container from the image
# -p 8000:8000 maps port 8000 on your machine to port 8000 in the container
docker run -p 8000:8000 energytypenet

# Test that it is running
curl http://localhost:8000/health
# → {"status": "ok"}

# Send a prediction
curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{"square_footage": 1500, "number_of_occupants": 4,
       "appliances_used": 10, "average_temperature": 20,
       "day_of_week": "Weekday", "energy_consumption": 5000}'
# → {"class": "Residential", "probabilities": {...}}`],
  ['callout','info','Why train at build time, not at runtime?','If we trained in CMD (at container start), every new container instance would wait 30+ seconds before accepting requests. In cloud auto-scaling, this is unacceptable — you might spin up 10 containers simultaneously. Training at build time bakes the model into the image, so containers start instantly.'],
  ['callout','warning','The --no-mlflow flag during docker build','The Docker build environment has no MLflow server running. Without --no-mlflow, the training step would crash trying to connect to a non-existent server. The flag skips all mlflow.* calls so the build succeeds cleanly.'],
  ['quiz',[
    {q:'Why does the Dockerfile copy requirements.txt and run pip install BEFORE copying the rest of the source code?',a:0,opts:[
      {t:'Docker caches each layer. The pip install layer only re-runs when requirements.txt changes. A code-only edit reuses the cached installed packages, saving 2-5 minutes on every rebuild',e:'Correct! This is the most important Docker build optimisation for Python projects.'},
      {t:'Python cannot be started without requirements.txt being present',e:'Python is already in the base image. requirements.txt is only needed by pip.'},
      {t:'COPY . . cannot copy .txt files, so they must be copied separately',e:'COPY . . copies all files, including .txt files.'},
      {t:'pip install must run before any Python files exist to avoid import conflicts',e:'pip install runs package setup scripts that do not import your src/ code.'},
    ]},
    {q:'CMD uses --host 0.0.0.0 instead of --host 127.0.0.1. What would happen with 127.0.0.1?',a:2,opts:[
      {t:'The server would start faster because it skips network interface discovery',e:'The bind address has no meaningful effect on startup speed.'},
      {t:'The API would only accept IPv6 connections',e:'127.0.0.1 is the loopback address for IPv4 only — it has nothing to do with IPv6 mode.'},
      {t:'The server would only accept connections from inside the container itself. docker run -p 8000:8000 would map the port, but nothing from outside could reach it',e:'Correct! 127.0.0.1 is the loopback interface — unreachable from outside the container network namespace.'},
      {t:'Docker would refuse to start the container',e:'Docker starts fine. The problem is reachability, not startup.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[16] = Streamlit Dashboard ────────────────────────────── */
window.BLOCKS[16] = [
  ['p', 'Streamlit is a Python library that turns Python scripts into interactive web apps. You write Python code with widgets (sliders, buttons, dropdowns) and Streamlit renders a web page — no HTML, CSS, or JavaScript needed.'],
  ['p', 'dashboard.py is a 1 000-line Streamlit app. It has three modes: EnergyTypeNet (explore the trained models), Custom Dataset (upload any CSV and run ML on it), and AI Dataset Assistant (AutoML + optional LLM explanations).'],
  ['callout','analogy','Streamlit\'s reruns — like a live spreadsheet','When you change a cell in Excel, the spreadsheet recalculates. When you move a slider in Streamlit, the entire Python script reruns from top to bottom. This is simple but powerful. The caching decorators prevent expensive recalculations (like model training) from happening on every slider move.'],
  ['h2','The two caching decorators'],
  ['p', 'Streamlit reruns the whole script on every interaction. Without caching, this would retrain all models every time you move a slider. Caching saves computed results and returns them instantly on subsequent reruns.'],
  ['code','Caching pattern (educational sketch)',
`# @st.cache_data: caches return value as a file (pickle).
# Best for: DataFrames, numpy arrays, raw data, simple Python objects.
@st.cache_data
def load_energy_data():
    X, y = load_features('data/train_energy_data.csv', 'core')
    return X, y
# First call: reads CSV from disk (~10ms). All later calls: instant from cache.

# @st.cache_resource: keeps the object in memory (no pickle).
# Best for: trained models, database connections, objects that can\'t be pickled.
@st.cache_resource
def train_energy_models(_scaler):
    # _ prefix on _scaler tells Streamlit: "skip hashing this argument"
    X, y = load_energy_data()
    X_sc = _scaler.transform(X)
    ovr     = LogisticRegressionOvR(eta=0.0001, n_iter=1000).fit(X_sc, y)
    softmax = LogisticRegressionSoftmax(eta=0.01, n_iter=1000).fit(X_sc, y)
    attn    = AttentionClassifier(w=2.0).fit(X_sc, y)
    return ovr, softmax, attn
# First call: trains 3 models in ~5 seconds. All later calls: instant from RAM.`],
  ['callout','info','Why cache_resource for models, not cache_data?','cache_data serialises and returns copies of data-like values. Sklearn pipelines are generally serialisable, but a trained model is an expensive shared resource whose identity should be preserved. cache_resource keeps that object in memory so reruns can reuse it without copying or retraining.'],
  ['h2','Three-mode architecture'],
  ['code','dashboard.py (mode switching)',
`mode = st.sidebar.radio(
    'Mode',
    ['EnergyTypeNet', 'Custom Dataset', 'AI Dataset Assistant'],
)

if mode == 'EnergyTypeNet':
    # Predefined pages: Overview, EDA, Model Comparison, Decision Boundaries,
    # Confusion Matrices, ROC Curves, Learning Curves, Live Prediction
    page = st.sidebar.selectbox('Page', ['Overview', 'EDA', ...])

elif mode == 'Custom Dataset':
    # Upload any CSV → select target column → compare 8 models → live prediction
    uploaded = st.file_uploader('Upload CSV', type='csv')
    if uploaded:
        df = pd.read_csv(uploaded)
        # ... target selection, feature selection, model training, evaluation ...

elif mode == 'AI Dataset Assistant':
    # Profile the uploaded dataset, suggest targets, train baselines,
    # answer natural-language questions (with optional Ollama LLM)`],
  ['callout','info','Live Prediction page','The Live Prediction page has st.slider() widgets for Energy Consumption and Square Footage. Every slider move triggers a Streamlit rerun. The models are returned instantly from cache. All five models update their probability bars simultaneously — no server round-trip, no ML computation (the model is already in RAM).'],
  ['quiz',[
    {q:'Why use @st.cache_resource instead of @st.cache_data for trained models?',a:1,opts:[
      {t:'cache_data does not support functions that return multiple values',e:'Both decorators support multiple return values via tuples.'},
      {t:'cache_resource preserves and reuses one expensive model object without repeatedly copying or retraining it',e:'Correct! Resource caching matches the lifecycle and identity of a trained model.'},
      {t:'cache_resource is 10× faster because it uses a hash table',e:'Speed difference is negligible. Safety is the reason.'},
      {t:'Streamlit requires cache_resource for any function with arguments',e:'Both decorators work with functions that take arguments.'},
    ]},
    {q:'dashboard.py uses _ prefix in train_energy_models(_scaler). What does the underscore tell Streamlit?',a:0,opts:[
      {t:'Skip hashing this argument when checking if a cached result can be reused — useful for complex objects like numpy arrays that are slow or impossible to hash',e:'Correct! Without the underscore, Streamlit would try to hash the scaler object on every rerun to check if it changed — which can be slow or raise an error.'},
      {t:'This argument is private and should not appear in the Streamlit UI',e:'The underscore is a Streamlit caching convention, not a UI visibility flag.'},
      {t:'The argument should be passed by reference rather than by value',e:'Python always passes objects by reference. The underscore has no effect on this.'},
      {t:'The function should run in a background thread',e:'Streamlit does not use the underscore prefix for threading.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[17] = GitHub Actions CI ──────────────────────────────── */
window.BLOCKS[17] = [
  ['p', 'Every time you push code to GitHub, you want to know immediately if you broke something. GitHub Actions is an automation tool that runs your tests automatically on every push and pull request — on GitHub\'s servers, not your laptop.'],
  ['p', 'If any test fails, GitHub shows a red ✗ on your pull request and blocks merging. This protects the main branch: no broken code gets merged. If all tests pass, you get a green ✓ and can merge safely.'],
  ['callout','analogy','A robot QA tester who reviews every change','Imagine a quality assurance engineer who tests your code every single time you make a change — not just when you ask them to. GitHub Actions is that robot. It runs 24/7, tests every push, and reports the result in seconds.'],
  ['h2','The complete workflow file'],
  ['code','.github/workflows/ci.yml',
`name: CI

on: [push, pull_request]   # run this workflow on every push and every PR

jobs:
  test:
    runs-on: ubuntu-latest  # run on a fresh Ubuntu virtual machine

    strategy:
      matrix:
        python-version: ['3.11']
    # The current workflow has one matrix entry. Keeping the matrix structure
    # makes it easy to add another supported Python version later.

    steps:
      - uses: actions/checkout@v4     # Step 1: clone your repository

      - uses: actions/setup-python@v5  # Step 2: install Python
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies    # Step 3: install all packages
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests               # Step 4: run the test suite
        run: pytest -q                # -q = quiet mode (only show failures)

      - name: Verify imports          # Step 5: make sure all modules import cleanly
        run: |
          python -c "from src.data import load_features, make_engineered_features"
          python -c "from src.models import AttentionClassifier, MLPCustom, BaggingClassifierCustom"
          python scripts/verify_model_imports.py

  deploy-check:
    needs: test
    runs-on: ubuntu-latest
    # On pull requests and pushes to main, also import dashboard.py,
    # compile the source, scan for API keys and validate Streamlit config.`],
  ['h2','What the tests cover'],
  ['code','tests/ — what each file covers',
`tests/test_data.py
  test_load_features_core_shape()        → X has 2 columns for feature_set="core"
  test_engineered_features_columns()     → make_engineered_features returns 9 columns

tests/test_models.py
  test_attention_proba_shape_and_sum()   → predict_proba rows sum to 1.0
  test_softmax_loss_decreases()          → training loss goes down (gradient works)

tests/test_api.py
  test_health_endpoint()                 → GET /health → {"status": "ok"}
  test_predict_endpoint_returns_proba()  → POST /predict → class + probabilities dict

tests/test_automl.py
  → profiling, target/feature suggestions, preprocessing, baselines, reports and Q&A

tests/test_explainability.py
  → SHAP/LIME routing, local explanations and global importance

tests/test_llm_assistant.py + test_chat_agent.py
  → grounded context, provider fallback, history and follow-up behavior

tests/test_ensemble_custom.py + test_model_package_imports.py
  → custom Bagging/AdaBoost behavior and package compatibility`],
  ['callout','info','Why verify imports separately from tests?','A test suite only covers code that tests explicitly call. If a model-family module has a syntax error in a function that no test calls, pytest -q can miss it — but the module fails when your app imports it in production. The import verification step catches these silent issues by importing every module.'],
  ['quiz',[
    {q:'The current strategy.matrix contains python-version: ["3.11"]. How many test jobs does that matrix create?',a:0,opts:[
      {t:'1 — the matrix runs once for its single version value',e:'Correct. One matrix value creates one test job.'},
      {t:'2 — GitHub always duplicates matrix jobs',e:'Jobs are created from the values explicitly listed.'},
      {t:'5 — one per pytest test file',e:'The matrix is independent of the number of test files.'},
      {t:'4 — two Python versions times two step groups (tests + imports)',e:'Each matrix entry is one job that runs ALL steps sequentially.'},
    ]},
    {q:'pytest -q is used instead of pytest -v. What does -q (quiet mode) do?',a:2,opts:[
      {t:'Runs tests in parallel across multiple CPU cores',e:'Parallelism requires pytest-xdist with the -n flag, not -q.'},
      {t:'Skips any tests marked with @pytest.mark.slow',e:'-q has no effect on test markers.'},
      {t:'Only prints failing tests and a final summary — passing tests produce no output',e:'Correct! In CI, you want clean logs. -v would flood the log with one line per passing test.'},
      {t:'Disables warnings to keep the CI log clean',e:'Use -W ignore to suppress warnings. -q only controls verbosity level.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[18] = AutoML Assistant ───────────────────────────────── */
window.BLOCKS[18] = [
  ['p', 'What if you have a completely different dataset — not buildings, but customer data, medical records, financial transactions? You want to train an ML model on it, but you do not want to manually explore the data, pick features, and configure models.'],
  ['p', 'src/automl.py is a general-purpose ML helper. You upload any CSV and it automatically: profiles every column, suggests which column to predict, recommends which columns to use as features, trains 8 different models, and answers questions about the results.'],
  ['callout','analogy','AutoML as a junior data scientist','Imagine hiring a junior data scientist who is very fast but not creative. They look at every column, count missing values, check data types, try 8 models with default settings, and report back. That is automl.py — it does the routine work so you can focus on the interesting decisions.'],
  ['h2','Step 1: Profile the dataset'],
  ['p', 'The first step is understanding what you have. profile_dataset() examines every column: How many rows? What data type? Any missing values? How many unique values?'],
  ['code','src/automl.py',
`def profile_dataset(df: pd.DataFrame) -> dict:
    rows = []
    for col in df.columns:
        series  = df[col]
        missing = int(series.isna().sum())
        unique  = int(series.nunique(dropna=True))
        rows.append({
            'column':      col,
            'dtype':       str(series.dtype),    # int64, float64, object, etc.
            'missing':     missing,               # raw count of NaN values
            'missing_pct': float(missing / max(len(df), 1)),  # fraction missing
            'unique':      unique,                # number of distinct values
            'example':     _safe_example(series), # one sample value from the column
        })
    return {
        'n_rows':         int(len(df)),
        'n_columns':      int(df.shape[1]),
        'columns':        rows,
        'missing_cells':  int(df.isna().sum().sum()),  # total missing across all columns
        'duplicate_rows': int(df.duplicated().sum()),   # exact duplicate rows
    }`],
  ['h2','Step 2: Suggest the target column'],
  ['p', 'Which column do you want to predict? automl.py scores every column based on naming conventions and data properties. A column named "target" or "label" with 2-10 unique values scores highly.'],
  ['code','src/automl.py',
`def suggest_targets(df: pd.DataFrame) -> list[dict]:
    for col in df.columns:
        score = 0.0

        if 2 <= unique <= MAX_TARGET_CLASSES:  score += 2.0   # right number of classes
        if missing_pct == 0:                   score += 1.0   # no missing values
        if col_lower in {'target', 'label',
                         'class', 'type',
                         'category', 'outcome'}: score += 2.0  # conventional name
        if any(t in col_lower for t in
               ['risk', 'level', 'status',
                'outcome']):                     score += 2.0  # domain keyword
        if col == last_col:                      score += 1.0  # last column convention

    return sorted(suggestions, key=lambda r: r['score'], reverse=True)`],
  ['h2','Step 3: Train 8 baseline models'],
  ['code','src/automl.py',
`def build_baseline_models(task_type: str) -> dict:
    if task_type == 'classification':
        return {
            'Dummy baseline':      DummyClassifier(strategy='most_frequent'),
            # ↑ Always predicts the most common class — our floor to beat

            'Logistic Regression': LogisticRegression(max_iter=2000),
            'KNN':                 KNeighborsClassifier(n_neighbors=3),
            'SVM':                 SVC(),
            'Random Forest':       RandomForestClassifier(n_estimators=200),
            'Gradient Boosting':   GradientBoostingClassifier(),
            'MLP':                 MLPClassifier(hidden_layer_sizes=(64, 32)),
            'XGBoost':             XGBClassifier(...),
        }
    # For regression: Ridge, KNeighborsRegressor, SVR, Random Forest, etc.`],
  ['callout','info','The preprocessing pipeline handles any CSV automatically','build_preprocessor() creates a ColumnTransformer: numeric columns get median imputation + StandardScaler; text/categorical columns get most_frequent imputation + OneHotEncoder. This handles missing values, mixed types, and categorical variables automatically — no manual preprocessing needed for arbitrary datasets.'],
  ['callout','info','Built-in Q&A without an LLM','answer_dataset_question() recognises patterns in the user\'s question ("is there overfitting?", "which model is best?", "are there missing values?") and answers using computed statistics. No internet connection or API key needed. If you have Ollama running locally, llm_assistant.py wraps the same facts in a natural-language prompt for richer answers.'],
  ['quiz',[
    {q:'suggest_targets() gives score += 2.0 if the column name is in {"target","label","class","type","category","outcome"}. What is this heuristic based on?',a:1,opts:[
      {t:'These column names have statistically higher correlation with typical target variables',e:'Mutual information is computed by rank_features(), not suggest_targets().'},
      {t:'These are conventional names that data scientists use for the column they want to predict — a reliable signal in practice',e:'Correct! In community datasets and ML competitions, target columns are almost always named this way.'},
      {t:'These column names appear in sklearn\'s built-in example datasets',e:'The heuristic is based on real-world naming conventions, not sklearn examples.'},
      {t:'Columns with these names are guaranteed to be categorical (not continuous)',e:'A column named "class" could contain numeric codes. The name alone does not guarantee the data type.'},
    ]},
    {q:'build_preprocessor() applies median imputation to numeric columns. Why median instead of mean?',a:2,opts:[
      {t:'Median is faster to compute than mean on large datasets',e:'Both are O(n). Speed is not the reason.'},
      {t:'SimpleImputer does not support strategy="mean"',e:'SimpleImputer explicitly supports mean, median, and most_frequent strategies.'},
      {t:'Median is robust to outliers. A single extreme value (e.g. energy = 1 000 000 kWh) would massively distort the mean but barely shift the median',e:'Correct! For real-world datasets with outliers and data entry errors, median is almost always a safer imputation choice.'},
      {t:'StandardScaler requires median-imputed inputs',e:'StandardScaler works on any numeric values regardless of imputation strategy.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ── BLOCKS[19] = Codebase Tour ──────────────────────────────────── */
window.BLOCKS[19] = [
  ['p', 'You have now learned every ML concept in this project. This final lesson is a bird\'s eye view — a map of every file, how they connect, and how data flows from a CSV file all the way to a prediction served over HTTP.'],
  ['p', 'Reading this after the individual lessons gives you the full picture. You will recognise every function and understand exactly why each piece exists.'],
  ['h2','Directory structure — every file explained'],
  ['code','Project layout',
`building-type-classifier-private/
│
├── src/                         ← All Python source code
│   ├── data.py                  Load + preprocess the CSV data
│   │     LABEL_MAP, FEATURE_COLS, load_raw(), load_features(),
│   │     make_engineered_features()
│   │
│   ├── models.py                Three custom ML classifiers
│   │     AttentionClassifier      (kernel-weighted nearest neighbour)
│   │     LogisticRegressionOvR    (one-vs-rest logistic regression)
│   │     LogisticRegressionSoftmax (joint multi-class softmax)
│   │
│   ├── evaluation.py            Testing and visualisation tools
│   │     make_skf()              StratifiedKFold with fixed random seed
│   │     cross_validate_custom() 5-fold CV with correct in-fold scaling
│   │     plot_decision_boundaries(), plot_confusion_matrices(), plot_learning_curves()
│   │
│   ├── train.py                 Orchestrates the full training pipeline
│   │     build_models()          Creates 9 production candidates
│   │     evaluate_models()       Runs 5-fold CV on all models
│   │     train_best_model()      Refits the winner on all training data
│   │     log_to_mlflow()         Records the run in MLflow
│   │     main() [CLI]            Entry point: python -m src.train --feature-set core
│   │
│   ├── predict.py               Load a saved model and make predictions
│   │     load_artifact()         Reads artifacts/model.joblib
│   │     predict_dataframe()     Runs model on a DataFrame → class + probabilities
│   │
│   ├── api.py                   FastAPI web service
│   │     BuildingFeatures        Pydantic input validation
│   │     GET /health             Liveness check
│   │     POST /predict           Accepts JSON → returns prediction
│   │
│   ├── automl.py                AutoML for arbitrary CSV files
│   │     profile_dataset()       Column-by-column data summary
│   │     suggest_targets()       Score-based target column recommendation
│   │     build_baseline_models() 8 models (classification or regression)
│   │     answer_dataset_question() Pattern-matched Q&A
│   │
│   └── llm_assistant.py         Optional Ollama LLM integration
│         build_dataset_context() Format statistics for LLM prompt
│         stream_ollama()         Stream from local Ollama server
│         answer_with_optional_llm() Use LLM if available, fallback otherwise
│
├── data/
│   ├── train_energy_data.csv    1 000 buildings, 7 columns (training)
│   └── test_energy_data.csv       100 buildings (final holdout — test set)
│
├── tests/                       30+ unit tests for all modules
├── notebooks/                   01–06 Jupyter research notebooks
├── dashboard.py                 Streamlit app (3 modes, ~1 000 lines)
├── Dockerfile                   Build → Train → Expose port 8000
├── requirements.txt             All Python dependencies
└── .github/workflows/ci.yml    Python 3.11 tests plus deploy checks`],
  ['h2','The complete data flow — from CSV to HTTP response'],
  ['code','End-to-end: how data moves through the system',
`① CSV file: data/train_energy_data.csv
   1 000 rows × 7 columns

② src/data.py — load_features(filepath, feature_set='core')
   y = df['Building Type'].map(LABEL_MAP)   → shape (1000,)   integers 0/1/2
   X = df[['Energy Consumption', 'Square Footage']].values → shape (1000, 2)

③ src/evaluation.py — cross_validate_custom()
   For each of 5 folds:
     StandardScaler.fit_transform(X_train)   ← learn scaling from train only
     StandardScaler.transform(X_val)         ← apply same scaling to val
     model.fit(X_train, y_train)
     accuracy_score(y_val, model.predict(X_val))
   → [0.61, 0.64, 0.58, 0.66, 0.62]  → mean=0.622, std=0.028

④ src/train.py — evaluate_models() picks the best model
   train_best_model() refits winner on ALL 1 000 training rows
   joblib.dump({'model': ..., 'feature_set': 'core', 'classes': [...]},
               'artifacts/model.joblib')
   log_to_mlflow()  → records params + metrics in MLflow

⑤ Dockerfile — docker build
   pip install -r requirements.txt
   python -m src.train --feature-set core --no-mlflow
   → model is baked into the Docker image

⑥ src/api.py — FastAPI server starts
   get_model_artifact() loads artifacts/model.joblib ONCE into memory

⑦ HTTP request arrives:
   POST /predict  {"energy_consumption": 5000, "square_footage": 1500, ...}

⑧ Pydantic validates every field (rejects invalid values with HTTP 422)

⑨ predict_dataframe() runs:
   X = row[['Energy Consumption', 'Square Footage']]   (selected by feature_set)
   model.predict(X)        → [0]          (class index)
   model.predict_proba(X)  → [[0.71, 0.22, 0.07]]

⑩ HTTP response:
   {"class": "Residential", "probabilities": {"Residential": 0.71, ...}}`],
  ['callout','info','Where to start reading the code','Start with src/data.py because everything depends on it. Then read the src/models/ family modules, especially linear.py, to understand the custom classifiers. Continue with src/train.py and src/evaluation.py, then src/api.py and dashboard.py to see how the model reaches users.'],
  ['quiz',[
    {q:'train_best_model() calls best_model.fit(X_train, y_train) AFTER cross-validation. Why refit on the full training set?',a:2,opts:[
      {t:'Cross-validation corrupts the model weights, so they must be reset',e:'CV trains temporary copies on 80% of data. The original model object is untouched by cross-validation.'},
      {t:'fit() must be called at least twice for the model to generalise correctly',e:'There is no such rule. fit() is called once on the full training data.'},
      {t:'CV evaluates the model on only 80% of training data per fold. The final deployed model should learn from 100% of available training data',e:'Correct! CV is for evaluation only. We then throw away the CV models and train the final model on all available data.'},
      {t:'joblib.dump() requires a freshly fitted model to serialise correctly',e:'joblib.dump() serialises whatever the model object contains — fit() timing does not matter.'},
    ]},
    {q:'A colleague runs python -m src.train --feature-set all and gets 68% CV accuracy vs 63% for --feature-set core. What does this mean?',a:1,opts:[
      {t:'The core feature set has data leakage that inflates its score',e:'63% < 68%, so core is not inflated — it is genuinely lower.'},
      {t:'The extra 3 features (Number of Occupants, Appliances Used, Average Temperature) contain additional discriminating information that reduces class overlap and raises the accuracy ceiling',e:'Correct! With 5 features instead of 2, the buildings are more separable in feature space.'},
      {t:'The model overfits on all features, which paradoxically increases CV score',e:'Overfitting increases training accuracy but DECREASES CV accuracy.'},
      {t:'The two scores cannot be compared because they use different CV folds',e:'make_skf() uses random_state=42 — the exact same folds every time, regardless of feature set.'},
    ]},
  ,
    {q:'Concept check. Why should you test a model on data it did not train on?',a:2,opts:[
      {t:'Because training data is always stored in a different file format',e:'File format is not the reason. The issue is whether the model generalizes beyond rows it already saw.'},
      {t:'Because unseen data makes the model train faster',e:'Validation does not speed up training. It measures whether training learned a useful pattern.'},
      {t:'Because training accuracy can be overly optimistic when the model memorizes patterns',e:'Correct. Unseen validation or test data reveals whether the model learned general rules.'},
      {t:'Because test data changes the learned weights after training',e:'A proper test set should not update weights. It is only used for evaluation.'},
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
    ]}]],
];

/* ════════════════════════════════════════════════════════════════════════
   EXTENDED EXPLANATIONS — appended to each lesson
   ════════════════════════════════════════════════════════════════════════ */

/* ── Extra content: Lesson 1 — Dataset ──────────────────────────── */
