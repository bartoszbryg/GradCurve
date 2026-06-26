window.BLOCKS[1].push(
  ['h2', "Exact source code - Dataset"],
  ['p', "Why this exists: without this loader, every model would receive raw strings or mismatched columns and training would fail before learning starts."],
  ['code', "src/data.py (exact source)", `def load_raw(filepath: str) -> pd.DataFrame:
    """Load the raw CSV data and remove empty rows."""
    return pd.read_csv(filepath).dropna()

def load_features(filepath: str, feature_set: str = 'core'):
    """Return feature and target arrays for the selected feature set.

    Parameters
    ----------
    filepath : path to CSV
    feature_set : one of 'core', 'extended', 'all'
    """
    df = load_raw(filepath)

    y = df['Building Type'].map(LABEL_MAP).values
    X = df[FEATURE_COLS[feature_set]].values.astype(float)

    return X, y`],
  ['code', 'Line by line explanation', `def load_raw(filepath: str) -> pd.DataFrame:  # define function
    """Load the raw CSV data and remove empty rows."""  # document behavior
    return pd.read_csv(filepath).dropna()  # return result

def load_features(filepath: str, feature_set: str = 'core'):  # define function
    """Return feature and target arrays for the selected feature set.  # document behavior

    Parameters  # continue statement
    ----------  # continue statement
    filepath : path to CSV  # continue statement
    feature_set : one of 'core', 'extended', 'all'  # continue statement
    """  # document behavior
    df = load_raw(filepath)  # assign value

    y = df['Building Type'].map(LABEL_MAP).values  # assign value
    X = df[FEATURE_COLS[feature_set]].values.astype(float)  # assign value

    return X, y  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: core features
X_core, y = load_features('data/train_energy_data.csv')
# Output: X_core.shape = (1000, 2)

# Call 2: extended features
X_ext, y = load_features('data/train_energy_data.csv', 'extended')
# Output changes to X_ext.shape = (1000, 4)

# Call 3: all numeric features
X_all, y = load_features('data/train_energy_data.csv', 'all')
# Output changes to X_all.shape = (1000, 5)`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[2].push(
  ['h2', "Exact source code - Feature Engineering"],
  ['p', "Why this exists: without engineered ratios, size hides usage intensity and similar-looking rows stay mixed together."],
  ['code', "src/data.py (exact source)", `def make_engineered_features(df: pd.DataFrame):
    """Create original and derived numeric features from a raw dataframe.

    Returns
    -------
    X : ndarray of shape (n, n_features)
    feat_names : list of feature name strings
    """
    feat = pd.DataFrame()

    feat['energy_consumption'] = df['Energy Consumption']
    feat['square_footage'] = df['Square Footage']
    feat['num_occupants'] = df['Number of Occupants']
    feat['appliances_used'] = df['Appliances Used']
    feat['avg_temperature'] = df['Average Temperature']
    feat['is_weekend'] = (df['Day of Week'] == 'Weekend').astype(float)

    sqft_safe = df['Square Footage'].clip(lower=1)
    occ_safe = df['Number of Occupants'].clip(lower=1)

    feat['energy_per_sqft'] = df['Energy Consumption'] / sqft_safe
    feat['occupancy_density'] = df['Number of Occupants'] / sqft_safe
    feat['appliance_per_occ'] = df['Appliances Used'] / occ_safe

    return feat.values.astype(float), list(feat.columns)`],
  ['code', 'Line by line explanation', `def make_engineered_features(df: pd.DataFrame):  # define function
    """Create original and derived numeric features from a raw dataframe.  # document behavior

    Returns  # continue statement
    -------  # continue statement
    X : ndarray of shape (n, n_features)  # continue statement
    feat_names : list of feature name strings  # continue statement
    """  # document behavior
    feat = pd.DataFrame()  # assign value

    feat['energy_consumption'] = df['Energy Consumption']  # assign value
    feat['square_footage'] = df['Square Footage']  # assign value
    feat['num_occupants'] = df['Number of Occupants']  # assign value
    feat['appliances_used'] = df['Appliances Used']  # assign value
    feat['avg_temperature'] = df['Average Temperature']  # assign value
    feat['is_weekend'] = (df['Day of Week'] == 'Weekend').astype(float)  # assign value

    sqft_safe = df['Square Footage'].clip(lower=1)  # assign value
    occ_safe = df['Number of Occupants'].clip(lower=1)  # assign value

    feat['energy_per_sqft'] = df['Energy Consumption'] / sqft_safe  # assign value
    feat['occupancy_density'] = df['Number of Occupants'] / sqft_safe  # assign value
    feat['appliance_per_occ'] = df['Appliances Used'] / occ_safe  # assign value

    return feat.values.astype(float), list(feat.columns)  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: full training DataFrame
X_eng, names = make_engineered_features(train_df)
# Output: X_eng.shape = (1000, 9)

# Call 2: first 10 rows only
X_small, names = make_engineered_features(train_df.head(10))
# Output changes to X_small.shape = (10, 9)

# Call 3: a row with zero square footage
X_fixed, names = make_engineered_features(problem_df)
# Output stays finite because clip(lower=1) prevents division by zero`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[3].push(
  ['h2', "Exact source code - Feature Scaling"],
  ['p', "Why this exists: without in-fold scaling, validation statistics leak into training and cross-validation becomes overly optimistic."],
  ['code', "src/evaluation.py (exact source)", `def cross_validate_custom(
    model_cls,
    kwargs: dict,
    X: np.ndarray,
    y: np.ndarray,
    skf=None,
    needs_scaling: bool = True,
) -> np.ndarray:
    """Run k-fold cross-validation for a custom model class.

    Parameters
    ----------
    model_cls : class to instantiate each fold
    kwargs : constructor arguments
    X, y : full dataset
    skf : StratifiedKFold instance
    needs_scaling : whether to fit a StandardScaler inside each fold
    """
    if skf is None:
        skf = make_skf()

    scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        if needs_scaling:
            scaler = StandardScaler()
            X_train = scaler.fit_transform(X_train)
            X_val = scaler.transform(X_val)

        model = model_cls(**kwargs)
        model.fit(X_train, y_train)

        scores.append(accuracy_score(y_val, model.predict(X_val)))

    return np.array(scores)`],
  ['code', 'Line by line explanation', `def cross_validate_custom(  # define function
    model_cls,  # continue statement
    kwargs: dict,  # continue statement
    X: np.ndarray,  # continue statement
    y: np.ndarray,  # continue statement
    skf=None,  # assign value
    needs_scaling: bool = True,  # assign value
) -> np.ndarray:  # continue statement
    """Run k-fold cross-validation for a custom model class.  # document behavior

    Parameters  # continue statement
    ----------  # continue statement
    model_cls : class to instantiate each fold  # continue statement
    kwargs : constructor arguments  # continue statement
    X, y : full dataset  # continue statement
    skf : StratifiedKFold instance  # continue statement
    needs_scaling : whether to fit a StandardScaler inside each fold  # continue statement
    """  # document behavior
    if skf is None:  # check condition
        skf = make_skf()  # assign value

    scores = []  # assign value

    for train_idx, val_idx in skf.split(X, y):  # loop through values
        X_train, X_val = X[train_idx], X[val_idx]  # assign value
        y_train, y_val = y[train_idx], y[val_idx]  # assign value

        if needs_scaling:  # check condition
            scaler = StandardScaler()  # assign value
            X_train = scaler.fit_transform(X_train)  # assign value
            X_val = scaler.transform(X_val)  # assign value

        model = model_cls(**kwargs)  # assign value
        model.fit(X_train, y_train)  # continue statement

        scores.append(accuracy_score(y_val, model.predict(X_val)))  # continue statement

    return np.array(scores)  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: scale inside each fold
scores = cross_validate_custom(LogisticRegressionOvR, {'eta': 0.0001}, X, y)
# Output: each validation fold uses its own training-only scaler

# Call 2: skip scaling for tree models
scores = cross_validate_custom(AttentionClassifier, {'w': 1.0}, X_sc, y, needs_scaling=False)
# Output changes because X_sc is already standardized

# Call 3: use 3 folds
scores = cross_validate_custom(LogisticRegressionOvR, {}, X, y, make_skf(3))
# Output changes to 3 accuracy values`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change StandardScaler.fit() from X_train to the full X before cross-validation?",a:1,opts:[{t:"The score becomes more honest because every fold uses more data.",e:"No. The validation fold leaks into the scaler statistics."},{t:"The CV score can become too high because validation statistics leak into training.",e:"Correct. This is data leakage."},{t:"The model stops running because StandardScaler requires fold indices.",e:"StandardScaler does not know about folds."},{t:"Only the test set changes; CV is unaffected.",e:"CV is affected immediately."}]}]],
);
window.BLOCKS[4].push(
  ['h2', "Exact source code - Logistic Regression OvR"],
  ['p', "Why this exists: without this custom class, the lesson cannot show how one-vs-rest gradient updates are actually implemented."],
  ['code', "src/models.py (exact source)", `class LogisticRegressionOvR(ClassifierMixin, BaseEstimator):
    """One-vs-rest multiclass logistic regression trained with gradient descent."""

    def __init__(
        self,
        eta: float = 0.0001,
        n_iter: int = 1000,
        alpha: float = 0.0,
        random_state: int = 42,
    ):
        self.eta = eta
        self.n_iter = n_iter
        self.alpha = alpha
        self.random_state = random_state

    @staticmethod
    def _sigmoid(z: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-np.clip(z, -250, 250)))

    def _fit_binary(self, X: np.ndarray, y_bin: np.ndarray, rng: np.random.RandomState):
        w = rng.normal(0.0, 0.01, size=1 + X.shape[1])
        losses = []

        for _ in range(self.n_iter):
            net = X @ w[1:] + w[0]
            output = self._sigmoid(net)
            errors = y_bin - output

            w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])
            w[0] += self.eta * errors.sum()

            output = np.clip(output, 1e-10, 1 - 1e-10)
            loss = (
                -y_bin @ np.log(output)
                - (1 - y_bin) @ np.log(1 - output)
                + (self.alpha / 2) * np.sum(w[1:] ** 2)
            )
            losses.append(loss)

        return w, losses

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LogisticRegressionOvR':
        self.classes_ = np.unique(y)
        rng = np.random.RandomState(self.random_state)

        self.weights_: list = []
        self.losses_: list = []

        for c in self.classes_:
            y_binary = (y == c).astype(float)
            w, losses = self._fit_binary(X, y_binary, rng)

            self.weights_.append(w)
            self.losses_.append(losses)

        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        scores = np.column_stack([
            self._sigmoid(X @ w[1:] + w[0])
            for w in self.weights_
        ])

        return self.classes_[np.argmax(scores, axis=1)]

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        scores = np.column_stack([
            self._sigmoid(X @ w[1:] + w[0])
            for w in self.weights_
        ])
        scores /= scores.sum(axis=1, keepdims=True) + 1e-12

        return scores`],
  ['code', 'Line by line explanation', `class LogisticRegressionOvR(ClassifierMixin, BaseEstimator):  # define class
    """One-vs-rest multiclass logistic regression trained with gradient descent."""  # document behavior

    def __init__(  # define function
        self,  # continue statement
        eta: float = 0.0001,  # assign value
        n_iter: int = 1000,  # assign value
        alpha: float = 0.0,  # assign value
        random_state: int = 42,  # assign value
    ):  # continue statement
        self.eta = eta  # assign value
        self.n_iter = n_iter  # assign value
        self.alpha = alpha  # assign value
        self.random_state = random_state  # assign value

    @staticmethod  # apply decorator
    def _sigmoid(z: np.ndarray) -> np.ndarray:  # define function
        return 1.0 / (1.0 + np.exp(-np.clip(z, -250, 250)))  # return result

    def _fit_binary(self, X: np.ndarray, y_bin: np.ndarray, rng: np.random.RandomState):  # define function
        w = rng.normal(0.0, 0.01, size=1 + X.shape[1])  # assign value
        losses = []  # assign value

        for _ in range(self.n_iter):  # loop through values
            net = X @ w[1:] + w[0]  # assign value
            output = self._sigmoid(net)  # assign value
            errors = y_bin - output  # assign value

            w[1:] += self.eta * (X.T @ errors - self.alpha * w[1:])  # assign value
            w[0] += self.eta * errors.sum()  # assign value

            output = np.clip(output, 1e-10, 1 - 1e-10)  # assign value
            loss = (  # assign value
                -y_bin @ np.log(output)  # continue statement
                - (1 - y_bin) @ np.log(1 - output)  # continue statement
                + (self.alpha / 2) * np.sum(w[1:] ** 2)  # continue statement
            )  # continue statement
            losses.append(loss)  # continue statement

        return w, losses  # return result

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LogisticRegressionOvR':  # define function
        self.classes_ = np.unique(y)  # assign value
        rng = np.random.RandomState(self.random_state)  # assign value

        self.weights_: list = []  # assign value
        self.losses_: list = []  # assign value

        for c in self.classes_:  # loop through values
            y_binary = (y == c).astype(float)  # assign value
            w, losses = self._fit_binary(X, y_binary, rng)  # assign value

            self.weights_.append(w)  # continue statement
            self.losses_.append(losses)  # continue statement

        return self  # return result

    def predict(self, X: np.ndarray) -> np.ndarray:  # define function
        scores = np.column_stack([  # assign value
            self._sigmoid(X @ w[1:] + w[0])  # continue statement
            for w in self.weights_  # loop through values
        ])  # continue statement

        return self.classes_[np.argmax(scores, axis=1)]  # return result

    def predict_proba(self, X: np.ndarray) -> np.ndarray:  # define function
        scores = np.column_stack([  # assign value
            self._sigmoid(X @ w[1:] + w[0])  # continue statement
            for w in self.weights_  # loop through values
        ])  # continue statement
        scores /= scores.sum(axis=1, keepdims=True) + 1e-12  # assign value

        return scores  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: default OvR classifier
ovr = LogisticRegressionOvR().fit(X_scaled, y)
# Output: predict_proba returns three normalized class probabilities

# Call 2: stronger L2 penalty
ovr = LogisticRegressionOvR(alpha=0.01).fit(X_scaled, y)
# Output changes: weights become smaller

# Call 3: more training iterations
ovr = LogisticRegressionOvR(n_iter=3000).fit(X_scaled, y)
# Output changes: loss has more chances to converge`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[5].push(
  ['h2', "Exact source code - Softmax Regression"],
  ['p', "Why this exists: without softmax, class scores would not compete for one shared probability total."],
  ['code', "src/models.py (exact source)", `class LogisticRegressionSoftmax(ClassifierMixin, BaseEstimator):
    """Multinomial logistic regression trained with softmax cross-entropy."""

    def __init__(
        self,
        eta: float = 0.01,
        n_iter: int = 1000,
        alpha: float = 0.0,
        random_state: int = 42,
    ):
        self.eta = eta
        self.n_iter = n_iter
        self.alpha = alpha
        self.random_state = random_state

    @staticmethod
    def _softmax(z: np.ndarray) -> np.ndarray:
        z = z - z.max(axis=1, keepdims=True)
        exp_z = np.exp(z)

        return exp_z / exp_z.sum(axis=1, keepdims=True)

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LogisticRegressionSoftmax':
        self.classes_ = np.unique(y)
        n_samples, n_features = X.shape
        n_classes = len(self.classes_)

        rng = np.random.RandomState(self.random_state)

        self.W_ = rng.normal(0.0, 0.01, size=(n_classes, n_features))
        self.b_ = np.zeros(n_classes)
        self.loss_: list = []

        Y = np.zeros((n_samples, n_classes))
        for i, c in enumerate(self.classes_):
            Y[:, i] = y == c

        for _ in range(self.n_iter):
            P = self._softmax(X @ self.W_.T + self.b_)
            dL = (P - Y) / n_samples

            self.W_ -= self.eta * (dL.T @ X + self.alpha * self.W_)
            self.b_ -= self.eta * dL.sum(axis=0)

            P_clip = np.clip(P, 1e-10, 1.0)
            loss = (
                -np.sum(Y * np.log(P_clip)) / n_samples
                + (self.alpha / 2) * np.sum(self.W_ ** 2)
            )
            self.loss_.append(loss)

        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self._softmax(X @ self.W_.T + self.b_)

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.classes_[np.argmax(self.predict_proba(X), axis=1)]`],
  ['code', 'Line by line explanation', `class LogisticRegressionSoftmax(ClassifierMixin, BaseEstimator):  # define class
    """Multinomial logistic regression trained with softmax cross-entropy."""  # document behavior

    def __init__(  # define function
        self,  # continue statement
        eta: float = 0.01,  # assign value
        n_iter: int = 1000,  # assign value
        alpha: float = 0.0,  # assign value
        random_state: int = 42,  # assign value
    ):  # continue statement
        self.eta = eta  # assign value
        self.n_iter = n_iter  # assign value
        self.alpha = alpha  # assign value
        self.random_state = random_state  # assign value

    @staticmethod  # apply decorator
    def _softmax(z: np.ndarray) -> np.ndarray:  # define function
        z = z - z.max(axis=1, keepdims=True)  # assign value
        exp_z = np.exp(z)  # assign value

        return exp_z / exp_z.sum(axis=1, keepdims=True)  # return result

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'LogisticRegressionSoftmax':  # define function
        self.classes_ = np.unique(y)  # assign value
        n_samples, n_features = X.shape  # assign value
        n_classes = len(self.classes_)  # assign value

        rng = np.random.RandomState(self.random_state)  # assign value

        self.W_ = rng.normal(0.0, 0.01, size=(n_classes, n_features))  # assign value
        self.b_ = np.zeros(n_classes)  # assign value
        self.loss_: list = []  # assign value

        Y = np.zeros((n_samples, n_classes))  # assign value
        for i, c in enumerate(self.classes_):  # loop through values
            Y[:, i] = y == c  # assign value

        for _ in range(self.n_iter):  # loop through values
            P = self._softmax(X @ self.W_.T + self.b_)  # assign value
            dL = (P - Y) / n_samples  # assign value

            self.W_ -= self.eta * (dL.T @ X + self.alpha * self.W_)  # assign value
            self.b_ -= self.eta * dL.sum(axis=0)  # assign value

            P_clip = np.clip(P, 1e-10, 1.0)  # assign value
            loss = (  # assign value
                -np.sum(Y * np.log(P_clip)) / n_samples  # continue statement
                + (self.alpha / 2) * np.sum(self.W_ ** 2)  # continue statement
            )  # continue statement
            self.loss_.append(loss)  # continue statement

        return self  # return result

    def predict_proba(self, X: np.ndarray) -> np.ndarray:  # define function
        return self._softmax(X @ self.W_.T + self.b_)  # return result

    def predict(self, X: np.ndarray) -> np.ndarray:  # define function
        return self.classes_[np.argmax(self.predict_proba(X), axis=1)]  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: train softmax
sm = LogisticRegressionSoftmax().fit(X_scaled, y)
# Output: probabilities sum to 1.0 per row

# Call 2: slower learning rate
sm = LogisticRegressionSoftmax(eta=0.001).fit(X_scaled, y)
# Output changes: loss decreases more slowly

# Call 3: regularized softmax
sm = LogisticRegressionSoftmax(alpha=0.01).fit(X_scaled, y)
# Output changes: W_ values are pulled toward zero`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change feature_set from core to extended before fitting LogisticRegressionSoftmax?",a:2,opts:[{t:"The model still has two weights because softmax only supports two features.",e:"Softmax supports any numeric feature count."},{t:"The probabilities stop summing to one.",e:"Softmax probabilities still sum to one."},{t:"W_ changes from shape (3, 2) to (3, 4), adding two weights per class.",e:"Correct. One weight is learned per class per feature."},{t:"The class list changes from three classes to four classes.",e:"Classes are unchanged; features changed."}]}]],
);
window.BLOCKS[6].push(
  ['h2', "Exact source code - Attention Classifier"],
  ['p', "Why this exists: without this memory-based classifier, the project has no simple model that can follow local curved boundaries."],
  ['code', "src/models.py (exact source)", `class AttentionClassifier(ClassifierMixin, BaseEstimator):
    """Kernel-weighted nearest-neighbor classifier."""

    def __init__(self, w: float = 1.0):
        self.w = w

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'AttentionClassifier':
        self.X_train_ = X
        self.y_train_ = y.ravel()
        self.classes_ = np.unique(self.y_train_)

        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        diff = X[:, np.newaxis, :] - self.X_train_[np.newaxis, :, :]
        dist = np.sqrt(np.sum(diff ** 2, axis=2))

        weights = np.exp(-dist / self.w)
        weights /= weights.sum(axis=1, keepdims=True) + 1e-12

        return np.stack(
            [weights[:, self.y_train_ == c].sum(axis=1) for c in self.classes_],
            axis=1,
        )

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.classes_[np.argmax(self.predict_proba(X), axis=1)]`],
  ['code', 'Line by line explanation', `class AttentionClassifier(ClassifierMixin, BaseEstimator):  # define class
    """Kernel-weighted nearest-neighbor classifier."""  # document behavior

    def __init__(self, w: float = 1.0):  # define function
        self.w = w  # assign value

    def fit(self, X: np.ndarray, y: np.ndarray) -> 'AttentionClassifier':  # define function
        self.X_train_ = X  # assign value
        self.y_train_ = y.ravel()  # assign value
        self.classes_ = np.unique(self.y_train_)  # assign value

        return self  # return result

    def predict_proba(self, X: np.ndarray) -> np.ndarray:  # define function
        diff = X[:, np.newaxis, :] - self.X_train_[np.newaxis, :, :]  # assign value
        dist = np.sqrt(np.sum(diff ** 2, axis=2))  # assign value

        weights = np.exp(-dist / self.w)  # assign value
        weights /= weights.sum(axis=1, keepdims=True) + 1e-12  # assign value

        return np.stack(  # return result
            [weights[:, self.y_train_ == c].sum(axis=1) for c in self.classes_],  # assign value
            axis=1,  # assign value
        )  # continue statement

    def predict(self, X: np.ndarray) -> np.ndarray:  # define function
        return self.classes_[np.argmax(self.predict_proba(X), axis=1)]  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: balanced bandwidth
attn = AttentionClassifier(w=1.0).fit(X_scaled, y)
# Output: first-row probabilities = [0.4429, 0.3571, 0.2000]

# Call 2: tiny bandwidth
attn = AttentionClassifier(w=0.1).fit(X_scaled, y)
# Output changes: nearest neighbors dominate

# Call 3: huge bandwidth
attn = AttentionClassifier(w=10.0).fit(X_scaled, y)
# Output changes: probabilities drift toward class frequency`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[7].push(
  ['h2', "Exact source code - XGBoost"],
  ['p', "Why this exists: without build_models(), every training run would hand-construct different estimators and comparisons would stop being reproducible."],
  ['code', "src/train.py (exact source)", `def build_models(random_state: int = 42) -> dict:
    """Build all candidate models used by the training script."""
    lr = make_pipeline(
        StandardScaler(),
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),
    )

    mlp = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(40, 20),
            activation='tanh',
            alpha=1e-5,
            max_iter=3000,
            early_stopping=True,
            random_state=random_state,
        ),
    )

    xgb = XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        max_depth=5,
        learning_rate=0.05,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=1.0,
        gamma=0,
        random_state=random_state,
        verbosity=0,
    )

    voting = VotingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        voting='soft',
    )

    stacking = StackingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        final_estimator=LogisticRegression(max_iter=1000),
        stack_method='predict_proba',
        cv=5,
        n_jobs=1,
    )

    return {
        'logistic_regression': lr,
        'mlp': mlp,
        'xgboost': xgb,
        'soft_voting': voting,
        'stacking': stacking,
    }`],
  ['code', 'Line by line explanation', `def build_models(random_state: int = 42) -> dict:  # define function
    """Build all candidate models used by the training script."""  # document behavior
    lr = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),  # assign value
    )  # continue statement

    mlp = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        MLPClassifier(  # continue statement
            hidden_layer_sizes=(40, 20),  # assign value
            activation='tanh',  # assign value
            alpha=1e-5,  # assign value
            max_iter=3000,  # assign value
            early_stopping=True,  # assign value
            random_state=random_state,  # assign value
        ),  # continue statement
    )  # continue statement

    xgb = XGBClassifier(  # assign value
        objective='multi:softprob',  # assign value
        num_class=3,  # assign value
        eval_metric='mlogloss',  # assign value
        max_depth=5,  # assign value
        learning_rate=0.05,  # assign value
        n_estimators=100,  # assign value
        subsample=0.8,  # assign value
        colsample_bytree=1.0,  # assign value
        gamma=0,  # assign value
        random_state=random_state,  # assign value
        verbosity=0,  # assign value
    )  # continue statement

    voting = VotingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        voting='soft',  # assign value
    )  # continue statement

    stacking = StackingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        final_estimator=LogisticRegression(max_iter=1000),  # assign value
        stack_method='predict_proba',  # assign value
        cv=5,  # assign value
        n_jobs=1,  # assign value
    )  # continue statement

    return {  # return result
        'logistic_regression': lr,  # continue statement
        'mlp': mlp,  # continue statement
        'xgboost': xgb,  # continue statement
        'soft_voting': voting,  # continue statement
        'stacking': stacking,  # continue statement
    }  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: default model suite
models = build_models()
# Output: keys include logistic_regression, mlp, xgboost, soft_voting, stacking

# Call 2: different seed
models = build_models(random_state=7)
# Output changes: stochastic models use a different reproducible seed

# Call 3: train only XGBoost
xgb = build_models()['xgboost'].fit(X_train, y_train)
# Output: xgb.predict_proba(X_test) returns 3 columns`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change XGBoost max_depth from 5 to 1?",a:0,opts:[{t:"Each tree becomes a stump, so the model is simpler and may underfit.",e:"Correct. Shallow trees capture fewer interactions."},{t:"Each tree memorizes more training rows.",e:"That happens with deeper trees, not shallower ones."},{t:"The number of classes changes to one.",e:"max_depth does not change classes."},{t:"The model cannot output probabilities.",e:"The objective still outputs probabilities."}]}]],
);
window.BLOCKS[8].push(
  ['h2', "Exact source code - Neural Network (MLP)"],
  ['p', "Why this exists: without the pipeline wrapper, the neural network would train on unscaled raw magnitudes and converge poorly."],
  ['code', "src/train.py (exact source)", `def build_models(random_state: int = 42) -> dict:
    """Build all candidate models used by the training script."""
    lr = make_pipeline(
        StandardScaler(),
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),
    )

    mlp = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(40, 20),
            activation='tanh',
            alpha=1e-5,
            max_iter=3000,
            early_stopping=True,
            random_state=random_state,
        ),
    )

    xgb = XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        max_depth=5,
        learning_rate=0.05,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=1.0,
        gamma=0,
        random_state=random_state,
        verbosity=0,
    )

    voting = VotingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        voting='soft',
    )

    stacking = StackingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        final_estimator=LogisticRegression(max_iter=1000),
        stack_method='predict_proba',
        cv=5,
        n_jobs=1,
    )

    return {
        'logistic_regression': lr,
        'mlp': mlp,
        'xgboost': xgb,
        'soft_voting': voting,
        'stacking': stacking,
    }`],
  ['code', 'Line by line explanation', `def build_models(random_state: int = 42) -> dict:  # define function
    """Build all candidate models used by the training script."""  # document behavior
    lr = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),  # assign value
    )  # continue statement

    mlp = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        MLPClassifier(  # continue statement
            hidden_layer_sizes=(40, 20),  # assign value
            activation='tanh',  # assign value
            alpha=1e-5,  # assign value
            max_iter=3000,  # assign value
            early_stopping=True,  # assign value
            random_state=random_state,  # assign value
        ),  # continue statement
    )  # continue statement

    xgb = XGBClassifier(  # assign value
        objective='multi:softprob',  # assign value
        num_class=3,  # assign value
        eval_metric='mlogloss',  # assign value
        max_depth=5,  # assign value
        learning_rate=0.05,  # assign value
        n_estimators=100,  # assign value
        subsample=0.8,  # assign value
        colsample_bytree=1.0,  # assign value
        gamma=0,  # assign value
        random_state=random_state,  # assign value
        verbosity=0,  # assign value
    )  # continue statement

    voting = VotingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        voting='soft',  # assign value
    )  # continue statement

    stacking = StackingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        final_estimator=LogisticRegression(max_iter=1000),  # assign value
        stack_method='predict_proba',  # assign value
        cv=5,  # assign value
        n_jobs=1,  # assign value
    )  # continue statement

    return {  # return result
        'logistic_regression': lr,  # continue statement
        'mlp': mlp,  # continue statement
        'xgboost': xgb,  # continue statement
        'soft_voting': voting,  # continue statement
        'stacking': stacking,  # continue statement
    }  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: get the MLP pipeline
mlp = build_models()['mlp']
# Output: StandardScaler runs before MLPClassifier

# Call 2: fit on core features
mlp.fit(X_train, y_train)
# Output: predicts labels with mlp.predict(X_test)

# Call 3: fit on extended features
mlp.fit(X_train_ext, y_train)
# Output changes: first layer receives 4 inputs instead of 2`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you remove StandardScaler from the MLP pipeline?",a:1,opts:[{t:"Training becomes more stable because raw values are preserved.",e:"Raw magnitudes usually make neural training less stable."},{t:"The optimizer sees huge feature-scale differences and convergence becomes slower or worse.",e:"Correct. MLP training is scale-sensitive."},{t:"The hidden layers automatically normalize inputs.",e:"MLPClassifier does not normalize features automatically."},{t:"Only XGBoost is affected.",e:"The MLP is directly affected."}]}]],
);
window.BLOCKS[9].push(
  ['h2', "Exact source code - Ensemble Methods"],
  ['p', "Why this exists: without ensembles, the project cannot combine linear, neural, and tree models into one stronger decision."],
  ['code', "src/train.py (exact source)", `def build_models(random_state: int = 42) -> dict:
    """Build all candidate models used by the training script."""
    lr = make_pipeline(
        StandardScaler(),
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),
    )

    mlp = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(40, 20),
            activation='tanh',
            alpha=1e-5,
            max_iter=3000,
            early_stopping=True,
            random_state=random_state,
        ),
    )

    xgb = XGBClassifier(
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        max_depth=5,
        learning_rate=0.05,
        n_estimators=100,
        subsample=0.8,
        colsample_bytree=1.0,
        gamma=0,
        random_state=random_state,
        verbosity=0,
    )

    voting = VotingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        voting='soft',
    )

    stacking = StackingClassifier(
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],
        final_estimator=LogisticRegression(max_iter=1000),
        stack_method='predict_proba',
        cv=5,
        n_jobs=1,
    )

    return {
        'logistic_regression': lr,
        'mlp': mlp,
        'xgboost': xgb,
        'soft_voting': voting,
        'stacking': stacking,
    }`],
  ['code', 'Line by line explanation', `def build_models(random_state: int = 42) -> dict:  # define function
    """Build all candidate models used by the training script."""  # document behavior
    lr = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        LogisticRegression(C=10, max_iter=1000, random_state=random_state),  # assign value
    )  # continue statement

    mlp = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        MLPClassifier(  # continue statement
            hidden_layer_sizes=(40, 20),  # assign value
            activation='tanh',  # assign value
            alpha=1e-5,  # assign value
            max_iter=3000,  # assign value
            early_stopping=True,  # assign value
            random_state=random_state,  # assign value
        ),  # continue statement
    )  # continue statement

    xgb = XGBClassifier(  # assign value
        objective='multi:softprob',  # assign value
        num_class=3,  # assign value
        eval_metric='mlogloss',  # assign value
        max_depth=5,  # assign value
        learning_rate=0.05,  # assign value
        n_estimators=100,  # assign value
        subsample=0.8,  # assign value
        colsample_bytree=1.0,  # assign value
        gamma=0,  # assign value
        random_state=random_state,  # assign value
        verbosity=0,  # assign value
    )  # continue statement

    voting = VotingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        voting='soft',  # assign value
    )  # continue statement

    stacking = StackingClassifier(  # assign value
        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],  # assign value
        final_estimator=LogisticRegression(max_iter=1000),  # assign value
        stack_method='predict_proba',  # assign value
        cv=5,  # assign value
        n_jobs=1,  # assign value
    )  # continue statement

    return {  # return result
        'logistic_regression': lr,  # continue statement
        'mlp': mlp,  # continue statement
        'xgboost': xgb,  # continue statement
        'soft_voting': voting,  # continue statement
        'stacking': stacking,  # continue statement
    }  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: soft voting
voting = build_models()['soft_voting']
# Output: averages probability vectors from LR, MLP, and XGBoost

# Call 2: stacking
stacking = build_models()['stacking']
# Output: meta-model learns from base-model probabilities

# Call 3: compare both
results = evaluate_models({'vote': voting, 'stack': stacking}, X, y)
# Output changes: each ensemble gets its own CV mean and std`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change VotingClassifier voting from soft to hard?",a:2,opts:[{t:"It averages probability vectors more carefully.",e:"That describes soft voting."},{t:"It uses the stacking meta-model instead.",e:"Voting and stacking are different estimators."},{t:"It counts only each model's top class vote, losing confidence information.",e:"Correct. Hard voting ignores probability strength."},{t:"It prevents base models from being trained.",e:"Base models are still trained."}]}]],
);
window.BLOCKS[10].push(
  ['h2', "Exact source code - Cross-Validation"],
  ['p', "Why this exists: without stratified folds, one fold could contain too few examples of a class and the score would be noisy."],
  ['code', "src/evaluation.py (exact source)", `def make_skf(n_splits: int = 5, random_state: int = 42) -> StratifiedKFold:
    """Create the stratified cross-validation splitter used across notebooks."""
    return StratifiedKFold(
        n_splits=n_splits,
        shuffle=True,
        random_state=random_state,
    )

def cross_validate_custom(
    model_cls,
    kwargs: dict,
    X: np.ndarray,
    y: np.ndarray,
    skf=None,
    needs_scaling: bool = True,
) -> np.ndarray:
    """Run k-fold cross-validation for a custom model class.

    Parameters
    ----------
    model_cls : class to instantiate each fold
    kwargs : constructor arguments
    X, y : full dataset
    skf : StratifiedKFold instance
    needs_scaling : whether to fit a StandardScaler inside each fold
    """
    if skf is None:
        skf = make_skf()

    scores = []

    for train_idx, val_idx in skf.split(X, y):
        X_train, X_val = X[train_idx], X[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]

        if needs_scaling:
            scaler = StandardScaler()
            X_train = scaler.fit_transform(X_train)
            X_val = scaler.transform(X_val)

        model = model_cls(**kwargs)
        model.fit(X_train, y_train)

        scores.append(accuracy_score(y_val, model.predict(X_val)))

    return np.array(scores)`],
  ['code', 'Line by line explanation', `def make_skf(n_splits: int = 5, random_state: int = 42) -> StratifiedKFold:  # define function
    """Create the stratified cross-validation splitter used across notebooks."""  # document behavior
    return StratifiedKFold(  # return result
        n_splits=n_splits,  # assign value
        shuffle=True,  # assign value
        random_state=random_state,  # assign value
    )  # continue statement

def cross_validate_custom(  # define function
    model_cls,  # continue statement
    kwargs: dict,  # continue statement
    X: np.ndarray,  # continue statement
    y: np.ndarray,  # continue statement
    skf=None,  # assign value
    needs_scaling: bool = True,  # assign value
) -> np.ndarray:  # continue statement
    """Run k-fold cross-validation for a custom model class.  # document behavior

    Parameters  # continue statement
    ----------  # continue statement
    model_cls : class to instantiate each fold  # continue statement
    kwargs : constructor arguments  # continue statement
    X, y : full dataset  # continue statement
    skf : StratifiedKFold instance  # continue statement
    needs_scaling : whether to fit a StandardScaler inside each fold  # continue statement
    """  # document behavior
    if skf is None:  # check condition
        skf = make_skf()  # assign value

    scores = []  # assign value

    for train_idx, val_idx in skf.split(X, y):  # loop through values
        X_train, X_val = X[train_idx], X[val_idx]  # assign value
        y_train, y_val = y[train_idx], y[val_idx]  # assign value

        if needs_scaling:  # check condition
            scaler = StandardScaler()  # assign value
            X_train = scaler.fit_transform(X_train)  # assign value
            X_val = scaler.transform(X_val)  # assign value

        model = model_cls(**kwargs)  # assign value
        model.fit(X_train, y_train)  # continue statement

        scores.append(accuracy_score(y_val, model.predict(X_val)))  # continue statement

    return np.array(scores)  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: default 5-fold splitter
skf = make_skf()
# Output: five reproducible stratified folds

# Call 2: ten folds
skf = make_skf(n_splits=10)
# Output changes to ten smaller validation folds

# Call 3: different random seed
skf = make_skf(random_state=7)
# Output changes: fold membership changes reproducibly`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change StratifiedKFold shuffle from True to False on ordered data?",a:0,opts:[{t:"Folds may become class-skewed if similar rows are grouped together.",e:"Correct. Shuffling protects against order artifacts."},{t:"The number of folds doubles automatically.",e:"shuffle does not change n_splits."},{t:"The scaler stops working.",e:"Scaler behavior is independent."},{t:"The test set is used for training.",e:"The test set is not involved."}]}]],
);
