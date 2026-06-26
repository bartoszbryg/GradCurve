window.BLOCKS[11].push(
  ['h2', "Exact source code - Evaluation Metrics"],
  ['p', "Why this exists: without confusion matrices, accuracy hides which classes are being confused with each other."],
  ['code', "src/evaluation.py (exact source)", `def plot_confusion_matrices(
    named_models: list,
    y_test: np.ndarray,
    figsize=(15, 9),
) -> plt.Figure:
    """Plot a grid of confusion matrices."""
    n_models = len(named_models)
    ncols = 3
    nrows = (n_models + ncols - 1) // ncols

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize)
    axes_flat = axes.flatten() if n_models > 1 else [axes]

    for ax, (title, model, X) in zip(axes_flat, named_models):
        y_pred = model.predict(X)
        acc = accuracy_score(y_test, y_pred)

        ConfusionMatrixDisplay.from_predictions(
            y_test,
            y_pred,
            display_labels=CLASSES,
            ax=ax,
            colorbar=False,
            cmap='Blues',
        )
        ax.set_title(f'{title}\nacc={acc:.2f}', fontsize=10)

    for ax in axes_flat[n_models:]:
        ax.set_visible(False)

    fig.suptitle('Confusion Matrices - All Models (Test Set)', fontsize=12, y=1.01)
    plt.tight_layout()

    return fig`],
  ['code', 'Line by line explanation', `def plot_confusion_matrices(  # define function
    named_models: list,  # continue statement
    y_test: np.ndarray,  # continue statement
    figsize=(15, 9),  # assign value
) -> plt.Figure:  # continue statement
    """Plot a grid of confusion matrices."""  # document behavior
    n_models = len(named_models)  # assign value
    ncols = 3  # assign value
    nrows = (n_models + ncols - 1) // ncols  # assign value

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize)  # assign value
    axes_flat = axes.flatten() if n_models > 1 else [axes]  # assign value

    for ax, (title, model, X) in zip(axes_flat, named_models):  # loop through values
        y_pred = model.predict(X)  # assign value
        acc = accuracy_score(y_test, y_pred)  # assign value

        ConfusionMatrixDisplay.from_predictions(  # continue statement
            y_test,  # continue statement
            y_pred,  # continue statement
            display_labels=CLASSES,  # assign value
            ax=ax,  # assign value
            colorbar=False,  # assign value
            cmap='Blues',  # assign value
        )  # continue statement
        ax.set_title(f'{title}\nacc={acc:.2f}', fontsize=10)  # assign value

    for ax in axes_flat[n_models:]:  # loop through values
        ax.set_visible(False)  # continue statement

    fig.suptitle('Confusion Matrices - All Models (Test Set)', fontsize=12, y=1.01)  # assign value
    plt.tight_layout()  # continue statement

    return fig  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: plot one model
fig = plot_confusion_matrices([('XGBoost', xgb, X_test)], y_test)
# Output: one visible confusion matrix

# Call 2: plot three models
fig = plot_confusion_matrices(named_models, y_test)
# Output changes to a multi-panel grid

# Call 3: wider figure
fig = plot_confusion_matrices(named_models, y_test, figsize=(18, 10))
# Output changes: larger panels and labels`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change a model so it predicts every row as Residential?",a:3,opts:[{t:"Precision and recall become perfect for every class.",e:"The non-Residential classes fail."},{t:"The confusion matrix becomes empty.",e:"It still has counts."},{t:"Accuracy always becomes 100%.",e:"Only Residential rows are correct."},{t:"The Residential column fills up and Commercial/Industrial recall collapses.",e:"Correct. All predictions land in one column."}]},
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
    ]}]],
);
window.BLOCKS[12].push(
  ['h2', "Exact source code - Decision Boundaries"],
  ['p', "Why this exists: without boundary plots, users cannot see where each model changes its mind in feature space."],
  ['code', "src/evaluation.py (exact source)", `def plot_decision_boundaries(
    named_models: list,
    X_sc: np.ndarray,
    y: np.ndarray,
    h: float = 0.06,
    figsize=(16, 10),
) -> plt.Figure:
    """Plot 2-D decision boundaries for a list of fitted models."""
    x0_min, x0_max = X_sc[:, 0].min() - 0.5, X_sc[:, 0].max() + 0.5
    x1_min, x1_max = X_sc[:, 1].min() - 0.5, X_sc[:, 1].max() + 0.5

    xx, yy = np.meshgrid(
        np.arange(x0_min, x0_max, h),
        np.arange(x1_min, x1_max, h),
    )

    n_models = len(named_models)
    ncols = 3
    nrows = (n_models + ncols - 1) // ncols

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize)
    axes_flat = axes.flatten() if n_models > 1 else [axes]

    for ax, (title, model, grid) in zip(axes_flat, named_models):
        Z = model.predict(grid).reshape(xx.shape)

        ax.pcolormesh(xx, yy, Z, cmap=CMAP_LIGHT, alpha=0.65, shading='auto')
        ax.scatter(
            X_sc[:, 0],
            X_sc[:, 1],
            c=y,
            cmap=CMAP_BOLD,
            edgecolors='k',
            s=15,
            alpha=0.6,
            linewidths=0.3,
        )
        ax.set_title(title, fontsize=11)
        ax.set_xlabel('Energy Consumption (scaled)')
        ax.set_ylabel('Square Footage (scaled)')

    for ax in axes_flat[n_models:]:
        ax.set_visible(False)

    handles = [
        plt.Line2D(
            [0],
            [0],
            marker='o',
            color='w',
            markerfacecolor=color,
            markersize=9,
            label=label,
        )
        for color, label in zip(['#CC0000', '#006600', '#0000CC'], CLASSES)
    ]

    fig.legend(
        handles=handles,
        loc='lower center',
        ncol=3,
        fontsize=11,
        bbox_to_anchor=(0.5, -0.03),
    )
    fig.suptitle(
        'Decision Boundaries - Energy Consumption x Square Footage (scaled)',
        fontsize=13,
        y=1.01,
    )
    plt.tight_layout()

    return fig`],
  ['code', 'Line by line explanation', `def plot_decision_boundaries(  # define function
    named_models: list,  # continue statement
    X_sc: np.ndarray,  # continue statement
    y: np.ndarray,  # continue statement
    h: float = 0.06,  # assign value
    figsize=(16, 10),  # assign value
) -> plt.Figure:  # continue statement
    """Plot 2-D decision boundaries for a list of fitted models."""  # document behavior
    x0_min, x0_max = X_sc[:, 0].min() - 0.5, X_sc[:, 0].max() + 0.5  # assign value
    x1_min, x1_max = X_sc[:, 1].min() - 0.5, X_sc[:, 1].max() + 0.5  # assign value

    xx, yy = np.meshgrid(  # assign value
        np.arange(x0_min, x0_max, h),  # continue statement
        np.arange(x1_min, x1_max, h),  # continue statement
    )  # continue statement

    n_models = len(named_models)  # assign value
    ncols = 3  # assign value
    nrows = (n_models + ncols - 1) // ncols  # assign value

    fig, axes = plt.subplots(nrows, ncols, figsize=figsize)  # assign value
    axes_flat = axes.flatten() if n_models > 1 else [axes]  # assign value

    for ax, (title, model, grid) in zip(axes_flat, named_models):  # loop through values
        Z = model.predict(grid).reshape(xx.shape)  # assign value

        ax.pcolormesh(xx, yy, Z, cmap=CMAP_LIGHT, alpha=0.65, shading='auto')  # assign value
        ax.scatter(  # continue statement
            X_sc[:, 0],  # continue statement
            X_sc[:, 1],  # continue statement
            c=y,  # assign value
            cmap=CMAP_BOLD,  # assign value
            edgecolors='k',  # assign value
            s=15,  # assign value
            alpha=0.6,  # assign value
            linewidths=0.3,  # assign value
        )  # continue statement
        ax.set_title(title, fontsize=11)  # assign value
        ax.set_xlabel('Energy Consumption (scaled)')  # continue statement
        ax.set_ylabel('Square Footage (scaled)')  # continue statement

    for ax in axes_flat[n_models:]:  # loop through values
        ax.set_visible(False)  # continue statement

    handles = [  # assign value
        plt.Line2D(  # continue statement
            [0],  # continue statement
            [0],  # continue statement
            marker='o',  # assign value
            color='w',  # assign value
            markerfacecolor=color,  # assign value
            markersize=9,  # assign value
            label=label,  # assign value
        )  # continue statement
        for color, label in zip(['#CC0000', '#006600', '#0000CC'], CLASSES)  # loop through values
    ]  # continue statement

    fig.legend(  # continue statement
        handles=handles,  # assign value
        loc='lower center',  # assign value
        ncol=3,  # assign value
        fontsize=11,  # assign value
        bbox_to_anchor=(0.5, -0.03),  # assign value
    )  # continue statement
    fig.suptitle(  # continue statement
        'Decision Boundaries - Energy Consumption x Square Footage (scaled)',  # continue statement
        fontsize=13,  # assign value
        y=1.01,  # assign value
    )  # continue statement
    plt.tight_layout()  # continue statement

    return fig  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: standard resolution
fig = plot_decision_boundaries(named_models, X_sc, y)
# Output: smooth enough grid for quick inspection

# Call 2: finer grid
fig = plot_decision_boundaries(named_models, X_sc, y, h=0.03)
# Output changes: smoother but slower plot

# Call 3: larger canvas
fig = plot_decision_boundaries(named_models, X_sc, y, figsize=(20, 12))
# Output changes: more room for model panels`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[13].push(
  ['h2', "Exact source code - MLflow"],
  ['p', "Why this exists: without logging, model comparisons live only in terminal output and cannot be audited later."],
  ['code', "src/train.py (exact source)", `def log_to_mlflow(output: dict, model_path: Path, feature_set: str) -> None:
    """Log every candidate's CV scores plus the best model artifact to MLflow."""
    mlflow.set_experiment('EnergyTypeNet')
    with mlflow.start_run(run_name=f'train-{feature_set}'):
        mlflow.log_param('feature_set', feature_set)
        mlflow.log_param('best_model', output['best_name'])

        for model_name, metrics in output['results'].items():
            mlflow.log_metric(f'{model_name}_cv_mean', metrics['cv_mean'])
            mlflow.log_metric(f'{model_name}_cv_std', metrics['cv_std'])

        if 'test_accuracy' in output['results'][output['best_name']]:
            mlflow.log_metric(
                'test_accuracy',
                output['results'][output['best_name']]['test_accuracy'],
            )

        mlflow.sklearn.log_model(
            output['best_model'],
            name='model',
            serialization_format='cloudpickle',
            registered_model_name='EnergyTypeNet',
        )
        mlflow.log_artifact(str(model_path), artifact_path='joblib')`],
  ['code', 'Line by line explanation', `def log_to_mlflow(output: dict, model_path: Path, feature_set: str) -> None:  # define function
    """Log every candidate's CV scores plus the best model artifact to MLflow."""  # document behavior
    mlflow.set_experiment('EnergyTypeNet')  # continue statement
    with mlflow.start_run(run_name=f'train-{feature_set}'):  # open managed block
        mlflow.log_param('feature_set', feature_set)  # continue statement
        mlflow.log_param('best_model', output['best_name'])  # continue statement

        for model_name, metrics in output['results'].items():  # loop through values
            mlflow.log_metric(f'{model_name}_cv_mean', metrics['cv_mean'])  # continue statement
            mlflow.log_metric(f'{model_name}_cv_std', metrics['cv_std'])  # continue statement

        if 'test_accuracy' in output['results'][output['best_name']]:  # check condition
            mlflow.log_metric(  # continue statement
                'test_accuracy',  # continue statement
                output['results'][output['best_name']]['test_accuracy'],  # continue statement
            )  # continue statement

        mlflow.sklearn.log_model(  # continue statement
            output['best_model'],  # continue statement
            name='model',  # assign value
            serialization_format='cloudpickle',  # assign value
            registered_model_name='EnergyTypeNet',  # assign value
        )  # continue statement
        mlflow.log_artifact(str(model_path), artifact_path='joblib')  # assign value`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: log core run
log_to_mlflow(output, Path('artifacts/model.joblib'), 'core')
# Output: MLflow run named train-core

# Call 2: log extended run
log_to_mlflow(output_ext, Path('artifacts/model_ext.joblib'), 'extended')
# Output changes: feature_set param is extended

# Call 3: log all-feature run
log_to_mlflow(output_all, Path('artifacts/model_all.joblib'), 'all')
# Output changes: metrics appear under train-all`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change --no-mlflow from false to true in CI?",a:1,opts:[{t:"The model is not trained.",e:"Training still runs."},{t:"MLflow logging is skipped, avoiding a tracking-server dependency.",e:"Correct. CI can run offline."},{t:"The feature_set changes to all.",e:"The flag only controls logging."},{t:"The metrics file cannot be written.",e:"metrics.json is still written."}]},
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
    ]}]],
);
window.BLOCKS[14].push(
  ['h2', "Exact source code - FastAPI"],
  ['p', "Why this exists: without the API layer, only Python users could run the model and other systems could not request predictions."],
  ['code', "src/api.py (exact source)", `class BuildingFeatures(BaseModel):
    square_footage: float = Field(..., gt=0)
    number_of_occupants: float = Field(..., ge=0)
    appliances_used: float = Field(..., ge=0)
    average_temperature: float
    day_of_week: str = 'Weekday'
    energy_consumption: float = Field(..., ge=0)

def get_model_artifact() -> dict:
    """Load the model once and reuse it for later requests."""
    global artifact

    if artifact is None:
        artifact = load_artifact()

    return artifact

def health() -> Dict[str, str]:
    return {'status': 'ok'}

def predict(features: BuildingFeatures) -> Dict:
    row = pd.DataFrame([{
        'Square Footage': features.square_footage,
        'Number of Occupants': features.number_of_occupants,
        'Appliances Used': features.appliances_used,
        'Average Temperature': features.average_temperature,
        'Day of Week': features.day_of_week,
        'Energy Consumption': features.energy_consumption,
    }])

    result = predict_dataframe(row, get_model_artifact())[0]

    return result`],
  ['code', 'Line by line explanation', `class BuildingFeatures(BaseModel):  # define class
    square_footage: float = Field(..., gt=0)  # assign value
    number_of_occupants: float = Field(..., ge=0)  # assign value
    appliances_used: float = Field(..., ge=0)  # assign value
    average_temperature: float  # continue statement
    day_of_week: str = 'Weekday'  # assign value
    energy_consumption: float = Field(..., ge=0)  # assign value

def get_model_artifact() -> dict:  # define function
    """Load the model once and reuse it for later requests."""  # document behavior
    global artifact  # continue statement

    if artifact is None:  # check condition
        artifact = load_artifact()  # assign value

    return artifact  # return result

def health() -> Dict[str, str]:  # define function
    return {'status': 'ok'}  # return result

def predict(features: BuildingFeatures) -> Dict:  # define function
    row = pd.DataFrame([{  # assign value
        'Square Footage': features.square_footage,  # continue statement
        'Number of Occupants': features.number_of_occupants,  # continue statement
        'Appliances Used': features.appliances_used,  # continue statement
        'Average Temperature': features.average_temperature,  # continue statement
        'Day of Week': features.day_of_week,  # continue statement
        'Energy Consumption': features.energy_consumption,  # continue statement
    }])  # continue statement

    result = predict_dataframe(row, get_model_artifact())[0]  # assign value

    return result  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: health check
GET /health
# Output: {'status': 'ok'}

# Call 2: valid prediction
POST /predict with non-negative fields
# Output: {'class': ..., 'probabilities': {...}}

# Call 3: invalid negative energy
POST /predict with energy_consumption=-1
# Output changes: FastAPI returns validation error 422`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change energy_consumption from 5000 to -1 in a /predict request?",a:0,opts:[{t:"FastAPI returns validation error 422 because Field(..., ge=0) rejects it.",e:"Correct. Pydantic validates before predict() runs."},{t:"The model silently clips it to zero.",e:"No clipping exists in the API model."},{t:"The model retrains itself.",e:"Prediction requests do not train."},{t:"The health endpoint fails.",e:"Only this invalid request fails."}]},
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
    ]}]],
);
window.BLOCKS[15].push(
  ['h2', "Exact source code - Docker"],
  ['p', "Why this exists: without the Dockerfile, deployment depends on whatever Python packages happen to be installed on the host machine."],
  ['code', "Dockerfile (exact source)", `FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -m src.train --feature-set core --no-mlflow

EXPOSE 8000

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]`],
  ['code', 'Line by line explanation', `FROM python:3.12-slim  # continue statement

WORKDIR /app  # continue statement

COPY requirements.txt .  # continue statement
RUN pip install --no-cache-dir --upgrade pip \  # continue statement
    && pip install --no-cache-dir -r requirements.txt  # continue statement

COPY . .  # continue statement

RUN python -m src.train --feature-set core --no-mlflow  # continue statement

EXPOSE 8000  # continue statement

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: build image
docker build -t energytypenet .
# Output: image contains trained artifacts/model.joblib

# Call 2: run container
docker run -p 8000:8000 energytypenet
# Output: API listens on port 8000

# Call 3: health probe
curl http://localhost:8000/health
# Output: {'status': 'ok'}`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
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

