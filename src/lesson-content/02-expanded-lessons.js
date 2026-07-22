window.BLOCKS[1].push(
  ['h2', 'Why 1 000 training rows and 100 test rows?'],
  ['p', 'Machine learning needs enough examples to learn patterns. With too few rows, the model memorises the data instead of learning general rules. 1 000 rows is small by industry standards, but enough to demonstrate all the key concepts here.'],
  ['p', 'The 100-row test set is kept completely separate. You only look at it once — at the very end — to get an honest measure of performance. If you look at test results during development and adjust your model based on them, your final number will be optimistic (you have been secretly fitting to the test set).'],
  ['callout','info','The 80/20 rule for train/test splits','A common starting split is 80% training, 20% testing. With 1 100 rows total (train + test), the project uses 91/9 — keeping more for training because 1 000 is already small. On large datasets (millions of rows), test sets can be as small as 1-2% because even 1% of 10 million is 100 000 rows — more than enough for reliable evaluation.'],
  ['h2', 'What happens if two buildings have exactly the same features but different labels?'],
  ['p', 'This is called label noise. Two buildings with identical Energy Consumption and Square Footage should have the same type — but one is labelled Residential and the other Commercial. The model cannot learn a consistent rule for this region. This is the main reason accuracy never reaches 100% on real-world data.'],
  ['p', 'You can see this problem in the decision boundary plots (Lesson 12). The overlapping region between Residential and Commercial in Energy × Sqft space is exactly where buildings have similar measurements but different types. No model, no matter how powerful, can solve noise in the labels.'],
  ['callout','warning','Never delete rows just because they seem wrong','If a row looks unusual — a tiny building with very high energy use — it might be correct (a server room in a small closet). Only drop rows if you have a specific technical reason (wrong data type, truly impossible value like negative square footage). Deleting unusual rows removes information about edge cases that real predictions must handle.']
);

/* ── Extra content: Lesson 2 — Feature Engineering ──────────────── */
window.BLOCKS[2].push(
  ['h2', 'How do you know if a new feature is useful?'],
  ['p', 'You add the feature, retrain, and compare CV accuracy. If accuracy goes up, the feature carries useful information the model was not getting before. If accuracy stays the same or drops, the feature is noise that confuses the model.'],
  ['p', 'A more rigorous approach: mutual information. This measures how much knowing the feature reduces uncertainty about the class label. rank_features() in automl.py computes mutual information for every column automatically.'],
  ['callout','info','energy_per_sqft is the most powerful feature in this dataset','When you switch from feature_set="core" (2 raw features) to feature_set="all" (5 features) to engineered features, each step adds a few percentage points of accuracy. The energy_per_sqft ratio alone contributes the largest single boost because it separates Industrial (high energy density) from Residential (low energy density) cleanly — something the raw numbers cannot do.'],
  ['h2', 'What feature engineering looks like in industry'],
  ['p', 'In practice, feature engineering is the most time-consuming and highest-impact part of building an ML model. A data scientist at a bank might spend weeks creating features: days since last login, ratio of failed login attempts, change in spending compared to the same day last year. The ML algorithm is often the last 5% of the work.'],
  ['p', 'Deep learning (very large neural networks) can sometimes learn useful features automatically from raw data — this is one reason it became popular. But for tabular data (spreadsheets), manually engineered features often still outperform deep learning.'],
  ['callout','warning','Feature engineering leaks information if done wrong','If you compute energy_per_sqft using statistics from the test set (e.g. clipping to the test-set maximum), you have cheated. All feature engineering must use only training-set statistics. In this project, clip(lower=1) uses a fixed constant (1), not a data-derived statistic, so it is always safe.']
);

/* ── Extra content: Lesson 3 — Feature Scaling ──────────────────── */
window.BLOCKS[3].push(
  ['h2', 'When do you NOT need to scale?'],
  ['p', 'Decision tree-based models (XGBoost, Random Forest, Gradient Boosting) do not need scaling. A tree asks: "is energy_consumption > 5 000?" Multiplying by 100 changes the threshold to 500 000, but the split is mathematically identical. The relative order of values is all that matters.'],
  ['p', 'Models that need scaling: Logistic Regression, Neural Networks (MLP), Support Vector Machines (SVM), K-Nearest Neighbours (KNN), Principal Component Analysis (PCA). The common thread: these models compute distances, dot products, or gradients — all of which are sensitive to the absolute magnitude of numbers.'],
  ['callout','info','StandardScaler vs MinMaxScaler','StandardScaler (z-score): mean=0, std=1. Works well for most models. Handles outliers reasonably. MinMaxScaler: scales to [0, 1]. Sensitive to outliers — one extreme value compresses everything else into a tiny range. RobustScaler: uses median and interquartile range instead of mean and std — excellent when your data has many outliers. For this project, StandardScaler is the right choice.'],
  ['h2', 'The actual numbers in this project after scaling'],
  ['code', 'What StandardScaler does to a single building',
`# One building with these raw values:
#   Energy Consumption = 5 000 kWh
#   Square Footage     = 1 200 sqft
#
# Training set statistics (learned by scaler.fit(X_train)):
#   Energy: mean = 28 500,  std = 17 300
#   Sqft:   mean = 10 600,  std =  6 400
#
# After scaling:
#   energy_scaled = (5 000 - 28 500) / 17 300 = -1.36
#   sqft_scaled   = (1 200 - 10 600) /  6 400 = -1.47
#
# Interpretation: this building uses much less energy than average
# AND is much smaller than average → probably Residential`],
  ['callout','danger','The most common scaling mistake in interviews','Interviewers at ML companies often ask: "You have a train/test split. Where do you fit the scaler?" The wrong answer: "On all the data." The correct answer: "Fit on training data only, then transform both train and test with the same fitted scaler." This comes up in almost every ML engineering interview because it is such a common real-world mistake.']
);

/* ── Extra content: Lesson 4 — Logistic Regression OvR ─────────── */
window.BLOCKS[4].push(
  ['h2', 'What does the model actually learn? Looking at the weights'],
  ['p', 'After training, you can inspect the weight vector for each binary classifier. If w_energy is large and positive for the Industrial classifier, that means high energy consumption strongly suggests Industrial. If w_sqft is small, square footage does not matter much for that class.'],
  ['code', 'Reading trained weights',
`# After ovr.fit(X_scaled, y):
# ovr.weights_ is a list of 3 weight vectors, one per class

# Class 0 (Residential):
#   w = [-0.4, -0.8, -0.3]   where w[0]=bias, w[1]=energy, w[2]=sqft
#   Negative energy weight: low energy → more likely Residential ✓

# Class 2 (Industrial):
#   w = [0.1, +1.2, +0.5]
#   Large positive energy weight: high energy → strongly predicts Industrial ✓

# This matches intuition: factories use lots of energy.
# The model learned this entirely from the training data, without being told.`],
  ['h2', 'Why is logistic regression still widely used in industry?'],
  ['p', 'Despite being "simple", logistic regression is the most deployed model in commercial settings. Banks use it for credit scoring. Hospitals use it for disease risk prediction. Why? Because it is interpretable: you can explain exactly why a model rejected a loan application ("your debt-to-income ratio contributed -2.3 to the score, which outweighed the positive contribution of your 12-year employment history").'],
  ['p', 'XGBoost or Neural Networks might give 1-2% higher accuracy, but a bank regulator may require you to explain every decision. Logistic regression makes this easy. Interpretability is often more valuable than marginal accuracy gains.'],
  ['callout','info','Learning rate eta and convergence','If eta (learning rate) is too large, the weights overshoot the optimal value and oscillate — accuracy bounces around and never settles. If eta is too small, training converges but takes thousands of iterations. In this project, eta=0.0001 with n_iter=1000 works well for scaled data. On unscaled data, you would need a much smaller eta — another reason scaling matters.']
);

/* ── Extra content: Lesson 5 — Softmax ─────────────────────────── */
window.BLOCKS[5].push(
  ['h2', 'Loss function: cross-entropy and why it works better than accuracy'],
  ['p', 'We want to train the model to maximise accuracy. So why not directly optimise accuracy? Because accuracy is not differentiable — you cannot compute its gradient. A small change to a weight might not change any prediction (you need to cross a threshold), so the gradient is zero almost everywhere. Gradient descent cannot move.'],
  ['p', 'Cross-entropy loss solves this. It penalises the model based on the probability it assigned to the correct class. If the correct class is Residential and the model gives it 90% probability — small loss. If it gives 10% — large loss. The gradient is smooth and informative everywhere. Models trained with cross-entropy end up with high accuracy even though accuracy was never directly optimised.'],
  ['math', 'Cross-entropy = − Σ y_true × log(P_predicted)     (summed over classes and samples)'],
  ['callout','info','What cross-entropy feels like intuitively','Imagine you get 10 points for predicting the correct class. Your score = 10 × log(probability you gave the correct class). If you gave it 100% probability: log(1) = 0 penalty. If you gave it 50%: log(0.5) = -0.3 penalty. If you gave it 1%: log(0.01) = -2 penalty. The model is punished harshly for confident wrong predictions.'],
  ['h2', 'One weight matrix vs three separate weight vectors (OvR)'],
  ['p', 'OvR trains three completely separate models. Each one sees a different binary version of y (one class vs all). Softmax trains one joint model where all three output neurons share the same input and their weights are updated simultaneously. This joint training means the classes compete with each other during training — if the Residential score goes up, the Commercial and Industrial scores feel a corresponding push downward.'],
  ['callout','warning','Softmax probabilities are calibrated but not perfect','Softmax outputs probabilities that sum to 1. But "probability 80% Residential" does not mean the building is Residential 80% of the time in reality. It means the model assigns 80% of its probability mass to Residential. On small datasets, these probabilities can be poorly calibrated — the model might say 95% for a case it actually gets wrong 20% of the time.']
);

/* ── Extra content: Lesson 6 — Attention Classifier ────────────── */
window.BLOCKS[6].push(
  ['h2', 'The connection to modern AI Attention'],
  ['p', 'The "attention" name here is not accidental. The Attention mechanism in Transformers (which powers ChatGPT, GPT-4, and similar models) works by the same principle: every position in a sequence computes a weighted sum over all other positions, where the weights are based on similarity. In this classifier, each test building computes a weighted sum over all training buildings — the same mathematical idea.'],
  ['p', 'The difference: in Transformers, the weights (attention scores) are LEARNED through training. In this classifier, the weights are computed directly from Euclidean distance and never learned. But the concept — "pay more attention to similar things" — is the same.'],
  ['callout','info','Non-parametric means no parameters to learn','Logistic Regression, Softmax, and MLP all have weight vectors or matrices that are optimised during training. AttentionClassifier has only one hyperparameter (w = bandwidth) that you choose before training. The model "remembers" the training data directly. This makes it the most transparent model in the project — you can literally look at which training buildings it is attending to for any prediction.'],
  ['h2', 'How to choose the bandwidth w'],
  ['code', 'Selecting bandwidth with cross-validation',
`# Try several bandwidth values and see which gives the best CV accuracy
bandwidths = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]

for w in bandwidths:
    scores = cross_validate_custom(
        AttentionClassifier, {'w': w}, X_scaled, y, skf
    )
    print(f"w={w:5.1f}  →  {scores.mean():.3f} ± {scores.std():.3f}")

# Typical output:
# w=  0.1  →  0.527 ± 0.045   ← too local (1-NN), very noisy
# w=  1.0  →  0.622 ± 0.028   ← good balance
# w=  2.0  →  0.618 ± 0.031   ← still reasonable
# w= 10.0  →  0.448 ± 0.019   ← too smooth, predicts majority class only`],
  ['callout','warning','Why AttentionClassifier does not generalise well to large datasets','Storing every training example is fine for 1 000 buildings. At 1 million training rows: prediction on 100 test buildings requires 100 × 1 000 000 = 100 million distance calculations. This takes minutes, not milliseconds. For large-scale nearest-neighbour search, specialised algorithms like KD-Trees, Ball Trees, or FAISS (Facebook AI Similarity Search) reduce the cost from O(n) to O(log n) per query.']
);

/* ── Extra content: Lesson 7 — XGBoost ─────────────────────────── */
window.BLOCKS[7].push(
  ['h2', 'What one decision tree actually does'],
  ['p', 'A single decision tree asks a series of yes/no questions. "Is energy_consumption > 15 000? If yes, go right. Is square_footage > 8 000? If yes, predict Industrial." Each question splits the data at one threshold on one feature. The tree keeps splitting until it reaches max_depth (5 in this project) or until further splits would not reduce the error.'],
  ['code', 'A simplified 2-level tree for building classification',
`Tree 1 (the first tree in XGBoost):
  Is energy_consumption > 15 000?
  ├─ YES → Is square_footage > 7 000?
  │         ├─ YES → predict Industrial  (68% correct here)
  │         └─ NO  → predict Commercial  (55% correct here)
  └─ NO  → Is square_footage > 4 000?
            ├─ YES → predict Commercial  (51% correct here)
            └─ NO  → predict Residential (72% correct here)

Tree 2 focuses on the buildings that Tree 1 got wrong.
Tree 3 focuses on the buildings Tree 1 and 2 got wrong.
... after 100 trees, the combined prediction is much more accurate.`],
  ['callout','info','Feature importance in XGBoost','After training, xgb.feature_importances_ shows which features were most useful. A feature is "important" if it appears in many tree splits and those splits reduced the error a lot. In this project, energy_consumption is almost always the most important feature, followed by square_footage. This matches intuition: energy consumption is the clearest signal of building type.'],
  ['h2', 'Why XGBoost wins so many Kaggle competitions'],
  ['p', 'XGBoost is the most commonly winning algorithm on Kaggle (a data science competition platform). The reasons: it handles missing values automatically, does not need feature scaling, works well out of the box with default hyperparameters, has built-in regularisation to prevent overfitting, and trains surprisingly fast even on large datasets due to parallelisation and efficient memory access patterns.'],
  ['callout','warning','XGBoost can overfit on small datasets','With 1 000 training rows and max_depth=5 and 100 trees, XGBoost might overfit — it has enough capacity to memorise the training data. Signs of overfitting: training accuracy >> CV accuracy. Fix: reduce max_depth (try 3 or 4), reduce n_estimators (try 50), or increase the regularisation parameter (add reg_lambda=1.0 or reg_alpha=0.1).']
);

/* ── Extra content: Lesson 8 — Neural Network (MLP) ────────────── */
window.BLOCKS[8].push(
  ['h2', 'Backpropagation in plain English'],
  ['p', 'Backpropagation is the algorithm that computes how much each weight in the network should change. It works by flowing the error backward through the layers — hence the name. If the output was wrong, how much did layer 2 contribute? How much did layer 1 contribute to layer 2 being wrong?'],
  ['p', 'It uses the chain rule from calculus: the total error is the product of small local error gradients at each layer. Each weight gets a number: "increase this weight by X to reduce the error." All weights are then updated simultaneously by gradient descent (the Adam optimizer in this project).'],
  ['callout','analogy','Backprop is like performance reviews in a company','The company (network) makes a mistake (wrong prediction). The CEO (output layer) gets a performance review first. Then the CEO\'s review is "propagated back" — each manager (hidden layer 2) is evaluated on how much they contributed to the CEO\'s mistake. Then each manager\'s review propagates back to their team (hidden layer 1). Everyone gets feedback proportional to their contribution to the mistake.'],
  ['h2', 'What Adam optimizer does differently from basic gradient descent'],
  ['p', 'Basic gradient descent uses the same learning rate for every weight. Adam (Adaptive Moment Estimation) maintains a separate effective learning rate for each weight, adapting it based on how much that weight has been moving recently.'],
  ['p', 'If a weight has been oscillating (up, down, up, down), Adam slows it down. If a weight has been consistently moving in one direction, Adam speeds it up. This makes training much faster and more stable — especially when features are on different scales.'],
  ['code', 'Training with Adam — what you actually see',
`# MLPClassifier trains internally — you cannot see intermediate steps easily.
# But if you run with verbose=True, you see the loss decreasing:
#
# Iteration 1,  loss = 1.099   (random weights — no better than guessing)
# Iteration 10, loss = 0.981   (learning slowly at first)
# Iteration 50, loss = 0.847   (speeding up)
# Iteration 200, loss = 0.731  (converging)
# Iteration 800, loss = 0.694  (nearly converged)
# Converged after 847 iterations  (early stopping triggered)
#
# Lower loss = the model's probability vectors are getting closer to correct.`],
  ['callout','info','When to use MLP vs XGBoost on tabular data','For small tabular datasets (< 10 000 rows): XGBoost almost always wins or ties. It needs no scaling, has fewer hyperparameters to tune, and is less prone to overfitting out of the box. MLP becomes competitive on larger tabular datasets (100 000+ rows). For images, audio, and text: MLP and deeper networks (CNNs, Transformers) dominate because they can learn spatial/sequential patterns that tree models cannot capture.']
);

/* ── Extra content: Lesson 9 — Ensemble Methods ────────────────── */
window.BLOCKS[9].push(
  ['h2', 'When do ensembles NOT help?'],
  ['p', 'If all base models make the same mistakes, combining them helps nothing. If Logistic Regression, MLP, and XGBoost all predict "Commercial" for the same set of ambiguous buildings, the ensemble also predicts "Commercial" for all of them. Diversity is the key ingredient — the base models must make different mistakes.'],
  ['p', 'Diversity comes from: different algorithm families (linear vs trees vs neural nets), different feature subsets, different random seeds, different training subsets. This project gets diversity by using three fundamentally different algorithm types.'],
  ['callout','warning','Ensembles add latency','A fitted voting or stacking prediction runs its three base learners (Logistic Regression, MLP and XGBoost) before combining their probabilities. The production trainer now compares nine candidates—including Extra Trees, HistGradientBoosting, custom Bagging and custom AdaBoost—but only the winning fitted candidate is saved for serving. Measure that saved winner rather than assuming all nine models run per request.'],
  ['h2', 'Stacking in depth: what the meta-model learns'],
  ['p', 'The meta-model (a LogisticRegression) receives a 3-column input for each building: [LR_proba, MLP_proba, XGB_proba]. It learns weights for each base model\'s predictions. These weights are not equal — the meta-model might learn to trust XGBoost much more than Logistic Regression for Industrial buildings, while trusting them equally for Residential.'],
  ['code', 'What the meta-model sees as training data',
`# Each row is one training building (after 5-fold out-of-fold prediction)
# Columns: [LR_pred_class, MLP_pred_class, XGB_pred_class, true_label]
# (With predict_proba, each model gives 3 probabilities — 9 columns total)
#
# Building 1:  LR=[0.70, 0.20, 0.10], MLP=[0.65, 0.25, 0.10], XGB=[0.72, 0.21, 0.07]  → label=0 (Res)
# Building 2:  LR=[0.30, 0.60, 0.10], MLP=[0.40, 0.50, 0.10], XGB=[0.15, 0.80, 0.05]  → label=1 (Com)
# Building 3:  LR=[0.20, 0.30, 0.50], MLP=[0.10, 0.20, 0.70], XGB=[0.05, 0.15, 0.80]  → label=2 (Ind)
#
# The meta LogisticRegression learns: "When XGB says 80%+ Industrial, trust it.
# When LR and MLP disagree, give XGB 2x the weight in the final decision."`],
  ['callout','info','Stacking vs blending','Stacking uses cross-validation to generate out-of-fold predictions (implemented here). Blending is simpler: hold out 20% of training data, train base models on the remaining 80%, generate predictions on the holdout, train meta-model on those predictions. Blending is faster and simpler but wastes 20% of training data. Stacking uses all data efficiently at the cost of complexity.']
);

/* ── Extra content: Lesson 10 — Cross-Validation ────────────────── */
window.BLOCKS[10].push(
  ['h2', 'Choosing the number of folds k'],
  ['p', 'k=5 is the most common choice. Why not k=2? Too little training data per fold — the model trained on 50% of data might be significantly weaker than one trained on 100%, so the CV score underestimates final performance. Why not k=100 (leave-one-out CV)? Computationally expensive: you train 100 models. Also, the 100 test sets each have only 1 example — the variance of the score is enormous.'],
  ['p', 'k=10 is also popular and gives slightly lower variance than k=5. The rule of thumb: k=5 or k=10 for most datasets. On very small datasets (< 100 rows), use k=10 or leave-one-out.'],
  ['callout','info','CV score variance: what the standard deviation tells you','A CV score of 0.62 ± 0.03 means the model scores between ~0.56 and ~0.68 across the 5 folds. Low std (< 0.03) means the model is stable — it performs consistently regardless of which buildings are in the training set. High std (> 0.08) means the model is sensitive to the data it trains on — often a sign of overfitting or a dataset that is too small relative to the model complexity.'],
  ['h2', 'Nested cross-validation for model selection'],
  ['p', 'Here is a subtle problem: if you use the same CV to both select hyperparameters AND report final performance, you are implicitly fitting to the validation sets. The reported score will be optimistic. Solution: nested CV — an outer loop evaluates performance, an inner loop selects hyperparameters.'],
  ['code', 'The right way to select and evaluate a model',
`# WRONG (optimistic bias — hyperparams selected on same folds used for evaluation):
scores = cross_validate_custom(XGBClassifier(max_depth=5), {}, X, y, skf)
print(f"Best depth=5: {scores.mean():.3f}")   # ← biased!

# RIGHT (nested CV):
outer_skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
inner_skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=7)

for train_idx, test_idx in outer_skf.split(X, y):
    X_outer_train, X_outer_test = X[train_idx], X[test_idx]

    # Inner loop: pick best hyperparameter on X_outer_train
    best_depth, best_score = 3, 0
    for depth in [3, 5, 7]:
        inner_scores = cross_validate_custom(
            XGBClassifier, {'max_depth': depth},
            X_outer_train, y[train_idx], inner_skf
        )
        if inner_scores.mean() > best_score:
            best_depth, best_score = depth, inner_scores.mean()

    # Outer loop: evaluate best model on truly held-out X_outer_test
    final_model = XGBClassifier(max_depth=best_depth).fit(X_outer_train, y[train_idx])
    outer_scores.append(accuracy_score(y[test_idx], final_model.predict(X_outer_test)))`],
  ['callout','warning','This project uses simple CV (not nested) for simplicity','For a teaching project, simple 5-fold CV is fine. In a published research paper or a high-stakes production model, use nested CV to avoid optimistic bias. The difference is usually small (1-3%) but matters when you need to know the true expected performance on unseen data.']
);

/* ── Extra content: Lesson 11 — Evaluation Metrics ─────────────── */
window.BLOCKS[11].push(
  ['h2', 'Macro vs weighted averaging'],
  ['p', 'The classification_report from sklearn prints "macro avg" and "weighted avg". Macro: compute F1 for each class independently, then average equally (each class counts the same). Weighted: average F1 by class frequency (a class with 500 examples contributes more than one with 100 examples).'],
  ['p', 'On a balanced dataset (equal class sizes), macro and weighted averages are identical. On an imbalanced dataset (many more Residential than Industrial), macro is more informative for minority classes — it penalises the model equally for failing on rare classes. Weighted is more reflective of overall practical performance.'],
  ['code', 'Example classification report',
`from sklearn.metrics import classification_report
print(classification_report(y_test, y_pred,
                             target_names=['Residential','Commercial','Industrial']))

#                   precision  recall  f1-score  support
# Residential           0.66    0.72      0.69       36
# Commercial            0.62    0.69      0.65       38
# Industrial            0.75    0.54      0.63       26
#
# macro avg             0.68    0.65      0.66      100
# weighted avg          0.67    0.66      0.66      100
#
# Reading this:
# Industrial has the highest precision (0.75) — when we say Industrial, we are right 75% of the time.
# Industrial has the lowest recall (0.54) — we miss 46% of actual Industrial buildings.
# This means our model is CONSERVATIVE about predicting Industrial:
# it only predicts it when very confident, but misses many marginal cases.`],
  ['callout','info','Precision-Recall trade-off','You can always increase precision by predicting a class only when you are very confident (raise the probability threshold). But this reduces recall — you miss more actual positives. The F1 score is the geometric mean of precision and recall, balancing both. The ROC curve (plotted in train.py) shows how this trade-off changes as you adjust the threshold.'],
  ['h2', 'When does accuracy mislead you?'],
  ['p', 'Suppose 90% of buildings are Residential and 5% each are Commercial and Industrial. A model that always predicts "Residential" achieves 90% accuracy — but it is completely useless for identifying the other types. F1 score for Commercial and Industrial would be 0.0, revealing the problem immediately.'],
  ['callout','danger','Always look at per-class metrics on imbalanced data','On the building dataset (roughly balanced: 33% each class), accuracy is a reliable metric. On a fraud detection dataset (0.1% fraud, 99.9% legitimate), accuracy is actively misleading. A model that never detects fraud achieves 99.9% accuracy. Always check recall for the minority class — that is the number that matters for rare but important events.']
);

/* ── Extra content: Lesson 12 — Decision Boundaries ────────────── */
window.BLOCKS[12].push(
  ['h2', 'Adding more features does not just improve accuracy — it changes the geometry'],
  ['p', 'With 2 features (Energy × Sqft), the decision boundary is drawn in 2D space — you can visualise it as a plot. With 5 features, the boundary is a surface in 5D space — impossible to visualise directly. This is the curse of dimensionality.'],
  ['p', 'However, the 5D boundary often separates classes better than the 2D boundary, even though you cannot see it. The accuracy improvement from "core" to "all" features shows this. Feature engineering (Lesson 2) is essentially finding 2D or 3D combinations (like energy_per_sqft) that preserve the useful structure of the higher-dimensional space.'],
  ['callout','info','Linear boundaries are not always bad','For the Residential vs. Industrial separation, a straight line works almost perfectly — they are well-separated in Energy × Sqft space. The overlap is almost entirely between Residential and Commercial, which are close in feature space. Complex non-linear boundaries for the Residential/Industrial boundary would be overfitting, not improving. Logistic Regression gets this right by keeping the boundary simple.'],
  ['h2', 'Reading a decision boundary plot'],
  ['code', 'What different boundary shapes mean',
`Shape            Model                  Meaning
──────────────────────────────────────────────────────────────
Straight line    Logistic Regression    Linear decision function.
                 / Softmax             Works when classes are linearly separable.
                                       Fast to train, easy to interpret.

Staircase/       XGBoost,               Axis-aligned splits.
rectangles       Random Forest          Can capture non-linear patterns but
                                       only with horizontal/vertical cuts.

Smooth curves    MLP,                   Can approximate any boundary shape.
                 AttentionClassifier    More flexible but risks overfitting
                                       on small datasets.

Circular/local   AttentionClassifier    Boundary follows local data density.
"islands"        (small bandwidth)      Very flexible, very prone to overfitting.`],
  ['callout','warning','A perfect-looking boundary on training data is a red flag','If the decision boundary weaves tightly around every training point, the model has memorised the data instead of learning the pattern. This is overfitting — the boundary will fail on new buildings. A good boundary is smooth and follows the general shape of the data, not every individual point. This is why regularisation (L2 penalty in LR, max_depth in XGBoost, alpha in MLP) is so important.']
);

/* ── Extra content: Lesson 13 — MLflow ──────────────────────────── */
window.BLOCKS[13].push(
  ['h2', 'The model registry: from experiment to production'],
  ['p', 'MLflow has a Model Registry where you can promote a model from "experiment" to "staging" to "production". When a new training run beats the current production model, you register the new version. Other services (the FastAPI server, the Streamlit dashboard) can always load the "production" model by name, automatically getting the latest version.'],
  ['code', 'Registering and loading models by name',
`# After a training run, the model is registered automatically:
mlflow.sklearn.log_model(
    model, name='model',
    registered_model_name='EnergyTypeNet'  # ← creates version 1, 2, 3, etc.
)

# The FastAPI server always loads the "Production" alias:
model = mlflow.sklearn.load_model("models:/EnergyTypeNet@Production")
# → if you promote version 7 to Production, the API automatically uses version 7
# → no code changes, no redeployment, just update the alias in MLflow UI`],
  ['h2', 'Comparing runs in the MLflow UI'],
  ['p', 'The real power of MLflow is the comparison view. Select 5 runs in the UI and click "Compare". You see a table: run 1 used feature_set="core" and got 0.62 accuracy. Run 2 used feature_set="all" and got 0.68. Run 3 added feature engineering and got 0.71. The best model is obvious — and you have a complete record of exactly what produced it.'],
  ['callout','info','MLflow alternatives','MLflow is open-source and runs locally. Alternatives: Weights & Biases (wandb.ai — popular for deep learning, excellent visualisations), Neptune.ai, ClearML, DVC (data version control). Cloud providers have their own: AWS SageMaker Experiments, Google Vertex AI Experiments, Azure ML. For a team project, a managed service saves the overhead of running MLflow infrastructure yourself.'],
  ['callout','warning','Reproducibility requires logging everything','If you change the dataset, the random seed, or the feature set but forget to log one of them, you cannot reproduce the best run later. A good practice: log EVERY variable that could affect training. In this project: feature_set, random_state, train file path, and all model hyperparameters. Future-you will thank present-you.']
);

/* ── Extra content: Lesson 14 — FastAPI ─────────────────────────── */
window.BLOCKS[14].push(
  ['h2', 'Testing the API without writing a test file'],
  ['p', 'FastAPI automatically generates an interactive documentation page at /docs. Open it in a browser and you can send test requests directly — no curl, no Postman needed. This is powered by OpenAPI (formerly Swagger). Every endpoint, every field, every validation rule is documented automatically from your Pydantic models.'],
  ['code', 'Testing the API three ways',
`# 1. FastAPI docs (browser) — visit http://localhost:8000/docs after uvicorn starts
#    Click "POST /predict" → "Try it out" → fill in fields → "Execute"

# 2. curl (terminal)
curl -X POST http://localhost:8000/predict \\
  -H "Content-Type: application/json" \\
  -d '{"square_footage":1500,"number_of_occupants":4,"appliances_used":8,
       "average_temperature":21,"day_of_week":"Weekday","energy_consumption":5000}'

# 3. Python requests library
import requests
response = requests.post("http://localhost:8000/predict", json={
    "square_footage": 1500, "number_of_occupants": 4,
    "appliances_used": 8, "average_temperature": 21,
    "day_of_week": "Weekday", "energy_consumption": 5000
})
print(response.json())
# → {"class": "Residential", "probabilities": {"Residential": 0.71, ...}}`],
  ['h2', 'Why FastAPI instead of Flask?'],
  ['p', 'Flask is simpler and has been around longer. FastAPI is faster (built on Starlette + async Python), has automatic validation via Pydantic, automatic docs via OpenAPI, and native async support for high-concurrency scenarios. For an ML prediction API that might serve thousands of requests per second, these differences matter.'],
  ['p', 'Performance benchmark on prediction endpoint: Flask ~2 000 requests/second (synchronous). FastAPI with async ~8 000 requests/second. For the model in this project (predict takes ~2ms), the bottleneck is usually model inference, not the web framework — but the async design future-proofs the API for high concurrency.'],
  ['callout','info','The /health endpoint is not just for humans','GET /health returning {"status": "ok"} is a standard "liveness probe" used by Docker and Kubernetes to check if the container is running. If /health returns an error or times out, the orchestration system automatically restarts the container. This is how production services stay up 24/7 without manual intervention.']
);

/* ── Extra content: Lesson 15 — Docker ──────────────────────────── */
window.BLOCKS[15].push(
  ['h2', 'Docker layers and what gets cached'],
  ['p', 'Every RUN, COPY, and ADD instruction in the Dockerfile creates a new layer. Docker caches layers and reuses them when you rebuild, as long as that layer\'s inputs have not changed. This is why the order of instructions matters.'],
  ['code', 'Efficient vs inefficient Dockerfile',
`# EFFICIENT (cache-friendly):
COPY requirements.txt .
RUN pip install -r requirements.txt    # ← cached unless requirements.txt changes
COPY . .                               # ← invalidates cache only when code changes
RUN python -m src.train --no-mlflow   # ← re-runs when code changes

# INEFFICIENT:
COPY . .                               # ← any code change invalidates everything below
RUN pip install -r requirements.txt    # ← re-runs even for a typo fix in a comment
RUN python -m src.train --no-mlflow

# On a slow connection, pip install takes 3-5 minutes.
# The efficient order saves this time on every code change.`],
  ['h2', 'Running multiple services with docker-compose'],
  ['p', 'A production deployment typically needs several containers: the FastAPI prediction service, an MLflow tracking server, a database for experiment records, maybe a Streamlit dashboard. docker-compose lets you define all of these in one YAML file and start them together.'],
  ['code', 'docker-compose.yml concept',
`version: "3.9"

services:
  api:
    build: .                       # build from the Dockerfile in this directory
    ports: ["8000:8000"]           # expose the FastAPI server
    depends_on: [mlflow]           # wait for MLflow to start first

  mlflow:
    image: ghcr.io/mlflow/mlflow   # official MLflow image from GitHub Container Registry
    ports: ["5000:5000"]
    command: mlflow server --host 0.0.0.0

# To start both:  docker-compose up
# To stop both:   docker-compose down`],
  ['callout','info','Docker in cloud deployment','Cloud platforms (AWS ECS, Google Cloud Run, Azure Container Apps) run Docker containers directly. You push your Docker image to a registry (Docker Hub, AWS ECR, Google Artifact Registry) and the cloud platform pulls it and runs it. Every instance runs the exact same image — no configuration drift, no "it works on my machine" problems. This is the standard deployment model in modern software engineering.']
);

/* ── Extra content: Lesson 16 — Streamlit ───────────────────────── */

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
  ['h2', 'How Streamlit\'s rerun model affects performance'],
  ['p', 'Every widget interaction triggers a full Python script rerun. This sounds inefficient, but with caching it is fast: only the lines that depend on the changed widget actually do work. Lines that hit @st.cache_data or @st.cache_resource return their cached result in microseconds.'],
  ['p', 'The key skill in Streamlit development: identifying what is expensive (model training, CSV loading, API calls) and wrapping it in a cache decorator. Anything that runs in under 100ms can be left uncached — the rerun overhead is negligible.'],
  ['code', 'Identifying what to cache',
`# These are expensive — must be cached:
@st.cache_resource  def train_models(): ...           # 5-10 seconds
@st.cache_data      def load_energy_data(): ...       # 50ms (file I/O)
@st.cache_data      def compute_confusion_matrix(): ...  # 20ms

# These are cheap — no need to cache:
def format_prediction_bar(prob): ...    # < 1ms, pure math
def build_sidebar(): ...                # < 5ms, just drawing UI
def render_result_card(class_name): ... # < 1ms, just HTML`],
  ['h2', 'The Custom Dataset mode — how it handles any CSV'],
  ['p', 'When a user uploads a CSV, Streamlit passes it to automl.py. The profiler examines every column. The user selects the target column. The preprocessor handles categorical columns (OneHotEncoder), missing values (median/mode imputation), and different numeric scales (StandardScaler). The current builder offers eleven classification candidates and eleven regression candidates when optional XGBoost is available, including a dummy baseline; unavailable optional models are skipped cleanly. Cross-validation results appear with task-appropriate metrics.'],
  ['callout','info','Why is there a "Download results" button?','Users often run the dashboard in a browser session that ends. The results — which feature set gave the best accuracy, which model won, the confusion matrix — are computed in memory and lost when the session closes. The download button converts results to a CSV or JSON file that the user can save. This is a standard Streamlit UX pattern for analytical tools.'],
  ['callout','warning','Streamlit is not a production API','Streamlit is excellent for data exploration, prototyping, and internal tools. It is NOT designed for production traffic — each user session runs a full Python process, which does not scale well beyond dozens of concurrent users. For a public-facing prediction service, use FastAPI (Lesson 14). Use Streamlit for data scientists and internal stakeholders, FastAPI for engineers building on top of the model.']
);

/* ── Extra content: Lesson 17 — GitHub Actions CI ───────────────── */
window.BLOCKS[17].push(
  ['h2', 'How to add a new test'],
  ['p', 'Every new function in src/ should have at least one test in tests/. A test is just a function whose name starts with test_ and uses assert statements to check that outputs are correct. Pytest automatically discovers and runs all such functions.'],
  ['code', 'Writing a new test for make_engineered_features',
`# tests/test_data.py

def test_engineered_features_has_9_columns():
    """make_engineered_features() should always return 9 columns."""
    import pandas as pd
    from src.data import make_engineered_features

    # Create a minimal DataFrame with just the required columns
    df = pd.DataFrame({
        'Energy Consumption':  [5000, 30000, 60000],
        'Square Footage':      [1200,  8000, 20000],
        'Number of Occupants': [   4,    50,    15],
        'Appliances Used':     [   8,    30,   100],
        'Average Temperature': [  20,    22,    18],
        'Day of Week':         ['Weekday', 'Weekend', 'Weekday'],
    })

    X, col_names = make_engineered_features(df)

    assert X.shape[1] == 9, f"Expected 9 columns, got {X.shape[1]}"
    assert len(col_names) == 9
    assert 'energy_per_sqft' in col_names    # key engineered feature`],
  ['h2', 'Beyond testing: what else can go in a GitHub Actions workflow'],
  ['p', 'The current workflow runs tests. You can add many more steps in the same file: automatic code formatting check (ruff format --check), type checking (mypy), security scanning (bandit), and even automatic deployment to a server if all tests pass.'],
  ['code', 'Extended workflow with linting and type checks',
`# Add these steps BEFORE "Run tests":

- name: Lint with ruff
  run: ruff check src/ tests/
  # Fails if any code violates style rules.
  # Catches: unused imports, undefined variables, dangerous patterns.

- name: Type check with mypy
  run: mypy src/
  # Fails if type annotations are wrong.
  # Catches: passing a string where a float is expected.

- name: Security scan with bandit
  run: bandit -r src/ -ll
  # Fails if code has known security vulnerabilities.
  # -ll = only report medium and high severity issues.`],
  ['callout','info','GitHub Actions minutes are free for public repositories','For public repos (open source), GitHub Actions is completely free with no limits. For private repos (like this one), you get 2 000 minutes per month on the free plan. Each CI run takes 2-4 minutes, so you can run it 500-1 000 times per month before being charged. This is more than enough for any individual project.']
);

/* ── Extra content: Lesson 18 — AutoML ─────────────────────────── */
window.BLOCKS[18].push(
  ['h2', 'How rank_features() decides which columns matter'],
  ['p', 'After the user selects the target column, automl.py computes mutual information between each feature and the target. Mutual information measures how much knowing a feature reduces uncertainty about the target class.'],
  ['code', 'Mutual information in practice',
`from sklearn.feature_selection import mutual_info_classif

# For the building dataset:
scores = mutual_info_classif(X, y, random_state=42)
# scores = [0.23, 0.18, 0.09, 0.14, 0.07]
# columns = ['Energy Consumption', 'Square Footage', 'Occupants', 'Appliances', 'Temp']

# Energy Consumption (0.23) is most informative.
# Temperature (0.07) is least informative.
# The ranked list helps the user decide which features to include.

# NOTE: mutual information is symmetric and non-negative.
# MI = 0 means the feature carries NO information about the target.
# High MI does not mean the feature is linear — it detects any relationship.`],
  ['h2', 'Limitations of AutoML — what it cannot do'],
  ['p', 'AutoML is excellent at routine tabular ML. It fails at: understanding domain context (a column named "code" might be a zip code or a product code — completely different treatment), detecting data collection errors (a building with -500 kWh energy use might be a recording error or might mean it generates energy), and understanding business constraints (maybe False Negatives for Industrial are 10× more costly than False Positives).'],
  ['p', 'AutoML also cannot reason about causality. High energy use correlates with Industrial buildings, but Industrial buildings do not have high energy use BECAUSE they are industrial in the dataset — the causal direction and the correlation direction happen to align here, but they do not always.'],
  ['callout','analogy','AutoML is like a fast driver who does not know the destination','AutoML drives efficiently and safely within the road rules. But if you ask it to drive to "the best restaurant", it needs you to define what "best" means. A human data scientist brings domain knowledge (what matters in your business), ethical judgement (is this feature fair to use?), and creative feature engineering. AutoML handles the routine execution.'],
  ['callout','info','The Dummy baseline is the most important model','DummyClassifier(strategy="most_frequent") always predicts the most common class. Its accuracy equals the class frequency of the majority class. Any real model must beat this baseline — if it does not, the features contain no useful information. In this project, each class is ~33% of the data, so the Dummy baseline scores ~33%. All models scoring 60%+ are a genuine improvement.']
);

/* ── Extra content: Lesson 19 — Codebase Tour ───────────────────── */
window.BLOCKS[19].push(
  ['h2', 'Extension points: where to add new things'],
  ['p', 'The project is designed to be extensible. Here is exactly where to make changes for common additions:'],
  ['code', 'Adding a new ML model',
`# 1. Implement the model in the appropriate src/models/ module
#    Follow the sklearn API: fit(X, y), predict(X), predict_proba(X)

class MyNewModel:
    def fit(self, X, y):
        # ... train your model ...
        return self

    def predict(self, X):
        return np.argmax(self.predict_proba(X), axis=1)

    def predict_proba(self, X):
        # ... return (n_samples, 3) probability matrix ...
        pass

# 2. Add it to build_models() in src/train.py:
models['my_model'] = make_pipeline(StandardScaler(), MyNewModel())

# 3. Add a test in tests/test_models.py:
def test_my_model_proba_sums_to_1():
    model = MyNewModel().fit(X_small, y_small)
    proba = model.predict_proba(X_small)
    assert np.allclose(proba.sum(axis=1), 1.0)`],
  ['h2', 'Adding a new feature set'],
  ['code', 'Adding a 6th feature set called "temporal"',
`# In src/data.py — add to FEATURE_COLS dict:
FEATURE_COLS = {
    'core':     ['Energy Consumption', 'Square Footage'],
    'extended': [...],
    'all':      [...],
    'temporal': ['Energy Consumption', 'Square Footage', 'Day of Week'],
    #            ↑ Keep Day of Week as text — need LabelEncoder or OneHotEncoder
}

# Then update load_features() to handle categorical columns:
if feature_set == 'temporal':
    df['day_enc'] = (df['Day of Week'] == 'Weekend').astype(float)
    X = df[['Energy Consumption', 'Square Footage', 'day_enc']].values

# Run: python -m src.train --feature-set temporal`],
  ['callout','info','How the website connects to the Python project','This educational website (the one you are reading now) is built separately from the Python ML code. The website lives in website/src/ and runs as a static site served by Flask (website/build.py). The lesson content (this file, lesson-blocks.js) describes what the Python code does but does not import or run it. The Live Predictor demo in the Streamlit dashboard (dashboard.py) is where you actually run the Python code interactively.'],
  ['callout','analogy','Think of the project as a three-layer cake','Layer 1 (bottom): the data and models — src/data.py, the family modules in src/models/, and src/evaluation.py. Layer 2 (middle): the services — src/train.py, src/api.py and dashboard.py. Layer 3 (top): GradCurve explains layers 1 and 2 without importing their Python runtime.']
);

/* ════════════════════════════════════════════════════════════════════════
   COPY-PASTE PROMPTS — appended to every lesson
   Each prompt is ready to paste into Claude or ChatGPT for deeper learning.
   ════════════════════════════════════════════════════════════════════════ */

window.BLOCKS[1].push(
  ['prompt','Dataset & ML Data Prep',
`I am learning machine learning. Explain the concept of a training dataset to me as a complete beginner.

Use this specific example: I have a CSV file with 1 000 buildings. Each row is one building. Columns: Energy Consumption (kWh), Square Footage, Number of Occupants, Appliances Used, Average Temperature, Day of Week, Building Type (Residential / Commercial / Industrial).

Please explain:
1. Why we split data into training and test sets. What is "data leakage" and why is it dangerous?
2. What does it mean to "encode" Building Type as 0, 1, 2? Why can't ML models use text labels?
3. What is X (features) and y (labels)? Give a concrete example using one row of my data.
4. What happens if we have missing values? What are the options for handling them?
5. Give me a simple analogy that explains why we never touch the test set during development.

Use short sentences and simple language. I am not a mathematician.`]
);

window.BLOCKS[2].push(
  ['prompt','Feature Engineering',
`I am learning feature engineering in machine learning. Help me understand it with a specific example.

I have a dataset of buildings with columns: Energy Consumption (kWh) and Square Footage. I want to classify them as Residential, Commercial, or Industrial.

Please explain:
1. Why is "Energy Consumption divided by Square Footage" (energy per sqft) a better feature than raw Energy Consumption alone? Give a concrete example with made-up numbers.
2. What is the general principle behind feature engineering? When should I create ratios? When should I create binary flags?
3. What does "occupancy density" (people per sqft) tell us that raw headcount doesn't?
4. Can you show me 3 more feature engineering ideas I could apply to this building dataset?
5. How do I know if a new engineered feature actually improves my model? What would I measure?

Please use simple language and concrete examples. I am a beginner.`]
);

window.BLOCKS[3].push(
  ['prompt','Feature Scaling',
`I am learning about feature scaling in machine learning. I have a dataset with two very different number ranges: Energy Consumption ranges from 1 000 to 60 000, and Square Footage ranges from 500 to 30 000.

Please explain:
1. Why does this difference in scale cause problems for models like Logistic Regression and Neural Networks, but NOT for XGBoost? Use a concrete analogy.
2. Walk me through StandardScaler step by step with small numbers. Show me the formula and compute an example.
3. What is the difference between StandardScaler, MinMaxScaler, and RobustScaler? When would I pick each one?
4. I have a train set and a test set. At which exact step do I call .fit() on the scaler, and on which data? Why is calling .fit() on the test set wrong? What is "data leakage"?
5. What does a value of -1.5 mean after StandardScaler? What about +2.3?

Use simple language and go step by step. I am just starting to learn ML.`]
);

window.BLOCKS[4].push(
  ['prompt','Logistic Regression',
`I want to understand Logistic Regression for multi-class classification. Please teach me from scratch.

Context: I am classifying buildings as Residential (0), Commercial (1), or Industrial (2) using their Energy Consumption and Square Footage.

Please explain:
1. What is the sigmoid function? Draw it with ASCII art and explain what it outputs.
2. How does One-vs-Rest (OvR) work? Walk me through the three classifiers being trained.
3. What are "weights" in logistic regression? What does a large positive weight mean? A large negative weight?
4. What is gradient descent and how does it update the weights? Explain the math with very small, concrete numbers — not variables.
5. What is L2 regularisation (the "alpha" parameter)? What problem does it solve? What happens if alpha is too large?
6. After training, how does the model pick between the three classes? Walk through a concrete example.

I am a beginner. Use simple language and real numbers where possible.`]
);

window.BLOCKS[5].push(
  ['prompt','Softmax Regression',
`Teach me the difference between One-vs-Rest Logistic Regression and Softmax Regression. I am classifying buildings as Residential, Commercial, or Industrial.

Please explain:
1. What is the softmax function? Why do its outputs always sum to 1? Show the formula and compute an example with made-up scores.
2. Why is softmax more elegant than OvR for multi-class problems?
3. What is cross-entropy loss? Why do we use it instead of directly optimising accuracy?
4. The softmax code subtracts the max value before computing exp(). Why? What would go wrong without this?
5. Can you show a tiny end-to-end example: one building, weight matrix W, compute scores → softmax → probabilities → pick winner? Use made-up numbers.
6. What does overfitting look like in softmax? How does L2 regularisation (alpha parameter) prevent it?

Keep it simple. Use concrete numbers and short sentences.`]
);

window.BLOCKS[6].push(
  ['prompt','Attention & Kernel Methods',
`I want to understand the Attention Classifier (kernel-weighted nearest neighbour) used for building classification.

Please explain:
1. How does this classifier classify a new building? Walk through the algorithm step by step with a tiny example (3 training buildings, 1 test building, 2 features).
2. What does "bandwidth w" control? What happens to predictions when w is very small vs very large?
3. How is this related to the "Attention" mechanism in modern AI like ChatGPT? What is similar and what is different?
4. Why is this called "non-parametric"? What does that mean compared to Logistic Regression which has parameters?
5. What is the computational cost of prediction? Why does it get slow with large training sets?
6. When would this type of model outperform Logistic Regression? When would it fail?

Use simple language. Give concrete examples with small numbers. I am a beginner.`]
);

window.BLOCKS[7].push(
  ['prompt','XGBoost & Gradient Boosting',
`I want to understand XGBoost from scratch. I am using it to classify buildings as Residential, Commercial, or Industrial.

Please explain:
1. What is a decision tree? Draw a tiny one with ASCII art using Energy Consumption and Square Footage as features.
2. What is "boosting"? How does the second tree know what to fix from the first tree?
3. What does "gradient" mean in "gradient boosting"? Where does calculus come in?
4. Why does XGBoost NOT need feature scaling while Logistic Regression does?
5. Explain these hyperparameters in plain English: max_depth=5, learning_rate=0.05, n_estimators=100, subsample=0.8. What does each control?
6. What is "feature importance" in XGBoost? How is it computed and what can I learn from it?
7. What are the signs that my XGBoost model is overfitting? How do I fix it?

Use simple language and concrete examples. I am just starting to learn ML.`]
);

window.BLOCKS[8].push(
  ['prompt','Neural Networks (MLP)',
`Teach me how a Multi-Layer Perceptron (MLP) neural network works. I am using one to classify buildings as Residential, Commercial, or Industrial. My network has 2 input neurons, 40 hidden neurons (layer 1), 20 hidden neurons (layer 2), and 3 output neurons.

Please explain:
1. What is a neuron? What does it compute? Use the formula and compute one step with tiny numbers.
2. What is the activation function (tanh)? Why do we need it? What would happen without it?
3. What is backpropagation in plain English? How does the network "learn" from its mistakes?
4. What is the Adam optimizer? How is it different from basic gradient descent?
5. What is early_stopping=True? How does it prevent overfitting?
6. How many parameters does my network have with 2 input features? Calculate it step by step.
7. When should I use a Neural Network vs XGBoost for tabular data?

Use simple language. Give concrete small examples. I am a beginner.`]
);

window.BLOCKS[9].push(
  ['prompt','Ensemble Methods',
`I want to understand ensemble methods in machine learning. I am combining Logistic Regression, MLP, and XGBoost to classify buildings.

Please explain:
1. Why do ensembles often outperform any single model? What is "diversity" and why does it matter?
2. What is the difference between hard voting and soft voting? Give a concrete example with made-up probabilities.
3. What is stacking? How is it different from voting?
4. Why does stacking use cross-validation (cv=5) to generate training data for the meta-model? What goes wrong without it?
5. When do ensembles NOT help? What conditions make them pointless?
6. In production, what is the trade-off between using an ensemble vs a single model?
7. Can you give me a real-world example where each of these three ensemble methods is the best choice?

Keep it beginner-friendly. Use concrete examples with made-up numbers.`]
);

window.BLOCKS[10].push(
  ['prompt','Cross-Validation',
`Teach me cross-validation from scratch. I am evaluating ML models on a 1 000-row building dataset.

Please explain:
1. Why is a single 80/20 train/test split unreliable? Give a concrete example of how it can mislead you.
2. Walk me through 5-fold cross-validation step by step. What data does each fold train on and test on?
3. What does StratifiedKFold do differently from plain KFold? When does it matter?
4. I get CV scores of [0.61, 0.64, 0.58, 0.66, 0.62]. What is the mean and standard deviation? What does the std tell me about my model?
5. The scaler must be fit INSIDE each fold on training data only. Explain exactly why, with a concrete example of what goes wrong if I fit it once before the loop.
6. What is the difference between the CV score and the final test score? Which should be higher and why?
7. What is nested cross-validation and when do I need it?

Use simple language and step-by-step examples.`]
);

window.BLOCKS[11].push(
  ['prompt','Evaluation Metrics',
`Teach me the key machine learning evaluation metrics. I have a 3-class problem (Residential, Commercial, Industrial buildings).

Please explain:
1. What is the difference between accuracy, precision, recall, and F1? Give a concrete example for the Industrial class.
2. What is a confusion matrix? Draw one for a 3-class problem with made-up numbers and show me how to read it.
3. When is accuracy misleading? Give a concrete imbalanced-class example.
4. What does "row-normalising" a confusion matrix show? What does the diagonal represent?
5. What is the difference between macro-average and weighted-average F1? When should I use each?
6. What is an ROC curve? What does AUC (Area Under Curve) mean? Is AUC=0.85 good?
7. For my building classifier, I want to never miss an Industrial building (factories are dangerous). Which metric should I optimise — precision or recall for Industrial? How do I adjust the threshold?

Keep it concrete. Use the 3-class building example throughout.`]
);

window.BLOCKS[12].push(
  ['prompt','Decision Boundaries',
`I want to understand decision boundaries in machine learning. I am classifying buildings (Residential, Commercial, Industrial) using Energy Consumption and Square Footage.

Please explain:
1. What is a decision boundary? What does it look like for a 2-feature, 3-class problem?
2. How does Logistic Regression's boundary differ from XGBoost's? Why is LR limited to straight lines?
3. What shape does XGBoost draw? What about a Neural Network? What about K-Nearest Neighbours?
4. I see that Residential and Commercial regions overlap in my plot. What does this mean? Can I fix it by using a more complex model?
5. Why does a boundary that perfectly separates ALL training points usually mean the model will fail on new data? What is this called?
6. What does adding more features (going from 2D to 5D) do to the decision boundary? Can I still visualise it?
7. How is the decision boundary related to the probability threshold? How does changing the threshold affect the boundary?

Use simple language and concrete examples.`]
);

window.BLOCKS[13].push(
  ['prompt','MLflow & Experiment Tracking',
`I want to understand MLflow experiment tracking. I am training building classifiers and want to track which settings give the best results.

Please explain:
1. What is MLflow? What problem does it solve that just printing results to the terminal doesn't?
2. What is the difference between logging a "param" vs a "metric" in MLflow? Give examples from building classification.
3. What is an MLflow artifact? What do I store as an artifact? How do I load a saved model later?
4. What is the Model Registry? How does it help when deploying a model to production?
5. What would a typical MLflow workflow look like? (I train 20 runs with different settings — walk me through what I see in the UI)
6. What are alternatives to MLflow? When would I choose Weights & Biases instead?
7. What is reproducibility? What are the minimum things I must log to be able to reproduce a run exactly?

Simple language please. I am new to ML engineering.`]
);

window.BLOCKS[14].push(
  ['prompt','FastAPI & ML APIs',
`I want to understand how to serve a machine learning model as a REST API using FastAPI. I have a trained building classifier.

Please explain:
1. What is a REST API? What does "POST /predict" mean? Walk through an HTTP request/response cycle.
2. What is Pydantic? What problem does it solve? Show me what happens when I send energy_consumption=-500.
3. Why do we load the model once at startup (lifespan function) rather than on every request?
4. What is the difference between a synchronous and asynchronous endpoint? When does async matter for ML APIs?
5. Walk me through a complete request: client sends JSON → FastAPI → Pydantic validates → model.predict() → JSON response. What happens at each step?
6. What is the /docs endpoint? What is OpenAPI/Swagger?
7. How do I test my API? Give me 3 different ways to send test requests.

Use simple language. I am a beginner to web development.`]
);

window.BLOCKS[15].push(
  ['prompt','Docker & Containerisation',
`I want to understand Docker and how it is used to deploy a machine learning model. I have a FastAPI-based building classifier.

Please explain:
1. What problem does Docker solve? What does "it works on my machine" mean and why is it a problem?
2. What is the difference between a Docker image and a Docker container? What is a layer?
3. Walk me through my Dockerfile step by step: FROM python:3.12-slim → COPY requirements.txt → RUN pip install → COPY . . → RUN train → EXPOSE → CMD
4. Why do I copy requirements.txt BEFORE copying the code? What is Docker layer caching?
5. Why does CMD use --host 0.0.0.0 instead of 127.0.0.1? What would happen with 127.0.0.1?
6. What is docker-compose? How would I use it to run my API and an MLflow server together?
7. What is the difference between building the model at docker BUILD time vs at container START time? Which is better for production and why?

Simple language please. I am new to DevOps.`]
);


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
  ['prompt','Streamlit & ML Dashboards',
`I want to understand how to build a machine learning dashboard with Streamlit. I have a building classifier and want to make it interactive.

Please explain:
1. What is Streamlit? How is it different from building a website with HTML/CSS/JavaScript?
2. What is Streamlit's "rerun" model? When does a script rerun and how does this affect performance?
3. What is the difference between @st.cache_data and @st.cache_resource? Give a concrete example of when to use each.
4. What is the _ prefix in train_models(_scaler) used for with Streamlit caching?
5. I want to add a "Download Results" button. Walk me through how to implement it.
6. What are the performance limits of Streamlit? How many concurrent users can it handle?
7. When should I use Streamlit (vs FastAPI) for a machine learning project? Can I use both together?

Keep it simple. I am a beginner to web development.`]
);

window.BLOCKS[17].push(
  ['prompt','GitHub Actions & CI/CD',
`I want to understand GitHub Actions CI/CD for a machine learning project. I have a building classifier with Python tests.

Please explain:
1. What is CI/CD? What problem does it solve? What is the difference between CI (Continuous Integration) and CD (Continuous Deployment)?
2. Walk through my ci.yml file line by line: on: [push], runs-on: ubuntu-latest, matrix python versions, steps (checkout, setup-python, pip install, pytest, import verification).
3. What does the matrix strategy do? Why does the current workflow list Python 3.11, and how would adding another value expand compatibility coverage?
4. Why do we verify imports separately from running tests? What kind of bug does import verification catch that pytest misses?
5. How do I write a new test for make_engineered_features()? Walk me through the structure of a good pytest test.
6. What is the red ✗ / green ✓ on a pull request? How does the branch protection rule work?
7. What can I add to my CI pipeline besides pytest? Name 3 useful additional checks.

Simple language please. I am new to DevOps and testing.`]
);

window.BLOCKS[18].push(
  ['prompt','AutoML & Automated Machine Learning',
`I want to understand AutoML (Automated Machine Learning). I have an AutoML assistant (src/automl.py) that works on any CSV file.

Please explain:
1. What is AutoML? What does it automate and what does it NOT automate?
2. How does automl.py detect which column is the target to predict? What heuristics does it use?
3. What is mutual information? How does it help rank which features are most useful?
4. What is the "dummy baseline" model? Why is it the most important benchmark to beat?
5. My AutoML trains 8 models: Dummy, LogReg, KNN, SVM, Random Forest, Gradient Boosting, MLP, XGBoost. Can you briefly explain what each one does in one sentence?
6. What is a ColumnTransformer preprocessing pipeline? What does it do for numeric vs categorical columns?
7. What are the limitations of AutoML? Name 3 things it cannot do that a human data scientist can.

Simple language please. I am learning ML.`]
);

window.BLOCKS[19].push(
  ['prompt','Full ML Project Architecture',
`I want to understand how a complete machine learning project fits together. I have a building type classifier project with this structure:

data/train_energy_data.csv (1 000 buildings) → src/data.py → src/models/ + src/evaluation.py → src/train.py → artifacts/model.joblib → src/api.py (FastAPI) → HTTP predictions
Also: dashboard.py (Streamlit), .github/workflows/ci.yml (GitHub Actions), Dockerfile

Please explain:
1. Trace the full data flow from the CSV file to a prediction served over HTTP. What happens at each step?
2. What is the role of each file? (data.py, models.py, evaluation.py, train.py, predict.py, api.py, automl.py, dashboard.py)
3. How do all these pieces communicate? What is the "contract" between train.py and api.py?
4. If I want to add a new ML model (say, a Random Forest), what files do I need to change and in what order?
5. If I want to add a new feature to the dataset, trace every file I need to update.
6. What would break first if I deleted artifacts/model.joblib? What would fix it?
7. Why is there both a FastAPI server AND a Streamlit dashboard? When would I use each?

Simple language. I am a beginner trying to see the full picture.`]
);

/* ════════════════════════════════════════════════════════════════════════
   NEW LESSONS 20, 21, 22
   ════════════════════════════════════════════════════════════════════════ */

