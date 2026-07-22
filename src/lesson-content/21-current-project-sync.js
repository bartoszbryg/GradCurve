/* Current-project synchronization: verified against the EnergyTypeNet working tree on 2026-07-22. */
window.LESSON_TITLES[50] = 'Notebook 19 · Ensemble Extensions';

window.BLOCKS[50] = [
  ['p', 'Notebook 19 extends the earlier voting-and-stacking lesson with ensemble algorithms implemented inside EnergyTypeNet itself. It uses the building dataset for multiclass classification and regression experiments, with a guarded California Housing comparison when that dataset is locally available.'],
  ['callout', 'info', 'What changed in the current project', 'The reusable model package now exports BaggingClassifierCustom, BaggingRegressorCustom and AdaBoostClassifierCustom from src/models/ensemble.py. The production trainer also compares custom Bagging and AdaBoost with Logistic Regression, MLP, XGBoost, soft voting, stacking, Extra Trees and HistGradientBoosting.'],

  ['h2', 'Bagging: reduce variance with bootstrap learners'],
  ['p', 'Bagging trains many base estimators on sampled rows. EnergyTypeNet can also sample feature subsets. Classification averages aligned class probabilities; regression averages numeric predictions. A tree omitted from a row’s bootstrap sample can vote on that out-of-bag row, providing an additional diagnostic without creating a separate split.'],
  ['math', String.raw`\hat{p}(y=c\mid x)=\frac{1}{B}\sum_{b=1}^{B}\hat{p}_b(y=c\mid x),\qquad \hat{y}=\arg\max_c\hat{p}(y=c\mid x)`],
  ['code', 'src/models/ensemble.py', `class BaggingClassifierCustom(ClassifierMixin, BaseEstimator):
    def __init__(self, base_estimator=None, n_estimators=10,
                 max_samples=1.0, max_features=1.0,
                 bootstrap=True, bootstrap_features=False,
                 oob_score=False, random_state=None, n_jobs=1):
        self.base_estimator = base_estimator
        self.n_estimators = n_estimators
        self.max_samples = max_samples
        self.max_features = max_features
        self.bootstrap = bootstrap
        self.bootstrap_features = bootstrap_features
        self.oob_score = oob_score
        self.random_state = random_state
        self.n_jobs = n_jobs

    def predict_proba(self, X):
        X = np.asarray(X, dtype=float)
        proba = np.zeros((X.shape[0], len(self.classes_)))
        for estimator, features in zip(self.estimators_, self.estimators_features_):
            proba += self._aligned_proba(estimator, X[:, features])
        return proba / len(self.estimators_)`],
  ['callout', 'analogy', 'Independent survey teams', 'Each bootstrap tree interviews a slightly different crowd of buildings. Averaging their answers is less sensitive to one unusual sample than trusting a single tree.'],
  ['callout', 'warning', 'OOB is useful, not magical', 'Out-of-bag scoring is available only when bootstrap=True. It is a diagnostic for the bagging estimator; the project still uses stratified cross-validation for fair candidate comparison.'],

  ['h2', 'AdaBoost: focus sequentially on mistakes'],
  ['p', 'AdaBoost is sequential rather than parallel. Each weak learner sees larger weights on rows that the current ensemble misclassifies. The custom classifier implements multiclass SAMME and uses a depth-one DecisionTreeClassifierCustom by default.'],
  ['math', String.raw`\alpha_t=\eta\left[\ln\left(\frac{1-e_t}{e_t}\right)+\ln(K-1)\right],\qquad w_i\leftarrow w_i\exp\left(\alpha_t\,\mathbb{1}[y_i\ne h_t(x_i)]\right)`],
  ['code', 'src/train.py', `custom_bagging = make_pipeline(
    StandardScaler(),
    BaggingClassifierCustom(
        base_estimator=DecisionTreeClassifierCustom(max_depth=5),
        n_estimators=15,
        random_state=random_state,
    ),
)

custom_adaboost = make_pipeline(
    StandardScaler(),
    AdaBoostClassifierCustom(
        base_estimator=DecisionTreeClassifierCustom(max_depth=1),
        n_estimators=30,
        learning_rate=0.5,
        random_state=random_state,
    ),
)`],

  ['h2', 'What Notebook 19 actually compares'],
  ['p', 'The notebook studies diversity, variance reduction, random feature subspaces, OOB scoring, AdaBoost shrinkage, Extra Trees versus Random Forest, HistGradientBoosting settings, regression ensembles, error correlation and greedy ensemble selection. Its grand table compares custom, sklearn and XGBoost candidates on EnergyTypeNet; it does not claim one algorithm wins universally.'],
  ['p', 'This is different from Notebook 05. Notebook 05 introduces soft voting and stacking. Notebook 19 asks why ensembles improve, implements bagging and boosting, and measures diversity and error correlation.'],
  ['streamlit', 'EnergyTypeNet · Model comparison', 'Open the deployed dashboard and compare the available model results. For the full custom Bagging/AdaBoost diagnostics, OOB experiments and staged curves, run notebooks/19_ensemble_extensions.ipynb locally.'],

  ['quiz', [
    {q:'Why can bagging reduce the variance of a decision tree?', a:1, opts:[
      {t:'It makes every tree identical.', e:'Identical trees would make identical errors and provide no averaging benefit.'},
      {t:'It averages learners trained on different bootstrap samples.', e:'Correct. Sampling creates variation, and averaging reduces sensitivity to any one sample.'},
      {t:'It removes all difficult rows.', e:'Bootstrap samples may omit a row for one learner, but difficult rows are not globally removed.'},
      {t:'It changes classification into regression.', e:'The custom package provides separate classifier and regressor implementations.'},
    ]},
    {q:'What does the custom AdaBoost classifier use as its default weak learner?', a:2, opts:[
      {t:'An unrestricted neural network.', e:'The implementation does not use a neural network.'},
      {t:'XGBoost.', e:'XGBoost is a separate production candidate.'},
      {t:'A depth-one custom decision tree.', e:'Correct. A depth-one tree is a decision stump.'},
      {t:'K-Means.', e:'K-Means is an unsupervised clustering model.'},
    ]},
    {q:'How does Notebook 19 differ from Notebook 05?', a:0, opts:[
      {t:'Notebook 05 introduces voting/stacking; Notebook 19 adds custom bagging, AdaBoost and diversity diagnostics.', e:'Correct.'},
      {t:'Notebook 19 replaces the building dataset with images.', e:'It remains focused on EnergyTypeNet ensembles.'},
      {t:'Notebook 05 is production code and Notebook 19 contains no executable code.', e:'Both are educational notebooks with executable experiments.'},
      {t:'There is no difference.', e:'They cover related but distinct stages of ensemble learning.'},
    ]},
  ]],
];

/* Corrections for lessons whose production context changed after their original text was written. */
window.BLOCKS[9].push(
  ['h2', 'Current EnergyTypeNet ensemble candidates'],
  ['p', 'Soft voting and stacking still combine Logistic Regression, MLP and XGBoost. The current trainer additionally evaluates Extra Trees, HistGradientBoosting, BaggingClassifierCustom and AdaBoostClassifierCustom, for nine total candidates. It selects by mean five-fold CV accuracy, fits only the winner on all training rows, evaluates that winner on the holdout CSV and saves it in artifacts/model.joblib.']
);

window.BLOCKS[18].push(
  ['callout', 'info', 'Current AutoML model menu', 'build_baseline_models() currently defines eleven classification and eleven regression candidates when optional XGBoost is installed. The dummy model is a sanity baseline; optional models may be omitted when their dependency is unavailable.']
);

window.BLOCKS[19].push(
  ['h2', 'Current model-package layout'],
  ['p', 'The former single-file model layer is now a package. Importing from src.models remains backward-compatible, while the implementations live in family modules: linear.py, trees.py, svm.py, probabilistic.py, regularized.py, dimensionality.py, clustering.py, neural.py and ensemble.py. The project currently exposes 29 public names from src/models/__init__.py, including the Node helper and ActivationFunctions utility.']
);

window.BLOCKS[28].push(
  ['h2', 'Production candidate list now used by train.py'],
  ['code', 'src/train.py · build_models() return value', `return {
    'logistic_regression': lr,
    'mlp': mlp,
    'xgboost': xgb,
    'soft_voting': voting,
    'stacking': stacking,
    'extra_trees': extra_trees,
    'hist_gradient_boosting': hist_gb,
    'custom_bagging': custom_bagging,
    'custom_adaboost': custom_adaboost,
}`],
  ['p', 'These are fixed candidate configurations, not a fresh hyperparameter grid search. evaluate_models() compares them with five-fold StratifiedKFold accuracy before train_best_model() fits and tests the CV winner.']
);

window.BLOCKS[30].push(
  ['h2', 'Where the project stands now'],
  ['p', 'The original three NumPy classifiers grew into a family-based custom model package covering linear models, trees, SVMs, probabilistic methods, regularization, dimensionality reduction, clustering, neural networks, bagging and boosting. Nineteen notebooks now connect those implementations to sklearn or PyTorch references.'],
  ['p', 'The production layer also grew: the Streamlit app supports EnergyTypeNet, uploaded datasets and an AI Dataset Assistant; FastAPI exposes prediction plus local/global explanation routes; SHAP and LIME share one explanation layer; model cards can be exported; and validation covers schema, drift and leakage checks.']
);
