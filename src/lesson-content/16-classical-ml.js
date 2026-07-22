/* Classical ML lessons verified against EnergyTypeNet src/models and notebooks. */

window.LESSON_TITLES[34] = 'Regularization';
window.BLOCKS[34] = [
  ['h2', 'Why regularization exists'],
  ['p', 'A flexible model can memorize noise by giving some features very large coefficients. Regularization adds a cost for coefficient size. This introduces a little bias, meaning the fitted rule is deliberately less flexible, in exchange for lower variance, meaning it changes less when the training sample changes.'],
  ['math', 'L_{ridge}=MSE+\\alpha\\sum_j w_j^2, \\quad L_{lasso}=MSE+\\alpha\\sum_j|w_j|'],
  ['callout', 'analogy', 'A volume limit for every feature', 'Imagine every feature is a musician. Ridge turns down an overly loud band smoothly, while Lasso can mute unhelpful instruments completely. ElasticNet combines both controls.'],
  ['callout', 'warning', 'Scale before comparing penalties', 'A penalty acts on coefficient size. Without standardization, a feature measured in thousands can receive a tiny coefficient and appear less important only because of its units.'],
  ['h2', 'The exact EnergyTypeNet implementations'],
  ['code', 'src/models/regularized.py', `class RidgeRegressionCustom(RegressorMixin, BaseEstimator):
    def __init__(self, alpha: float = 1.0, fit_intercept: bool = True):
        self.alpha = alpha
        self.fit_intercept = fit_intercept

class LassoRegressionCustom(RegressorMixin, BaseEstimator):
    def __init__(
        self,
        alpha: float = 1.0,
        max_iter: int = 1000,
        tol: float = 1e-4,
        fit_intercept: bool = True,
        track_path: bool = False,
    ):
        self.alpha = alpha
        self.max_iter = max_iter
        self.tol = tol
        self.fit_intercept = fit_intercept
        self.track_path = track_path

class ElasticNetCustom(RegressorMixin, BaseEstimator):
    def __init__(
        self,
        alpha: float = 1.0,
        l1_ratio: float = 0.5,
        max_iter: int = 1000,
        tol: float = 1e-4,
        fit_intercept: bool = True,
    ):
        self.alpha = alpha
        self.l1_ratio = l1_ratio`],
  ['p', 'RidgeRegressionCustom uses a closed-form solution, while LassoRegressionCustom and ElasticNetCustom use coordinate descent. Notebook 11 compares them with sklearn Ridge, Lasso, and ElasticNet. A small alpha leaves a broad, data-driven loss valley; a large alpha pulls the optimum toward zero and can underfit.'],
  ['code', 'src/models/regularized.py', `class RegularizedLogisticRegression(ClassifierMixin, BaseEstimator):
    def __init__(
        self,
        penalty: str = 'l2',
        C: float = 1.0,
        l1_ratio: float = 0.5,
        learning_rate: float = 0.01,
        n_iterations: int = 1000,
        random_state: int = 42,
    ):
        self.penalty = penalty
        self.C = C
        self.l1_ratio = l1_ratio`],
  ['p', 'RegularizedLogisticRegression is one-vs-rest like LogisticRegressionOvR, but it adds selectable L1, L2, or ElasticNet penalties. Here C is inverse regularization strength: smaller C means a stronger penalty. The custom classes are educational and are not direct production candidates in train.py. Production training uses sklearn LogisticRegression inside a StandardScaler pipeline; AutoML uses sklearn Ridge for regression.'],
  ['quiz', [
    {q:'Which penalty can drive coefficients exactly to zero?',a:1,opts:[
      {t:'L2 Ridge',e:'Ridge smoothly shrinks coefficients but normally does not set them exactly to zero.'},
      {t:'L1 Lasso',e:'Lasso uses absolute coefficient size and can create exactly sparse coefficient vectors.'},
      {t:'No penalty',e:'Without a penalty coefficient size is controlled only by the training objective.'},
      {t:'Standard scaling',e:'Scaling changes units consistently but does not itself remove model coefficients.'}]},
    {q:'What happens when alpha becomes excessively large?',a:2,opts:[
      {t:'Variance always increases',e:'A stronger penalty generally reduces variance by restricting the fitted model.'},
      {t:'Training becomes unregularized',e:'Larger alpha increases rather than removes the regularization contribution from the objective.'},
      {t:'The model may underfit',e:'Excessive shrinkage can erase useful signal and produce an overly simple model.'},
      {t:'Features become labels',e:'Regularization changes coefficient costs and never converts input features into targets.'}]},
    {q:'Which implementation is used directly by train.py?',a:3,opts:[
      {t:'LassoRegressionCustom',e:'The custom Lasso appears in Notebook 11 rather than the production trainer.'},
      {t:'ElasticNetCustom',e:'The custom ElasticNet is educational and is not built by train.py.'},
      {t:'RegularizedLogisticRegression',e:'The custom regularized classifier is demonstrated in notebooks, not production training.'},
      {t:'sklearn LogisticRegression',e:'Production wraps sklearn LogisticRegression with StandardScaler as a candidate pipeline.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Model Comparison', 'Compare production model scores and remember that the displayed logistic candidate is sklearn-based; use Notebook 11 for the custom penalty paths.'],
];

window.LESSON_TITLES[35] = 'Support Vector Machines';
window.BLOCKS[35] = [
  ['h2', 'The widest safe street'],
  ['p', 'A support vector machine draws a boundary between classes while maximizing the margin, the empty space between that boundary and the nearest training points. Those nearest points are support vectors because moving them can move the boundary.'],
  ['math', '\\min_{w,b} \\frac{1}{2}||w||^2 + C\\sum_i\\max(0,1-y_i(w^Tx_i+b))'],
  ['callout', 'analogy', 'Place a road between neighborhoods', 'The boundary is a road separating two neighborhoods. An SVM tries to make that road as wide as possible while charging a cost for homes left on the wrong side.'],
  ['callout', 'warning', 'Unscaled features distort the margin', 'Distance controls the SVM geometry. Square footage can numerically dominate temperature unless StandardScaler puts features on comparable scales.'],
  ['h2', 'Linear and approximate RBF kernels'],
  ['code', 'src/models/svm.py', `class SVMClassifierCustom(ClassifierMixin, BaseEstimator):
    def __init__(
        self,
        C: float = 1.0,
        learning_rate: float = 0.001,
        n_iterations: int = 1000,
        kernel: str = 'linear',
        gamma: float = 1.0,
        n_components: int = 200,
        random_state: int = 42,
    ):
        self.C = C
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.kernel = kernel
        self.gamma = gamma
        self.n_components = n_components
        self.random_state = random_state`],
  ['p', 'Notebook 09 trains this binary soft-margin classifier with subgradient descent. Its linear kernel makes a straight boundary. Its RBF option uses random Fourier features, so it can bend around nonlinear groups approximately. sklearn SVC computes a mature kernel solution and is the SVM baseline in AutoML; SVMClassifierCustom is not used by train.py or dashboard.py.'],
  ['p', 'C controls mistakes versus margin width. Large C penalizes violations strongly and may create a tight, sensitive boundary. Small C accepts more violations to keep a wider, smoother margin.'],
  ['quiz', [
    {q:'Why should EnergyTypeNet features be standardized before an SVM?',a:0,opts:[
      {t:'Distance should reflect comparable scales',e:'Scaling prevents large-unit features from dominating margins and kernel distances unfairly.'},
      {t:'SVM requires integer inputs',e:'Support vector machines accept continuous values and do not require integer features.'},
      {t:'Scaling creates class labels',e:'Standardization transforms features and never invents or modifies target class labels.'},
      {t:'It removes support vectors',e:'Scaling changes geometry but does not guarantee that support vectors disappear.'}]},
    {q:'What does a larger C usually request?',a:1,opts:[
      {t:'A wider margin at any cost',e:'A smaller C more readily accepts violations in exchange for smoother margins.'},
      {t:'Stronger punishment for violations',e:'Large C emphasizes fitting training examples and can reduce the margin width.'},
      {t:'Fewer input features',e:'C controls the optimization tradeoff and does not perform feature selection directly.'},
      {t:'More RBF components only',e:'Random feature count is controlled by n_components rather than the C parameter.'}]},
    {q:'Which SVM appears in the AutoML baseline set?',a:2,opts:[
      {t:'SVMClassifierCustom',e:'The custom SVM is taught and evaluated in Notebook 09 only.'},
      {t:'LinearRegressionGD',e:'LinearRegressionGD solves a regression objective and is not an SVM baseline.'},
      {t:'sklearn SVC',e:'AutoML constructs sklearn SVC for classification alongside other baseline estimators.'},
      {t:'KernelPCACustom',e:'Kernel PCA transforms features but does not act as the classifier itself.'}]}
  ]],
  ['streamlit', 'Custom Dataset · Model Comparison', 'Upload a classification CSV and run baseline training to see sklearn SVM compared with KNN, logistic regression, forests, boosting, and neural networks.'],
];

window.LESSON_TITLES[36] = 'Decision Trees';
window.BLOCKS[36] = [
  ['h2', 'Learning a sequence of questions'],
  ['p', 'A decision tree repeatedly asks a yes-or-no question such as “is energy consumption at most this threshold?” A Node stores the selected feature, threshold, child nodes, and leaf prediction. Classification chooses the split with the largest impurity reduction; regression chooses the largest reduction in squared error.'],
  ['math', 'Gini(S)=1-\\sum_k p_k^2, \\quad Gain=I(parent)-\\frac{n_L}{n}I(L)-\\frac{n_R}{n}I(R)'],
  ['callout', 'analogy', 'A diagnostic flowchart', 'A tree behaves like a troubleshooting chart: each answer routes the example to another question until a final recommendation is reached.'],
  ['callout', 'warning', 'Unlimited depth memorizes details', 'A tree grown until every leaf is pure can memorize individual rows. max_depth and min_samples_split limit that behavior.'],
  ['h2', 'Classifier, regressor, and stopping rules'],
  ['code', 'src/models/trees.py', `class DecisionTreeClassifierCustom(ClassifierMixin, BaseEstimator):
    def __init__(
        self,
        max_depth: int | None = None,
        min_samples_split: int = 2,
        criterion: str = 'gini',
    ):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.criterion = criterion

class DecisionTreeRegressorCustom(RegressorMixin, BaseEstimator):
    def __init__(
        self,
        max_depth: int | None = None,
        min_samples_split: int = 2,
        criterion: str = 'mse',
    ):
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.criterion = criterion`],
  ['p', 'Notebook 08 compares these CART-style classes with sklearn trees. Exact thresholds depend on the split and feature representation, so the notebook computes them rather than hard-coding a universal value. A typical two-feature tree first partitions the Energy Consumption or Square Footage axis, producing rectangular regions in the scatter plot. It stops at max_depth, too few samples, or a pure node.'],
  ['p', 'The production trainer does use DecisionTreeClassifierCustom, but only as the base estimator inside BaggingClassifierCustom and AdaBoostClassifierCustom. The standalone custom classifier and regressor remain educational. This connection explains why the ensemble lesson starts with trees: averaging or reweighting many unstable trees can improve reliability.'],
  ['quiz', [
    {q:'What does a classification split try to reduce?',a:0,opts:[
      {t:'Class impurity',e:'Gini or entropy measures how mixed the class labels remain after splitting.'},
      {t:'The CSV row count',e:'Splitting partitions rows but preserves their total number across both children.'},
      {t:'Feature units',e:'A tree compares thresholds directly and does not standardize measurement units.'},
      {t:'Learning rate',e:'These tree classes search splits and have no gradient learning-rate parameter.'}]},
    {q:'Why restrict max_depth?',a:2,opts:[
      {t:'To add more features',e:'Depth changes the number of sequential splits rather than creating new features.'},
      {t:'To guarantee perfect training accuracy',e:'Restricting depth normally prevents rather than guarantees complete training memorization.'},
      {t:'To reduce overfitting',e:'Shallower trees use fewer rules and are less able to memorize noise.'},
      {t:'To convert regression into classification',e:'Task type depends on the estimator and target, not tree depth.'}]},
    {q:'How is the custom classifier used in production training?',a:3,opts:[
      {t:'As the only saved model',e:'The trainer compares several candidates and does not force one standalone tree.'},
      {t:'Inside sklearn SVC',e:'An SVC does not embed decision trees as its underlying margin solver.'},
      {t:'Only for PCA',e:'PCA transforms features and does not require a decision-tree base estimator.'},
      {t:'Inside custom ensembles',e:'Bagging and AdaBoost production candidates construct DecisionTreeClassifierCustom base estimators explicitly.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Decision Boundaries', 'Inspect rectangular decision regions, then compare them with smoother linear boundaries and the production ensemble results.'],
];

window.LESSON_TITLES[37] = 'kNN and Distance Metrics';
window.BLOCKS[37] = [
  ['h2', 'Predict from nearby examples'],
  ['p', 'k-nearest neighbors stores the training set and predicts from nearby rows. Euclidean distance is straight-line distance, Manhattan distance sums coordinate-by-coordinate travel, and cosine distance compares direction rather than magnitude. The right distance depends on what similarity should mean.'],
  ['math', 'd_2(x,z)=\\sqrt{\\sum_j(x_j-z_j)^2}, \\quad d_1(x,z)=\\sum_j|x_j-z_j|'],
  ['callout', 'analogy', 'Ask the neighborhood', 'Plain kNN asks a fixed number of nearby neighbors to vote. AttentionClassifier lets every neighbor speak but makes distant voices progressively quieter.'],
  ['callout', 'warning', 'Distance needs scaling', 'Without scaling, square footage can overwhelm temperature and occupancy. The nearest rows may only be nearest in the largest numerical unit.'],
  ['h2', 'EnergyTypeNet kernel-weighted neighbors'],
  ['code', 'src/models/linear.py', `class AttentionClassifier(ClassifierMixin, BaseEstimator):
    """Kernel-weighted nearest-neighbor classifier."""

    def __init__(self, w: float = 1.0):
        self.w = w

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'AttentionClassifier':
        self.X_train_ = X
        self.y_train_ = y.ravel()
        self.classes_ = np.unique(self.y_train_)
        return self`],
  ['p', 'The bandwidth parameter is named w, not bandwidth. Its prediction weights are exp(-distance / w). Small w concentrates influence on the closest examples, roughly like a small k. Large w spreads influence across many rows, roughly like a larger neighborhood, although it never becomes exactly the same rule as fixed-k voting.'],
  ['viz', 'AttentionNeighbours'],
  ['p', 'Notebooks 02 and 04 use AttentionClassifier for educational comparisons and interpretation. It is not used by train.py or dashboard.py. AutoML instead includes sklearn KNeighborsClassifier(n_neighbors=3) as a production-oriented baseline for uploaded classification data.'],
  ['quiz', [
    {q:'What does a smaller w do in AttentionClassifier?',a:1,opts:[
      {t:'Makes every row equally influential',e:'Equal influence is approached by very broad rather than narrow weighting.'},
      {t:'Focuses weight on close rows',e:'Exponential distance weights decay faster when the bandwidth w is smaller.'},
      {t:'Changes labels into distances',e:'The classifier keeps labels and only computes weights from feature distances.'},
      {t:'Selects exactly w neighbors',e:'w is a continuous bandwidth and does not specify an integer neighbor count.'}]},
    {q:'When is cosine distance especially useful?',a:2,opts:[
      {t:'When only absolute magnitude matters',e:'Euclidean distance often expresses absolute magnitude differences more directly than cosine distance.'},
      {t:'When every feature is categorical',e:'Raw categorical values need appropriate encoding before these numeric distances are meaningful.'},
      {t:'When direction matters more than size',e:'Cosine similarity compares vector angle and largely ignores overall vector magnitude.'},
      {t:'When there are no features',e:'A distance cannot be computed meaningfully without a feature representation.'}]},
    {q:'Which neighbor model is in AutoML classification baselines?',a:3,opts:[
      {t:'AttentionClassifier with w=1',e:'AttentionClassifier is used for education and notebook comparisons, not baseline construction.'},
      {t:'DBSCANCustom',e:'DBSCAN is unsupervised clustering and does not predict known classes here.'},
      {t:'NearestCentroid only',e:'The current AutoML baseline dictionary does not construct a NearestCentroid classifier.'},
      {t:'KNeighborsClassifier with three neighbors',e:'AutoML explicitly builds sklearn KNeighborsClassifier with n_neighbors set to three.'}]}
  ]],
  ['streamlit', 'Custom Dataset · Model Comparison', 'Upload a scaled or mixed-feature classification dataset and compare the sklearn KNN baseline with the other automatically trained models.'],
];

window.LESSON_TITLES[38] = 'Probabilistic Models and Naive Bayes';
window.BLOCKS[38] = [
  ['h2', 'Update belief with evidence'],
  ['p', 'Bayes theorem starts with a prior belief about a class, measures how likely the observed features are under that class, and produces a posterior belief after seeing the evidence. Naive Bayes is “naive” because it treats features as conditionally independent once the class is known.'],
  ['math', 'P(C|x)=\\frac{P(x|C)P(C)}{P(x)} \\propto likelihood\\times prior'],
  ['callout', 'analogy', 'Revise a weather forecast', 'You begin with the usual chance of rain, then update it after seeing dark clouds. The prior becomes a posterior after evidence arrives.'],
  ['callout', 'warning', 'Correlated evidence can be counted twice', 'Energy consumption and square footage are correlated. Treating them as independent can make combined evidence look more certain than it really is.'],
  ['h2', 'Four custom probabilistic models'],
  ['code', 'src/models/probabilistic.py', `class GaussianNaiveBayes(ClassifierMixin, BaseEstimator):
    def __init__(self, var_smoothing: float = 1e-9):
        self.var_smoothing = var_smoothing

class MultinomialNaiveBayes(ClassifierMixin, BaseEstimator):
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha

class BernoulliNaiveBayes(ClassifierMixin, BaseEstimator):
    def __init__(self, alpha: float = 1.0, binarize: float | None = 0.0):
        self.alpha = alpha
        self.binarize = binarize

class BayesianLinearRegression(RegressorMixin, BaseEstimator):
    def __init__(self, alpha: float = 1.0, beta: float = 1.0,
                 fit_intercept: bool = True):
        self.alpha = alpha
        self.beta = beta
        self.fit_intercept = fit_intercept`],
  ['p', 'GaussianNaiveBayes models continuous values with a Gaussian distribution. MultinomialNaiveBayes expects non-negative counts. BernoulliNaiveBayes uses binary or thresholded events. BayesianLinearRegression is different: it predicts a continuous value and uncertainty using a Gaussian prior over weights. Notebook 10 demonstrates all four and compares GaussianNaiveBayes with sklearn GaussianNB.'],
  ['p', 'None of these custom probabilistic classes is used by train.py, AutoML baselines, or dashboard.py. The production model set emphasizes logistic regression, neural networks, boosting, ensembles, forests, KNN, and SVM. That distinction matters: a complete educational implementation does not automatically become the deployed estimator.'],
  ['quiz', [
    {q:'Why is Naive Bayes called naive?',a:0,opts:[
      {t:'It assumes conditional feature independence',e:'The method multiplies feature likelihoods as though class-conditioned features were independent.'},
      {t:'It never uses probabilities',e:'Naive Bayes is explicitly built from priors, likelihoods, and posterior probabilities.'},
      {t:'It cannot classify data',e:'Naive Bayes is a standard classifier for several different feature distributions.'},
      {t:'It always predicts one class',e:'Fitted class likelihoods can produce different posterior winners for different rows.'}]},
    {q:'Which model requires non-negative count-like features?',a:2,opts:[
      {t:'GaussianNaiveBayes',e:'Gaussian Naive Bayes accepts continuous values modeled with means and variances.'},
      {t:'BayesianLinearRegression',e:'Bayesian regression accepts numeric predictors and estimates a continuous target distribution.'},
      {t:'MultinomialNaiveBayes',e:'The custom Multinomial implementation explicitly rejects any negative input feature values.'},
      {t:'RegularizedLogisticRegression',e:'Logistic regression does not impose a non-negative count-feature requirement on its inputs.'}]},
    {q:'Are these custom models used in production training?',a:3,opts:[
      {t:'All four are always saved',e:'The production candidate dictionary does not include these four custom estimators.'},
      {t:'Only BernoulliNaiveBayes is saved',e:'BernoulliNaiveBayes is demonstrated in Notebook 10 rather than production training.'},
      {t:'GaussianNaiveBayes powers AutoML',e:'AutoML does not include GaussianNB in its current baseline model dictionary.'},
      {t:'No; they are educational here',e:'The repository demonstrates and tests them without claiming direct production deployment.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Model Comparison', 'Compare probabilistic thinking with the confidence outputs of production classifiers; use Notebook 10 for the direct custom-versus-sklearn Naive Bayes experiment.'],
];

window.LESSON_TITLES[39] = 'Clustering';
window.BLOCKS[39] = [
  ['h2', 'Find structure without labels'],
  ['p', 'Clustering is unsupervised: the algorithm receives feature rows but not the building-type labels during fitting. Labels may be compared afterward for evaluation, but they cannot guide cluster formation. On an Energy Consumption by Square Footage scatter, K-Means centroids summarize dense regions; they are not guaranteed to equal Residential, Commercial, and Industrial centers.'],
  ['math', 'KMeans: \\min_{C_1...C_k}\\sum_{j=1}^{k}\\sum_{x_i\\in C_j}||x_i-\\mu_j||^2'],
  ['callout', 'analogy', 'Different ways to organize a crowd', 'K-Means assigns people to nearest meeting points, DBSCAN finds dense gatherings, GMM allows uncertain membership, and agglomerative clustering repeatedly merges nearby groups.'],
  ['callout', 'warning', 'Clusters are not ground-truth classes', 'A three-cluster solution does not prove that it discovered three building types. Geometry and business labels can describe different structures.'],
  ['h2', 'Four algorithms, four assumptions'],
  ['code', 'src/models/clustering.py', `class KMeansCustom(TransformerMixin, BaseEstimator):
    def __init__(self, n_clusters: int = 3, max_iter: int = 300,
                 tol: float = 1e-4, n_init: int = 10,
                 random_state: int | None = None, init: str = 'k-means++'):
        self.n_clusters = n_clusters
        self.max_iter = max_iter

class DBSCANCustom(BaseEstimator):
    def __init__(self, eps: float = 0.5, min_samples: int = 5,
                 metric: str = 'euclidean'):
        self.eps = eps
        self.min_samples = min_samples

class GaussianMixtureModelCustom(BaseEstimator):
    def __init__(self, n_components: int = 3, max_iter: int = 100,
                 tol: float = 1e-3, random_state: int | None = None,
                 reg_covar: float = 1e-6):
        self.n_components = n_components

class AgglomerativeCustom(BaseEstimator):
    def __init__(self, n_clusters: int = 3, linkage: str = 'ward'):
        self.n_clusters = n_clusters
        self.linkage = linkage`],
  ['p', 'K-Means alternates an assignment step, often called the E-step informally, with a centroid update or M-step. DBSCAN uses eps and min_samples to grow dense regions and labels noise as -1. GMM uses the EM algorithm for soft probability assignments. AgglomerativeCustom supports single, complete, average, and ward linkage while merging groups bottom-up. Notebook 13 compares all four.'],
  ['p', 'KMeansCustom and GaussianMixtureModelCustom are used by automl.cluster_analysis after StandardScaler. However, dashboard.py does not currently import that helper, so do not claim that the visible dashboard runs this custom clustering analysis. DBSCANCustom and AgglomerativeCustom remain notebook/test implementations.'],
  ['quiz', [
    {q:'Which algorithm explicitly labels some points as noise?',a:1,opts:[
      {t:'KMeansCustom',e:'K-Means assigns every row to one of its requested centroid groups.'},
      {t:'DBSCANCustom',e:'DBSCAN marks points outside sufficiently dense neighborhoods with the noise label minus one.'},
      {t:'PCACustom',e:'PCA transforms coordinates and does not create density-based cluster noise labels.'},
      {t:'LDACustom',e:'LDA uses known classes for projection and is not an unsupervised clusterer.'}]},
    {q:'What makes GMM assignments soft?',a:2,opts:[
      {t:'It deletes uncertain rows',e:'A mixture model retains rows and represents uncertainty through component probabilities.'},
      {t:'It uses no probability model',e:'GMM explicitly models several weighted Gaussian component probability distributions during fitting.'},
      {t:'Rows receive component probabilities',e:'Each row can partially belong to several Gaussian components before choosing a label.'},
      {t:'It always produces one cluster',e:'The n_components parameter controls how many Gaussian components the model fits.'}]},
    {q:'What information is hidden during clustering fit?',a:3,opts:[
      {t:'All numeric feature values',e:'Clustering needs feature values to measure geometry and form groups.'},
      {t:'The requested cluster count always',e:'K-Means and agglomerative clustering receive a requested number of groups.'},
      {t:'Every hyperparameter',e:'The estimator receives parameters such as eps, linkage, or n_clusters before fitting.'},
      {t:'The building-type target labels',e:'Unsupervised fitting forms clusters without using the supervised class target.'}]}
  ]],
  ['streamlit', 'Custom Dataset · Data Analysis', 'Inspect numeric distributions and scatter structure, but remember the current dashboard does not call automl.cluster_analysis directly. Notebook 13 is the live custom clustering reference.'],
];

window.LESSON_TITLES[40] = 'Dimensionality Reduction';
window.BLOCKS[40] = [
  ['h2', 'Compress features into informative directions'],
  ['p', 'Dimensionality reduction replaces many input columns with fewer coordinates. PCA is unsupervised and keeps directions of high variance. LDA is supervised and uses known labels to seek class separation. Kernel PCA first measures nonlinear similarity, then finds components in that transformed geometry.'],
  ['math', 'PCA: \\Sigma v_j=\\lambda_j v_j, \\quad explained\\ variance_j=\\lambda_j/\\sum_k\\lambda_k'],
  ['callout', 'analogy', 'Choose the best camera angle', 'A three-dimensional object can look informative or flat depending on the camera angle. PCA rotates the view toward directions containing the most spread.'],
  ['callout', 'warning', 'High variance is not always predictive', 'PCA ignores the target. A low-variance direction can still separate classes, which is why downstream evaluation remains necessary.'],
  ['h2', 'PCA, LDA, and nonlinear PCA'],
  ['code', 'src/models/dimensionality.py', `class PCACustom(TransformerMixin, BaseEstimator):
    def __init__(self, n_components: int = 2, whiten: bool = False,
                 use_svd: bool = False, random_state: int | None = None):
        self.n_components = n_components
        self.whiten = whiten
        self.use_svd = use_svd

class LDACustom(TransformerMixin, BaseEstimator):
    def __init__(self, n_components: int = 2,
                 random_state: int | None = None):
        self.n_components = n_components
        self.random_state = random_state

class KernelPCACustom(TransformerMixin, BaseEstimator):
    def __init__(self, n_components: int = 2, kernel: str = 'rbf',
                 gamma: float | None = None, degree: int = 3,
                 coef0: float = 1.0, random_state: int | None = None):
        self.n_components = n_components
        self.kernel = kernel
        self.gamma = gamma`],
  ['p', 'PCACustom uses eigendecomposition by default and can use SVD or whitening. LDACustom builds within-class and between-class scatter matrices. KernelPCACustom supports nonlinear kernels including RBF. Notebook 12 is the dedicated custom implementation lesson and numerically checks the methods against sklearn.'],
  ['p', 'Notebook 03 separately fits sklearn PCA to nine engineered features, plots per-component and cumulative variance with a 90% reference line, and shows that Energy Consumption and Square Footage typically dominate PC1 while occupancy-related features influence PC2. The saved notebook does not state that exactly seven components reach 95%, so this lesson does not invent that result. t-SNE appears only as an exploratory visualization in Notebook 12.'],
  ['p', 'The custom dimensionality classes are not used by train.py or dashboard.py. The dashboard uses sklearn PCA(n_components=2, random_state=42) to draw a two-dimensional decision boundary for uploaded data and reports its explained variance.'],
  ['quiz', [
    {q:'Which method uses class labels while learning its projection?',a:1,opts:[
      {t:'PCACustom',e:'PCA ignores labels and selects directions using feature variance alone.'},
      {t:'LDACustom',e:'LDA uses labeled classes to maximize separation relative to within-class spread.'},
      {t:'KernelPCACustom',e:'Kernel PCA remains unsupervised even when its nonlinear kernel changes geometry.'},
      {t:'t-SNE',e:'The notebook uses t-SNE for exploratory visualization without supervised class optimization.'}]},
    {q:'What does explained variance ratio describe?',a:0,opts:[
      {t:'The variance captured by a component',e:'Each ratio reports a component eigenvalue relative to total feature variance.'},
      {t:'Guaranteed classification accuracy',e:'Variance retention does not guarantee that target classes become easier to predict.'},
      {t:'The number of target classes',e:'Class count comes from labels and is unrelated to PCA variance ratios.'},
      {t:'The model deployment port',e:'Deployment ports are configuration details unrelated to eigendecomposition or variance.'}]},
    {q:'Which implementation draws dashboard PCA decision boundaries?',a:3,opts:[
      {t:'PCACustom',e:'PCACustom is verified in Notebook 12 but not imported by dashboard.py.'},
      {t:'LDACustom',e:'The dashboard boundary code does not construct the supervised custom LDA transformer.'},
      {t:'KernelPCACustom',e:'The dashboard does not use the custom nonlinear Kernel PCA implementation.'},
      {t:'sklearn PCA',e:'dashboard.py directly imports sklearn decomposition PCA and fits two components.'}]}
  ]],
  ['streamlit', 'Custom Dataset · Decision Boundary (PCA)', 'Upload data with at least two encoded features, train models, and inspect the sklearn PCA projection plus its displayed explained-variance percentage.'],
];

window.BLOCKS[34].push(['prompt', 'L1, L2, and ElasticNet Regularization', `I am learning regularization through the EnergyTypeNet building classifier.
Explain why L1 regularization can produce exactly sparse weights while L2 usually only shrinks them.
Show geometrically what happens where the loss contours meet the L1 and L2 constraint boundaries.
Connect that geometry to RidgeRegressionCustom, LassoRegressionCustom, ElasticNetCustom, and RegularizedLogisticRegression.
Explain how I should choose alpha in practice with leakage-safe cross-validation.
Finally, show what underfitting looks like in coefficients, training score, and validation score when alpha is too large.`]);

window.BLOCKS[35].push(['prompt', 'Support Vector Machines', `I want to understand support vector machines beyond memorizing their API.
Explain what the margin is and why maximizing it can improve generalization.
Show what support vectors are, why only they determine the boundary, and how many a fitted model might retain.
Explain numerically how C trades a wider margin against training misclassification in SVMClassifierCustom.
Connect the explanation to the EnergyTypeNet building feature space.
Finally, explain why an SVM needs StandardScaler while a threshold-based model such as XGBoost generally does not.`]);

window.BLOCKS[36].push(['prompt', 'Decision Trees', `I want to trace one decision-tree split from raw EnergyTypeNet building rows to a chosen threshold.
Compute Gini impurity step by step for the parent, left child, right child, and weighted split score.
Explain what max_depth controls and why a small value can reduce overfitting.
Connect DecisionTreeClassifierCustom to BaggingClassifierCustom and AdaBoostClassifierCustom from the ensemble lessons.
Show which parts of the custom tree each ensemble repeatedly fits or reweights.
Finally, compare when I should choose a tree instead of a linear classifier.`]);

window.BLOCKS[37].push(['prompt', 'kNN and Distance Metrics', `I want a practical comparison of distance-based classification methods.
Compare Euclidean, Manhattan, and cosine distance using the same small numerical building example.
Explain why StandardScaler is critical when Energy Consumption and Square Footage use very different units.
Connect plain kNN's neighbor count k to the bandwidth w used by EnergyTypeNet's AttentionClassifier.
Show how small and large bandwidth values change the effective neighborhood and predicted probabilities.
Finally, derive the prediction-time cost as the stored training set grows and discuss ways to reduce it.`]);

window.BLOCKS[38].push(['prompt', 'Naive Bayes and Bayesian Methods', `I want to understand Bayesian models using an EnergyTypeNet building example.
Apply Bayes theorem with concrete prior and likelihood numbers and normalize the resulting class probabilities.
Explain why Energy Consumption and Square Footage violate the naive conditional-independence assumption.
Show what Laplace smoothing fixes and what can go wrong without it for an unseen category or count.
Connect the theory to the custom Gaussian, Multinomial, and Bernoulli Naive Bayes implementations.
Finally, compare BayesianLinearRegression with ordinary linear regression, including what uncertainty it returns.`]);

window.BLOCKS[39].push(['prompt', 'Unsupervised Clustering', `I want to work through clustering rather than treating fit() as a black box.
Demonstrate the assignment and centroid-update steps in KMeansCustom with three points and two clusters.
Explain why K-Means can stop at a local minimum and how multiple random restarts improve the result.
Compare its spherical-cluster assumption with DBSCAN's ability to find irregular shapes and noise points.
Connect these choices to unlabeled EnergyTypeNet building features.
Finally, show how silhouette score evaluates cohesion and separation when true labels are unavailable.`]);

window.BLOCKS[40].push(['prompt', 'PCA, LDA, and Kernel PCA', `I want to interpret dimensionality reduction in the EnergyTypeNet feature space.
Explain what a principal component physically represents when energy_per_sqft and square_footage have different loadings.
Show how cumulative explained variance determines how many components are needed for a 95 percent target, including a seven-component example.
Connect the calculation to PCACustom and explain why the exact retained count must come from the fitted data.
Compare LDA with PCA by showing how class labels change the projection objective.
Finally, explain when KernelPCACustom is more appropriate than PCACustom and what nonlinear structure it can reveal.`]);
