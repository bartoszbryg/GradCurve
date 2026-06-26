/* ── BLOCKS[20] = Gradient Descent ───────────────────────────────── */
window.BLOCKS[20] = [
  ['p', 'Gradient descent is the update rule that lets a model improve itself. The model starts with rough weights, measures the error, then nudges the weights in the direction that lowers the loss.'],
  ['p', 'In this project, the custom LogisticRegressionOvR and LogisticRegressionSoftmax classes both use gradient descent. The math looks abstract at first, but the idea is simple: make a prediction, measure how wrong it is, move a little, and repeat.'],
  ['callout', 'analogy', 'Like walking downhill in fog', 'You cannot see the whole mountain, but you can feel which direction slopes downward under your feet. Gradient descent takes one careful downhill step at a time.'],
  ['h2', 'The core update idea'],
  ['math', 'new_weight = old_weight - learning_rate × gradient'],
  ['p', 'The gradient tells the model which direction increases the loss. Subtracting the gradient moves the model in the opposite direction, toward lower loss.'],
  ['code', 'src/models.py',
`for _ in range(self.n_iter):
    net = X @ w[1:] + w[0]
    output = self._sigmoid(net)
    errors = y_bin - output

    w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])
    w[0] += self.eta * errors.sum()`],
  ['callout', 'info', 'What this tells you', 'The model does not guess all weights at once. It updates them repeatedly using the errors from the current predictions.'],
  ['h2', 'Learning rate matters'],
  ['p', 'The learning rate controls step size. If it is too small, training is slow. If it is too large, the model can jump past the best solution and make the loss worse.'],
  ['code', 'Learning-rate behavior',
`eta = 0.00001  # tiny steps: stable but slow
eta = 0.01     # useful steps on scaled features
eta = 10.0     # huge steps: likely unstable`],
  ['quiz', [
    {q:'What does a gradient point toward?', a:1, opts:[
      {t:'The direction that lowers the loss fastest', e:'That is the negative gradient direction.'},
      {t:'The direction that increases the loss fastest', e:'Correct. Gradient descent subtracts it to go downhill.'},
      {t:'The class with the highest probability', e:'Class probability is separate from the gradient.'},
      {t:'The final test accuracy', e:'Accuracy is an evaluation metric, not the training direction.'},
    ]},
    {q:'What happens if the learning rate is too large?', a:2, opts:[
      {t:'Training always becomes faster and better', e:'Large steps can overshoot the minimum.'},
      {t:'The model stops using the loss function', e:'The loss is still used.'},
      {t:'The loss may bounce around or diverge', e:'Correct. Huge steps can make training unstable.'},
      {t:'The labels are converted back to strings', e:'Label conversion is unrelated.'},
    ]},
    {q:'What happens if you change n_iter from 1000 to 10?', a:0, opts:[
      {t:'The model may underfit because it stops before convergence', e:'Correct. Ten updates is usually not enough.'},
      {t:'The model automatically becomes more accurate', e:'Fewer iterations usually reduce training quality.'},
      {t:'The feature columns disappear', e:'Feature selection is unrelated.'},
      {t:'The confusion matrix becomes impossible to compute', e:'You can still compute it, but predictions may be worse.'},
    ]},
  ,
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

/* ── BLOCKS[21] = Overfitting ────────────────────────────────────── */
window.BLOCKS[21] = [
  ['p', 'Overfitting happens when a model memorizes the training set instead of learning a pattern that works on new data. It looks good during training and worse during validation or testing.'],
  ['p', 'This project is a good place to see overfitting because the classes overlap. A complex model can draw a very detailed boundary around training points, but that detail may not generalize.'],
  ['callout', 'warning', 'High training accuracy is not enough', 'A model that scores 99% on training data but 60% on validation data has probably learned noise, not the real rule.'],
  ['h2', 'The overfitting signal'],
  ['code', 'Typical pattern',
`training_accuracy   = 0.99
validation_accuracy = 0.63

overfitting_gap = training_accuracy - validation_accuracy
# overfitting_gap = 0.36  → too large`],
  ['p', 'Cross-validation helps because the model must prove itself on several validation folds, not just one lucky split.'],
  ['h2', 'How the project reduces overfitting'],
  ['code', 'Common protections',
`StandardScaler()                 # keeps feature scales controlled
StratifiedKFold(n_splits=5)       # tests several validation splits
LogisticRegression(C=10)          # regularization through C
MLPClassifier(early_stopping=True)# stops when validation stops improving
XGBClassifier(subsample=0.8)      # trains each tree on a sample`],
  ['callout', 'info', 'What this tells you', 'The goal is not to make the training score perfect. The goal is to make validation and test performance reliable.'],
  ['quiz', [
    {q:'Which pattern suggests overfitting?', a:3, opts:[
      {t:'Train accuracy and validation accuracy are both low', e:'That is more like underfitting.'},
      {t:'Train accuracy and validation accuracy are both similar', e:'That is usually healthier.'},
      {t:'Validation accuracy is much higher than train accuracy', e:'That is unusual and may mean a data issue.'},
      {t:'Train accuracy is much higher than validation accuracy', e:'Correct. The model fits training details that do not generalize.'},
    ]},
    {q:'Why does cross-validation help?', a:1, opts:[
      {t:'It removes the need for a model', e:'You still train models.'},
      {t:'It tests the model across multiple train/validation splits', e:'Correct. This gives a more stable estimate.'},
      {t:'It changes labels into strings', e:'No, label mapping is separate.'},
      {t:'It guarantees 100% test accuracy', e:'No evaluation method can guarantee that.'},
    ]},
    {q:'What happens if you make a model much more complex on a small noisy dataset?', a:2, opts:[
      {t:'It always generalizes better', e:'Complexity can help, but not always.'},
      {t:'It cannot train at all', e:'It can train, sometimes too well.'},
      {t:'It may memorize noise and overfit', e:'Correct. Small noisy datasets need restraint.'},
      {t:'It deletes the test set', e:'No.'},
    ]},
  ,
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

/* ── BLOCKS[22] = Reading Your Results ────────────────────────────── */
window.BLOCKS[22] = [
  ['p', 'After training, the most important skill is reading results honestly. Accuracy, cross-validation scores, confusion matrices, and classification reports each answer a different question.'],
  ['p', 'Do not look for one magic number. A good result is a pattern: stable CV scores, reasonable test accuracy, understandable errors, and no huge gap between training and validation performance.'],
  ['callout', 'analogy', 'Like a medical checkup', 'One number is never the whole story. You read several measurements together before deciding whether the system is healthy.'],
  ['h2', 'Where results are saved'],
  ['code', 'src/train.py',
`metrics_path.write_text(
    json.dumps(output['results'], indent=2),
    encoding='utf-8',
)

joblib.dump(artifact, model_path)`],
  ['p', 'The metrics JSON stores cross-validation means and standard deviations. The model artifact stores the trained model, class names, feature set, and best model name.'],
  ['h2', 'What to read first'],
  ['code', 'Reading metrics',
`best_model = "stacking"
cv_mean = 0.628
cv_std = 0.014
test_accuracy = 0.650

# Read this as:
# average validation accuracy is about 63%
# folds are fairly consistent
# final held-out test accuracy is about 65%`],
  ['callout', 'info', 'What this tells you', 'A modest but stable score is more trustworthy than one lucky high score. The result says the two core features contain useful signal, but not enough to perfectly separate all building types.'],
  ['quiz', [
    {q:'What does CV mean tell you?', a:0, opts:[
      {t:'Average validation performance across folds', e:'Correct. It summarizes cross-validation.'},
      {t:'The number of columns in the CSV', e:'No.'},
      {t:'The final API port', e:'No.'},
      {t:'The label mapping order', e:'No.'},
    ]},
    {q:'What does a high CV standard deviation mean?', a:2, opts:[
      {t:'The model is definitely perfect', e:'No.'},
      {t:'The model never trained', e:'No.'},
      {t:'Performance changes a lot depending on the split', e:'Correct. The model is sensitive to which rows land in each fold.'},
      {t:'The feature values are all zero', e:'No.'},
    ]},
    {q:'What happens if test accuracy is much lower than CV accuracy?', a:1, opts:[
      {t:'The test set is easier than validation', e:'Lower test accuracy suggests the opposite.'},
      {t:'The model may not generalize as well as CV suggested', e:'Correct. Investigate data split, leakage, and class overlap.'},
      {t:'The model becomes unsupervised', e:'No.'},
      {t:'The dashboard cannot load CSS', e:'Unrelated.'},
    ]},
  ,
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
