/* Final coverage-audit additions. Loaded after the full lesson definitions. */
[
  [1, 'X \\in \\mathbb{R}^{n \\times d}, \\quad y \\in \\{0,1,2\\}^{n}, \\quad n=1000 \\text{ buildings}, \\ d=2 \\text{ core features}'],
  [2, '\\hat{y}=Xw+b, \\qquad L=\\frac{1}{2n}\\sum_i(y_i-\\hat{y}_i)^2, \\qquad w\\leftarrow w-\\eta\\frac{X^T(\\hat{y}-y)}{n}'],
  [9, '\\hat{P}(k)=\\frac{1}{M}\\sum_{m=1}^{M}P_m(k), \\qquad \\hat{y}_{stack}=meta(P_1,\\ldots,P_M)'],
  [13, 'Run=\\{parameters, metrics, artifacts\\}, \\qquad best=\\operatorname*{argmax}_m CV_{mean}(m)'],
  [14, '\\text{POST /predict: features} \\rightarrow \\text{Pydantic} \\rightarrow model.predict\\_proba \\rightarrow \\text{JSON}'],
  [15, 'Image=\\sum layers, \\qquad Container=Image+runtime, \\qquad Size\\approx\\sum layer\\_size'],
  [17, 'Jobs=|python\\ versions|\\times|steps|, \\qquad \\text{all jobs must pass for a green check}'],
  [18, 'best=\\operatorname*{argmax}_{m\\in models} cross\\_val\\_score(m,X,y,cv=5)'],
  [28, 'GridSearch:\\ score(C,solver), \\quad C\\in\\{0.01,0.1,1,10\\}'],
  [24, '\\Delta acc_j=acc(X)-acc(X\\text{ with feature }j\\text{ shuffled})']
].forEach(function(item){ window.BLOCKS[item[0]].push(['math',item[1]]); });

var verifiedLinearSource = `class LinearRegressionGD(RegressorMixin, BaseEstimator):
    def __init__(self, learning_rate: float = 0.01,
                 n_iterations: int = 1000,
                 fit_intercept: bool = True):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.fit_intercept = fit_intercept

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LinearRegressionGD':
        X_fit = self._add_intercept(X)
        y = np.asarray(y, dtype=float).ravel()
        self.weights_ = np.zeros(X_fit.shape[1])
        self.loss_history_: list[float] = []
        for _ in range(self.n_iterations):
            predictions = X_fit @ self.weights_
            errors = predictions - y
            gradient = (2.0 / X_fit.shape[0]) * (X_fit.T @ errors)
            self.weights_ -= self.learning_rate * gradient
            self.loss_history_.append(float(np.mean(errors ** 2)))
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self._add_intercept(X) @ self.weights_

    def _add_intercept(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        if not self.fit_intercept:
            return X
        return np.c_[np.ones(X.shape[0]), X]

class LinearRegressionNormal(RegressorMixin, BaseEstimator):
    def __init__(self, fit_intercept: bool = True):
        self.fit_intercept = fit_intercept

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LinearRegressionNormal':
        X_fit = self._add_intercept(X)
        y = np.asarray(y, dtype=float).ravel()
        xtx = X_fit.T @ X_fit
        try:
            if np.linalg.cond(xtx) > 1 / np.finfo(float).eps:
                raise np.linalg.LinAlgError
            self.weights_ = np.linalg.inv(xtx) @ X_fit.T @ y
        except np.linalg.LinAlgError:
            self.weights_ = np.linalg.lstsq(X_fit, y, rcond=None)[0]
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self._add_intercept(X) @ self.weights_

    def _add_intercept(self, X: np.ndarray) -> np.ndarray:
        X = np.asarray(X, dtype=float)
        if not self.fit_intercept:
            return X
        return np.c_[np.ones(X.shape[0]), X]`;

window.BLOCKS[2].push(
  ['code','src/models/linear.py',verifiedLinearSource],
  ['callout','info','Where these models appear in the project','LinearRegressionGD and LinearRegressionNormal are custom educational implementations demonstrated in Notebook 07. Production train.py instead uses sklearn LogisticRegression as its linear classification baseline.']
);

/* Replace the abbreviated regression listing in lesson 49 with verified source. */
window.BLOCKS[49].push(['h2','Verified linear-regression implementations'],['code','src/models/linear.py',verifiedLinearSource]);

window.BLOCKS[28].push(['streamlit','Custom Dataset · Train models',
  'Run streamlit run dashboard.py. Choose Custom Dataset, upload data/train_energy_data.csv, choose Building Type as the target, and train the models. Compare cross-validation mean and spread in the results; selection should use validation evidence, not the final test score.']);

window.BLOCKS[24].push(['streamlit','AI Dataset Assistant · Feature ranking',
  'Run streamlit run dashboard.py, choose AI Dataset Assistant, upload data/train_energy_data.csv, and inspect the Dataset Profile and Feature Diagnostics. After clicking “Train baseline models and compare feature sets,” ask which features are most important. The assistant grounds its answer in rank_features() mutual-information results.']);

var glossaryTerms = [
  ['Linear Separability','Classes are linearly separable when one straight boundary can divide them perfectly.','It appears in the Perceptron and decision-boundary lessons.','Two groups can stand on opposite sides of one rope.'],
  ['Perceptron','A binary linear classifier that changes weights only after mistakes.','It appears in Notebook 07 and the Perceptron lesson.','A referee moves a dividing line after each wrong call.'],
  ['Adaline','An adaptive linear neuron trained on continuous prediction error.','AdalineGD appears in the custom linear-model package.','A thermostat adjusts by how far the temperature misses its target.'],
  ['Delta Rule','The Adaline weight update proportional to input times continuous error.','It drives each AdalineGD batch-gradient update.','A larger measuring error produces a larger steering correction.'],
  ['Normal Equation','A direct least-squares solution computed from the feature matrix.','LinearRegressionNormal uses it before its stable least-squares fallback.','Solve the whole route algebraically instead of taking repeated steps.'],
  ['Margin','The distance between an SVM boundary and its closest training points.','It appears in the support-vector-machine lesson.','A wider safety lane separates traffic moving in opposite directions.'],
  ['Support Vector','A training point closest to an SVM decision boundary.','Support vectors determine the fitted SVM margin.','The nearest fence posts determine where the fence can stand.'],
  ['C Parameter','An SVM penalty controlling margin width versus training violations.','It appears during SVM tuning and regularization.','A strict referee allows fewer violations but may overreact.'],
  ['Gini Impurity','A measure of how mixed the class labels are in a node.','Decision trees use it to evaluate candidate splits.','A jar containing many candy colors is more mixed.'],
  ['Information Gain','The reduction in impurity produced by a tree split.','It appears when choosing decision-tree thresholds.','A useful question removes the most uncertainty in a guessing game.'],
  ['Leaf Node','A terminal tree node that produces a prediction.','Custom and sklearn decision trees end their paths at leaves.','The final room on a decision path contains the answer.'],
  ['Bayes Theorem','A rule for updating a probability after seeing evidence.','It underlies Gaussian Naive Bayes.','A detective revises a suspicion after finding a clue.'],
  ['Prior Probability','The probability assigned before considering the current features.','Naive Bayes estimates class priors from training labels.','It is your expectation before opening the weather forecast.'],
  ['Likelihood','The probability of observed evidence under a proposed class.','Gaussian Naive Bayes multiplies feature likelihoods.','Ask how plausible each clue is under each suspect.'],
  ['Posterior Probability','The updated class probability after incorporating evidence.','Naive Bayes compares posteriors to choose a class.','It is the revised forecast after seeing dark clouds.'],
  ['Naive Independence Assumption','The assumption that features are conditionally independent within each class.','Gaussian Naive Bayes makes this simplifying assumption.','Judge each witness independently even when their stories may be connected.'],
  ['K-Means Centroid','The mean point representing one K-means cluster.','KMeansCustom repeatedly updates cluster centroids.','A meeting point moves to the average location of its group.'],
  ['E-Step and M-Step','EM alternates estimating memberships and updating distribution parameters.','Gaussian mixture models use these two repeating steps.','Assign diners to tables, then move each table toward its diners.'],
  ['DBSCAN Epsilon','The maximum neighborhood radius used by DBSCAN.','It appears in density-based clustering.','It is how far each person can reach to form a crowd.'],
  ['Noise Point (DBSCAN)','A point outside every sufficiently dense DBSCAN neighborhood.','DBSCAN labels such observations as noise instead of forcing membership.','A lone house sits too far from every neighborhood.'],
  ['Gaussian Mixture Model','A probabilistic model representing data as several Gaussian components.','It appears in the clustering lesson.','Several overlapping bell-shaped crowds explain the whole population.'],
  ['Principal Component','A new orthogonal direction capturing as much variance as possible.','PCA creates principal components from engineered features.','Rotate a photograph to view its widest spread.'],
  ['Explained Variance Ratio','The fraction of total variance captured by one component.','Notebook 12 reports cumulative PCA explained variance.','It measures how much of a story one summary chapter preserves.'],
  ['Linear Discriminant Analysis','A supervised projection that seeks class-separating directions.','It is contrasted with unsupervised PCA.','Rotate the view specifically to pull labeled groups apart.'],
  ['Encoder','The network half that compresses an input into a latent representation.','Notebook 16 defines the autoencoder encoder.','A suitcase packer keeps the essentials in less space.'],
  ['Decoder','The network half that reconstructs input features from latent values.','Notebook 16 defines the autoencoder decoder.','An unpacker rebuilds the room from the packed suitcase.'],
  ['Latent Space','A compact learned coordinate system representing input patterns.','The autoencoder projects building features into latent space.','A short set of map coordinates summarizes a large landscape.'],
  ['Reconstruction Loss','The error between an autoencoder input and its rebuilt output.','Notebook 16 trains with reconstruction error.','Compare a copied drawing with the original and score the differences.'],
  ['Tensor','A multidimensional numeric array used by deep-learning libraries.','PyTorch models exchange tensors during forward and backward passes.','A spreadsheet extended into stacks of sheets.'],
  ['Autograd','Automatic differentiation that records operations and computes gradients.','PyTorch invokes it through loss.backward().','An accountant traces every operation backward to assign responsibility.'],
  ['Convolutional Filter','A small learned weight grid slid across spatial data.','DigitCNN learns filters from image patches.','A small inspection window scans every part of a wall.'],
  ['Receptive Field','The input region capable of influencing one neural activation.','It grows across stacked CNN layers.','A lookout sees a wider landscape from each higher tower.'],
  ['LSTM Cell State','The long-lived memory path carried through an LSTM sequence.','Notebook 18 uses LSTM layers for synthetic sequences.','A conveyor belt carries selected notes through time.'],
  ['Forget Gate','An LSTM gate deciding which old cell-state information to retain.','It appears in the LSTM cell equations.','An editor removes obsolete notes before adding new ones.'],
  ['SHAP Value','A feature contribution relative to a model baseline prediction.','The Explanations dashboard presents local and global SHAP results.','A shared bill assigns each feature its contribution.'],
  ['LIME Explanation','A local surrogate explanation fitted near one prediction.','EnergyTypeNet offers LIME beside SHAP for local interpretation.','Approximate a curved road with a short straight segment nearby.'],
  ['KS Statistic','The maximum separation between two empirical cumulative distributions.','Drift checks use it to compare reference and current data.','Find the widest gap between two cumulative scoreboards.'],
  ['Data Drift','A change in input-data distribution after model development.','EnergyTypeNet validation and monitoring lessons discuss drift.','The river channel shifts while the old map stays unchanged.'],
  ['Model Card','A structured report describing a model, evidence, limitations, and use.','model_card.py validates and exports EnergyTypeNet documentation.','A nutrition label summarizes what is inside and important cautions.'],
  ['Grounded Response (LLM)','An answer constrained by supplied project data and computed evidence.','The dataset assistant builds prompts from analysis results.','An open-book answer cites the provided case file.'],
  ['Deterministic Fallback','A predictable non-LLM answer returned when providers are unavailable.','stream_with_fallback returns its supplied fallback_answer after provider failures.','A printed emergency map works when navigation services lose signal.']
];
glossaryTerms.forEach(function(x){ window.BLOCKS[33].push(['h2',x[0]],['p',x[1]],['p',x[2]],['callout','analogy','Simple analogy',x[3]]); });

/* Interactive concept visualizations: keep quizzes and prompts as the finale. */
[
  [49,'PerceptronViz'],[34,'RegularizationViz'],[36,'DecisionTreeViz'],
  [38,'NaiveBayesViz'],[21,'BiasVarianceViz'],[9,'EnsembleVoteViz'],
  [40,'PCAViz'],[45,'SHAPWaterfallViz'],[44,'LSTMGateViz']
].forEach(function(item){
  var blocks=window.BLOCKS[item[0]],at=blocks.findIndex(function(block){return block[0]==='quiz'||block[0]==='prompt';});
  if(at<0) at=blocks.length;
  blocks.splice(at,0,['viz',item[1]]);
});
