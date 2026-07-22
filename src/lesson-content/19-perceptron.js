/* Verified against EnergyTypeNet src/models/linear.py and Notebook 07. */
window.LESSON_TITLES[49] = 'Perceptron and Linear Separability';
window.BLOCKS[49] = [
  ['h2','The Perceptron idea'],
  ['p','Rosenblatt introduced the Perceptron in 1958. This trainable neuron combines inputs with weights and a bias, then emits 1 when the score reaches its threshold. A mistake moves the boundary; a correct prediction makes the error term zero.'],
  ['math','w \\leftarrow w + \\eta(y_{true}-y_{pred})x, \\qquad b \\leftarrow b + \\eta(y_{true}-y_{pred})'],
  ['callout','analogy','Adjusting a balance scale','Each feature places weight on a balance. When the prediction tips to the wrong side, the Perceptron shifts the weights toward the correct side.'],
  ['code','src/models/linear.py',`class Perceptron(ClassifierMixin, BaseEstimator):
    def __init__(self, learning_rate=1.0, n_iterations=100,
                 zero_based=True, random_state=None):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.zero_based = zero_based
        self.random_state = random_state

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'Perceptron':
        X_fit = np.c_[np.ones(X.shape[0]), np.asarray(X, dtype=float)]
        y_train = self._encode_y(y)
        self.weights_ = np.zeros(X_fit.shape[1])
        self.errors_ = []
        for _ in range(self.n_iterations):
            errors = 0
            for xi, target in zip(X_fit, y_train):
                y_hat = 1 if xi @ self.weights_ >= 0.0 else 0
                update = self.learning_rate * (target - y_hat)
                if update != 0.0:
                    self.weights_ += update * xi
                    errors += 1
            self.errors_.append(errors)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        X_fit = np.c_[np.ones(X.shape[0]), np.asarray(X, dtype=float)]
        predictions = (X_fit @ self.weights_ >= 0.0).astype(int)
        return predictions if self.zero_based else np.where(predictions == 1, 1, -1)`],
  ['h2','AdalineGD: the smoother sibling'],
  ['p','The Perceptron learns from a hard class decision. Adaline compares the continuous net input with the target before thresholding. Its mean-squared-error landscape is smooth, allowing batch gradient descent to make measured progress even when classes overlap.'],
  ['math','L=\\frac{1}{2n}\\sum_i(y_i-net_i)^2, \\qquad w\\leftarrow w+\\eta X^T(y-net)/n'],
  ['code','src/models/linear.py',`class AdalineGD(ClassifierMixin, BaseEstimator):
    def __init__(self, learning_rate=0.01, n_iterations=50,
                 fit_intercept=True, random_state=None):
        self.learning_rate = learning_rate
        self.n_iterations = n_iterations
        self.fit_intercept = fit_intercept
        self.random_state = random_state

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'AdalineGD':
        X_fit = self._add_intercept(X)
        y_train = np.asarray(y, dtype=float).ravel()
        self.weights_ = np.zeros(X_fit.shape[1])
        self.loss_history_ = []
        for _ in range(self.n_iterations):
            net_input = X_fit @ self.weights_
            errors = y_train - net_input
            self.weights_ += self.learning_rate * (X_fit.T @ errors) / X_fit.shape[0]
            self.loss_history_.append(float(np.mean(errors ** 2)))
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return (self._add_intercept(X) @ self.weights_ >= 0.5).astype(int)`],
  ['h2','Linear separability and its catch'],
  ['p','One line can perfectly divide linearly separable binary data. Notebook 07 contrasts separable blobs with XOR-like, moon, and circle data, and tests EnergyTypeNet as Residential versus the rest. That easier binary result must not be confused with the overlapping three-class benchmark.'],
  ['callout','warning','The Perceptron Convergence Theorem has a catch','It guarantees convergence only for linearly separable data. With overlap, correcting one row can recreate another mistake. Use a finite iteration limit and cross-validation instead of waiting forever for zero errors.'],
  ['h2','Connection to LogisticRegressionOvR'],
  ['p','Both models draw linear boundaries. Logistic regression replaces the hard training threshold with a sigmoid and cross-entropy loss, producing smooth gradients and probabilities. Production uses sklearn LogisticRegression; the custom Perceptron remains educational.'],
  ['streamlit','Decision Boundaries','Choose EnergyTypeNet (pre-loaded), then Decision Boundaries. The straight logistic boundaries descend from the same linear-score idea. Observe why overlapping Residential and Commercial points cannot all be separated by one line.'],
  ['h2','Two ways to fit a regression line'],
  ['p','Notebook 07 predicts Energy Consumption from four EnergyTypeNet features. LinearRegressionGD iteratively follows a gradient. LinearRegressionNormal solves least squares directly, using an inverse when stable and np.linalg.lstsq as a fallback. Gradient descent scales better; solving a large coefficient matrix is roughly cubic in feature count.'],
  ['math','\\hat{y}=Xw, \\quad w_{normal}=(X^TX)^{-1}X^Ty, \\quad w_{GD}\\leftarrow w_{GD}-\\eta\\frac{2}{n}X^T(\\hat{y}-y)'],
  ['code','src/models/linear.py',`class LinearRegressionGD(RegressorMixin, BaseEstimator):
    def __init__(self, learning_rate=0.01, n_iterations=1000,
                 fit_intercept=True): ...
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LinearRegressionGD': ...
    def predict(self, X: np.ndarray) -> np.ndarray: ...

class LinearRegressionNormal(RegressorMixin, BaseEstimator):
    def __init__(self, fit_intercept=True): ...
    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LinearRegressionNormal':
        X_fit = self._add_intercept(X)
        xtx = X_fit.T @ X_fit
        try:
            self.weights_ = np.linalg.inv(xtx) @ X_fit.T @ y
        except np.linalg.LinAlgError:
            self.weights_ = np.linalg.lstsq(X_fit, y, rcond=None)[0]
        return self
    def predict(self, X: np.ndarray) -> np.ndarray: ...`],
  ['quiz',[
    {q:'What happens after a correctly classified Perceptron example?',a:1,opts:[{t:'Weights double',e:'The implementation never doubles every weight after processing a correct example.'},{t:'Weights stay unchanged',e:'The target-minus-prediction term is zero, so the complete update equals zero.'},{t:'Bias becomes one',e:'The embedded bias weight follows exactly the same error-driven update rule.'},{t:'Training immediately ends',e:'One correct row does not prove every remaining row is separable.'}]},
    {q:'Why does Adaline provide a smoother learning signal?',a:2,opts:[{t:'It uses deeper trees',e:'Adaline is a linear neuron and contains no decision-tree splitting process.'},{t:'It removes all overlap',e:'An optimizer cannot remove overlap already present in the underlying dataset.'},{t:'It optimizes continuous error',e:'Mean squared error on net input changes smoothly when weights change.'},{t:'It stores every neighbor',e:'Storing neighbors describes instance-based learning rather than batch gradient descent.'}]},
    {q:'Why can the normal equation become impractical with 10,000 features?',a:3,opts:[{t:'It needs class labels',e:'Linear regression accepts continuous targets and requires no categorical class labels.'},{t:'It cannot fit an intercept',e:'The implementation adds an intercept column when fit_intercept is enabled.'},{t:'It supports two rows',e:'The least-squares solution supports many observations when dimensions permit it.'},{t:'Matrix solving is cubic',e:'Solving the coefficient matrix scales roughly cubically with the feature count.'}]}
  ]],
  ['prompt','Perceptron and Linear Separability','Explain why the Perceptron convergence theorem does not guarantee convergence for overlapping Residential and Commercial buildings, how AdalineGD uses continuous error, and how LogisticRegressionOvR improves further. Use concrete building examples and small numeric updates.'],
];
