window.BLOCKS[20].push(
  ['p', 'Why this exists: without gradient descent, you would have to try every possible combination of weights by brute force — which is computationally impossible. A model with 1 003 parameters would require searching through an incomprehensibly large space. Gradient descent gives us a principled, efficient way to navigate that space by always moving "downhill" in the loss landscape.'],
  ['code', 'Line by line — _fit_binary() gradient update', `    def _fit_binary(self, X, y_bin, rng):
        w = rng.normal(0.0, 0.01, size=1 + X.shape[1])  # random start near zero

        for _ in range(self.n_iter):          # repeat n_iter times (default 1000)
            net    = X @ w[1:] + w[0]        # linear: w·x + bias for all samples
            output = self._sigmoid(net)        # convert net input → probability 0→1
            errors = y_bin - output           # residuals: positive = too low, negative = too high

            # Gradient descent weight updates:
            w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])
            # X.T @ errors = sum of (feature × error) across all training rows
            # - self.alpha * w[1:] = L2 penalty nudging weights toward zero

            w[0]  += self.eta * errors.sum()  # bias update: sum of all errors

        return w, losses  # trained weight vector`],
  ['code', 'Real output', `# Training the OvR classifier on scaled core features (Energy, Sqft):
from src.models import LogisticRegressionOvR
from src.data import load_features
from src.evaluation import cross_validate_custom, make_skf
from sklearn.preprocessing import StandardScaler
import numpy as np

X, y = load_features('data/train_energy_data.csv', 'core')
scaler = StandardScaler().fit(X)
X_sc   = scaler.transform(X)

ovr = LogisticRegressionOvR(eta=0.0001, n_iter=1000, alpha=0.0)
ovr.fit(X_sc, y)

# Trained weights for each class:
# Class 0 (Residential): w = [-0.9886, -2.8683,  2.2454]  (bias, energy_w, sqft_w)
# Class 1 (Commercial):  w = [-0.6836,  0.0731, -0.1702]
# Class 2 (Industrial):  w = [-1.2231,  2.9265, -2.0959]
#
# CV accuracy: 0.606 ± 0.033  (5-fold, over runs [0.615,0.575,0.665,0.595,0.580])`],
  ['code', 'Three ways to call this (different eta / n_iter)', `# Call 1 — fast (fewer iterations, larger step)
ovr_fast = LogisticRegressionOvR(eta=0.001, n_iter=200, alpha=0.0)
ovr_fast.fit(X_sc, y)
# Converges faster but may not fully optimise — check CV accuracy

# Call 2 — standard (as used in the project)
ovr_std = LogisticRegressionOvR(eta=0.0001, n_iter=1000, alpha=0.0)
ovr_std.fit(X_sc, y)
# CV accuracy ≈ 0.606 ± 0.033

# Call 3 — with L2 regularisation to prevent overfitting
ovr_reg = LogisticRegressionOvR(eta=0.0001, n_iter=1000, alpha=0.01)
ovr_reg.fit(X_sc, y)
# Weights stay smaller; CV accuracy may improve slightly on noisy data`],
  ['callout','info','What this tells you','The trained weight for energy in the Industrial classifier (+2.93) is large and positive: high energy strongly predicts Industrial. The weight for sqft is negative (-2.10): a large but LOW-energy building is less likely Industrial. This matches intuition — factories use a lot of energy regardless of size. The weights are the model\'s learned theory of building types.'],
  ['callout','analogy','Real world — retail price optimisation','An online retailer wants to find the optimal price for a product. They start with a guess ($50), measure total revenue, and ask: "would raising or lowering the price by $1 increase revenue?" They nudge the price in the direction of higher revenue. After many small adjustments, they converge to the optimal price. Gradient descent is exactly this process — but for hundreds of weights simultaneously, all nudged by their individual revenue contributions.'],
  ['quiz',[{q:'What happens if you change eta from 0.0001 to 0.5 with n_iter=1000 on this dataset?',a:1,opts:[
    {t:'Training converges 5 000× faster and achieves the same final accuracy',e:'A large learning rate causes oscillation, not faster convergence. The accuracy will be worse, not the same.'},
    {t:'The weight updates overshoot the optimal value on each step — the loss oscillates and may diverge rather than decrease. Final CV accuracy is likely much lower than 0.606',e:'Correct! eta=0.5 on scaled data with binary targets causes the weights to jump over the minimum on every step. The model never settles.'},
    {t:'The model underfits because large steps skip over the correct weights',e:'Large steps cause oscillation, not underfitting in the classical sense. Underfitting means the model is too simple.'},
    {t:'No change — the model finds the same minimum regardless of eta',e:'The minimum found by gradient descent depends heavily on eta. Large eta can prevent convergence entirely.'},
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

/* ── Step 2-8 additions: Lesson 21 — Overfitting ── */
window.BLOCKS[21].push(
  ['p', 'Why this exists: overfitting is the most common failure mode in ML. A model that scores 94% on training data but 58% on new data is worse than useless in production — it gives false confidence. Detecting and fixing overfitting before deployment is the most important skill in applied ML.'],
  ['code', 'Line by line — overfitting diagnosis via CV', `# How cross-validation reveals overfitting in this project:

from src.models import LogisticRegressionOvR
from src.evaluation import cross_validate_custom, make_skf
from sklearn.preprocessing import StandardScaler

X, y   = load_features('data/train_energy_data.csv', 'core')
scaler = StandardScaler().fit(X)
X_sc   = scaler.transform(X)
skf    = make_skf()

# Train and evaluate with different regularisation strengths:
for alpha in [0.0, 0.001, 0.01, 0.1, 1.0]:
    scores = cross_validate_custom(
        LogisticRegressionOvR,
        {'eta': 0.0001, 'n_iter': 1000, 'alpha': alpha},
        X_sc, y, skf, needs_scaling=False  # already scaled
    )
    print(f"alpha={alpha:.3f}  CV={scores.mean():.3f} ± {scores.std():.3f}")`],
  ['code', 'Real output', `# Results running the alpha sweep on core features:
# alpha=0.000  CV=0.606 ± 0.033   ← baseline (no regularisation)
# alpha=0.001  CV=0.610 ± 0.030   ← slight improvement, std dropping
# alpha=0.010  CV=0.611 ± 0.028   ← best balance
# alpha=0.100  CV=0.601 ± 0.027   ← starting to underfit
# alpha=1.000  CV=0.341 ± 0.005   ← severe underfit: weights forced near zero
#                                     → model predicts majority class only
#
# Attention Classifier bandwidth comparison (overfitting via small w):
# w=0.1  →  CV=0.587 ± 0.045   ← 1-NN behaviour, high variance
# w=1.0  →  CV=0.576 ± 0.040   ← smoother, lower variance
# w=10.0 →  CV=0.377 ± 0.019   ← too smooth (underfits, predicts majority class)`],
  ['code', 'Three ways to detect and fix overfitting', `# Method 1 — compare training vs CV accuracy
from sklearn.metrics import accuracy_score
ovr.fit(X_sc, y)
train_acc = accuracy_score(y, ovr.predict(X_sc))  # training accuracy
cv_acc    = cross_validate_custom(...).mean()       # CV accuracy
gap = train_acc - cv_acc
print(f"Train={train_acc:.3f}, CV={cv_acc:.3f}, gap={gap:.3f}")
# gap > 0.10 → overfitting; gap < 0.05 → good generalisation

# Method 2 — add L2 regularisation (increase alpha)
ovr_reg = LogisticRegressionOvR(eta=0.0001, n_iter=1000, alpha=0.01)

# Method 3 — reduce model complexity (MLP: fewer hidden units)
from sklearn.neural_network import MLPClassifier
mlp_small = MLPClassifier(hidden_layer_sizes=(20,), max_iter=1000)
# vs the original: hidden_layer_sizes=(40, 20) — half the neurons`],
  ['callout','info','What this tells you','The Attention Classifier shows a classic complexity vs. generalisation trade-off through the bandwidth parameter w. At w=0.1 (very local), CV accuracy is 0.587 but variance is 0.045 — the model memorises local clusters. At w=10.0 (very global), CV accuracy collapses to 0.377 — the model loses all discriminating power. The sweet spot (w≈1–2) gives the best trade-off between fitting the data and generalising to new buildings.'],
  ['callout','analogy','Real world — insurance fraud detection','An insurance company trains a fraud detection model that flags 95% of known fraud cases in historical data but flags only 60% of fraud in new claims. The model learned the specific patterns of historical cases but not the general characteristics of fraud. It overfitted to the training cases. The fix: regularisation (penalise overly specific rules), more diverse training data, and simpler decision rules that generalise.'],
  ['quiz',[{q:'You add 50 new random noise columns (filled with random numbers unrelated to building type) to the dataset before training XGBoost. Training accuracy stays at 95% but CV accuracy drops from 0.65 to 0.58. What happened?',a:3,opts:[
    {t:'The random columns improved the model\'s ability to find patterns (more information available)',e:'Random columns contain no information about building type by definition. They only add noise.'},
    {t:'XGBoost cannot handle more than 50 features',e:'XGBoost handles thousands of features efficiently.'},
    {t:'StandardScaler failed to scale the random columns correctly',e:'StandardScaler scales all numeric columns identically. Random values scale fine.'},
    {t:'XGBoost found spurious correlations in the 50 random columns on the training set. These fake patterns held on training data but not on unseen validation data — a classic overfitting scenario from too many irrelevant features',e:'Correct! With enough features, XGBoost can always find some that accidentally correlate with the target in training data. CV accuracy reveals these are spurious — they do not hold on new data.'},
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

/* ── Step 2-8 additions: Lesson 22 — Reading Your Results ── */
window.BLOCKS[22].push(
  ['p', 'Why this exists: a results table with 7 models and 14 numbers is hard to interpret at a glance. This diagnostic framework turns raw numbers into clear decisions: which model to deploy, what to try next, and which errors matter most for this particular problem.'],
  ['code', 'Line by line — evaluate_models()', `def evaluate_models(models: dict, X: np.ndarray, y: np.ndarray) -> dict:
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)  # same folds every run
    results = {}

    for name, model in models.items():          # iterate all candidate models
        scores = cross_val_score(               # sklearn's built-in CV runner
            model, X, y,
            cv      = cv,                       # use our stratified folds
            scoring = 'accuracy',               # metric to compute per fold
            n_jobs  = 1,                        # sequential (reproducible)
        )
        results[name] = {
            'cv_mean':   float(scores.mean()),  # the headline number
            'cv_std':    float(scores.std()),   # stability across folds
            'cv_scores': [float(s) for s in scores],  # all 5 individual fold scores
        }

    return results  # dict keyed by model name`],
  ['code', 'Real output', `# Actual evaluate_models() output on core features (train.py):
results = {
    'logistic_regression': {'cv_mean': 0.626, 'cv_std': 0.017,
                             'cv_scores': [0.620, 0.610, 0.645, 0.630, 0.625]},
    'mlp':                 {'cv_mean': 0.550, 'cv_std': 0.027,
                             'cv_scores': [0.520, 0.545, 0.580, 0.555, 0.550]},
    'xgboost':             {'cv_mean': 0.587, 'cv_std': 0.040,
                             'cv_scores': [0.545, 0.560, 0.630, 0.600, 0.600]},
    'soft_voting':         {'cv_mean': 0.618, 'cv_std': 0.025, ...},
    'stacking':            {'cv_mean': 0.627, 'cv_std': 0.015, ...},
}
# best_name = 'stacking'  (highest cv_mean)
# After refitting stacking on full training set:
# test_accuracy = 0.640   (measured on 100-row test set)
#
# XGBoost feature_importances_ = [0.591, 0.409]
# → Energy Consumption contributes 59.1%, Square Footage 40.9%`],
  ['code', 'Three ways to use the results', `# Usage 1 — pick the best model automatically
best_name = max(results, key=lambda name: results[name]['cv_mean'])
print(f"Best: {best_name}  ({results[best_name]['cv_mean']:.3f})")
# → Best: stacking  (0.627)

# Usage 2 — check if CV and test accuracy are close (no leakage)
cv_acc   = results[best_name]['cv_mean']          # 0.627
test_acc = results[best_name]['test_accuracy']     # 0.640
gap      = abs(test_acc - cv_acc)
print(f"CV={cv_acc:.3f}, Test={test_acc:.3f}, gap={gap:.3f}")
# → CV=0.627, Test=0.640, gap=0.013  ← small gap: no leakage, good generalisation

# Usage 3 — compare stabilities (choose lower std in a tie)
for name in results:
    mean = results[name]['cv_mean']
    std  = results[name]['cv_std']
    print(f"{name:25s}  {mean:.3f} ± {std:.3f}")`],
  ['callout','info','What this tells you','The real results show an interesting pattern: sklearn\'s LogisticRegression (0.626) beats XGBoost (0.587) and MLP (0.550) on this dataset. This is common on small, well-scaled datasets with limited features — complex models overfit while a simple linear model generalises better. Stacking (0.627) is only marginally better than LR alone, confirming that the 2-feature core set is the bottleneck, not the model choice. Adding engineered features (energy_per_sqft, occupancy_density) would raise all models more than switching algorithms.'],
  ['callout','analogy','Real world — clinical drug trial analysis','After a clinical trial, a medical team reviews results: drug A reduced symptoms in 65% of patients (mean), with variation across hospitals ± 8% (std). Drug B: 67% mean, ± 3% std. Drug B is chosen not only because of the slightly higher mean but because the lower std means it works consistently across different patient populations. A drug with 70% mean but ± 15% std would be flagged as high-risk: it works brilliantly in some settings and poorly in others. The same logic applies to model selection.'],
  ['quiz',[{q:'You switch from feature_set="core" (2 features) to feature_set="extended" (4 features, adding Occupants and Appliances). XGBoost CV accuracy improves from 0.587 to 0.631 and test accuracy improves from 0.650 to 0.678. What should you conclude?',a:2,opts:[
    {t:'The improvement is due to data leakage — more features gave XGBoost access to test-set information',e:'Leakage would show a large CV-to-test gap. Both metrics improved proportionally, suggesting genuine improvement.'},
    {t:'XGBoost overfits on 4 features because it has too many tree splits available',e:'Overfitting would show CV improving but test accuracy staying the same or dropping. Both improved here.'},
    {t:'Occupants and Appliances contain genuine discriminating information: the 4-feature space separates classes better than the 2-feature space. The consistent improvement on both CV and test confirms this is real signal, not noise',e:'Correct! When both CV and test accuracy improve by similar amounts, the new features carry real information. The consistent gap between them (CV≈0.631, test≈0.678) shows no leakage.'},
    {t:'The results are not comparable because different feature sets use different StandardScaler parameters',e:'StandardScaler is fitted fresh inside each CV fold on whichever features are used. The comparison is fair.'},
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
/* === Human clarity pass: exact src code and predictive quiz fixes === */
