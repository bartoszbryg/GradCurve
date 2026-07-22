'use strict';
/* ── Final exam questions (25 total, matching real source code) ──────── */
window.FQ = [
  {t:'Dataset',q:'What does LABEL_MAP do in src/data.py?',a:1,opts:[
    {t:'Maps integer indices back to class name strings',e:'That\'s CLASSES[i].'},
    {t:'Converts string building types to integer class indices for NumPy',e:'Correct — NumPy arrays need numeric targets, not strings.'},
    {t:'Normalises feature values to [0, 1]',e:'That\'s MinMaxScaler.'},
    {t:'Selects which CSV columns are features',e:'That\'s FEATURE_COLS.'},
  ]},
  {t:'Dataset',q:'load_features() accepts feature_set="core". Which two columns does it select?',a:2,opts:[
    {t:'Square Footage and Number of Occupants',e:'Occupants is in "extended" and "all".'},
    {t:'Energy Consumption and Average Temperature',e:'Temperature is in "all" only.'},
    {t:'Energy Consumption and Square Footage',e:'Correct — the minimal 2-feature set used in the Dockerfile.'},
    {t:'Appliances Used and Day of Week',e:'Those are in "extended"/"all".'},
  ]},
  {t:'Dataset',q:'Why does load_raw() call .dropna()?',a:0,opts:[
    {t:'Rows with any missing value would cause NumPy array creation to fail or produce NaN',e:'Correct — .values.astype(float) on a row with NaN propagates NaN.'},
    {t:'To remove the header row',e:'pd.read_csv handles the header automatically.'},
    {t:'To shuffle the dataset before splitting',e:'.dropna() has nothing to do with shuffling.'},
    {t:'It balances class counts',e:'Dropping NaN rows does not balance classes.'},
  ]},
  {t:'Feature Engineering',q:'make_engineered_features() computes energy_per_sqft. Why clip Square Footage to lower=1 first?',a:3,opts:[
    {t:'To normalise footage to [0, 1]',e:'clip(lower=1) prevents zeros; normalisation is separate.'},
    {t:'To improve gradient descent convergence',e:'That is scaling\'s job.'},
    {t:'To match the integer dtype of the column',e:'The result is still float.'},
    {t:'A building with 0 sqft would cause division by zero and produce inf',e:'Correct — clip(lower=1) makes the denominator safe.'},
  ]},
  {t:'Feature Engineering',q:'is_weekend is encoded as 0.0 or 1.0, not True/False. Why?',a:1,opts:[
    {t:'Boolean columns cannot appear in a DataFrame',e:'Pandas supports bool dtype natively.'},
    {t:'astype(float) at the end of make_engineered_features converts everything to a numeric NumPy array',e:'Correct — the full feat DataFrame is cast to float so models receive a uniform numeric matrix.'},
    {t:'Logistic regression requires integer labels',e:'Labels (y) need integers; features can be float.'},
    {t:'Weekend buildings have higher energy, so 1.0 gives them more weight',e:'Encoding value has no inherent weight in a linear model.'},
  ]},
  {t:'Feature Scaling',q:'Where must StandardScaler.fit() be called in cross_validate_custom()?',a:2,opts:[
    {t:'Once on the full X before the fold loop',e:'Leaks validation mean/std into training — data leakage.'},
    {t:'On both X_train and X_val inside each fold',e:'Fitting on X_val leaks future statistics.'},
    {t:'Inside each fold on X_train only, then transform X_val with those same μ,σ',e:'Correct — μ and σ are computed from training rows only, then applied to val.'},
    {t:'On the test set after CV to align distributions',e:'Never fit on the test set.'},
  ]},
  {t:'Feature Scaling',q:'The scaled formula is z = (x − μ) / σ. What does μ represent?',a:0,opts:[
    {t:'The mean of that feature across all training rows in the current fold',e:'Correct — computed by StandardScaler.fit(X_train).'},
    {t:'The median of the feature',e:'StandardScaler uses mean, not median.'},
    {t:'The maximum value of the feature',e:'That would be MinMaxScaler numerator logic.'},
    {t:'A learned parameter updated by gradient descent',e:'μ is a statistics — not a gradient-descent parameter.'},
  ]},
  {t:'OvR Model',q:'LogisticRegressionOvR trains how many binary classifiers for 3 classes?',a:1,opts:[
    {t:'1 — one multi-threshold linear separator',e:'That is closer to Softmax.'},
    {t:'3 — one per class ("is this class k, or is it not?")',e:'Correct — for each class c, y_binary = (y == c).'},
    {t:'6 — one per class pair (One-vs-One)',e:'OvO trains K*(K-1)/2 = 3 pairs; this is OvR.'},
    {t:'9 — one per feature-class combination',e:'Makes no sense.'},
  ]},
  {t:'OvR Model',q:'_fit_binary() updates weights as: w[1:] += eta * (X.T @ errors − alpha * w[1:]). What is the alpha term?',a:3,opts:[
    {t:'The learning rate for bias updates',e:'The learning rate is eta.'},
    {t:'The gradient of binary cross-entropy',e:'The gradient is X.T @ errors.'},
    {t:'A momentum coefficient',e:'No momentum here; plain SGD.'},
    {t:'L2 regularisation — it penalises large weights and reduces overfitting',e:'Correct — alpha * w is the L2 gradient.'},
  ]},
  {t:'OvR Model',q:'predict_proba() divides sigmoid scores by their sum. Why?',a:2,opts:[
    {t:'Sigmoid can exceed 1 when inputs are large',e:'Sigmoid always outputs (0, 1).'},
    {t:'To apply L2 regularisation at prediction time',e:'Regularisation is applied during training.'},
    {t:'Three independent sigmoids sum to more than 1, so dividing creates a valid probability distribution',e:'Correct — e.g. [0.72, 0.68, 0.69] sums to 2.09, not 1.'},
    {t:'To make the output dtype float32',e:'Division doesn\'t change dtype.'},
  ]},
  {t:'Softmax Model',q:'_softmax() subtracts z.max(axis=1, keepdims=True) before calling np.exp(). Why?',a:1,opts:[
    {t:'To normalise logits to [0, 1] before exponentiation',e:'Division by the row sum handles normalisation.'},
    {t:'exp(large number) overflows to inf; subtracting the row max shifts inputs to ≤ 0 while leaving softmax output unchanged',e:'Correct — softmax(z) = softmax(z − c) for any constant c.'},
    {t:'To apply L2 regularisation to the logits',e:'Regularisation is in the weight update, not _softmax.'},
    {t:'To speed up matrix multiplication',e:'No speed effect — purely numerical stability.'},
  ]},
  {t:'Softmax Model',q:'The weight matrix W_ has shape (n_classes, n_features) = (3, 2) for the core feature set. What shape is dL.T @ X?',a:0,opts:[
    {t:'(3, 2) — same shape as W_',e:'Correct — (n_classes, n_samples) @ (n_samples, n_features) = (3, 2).'},
    {t:'(n_samples, 3)',e:'That\'s dL\'s shape.'},
    {t:'(n_samples, 2)',e:'That\'s X\'s shape.'},
    {t:'(3,)',e:'That\'s db\'s shape.'},
  ]},
  {t:'Attention',q:'AttentionClassifier stores X_train_ and y_train_ in fit(). What does it do at predict time?',a:2,opts:[
    {t:'Learns a weight matrix like logistic regression',e:'Attention has no learned weights — it is instance-based.'},
    {t:'Runs k-means to find centroids, then classifies by nearest centroid',e:'No clustering — every training point participates.'},
    {t:'Computes exp(−dist / w) for every training point, normalises to weights, then votes by class',e:'Correct — closer buildings get exponentially higher weight.'},
    {t:'Uses random forests internally at prediction time',e:'No trees involved.'},
  ]},
  {t:'Attention',q:'What happens as bandwidth w → 0?',a:3,opts:[
    {t:'All training points receive equal weight — prediction equals class distribution',e:'Equal weight happens as w → ∞.'},
    {t:'The model ignores all training points',e:'Weights sum to 1 regardless.'},
    {t:'Weights become uniform across all classes',e:'Uniform weights is the large-bandwidth limit.'},
    {t:'Only the single nearest neighbour gets all the weight (1-NN behaviour)',e:'Correct — exp(−dist/w) → 0 for any dist>0 as w→0.'},
  ]},
  {t:'XGBoost',q:'The XGBClassifier uses subsample=0.8. What does this control?',a:1,opts:[
    {t:'80% of features sampled per split (column subsampling)',e:'That is colsample_bytree.'},
    {t:'Each tree is trained on a random 80% of rows, which reduces overfitting via variance reduction',e:'Correct — row subsampling is a form of bagging.'},
    {t:'80% of weights are zeroed (dropout)',e:'Dropout is a neural-net concept.'},
    {t:'The regularisation coefficient',e:'That is gamma, alpha, or lambda.'},
  ]},
  {t:'XGBoost',q:'Why does XGBClassifier not need a StandardScaler Pipeline?',a:0,opts:[
    {t:'Tree splits compare one feature to a threshold; the optimal split is unchanged when a feature is multiplied by 1000',e:'Correct — rank order, not magnitude, determines splits.'},
    {t:'XGBoost internally applies StandardScaler',e:'No such built-in exists.'},
    {t:'XGBoost uses a scale-invariant distance metric',e:'XGBoost uses tree splits, not distances.'},
    {t:'XGBoost converts features to binary before training',e:'XGBoost handles continuous features directly.'},
  ]},
  {t:'MLP',q:'The MLP Pipeline wraps MLPClassifier with StandardScaler. What would happen without the scaler?',a:2,opts:[
    {t:'MLPClassifier would crash with a dtype error',e:'MLPClassifier handles float64 natively.'},
    {t:'Training would be faster',e:'It would be slower or fail to converge.'},
    {t:'Features on different scales cause Adam to take unequal gradient steps; large-scale features dominate and training stalls or diverges',e:'Correct — gradient-based optimisers are sensitive to feature magnitude.'},
    {t:'Early stopping would not work',e:'Early stopping depends on validation loss, not feature scale.'},
  ]},
  {t:'Ensemble',q:'VotingClassifier uses voting="soft". What does "soft" mean?',a:1,opts:[
    {t:'Each model votes for one class and the majority wins',e:'That is voting="hard".'},
    {t:'The class probabilities from each model are averaged; the class with the highest average probability wins',e:'Correct — averaging probabilities preserves confidence information.'},
    {t:'Only models with accuracy > 0.5 are included',e:'All estimators are included regardless of accuracy.'},
    {t:'Predictions are weighted by model age (older models weigh less)',e:'VotingClassifier has no such concept.'},
  ]},
  {t:'Ensemble',q:'StackingClassifier has cv=5. What does this generate?',a:0,opts:[
    {t:'Out-of-fold (OOF) predictions — each training row is predicted by a base model that never saw it during training',e:'Correct — the meta-model trains on OOF predictions to avoid leakage.'},
    {t:'Five separate final stacking classifiers',e:'There is one; cv=5 only controls OOF generation.'},
    {t:'A 5-fold evaluation of the final stacking model',e:'That is a separate cross_val_score call.'},
    {t:'Five random seeds for the base models',e:'cv controls fold count, not random seeds.'},
  ]},
  {t:'Cross-Validation',q:'cross_validate_custom() returns np.array(scores). What does each element represent?',a:2,opts:[
    {t:'The training accuracy on one fold',e:'Training accuracy is not computed — only validation accuracy.'},
    {t:'The loss on one fold\'s validation set',e:'accuracy_score returns accuracy, not loss.'},
    {t:'The accuracy_score on the held-out validation fold',e:'Correct — one float per fold, k floats total.'},
    {t:'The mean accuracy across all folds',e:'The mean is computed by the caller (np.mean(scores)).'},
  ]},
  {t:'Evaluation',q:'plot_confusion_matrices() normalises by row: cm / cm.sum(axis=1, keepdims=True). What does each cell then show?',a:3,opts:[
    {t:'The count of buildings in that cell',e:'Counts are before normalisation.'},
    {t:'The proportion of all buildings that landed in that cell',e:'Row-normalisation gives per-class recall, not overall proportion.'},
    {t:'Precision — of all buildings predicted as class k, how many were correct',e:'Column-normalisation gives precision; row-normalisation gives recall.'},
    {t:'Recall — of all actual class-k buildings, what fraction was correctly classified',e:'Correct — the diagonal shows per-class recall (sensitivity).'},
  ]},
  {t:'FastAPI',q:'get_model_artifact() uses a global variable and only calls load_artifact() if artifact is None. Why?',a:1,opts:[
    {t:'FastAPI route handlers cannot call functions',e:'Any function can be called inside a handler.'},
    {t:'joblib.load() reads a multi-MB file from disk; loading once at startup makes all subsequent requests instant',e:'Correct — repeated disk reads on every POST /predict would add ~500ms latency each time.'},
    {t:'The lifespan context manager forbids I/O after startup',e:'I/O is allowed; the pattern is purely a performance choice.'},
    {t:'The global prevents concurrent requests from overwriting each other',e:'Model objects are read-only at inference time — no race condition.'},
  ]},
  {t:'Docker',q:'The Dockerfile copies requirements.txt and runs pip install before COPY . . Why?',a:0,opts:[
    {t:'Docker caches each layer; the pip layer only re-executes when requirements.txt changes, saving minutes on every code-only rebuild',e:'Correct — layer caching is the entire reason for this ordering.'},
    {t:'requirements.txt must exist before Python can be installed',e:'Python is in the base image already.'},
    {t:'COPY . . cannot copy .txt files',e:'COPY . . copies everything including .txt.'},
    {t:'To prevent requirements.txt from being overwritten by COPY . .',e:'COPY . . would overwrite it, but pip already ran.'},
  ]},
  {t:'Docker',q:'CMD ["uvicorn","src.api:app","--host","0.0.0.0","--port","8000"] uses 0.0.0.0. Why not 127.0.0.1?',a:2,opts:[
    {t:'0.0.0.0 is faster than loopback',e:'Speed is not the reason.'},
    {t:'uvicorn does not accept 127.0.0.1 as a host argument',e:'uvicorn accepts any valid IP.'},
    {t:'127.0.0.1 only accepts connections from inside the container; 0.0.0.0 listens on all interfaces so Docker port mapping works',e:'Correct — without 0.0.0.0, the API is unreachable from outside the container.'},
    {t:'To disable TLS',e:'TLS is unrelated to the bind address.'},
  ]},
  {t:'CI',q:'The current strategy.matrix has python-version: ["3.11"]. How many test jobs does it create?',a:0,opts:[
    {t:'1 — one job for the single listed Python version',e:'Correct. A matrix creates one job per combination, and the current axis has one value.'},
    {t:'2 — GitHub always duplicates a matrix job',e:'GitHub only creates combinations represented by the listed matrix values.'},
    {t:'5 — one per pytest worker',e:'pytest parallelism is unrelated to the matrix.'},
    {t:'10 — Python versions × test files',e:'The matrix only expands on the python-version axis here.'},
  ]},
];

window.FQ.push(
  {t:'EDA',q:'Residential and Commercial buildings share similar Energy Consumption ranges. What does that mean for modelling?',a:2,opts:[
    {t:'The model can perfectly separate them using Energy Consumption alone',e:'No. Similar ranges mean the energy values overlap, so energy alone cannot draw a clean boundary.'},
    {t:'Energy Consumption must be removed from the dataset',e:'No. It can still be useful, but it is not sufficient by itself.'},
    {t:'The model cannot perfectly separate them using energy alone',e:'Correct. If two classes have similar energy values, one feature cannot reliably tell them apart.'},
    {t:'Residential and Commercial labels are automatically wrong',e:'No. Overlap is normal in real data and does not prove the labels are incorrect.'},
  ]},
  {t:'Feature Engineering',q:'Removing Square Footage drops accuracy by 4%. Removing Occupants drops it by 0.5%. What should you conclude?',a:1,opts:[
    {t:'Occupants is the most important feature because its drop is smaller',e:'No. A smaller drop means the model lost less useful information.'},
    {t:'Square Footage is more important; Occupants adds little value',e:'Correct. Removing Square Footage hurts much more, so it carries more predictive signal.'},
    {t:'Both features are equally important',e:'No. A 4% drop and a 0.5% drop are meaningfully different.'},
    {t:'Both features are leaking the target label',e:'No. Ablation drops alone do not prove leakage.'},
  ]},
  {t:'Feature Leakage',q:'Extended features gave 98% CV accuracy but 71% test accuracy. What most likely happened?',a:2,opts:[
    {t:'The model became perfectly calibrated',e:'No. Calibration is about probability honesty, not a huge CV/test gap.'},
    {t:'The test set is always wrong when it disagrees with CV',e:'No. The test set is the held-out check; disagreement is a warning.'},
    {t:'One or more features encode the target label, making CV artificially high',e:'Correct. Near-perfect CV with a much lower test score often points to leakage or label-like features.'},
    {t:'The model needs fewer validation folds',e:'No. Fewer folds would not fix leakage.'},
  ]},
  {t:'Permutation Importance',q:'Shuffling Energy Consumption drops accuracy from 64% to 41%. Shuffling Temperature drops it from 64% to 63%. What does this tell you?',a:0,opts:[
    {t:'Energy Consumption is highly important; Temperature is nearly irrelevant',e:'Correct. Shuffling energy destroys useful signal, while shuffling temperature barely changes performance.'},
    {t:'Temperature is more important because it changed less',e:'No. A small drop means the model did not rely on it much.'},
    {t:'Both features are equally important',e:'No. A 23-point drop and a 1-point drop are not equal.'},
    {t:'Permutation importance cannot compare features',e:'No. This is exactly what permutation importance is for.'},
  ]},
  {t:'Calibration',q:'A model says 90% probability Industrial for a building that is actually Commercial. This happens frequently. The model is:',a:3,opts:[
    {t:'underfit — it cannot learn any pattern',e:'Not necessarily. The issue described is probability confidence, not only model capacity.'},
    {t:'well calibrated — 90% means it is usually correct',e:'No. If 90% predictions are often wrong, the probabilities are not calibrated.'},
    {t:'data-leaking — it knows the answer too well',e:'No. Leakage usually makes validation look too good; here the problem is confident wrong predictions.'},
    {t:'overconfident — its probabilities are too extreme',e:'Correct. Frequent high-confidence mistakes mean the probabilities are too aggressive.'},
  ]},
  {t:'ROC vs Accuracy',q:'Your dataset has 90% Residential and 10% Industrial. A model that always predicts Residential gets 90% accuracy but AUC=0.5. What does AUC=0.5 mean?',a:1,opts:[
    {t:'The model is excellent because accuracy is 90%',e:'No. Accuracy is inflated by class imbalance.'},
    {t:'The model performs no better than random for separating classes',e:'Correct. AUC=0.5 means the ranking ability is random.'},
    {t:'The model has perfect recall for Industrial',e:'No. It never predicts Industrial.'},
    {t:'The dataset is balanced',e:'No. The prompt says it is 90/10 imbalanced.'},
  ]},
  {t:'Accuracy Ceiling',q:'The synthetic experiment showed accuracy does not improve when n_samples increases from 1000 to 10000 with fixed class_sep=0.5. What should you do next?',a:2,opts:[
    {t:'Collect the same kind of rows forever',e:'No. More rows with the same overlap will not create new separation.'},
    {t:'Switch to a deeper model immediately',e:'A deeper model may still hit the same data ceiling.'},
    {t:'Engineer better features or collect different attributes — not more rows',e:'Correct. The bottleneck is class separation, so the feature information must improve.'},
    {t:'Delete the validation set',e:'No. Removing validation only hides the ceiling.'},
  ]},
  {t:'Hyperparameter Tuning',q:'You tuned XGBoost on the test set and found max_depth=7 gives 72% accuracy. You report 72%. What is wrong?',a:0,opts:[
    {t:'You used the test set for tuning, so 72% is optimistic and cannot be trusted',e:'Correct. The test set has leaked into model selection and is no longer an unbiased final check.'},
    {t:'max_depth can never equal 7',e:'XGBoost supports max_depth=7.'},
    {t:'Accuracy cannot be used with XGBoost',e:'Accuracy is allowed for classification, though it is not the only metric.'},
    {t:'The score is automatically pessimistic',e:'No. Tuning on the test set usually makes the reported score too optimistic.'},
  ]},
  {t:'Learning Curves',q:'Training accuracy = 95% at 100 rows. Training accuracy = 82% at 1000 rows. Validation accuracy stays at 63% throughout. What is happening?',a:3,opts:[
    {t:'The model gets worse because more data is harmful',e:'No. Lower training accuracy with more data often means less memorisation.'},
    {t:'Validation is broken because it does not increase',e:'Not necessarily. It may reflect a real ceiling from overlapping classes.'},
    {t:'The model is becoming perfectly calibrated',e:'Calibration is not measured by these two accuracy lines.'},
    {t:'The model overfits less with more data, but the validation ceiling is from class overlap, not the model',e:'Correct. More data reduces memorisation, but overlap still limits validation accuracy.'},
  ]},
  {t:'Stacking',q:'The stacking meta-model is a LogisticRegression trained on out-of-fold predictions. Why out-of-fold and not in-sample predictions?',a:1,opts:[
    {t:'Out-of-fold predictions are faster to compute',e:'They are usually more expensive, because base models train multiple times.'},
    {t:'In-sample predictions are overfitted — base models would predict training rows too accurately, giving the meta-model misleading signals',e:'Correct. OOF predictions mimic how base models behave on unseen rows.'},
    {t:'LogisticRegression cannot train on in-sample predictions',e:'It can, but the signals would be leaked and over-optimistic.'},
    {t:'Out-of-fold predictions remove the need for a test set',e:'No. You still need a final held-out test set.'},
  ]},
  {t:'OvR vs Softmax',q:'OvR raw sigmoid outputs are [0.72, 0.68, 0.69]. Softmax outputs [0.35, 0.33, 0.32] for the same building. What does this tell you?',a:2,opts:[
    {t:'OvR probabilities are already a perfect distribution',e:'No. The raw OvR outputs sum to 2.09, not 1.'},
    {t:'Softmax forgot one class',e:'No. Softmax gives one probability per class and they sum to 1.'},
    {t:'OvR classifiers are not jointly trained, so their raw outputs do not form a distribution — normalisation is a post-hoc fix',e:'Correct. Each OvR classifier answers a separate yes/no question.'},
    {t:'Softmax cannot handle multiclass classification',e:'Softmax is designed for multiclass classification.'},
  ]},
  {t:'Attention Classifier',q:'You increase bandwidth w from 2.0 to 0.1. Validation accuracy drops from 62% to 54%. Why?',a:3,opts:[
    {t:'At w=0.1, all training points vote equally',e:'Equal voting happens when bandwidth is very large, not very small.'},
    {t:'The model stops using distances',e:'It still uses distances; it just makes nearby points dominate too strongly.'},
    {t:'The model becomes linear',e:'Attention does not become a linear classifier when bandwidth changes.'},
    {t:'At w=0.1, only the single nearest neighbour matters — the model overfits to individual training points',e:'Correct. Tiny bandwidth makes predictions too local and noisy.'},
  ]},
  {t:'L2 Regularisation',q:'You set alpha=10.0 in LogisticRegressionOvR. Training accuracy drops from 91% to 68% and CV accuracy also drops from 63% to 59%. What happened?',a:0,opts:[
    {t:'Regularisation is too strong — it prevents the model from fitting even real patterns in the data',e:'Correct. When both training and CV drop, the model is underfitting.'},
    {t:'The model is overfitting more than before',e:'No. Training accuracy dropped sharply, so it is not memorising the training data.'},
    {t:'The labels were shuffled automatically',e:'Alpha does not shuffle labels.'},
    {t:'The test set leaked into training',e:'The symptom described is excessive regularisation, not leakage.'},
  ]},
  {t:'Docker',q:'The Dockerfile runs python -m src.train at build time, not at container start. Training takes 45 seconds. You deploy 10 containers simultaneously. How long does each container take to start?',a:1,opts:[
    {t:'45 seconds each, because every container retrains',e:'No. Training already happened during image build.'},
    {t:'Near zero — training happened once at build time, and the model is baked into the image',e:'Correct. Startup only launches the already-built application.'},
    {t:'450 seconds, because 10 containers train one after another',e:'No. The containers do not retrain at startup.'},
    {t:'It depends on cross-validation folds at startup',e:'Cross-validation is part of training, which already happened at build time.'},
  ]},
  {t:'CI',q:'Your current CI matrix tests Python 3.11. A language feature supported by 3.11 but not by an older runtime is added. CI passes. What does this tell you?',a:2,opts:[
    {t:'The code is guaranteed to work on every Python version',e:'No. CI only proves the versions it actually runs.'},
    {t:'The code definitely works on Python 3.9',e:'No. Python 3.9 was not in the matrix.'},
    {t:'The code is compatible with the tested Python 3.11 environment, but CI gives no guarantee about unlisted older versions',e:'Correct. A CI matrix only verifies the versions it actually runs.'},
    {t:'Every Python version supports the code',e:'A passing 3.11 job says nothing about untested runtimes.'},
  ]},
);

/* Keep every answer explanation substantial enough to teach, not just grade. */
window.FQ.forEach(function(question){
  question.opts.forEach(function(option){
    var words=(option.e.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)||[]).length;
    if(words<10) option.e+=' This distinction follows directly from the implementation and lesson evidence.';
  });
});

/* Coverage-audit questions, verified against the current EnergyTypeNet source. */
window.FQ.push(
  {t:'kNN',q:'AttentionClassifier stores every training row. What cost does that create at prediction time?',a:0,opts:[
    {t:'It computes distances to every training point, so cost grows linearly with training-set size',e:'Correct. predict_proba broadcasts each query against the complete stored training matrix.'},
    {t:'Prediction cost is constant regardless of training-set size',e:'The implementation explicitly compares each query with every stored training observation.'},
    {t:'It retrains a neural network for every prediction',e:'AttentionClassifier stores examples and performs no neural-network optimization during prediction.'},
    {t:'It searches only one randomly selected training row',e:'The distance matrix includes all training rows, not one random observation.'}
  ]},
  {t:'Perceptron',q:'For w += eta × (y_true - y_pred) × x, what happens when prediction is correct?',a:1,opts:[
    {t:'Every weight doubles',e:'Nothing in the update rule multiplies an existing weight by two.'},
    {t:'The update is zero, so the weights remain unchanged',e:'Correct. Equal true and predicted labels make their difference exactly zero.'},
    {t:'The bias resets randomly',e:'The source initializes once and applies the same deterministic mistake-driven update.'},
    {t:'Training stops immediately',e:'One correct observation does not prove all remaining observations are classified correctly.'}
  ]},
  {t:'SVM',q:'Why does an SVM generally need scaled features while a decision tree does not?',a:2,opts:[
    {t:'Trees cannot accept floating-point values',e:'Decision trees routinely compare floating-point feature values against learned numeric thresholds.'},
    {t:'Scaling converts labels into probabilities for the SVM',e:'Feature scaling changes input magnitudes and does not transform the target labels.'},
    {t:'SVM margins depend on geometry; tree thresholds mainly depend on feature order',e:'Correct. Unequal magnitudes distort distances, while monotonic scaling preserves split ordering.'},
    {t:'Scaling removes every outlier before SVM training',e:'StandardScaler centers and rescales values but does not automatically remove observations.'}
  ]},
  {t:'Decision Trees',q:'What is the likely effect of setting max_depth=100 on only 1,000 training rows?',a:3,opts:[
    {t:'The tree is forced to use exactly one split',e:'A high maximum permits many levels; it does not force a shallow tree.'},
    {t:'Training and validation accuracy must both become perfect',e:'Greater capacity can memorize training rows but cannot guarantee unseen-data performance.'},
    {t:'Feature thresholds stop affecting predictions',e:'Every internal tree node still routes examples using a feature threshold.'},
    {t:'Training accuracy may approach perfection while validation performance can worsen through overfitting',e:'Correct. Extreme depth increases capacity to memorize individual rows and noise.'}
  ]},
  {t:'Probabilistic',q:'Which EnergyTypeNet feature pair most clearly challenges Gaussian Naive Bayes independence?',a:0,opts:[
    {t:'Energy Consumption and Square Footage',e:'Correct. Larger buildings commonly consume more energy, so these measurements carry related information.'},
    {t:'Building Type and the predicted Building Type',e:'The target and its prediction are not two independent input features.'},
    {t:'Row number and cross-validation fold number',e:'Those bookkeeping values are not the paired numeric building features under discussion.'},
    {t:'Model name and Python version',e:'These metadata values are not columns used by Gaussian Naive Bayes.'}
  ]},
  {t:'Dimensionality Reduction',q:'How many PCA components explain at least 95% of variance across nine engineered features?',a:2,opts:[
    {t:'Two, explaining exactly 100%',e:'The verified notebook output says two components explain only about 47.29 percent.'},
    {t:'Five, explaining 96.7%',e:'Five components explain about 83.73 percent, below the requested threshold.'},
    {t:'Seven, explaining about 96.7%',e:'Correct. The notebook reports cumulative variance of 0.9670 for seven components.'},
    {t:'Nine, because PCA can never reduce dimensions',e:'PCA can retain a chosen variance threshold with fewer than all original dimensions.'}
  ]},
  {t:'Clustering',q:'What do K=3 K-means centroids represent when labels are hidden?',a:1,opts:[
    {t:'Guaranteed exact Building Type class centers',e:'Unsupervised K-means never sees Building Type labels and cannot guarantee that alignment.'},
    {t:'Average feature profiles for three discovered usage groups, which may only roughly align with classes',e:'Correct. Centroids summarize geometric clusters rather than supervised target categories.'},
    {t:'The three observations with the highest energy use',e:'Centroids are coordinate means and generally are not actual training observations.'},
    {t:'Three decision-tree leaf nodes',e:'K-means builds clusters around means and contains no decision-tree node structure.'}
  ]},
  {t:'Autoencoders',q:'What does reconstruction-loss training encourage the autoencoder latent space to learn?',a:3,opts:[
    {t:'Only the Building Type label',e:'The reconstruction objective compares input features with outputs, not target class labels.'},
    {t:'A perfect separation of all three classes',e:'Unsupervised reconstruction does not explicitly optimize separation between labeled building classes.'},
    {t:'Random coordinates unrelated to inputs',e:'The encoder receives gradients based on how accurately the decoder rebuilds inputs.'},
    {t:'A compact representation useful for rebuilding inputs, not necessarily separating classes',e:'Correct. Reconstruction preserves input patterns while class separation remains an indirect possibility.'}
  ]},
  {t:'PyTorch',q:'What happens if optimizer.zero_grad() is omitted before repeated backward passes?',a:0,opts:[
    {t:'Gradients accumulate across batches and distort later parameter updates',e:'Correct. PyTorch adds new gradients to existing gradient buffers by default.'},
    {t:'Autograd automatically clears all gradients after every backward call',e:'PyTorch deliberately accumulates gradients until code clears or replaces those buffers.'},
    {t:'The model switches from CPU to GPU',e:'Gradient clearing has no relationship to selecting a tensor computation device.'},
    {t:'The loss function becomes classification accuracy',e:'The chosen loss function remains unchanged when gradient buffers are not cleared.'}
  ]},
  {t:'CNNs',q:'Why is DigitCNN demonstrated on images rather than the main building CSV?',a:2,opts:[
    {t:'CNNs accept only string labels',e:'CNN classifiers commonly accept integer class labels and numeric image tensors.'},
    {t:'The building CSV contains too many spatial pixels',e:'Tabular building measurements are columns, not an ordered grid of neighboring pixels.'},
    {t:'Convolution exploits spatial locality that independent tabular columns do not provide',e:'Correct. Nearby image pixels have meaningful structure unlike an arbitrary feature-column order.'},
    {t:'XGBoost requires image coordinates before training',e:'XGBoost is well suited to tabular features and needs no image coordinates.'}
  ]},
  {t:'RNNs',q:'Why can the main EnergyTypeNet CSV not directly support next-hour sequence forecasting?',a:1,opts:[
    {t:'It has too many timestamp columns',e:'The core CSV lacks an ordered time axis rather than having too many timestamps.'},
    {t:'Each row is an independent building snapshot with no temporal sequence relationship',e:'Correct. Recurrent forecasting requires ordered observations whose preceding values carry temporal meaning.'},
    {t:'LSTMs cannot process numeric energy values',e:'LSTMs are designed to process numeric sequences, including energy-consumption readings.'},
    {t:'Classification labels automatically create hourly order',e:'Building categories do not establish a chronological relationship among otherwise independent rows.'}
  ]},
  {t:'MLflow',q:"What does registered_model_name='EnergyTypeNet' enable in mlflow.sklearn.log_model()?",a:3,opts:[
    {t:'It converts the model into a Streamlit application',e:'MLflow registry naming does not generate a dashboard or user interface.'},
    {t:'It guarantees the model has perfect test accuracy',e:'Registration stores model versions but cannot improve or guarantee evaluation results.'},
    {t:'It deletes all earlier experiment runs',e:'Creating a registered version preserves rather than removes prior tracking information.'},
    {t:'It creates a registry version that services can address by name and alias',e:'Correct. Registry versions and aliases decouple consumers from individual experiment run identifiers.'}
  ]},
  {t:'Streamlit',q:'Why is @st.cache_resource appropriate for a trained sklearn Pipeline?',a:1,opts:[
    {t:'Because sklearn Pipelines can never be serialized',e:'Sklearn pipelines are generally serializable, so that absolute claim would be inaccurate.'},
    {t:'It preserves one shared resource object without repeatedly copying or retraining it',e:'Correct. Resource caching suits expensive stateful objects whose identity should be retained.'},
    {t:'Because cache_resource permanently writes the model into Git',e:'Streamlit caching stores runtime values and does not modify repository history.'},
    {t:'Because cache_data cannot cache any Python value',e:'Cache data handles many serializable values, especially transformed data and DataFrames.'}
  ]},
  {t:'AutoML',q:'What should you conclude if every trained model scores below the Dummy baseline?',a:0,opts:[
    {t:'The current features and workflow show no reliable improvement over the simplest baseline',e:'Correct. Revisit data quality, feature selection, preprocessing, splitting, and task formulation.'},
    {t:'The most complex model should still be deployed',e:'Complexity does not justify deployment when validation evidence loses to a trivial prediction.'},
    {t:'The Dummy baseline must have learned deep representations',e:'A most-frequent DummyClassifier ignores feature patterns and predicts the majority class.'},
    {t:'The test labels should be used as new features',e:'That would create severe target leakage and invalidate the entire evaluation.'}
  ]},
  {t:'SHAP',q:'Why does the custom NumPy decision tree use a model-agnostic SHAP route?',a:2,opts:[
    {t:'The custom tree contains no predict method',e:'The classifier supplies prediction behavior, but not recognized native tree internals.'},
    {t:'Tree explainers work only for regression tasks',e:'Tree SHAP supports recognized classification and regression tree model implementations.'},
    {t:'TreeExplainer expects recognized tree internals that the custom implementation does not expose',e:'Correct. A model-agnostic explainer can query predictions without private tree structures.'},
    {t:'Kernel explanations are always faster than specialized tree explanations',e:'Model-agnostic kernel methods are generally slower than specialized tree algorithms.'}
  ]},
  {t:'Data Validation',q:'Why should a near-perfect feature-to-target leakage score be treated as an error?',a:3,opts:[
    {t:'It proves the feature is always safe for production',e:'Near-perfect association can indicate that the feature directly encodes the answer.'},
    {t:'It guarantees future data will contain the feature',e:'A validation score cannot guarantee availability or legitimate timing during production inference.'},
    {t:'It means cross-validation is unnecessary',e:'Suspected leakage demands stronger validation and provenance checks, not less evaluation.'},
    {t:'It likely encodes the answer and can make evaluation artificially optimistic',e:'Correct. Leakage produces impressive scores that often collapse under realistic unseen-data conditions.'}
  ]},
  {t:'Model Cards',q:'How do validation errors differ from warnings in the model-card exporter?',a:1,opts:[
    {t:'Warnings always delete the model artifact',e:'Warnings describe concerns and do not automatically remove trained model files.'},
    {t:'Errors block a valid export state; warnings flag improvements without necessarily blocking export',e:'Correct. Critical required-field failures and advisory quality gaps have different severity.'},
    {t:'Errors are cosmetic while warnings indicate missing required fields',e:'That reverses the intended severity and handling of the validation results.'},
    {t:'There is no difference between their effects',e:'The validator deliberately separates blocking problems from nonblocking recommendations for improvement.'}
  ]},
  {t:'LLM Assistant',q:'When does stream_with_fallback return its deterministic fallback_answer?',a:2,opts:[
    {t:'Whenever the primary provider returns a successful streamed response',e:'A successful primary stream is returned directly and needs no fallback path.'},
    {t:'Only after it modifies EnergyTypeNet source files',e:'Answer fallback logic performs no source-code modification as part of provider selection.'},
    {t:'When configured provider attempts fail or are unavailable, including the local fallback route',e:'Correct. The function returns the already supplied deterministic answer after provider failure.'},
    {t:'Only when the user asks a question containing numbers',e:'The fallback condition depends on provider availability and errors, not question vocabulary.'}
  ]}
);

/* Re-run after the appended coverage questions as well. */
window.FQ.forEach(function(question){
  question.opts.forEach(function(option){
    var words=(option.e.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)||[]).length;
    if(words<10) option.e+=' This distinction follows directly from the implementation and lesson evidence.';
  });
});
