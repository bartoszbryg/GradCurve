'use strict';

window.LESSON_TITLES[33] = 'Glossary';
window.BLOCKS[33] = [
  ['p', 'Search this glossary when a lesson uses a word that feels too technical.'],

  ['h2', 'Accuracy'],
  ['p', 'The share of predictions the model gets right.'],
  ['p', 'It appears in metrics, model comparison, and the accuracy ceiling lesson.'],
  ['callout', 'analogy', 'Simple analogy', 'A cashier is accurate when most scanned prices are correct.'],

  ['h2', 'Precision'],
  ['p', 'Of predicted positives, how many were truly positive.'],
  ['p', 'It appears in the metrics and confusion matrix lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A fraud alert has high precision when alerts are usually real fraud.'],

  ['h2', 'Recall'],
  ['p', 'Of real positives, how many the model found.'],
  ['p', 'It appears in the metrics, confusion matrix, and evaluation lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A hospital screen has high recall when it catches most sick patients.'],

  ['h2', 'F1 Score'],
  ['p', 'One score balancing precision and recall.'],
  ['p', 'It appears in model reports and final evaluation.'],
  ['callout', 'analogy', 'Simple analogy', 'A hiring filter balances avoiding bad hires and finding good ones.'],

  ['h2', 'AUC'],
  ['p', 'How well scores rank correct classes above incorrect classes.'],
  ['p', 'It appears in ROC and final exam evaluation questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A queue system ranks urgent tickets before routine tickets.'],

  ['h2', 'Confusion Matrix'],
  ['p', 'A table of correct and incorrect class predictions.'],
  ['p', 'It appears in the metrics lesson and confusion matrix explorer.'],
  ['callout', 'analogy', 'Simple analogy', 'A warehouse compares ordered items against shipped items.'],

  ['h2', 'ROC Curve'],
  ['p', 'A plot showing ranking quality across thresholds.'],
  ['p', 'It appears in the evaluation and final exam lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A security gate changes strictness and tracks catches versus false alarms.'],

  ['h2', 'Calibration'],
  ['p', 'Whether predicted probabilities match real-world frequencies.'],
  ['p', 'It appears in probability and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A weather forecast is calibrated when 70% rain happens about 70% of the time.'],

  ['h2', 'Gradient Descent'],
  ['p', 'An update method that moves parameters downhill.'],
  ['p', 'It appears in the gradient descent lesson and demo.'],
  ['callout', 'analogy', 'Simple analogy', 'A delivery driver follows lower traffic until the route improves.'],

  ['h2', 'Learning Rate'],
  ['p', 'The step size used during gradient descent.'],
  ['p', 'It appears in gradient descent and training lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'Turning a faucet slowly gives more control than twisting it fully.'],

  ['h2', 'Convergence'],
  ['p', 'Training stabilizes near a good solution.'],
  ['p', 'It appears in gradient descent and model training lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A negotiation converges when both sides stop changing offers much.'],

  ['h2', 'Divergence'],
  ['p', 'Training moves away from a good solution.'],
  ['p', 'It appears in the gradient step visualizer.'],
  ['callout', 'analogy', 'Simple analogy', 'A thermostat diverges when every correction makes the room worse.'],

  ['h2', 'Overfitting'],
  ['p', 'The model memorizes training data instead of learning patterns.'],
  ['p', 'It appears in overfitting, cross-validation, and final exam lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A student memorizes old test answers but fails new questions.'],

  ['h2', 'Underfitting'],
  ['p', 'The model is too simple to learn real patterns.'],
  ['p', 'It appears in regularisation and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A doctor using only age misses many diagnoses.'],

  ['h2', 'Regularisation'],
  ['p', 'A penalty that discourages overly complex models.'],
  ['p', 'It appears in logistic regression and overfitting lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A manager limits overtime to prevent chaotic work habits.'],

  ['h2', 'L2 Penalty'],
  ['p', 'Regularisation that penalizes large squared weights.'],
  ['p', 'It appears in OvR, Softmax, and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A bank discourages risky oversized loans with stricter costs.'],

  ['h2', 'Cross-Validation'],
  ['p', 'Repeated training on different train and validation splits.'],
  ['p', 'It appears in training, model comparison, and notebooks.'],
  ['callout', 'analogy', 'Simple analogy', 'A restaurant tests a recipe with different customer groups.'],

  ['h2', 'Stratified K-Fold'],
  ['p', 'Cross-validation that preserves class proportions in each fold.'],
  ['p', 'It appears in cross-validation and training code.'],
  ['callout', 'analogy', 'Simple analogy', 'A survey samples each age group in the right proportion.'],

  ['h2', 'Train/Val/Test Split'],
  ['p', 'Separate data groups for learning, tuning, and final checking.'],
  ['p', 'It appears throughout notebooks, training, and evaluation lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A chef practices, adjusts, then serves judges a fresh dish.'],

  ['h2', 'Data Leakage'],
  ['p', 'Information from the answer sneaks into training.'],
  ['p', 'It appears in feature engineering and accuracy ceiling lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A student sees the answer key before the exam.'],

  ['h2', 'Feature Leakage'],
  ['p', 'A feature secretly encodes the target label.'],
  ['p', 'It appears in notebook 03 and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A package barcode accidentally includes the delivery outcome.'],

  ['h2', 'Out-of-fold Predictions'],
  ['p', 'Predictions made for rows excluded from that fold training.'],
  ['p', 'It appears in stacking and final exam lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A judge scores dishes they did not help cook.'],

  ['h2', 'One-Hot Encoding'],
  ['p', 'Turning categories into separate 0 or 1 columns.'],
  ['p', 'It appears in feature engineering and preprocessing lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A checklist marks exactly which department handled a request.'],

  ['h2', 'StandardScaler'],
  ['p', 'Scaling features to mean zero and standard deviation one.'],
  ['p', 'It appears in feature scaling and training pipelines.'],
  ['callout', 'analogy', 'Simple analogy', 'Different currencies are converted before comparing prices.'],

  ['h2', 'MinMaxScaler'],
  ['p', 'Scaling features into a fixed minimum and maximum range.'],
  ['p', 'It appears in scaling comparisons and preprocessing discussion.'],
  ['callout', 'analogy', 'Simple analogy', 'Thermostat settings are mapped onto one shared slider.'],

  ['h2', 'Sigmoid'],
  ['p', 'A function converting one score into a probability-like value.'],
  ['p', 'It appears in OvR logistic regression.'],
  ['callout', 'analogy', 'Simple analogy', 'A dimmer switch turns raw voltage into brightness level.'],

  ['h2', 'Softmax'],
  ['p', 'A function converting class scores into probabilities summing to one.'],
  ['p', 'It appears in Softmax regression and model probability lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A budget is divided across departments so shares total 100%.'],

  ['h2', 'Cross-Entropy Loss'],
  ['p', 'A loss that punishes confident wrong probabilities.'],
  ['p', 'It appears in logistic regression and neural network lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A wrong confident forecast loses more trust than a cautious one.'],

  ['h2', 'Hyperparameter'],
  ['p', 'A setting chosen before training starts.'],
  ['p', 'It appears in tuning, XGBoost, MLP, and final exam lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'An oven temperature is chosen before baking begins.'],

  ['h2', 'Grid Search'],
  ['p', 'Trying every combination from fixed hyperparameter lists.'],
  ['p', 'It appears in hyperparameter tuning lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A store tests every shelf layout from a planned list.'],

  ['h2', 'Random Search'],
  ['p', 'Trying random hyperparameter combinations from chosen ranges.'],
  ['p', 'It appears in hyperparameter tuning comparisons.'],
  ['callout', 'analogy', 'Simple analogy', 'A chef samples random spice amounts from sensible ranges.'],

  ['h2', 'Ensemble'],
  ['p', 'Multiple models combined into one prediction system.'],
  ['p', 'It appears in ensemble, voting, stacking, and notebook 05 lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A medical team combines several specialist opinions.'],

  ['h2', 'Voting Classifier'],
  ['p', 'An ensemble that combines model votes or probabilities.'],
  ['p', 'It appears in ensemble and production training lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A committee chooses the option supported by most members.'],

  ['h2', 'Stacking'],
  ['p', 'An ensemble where a model learns from other model predictions.'],
  ['p', 'It appears in ensemble, MLflow, and final exam lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A senior analyst learns how much to trust each junior analyst.'],

  ['h2', 'Mutual Information'],
  ['p', 'A score measuring dependency between a feature and target.'],
  ['p', 'It appears in feature importance and notebook 03.'],
  ['callout', 'analogy', 'Simple analogy', 'A retailer checks which signals best predict product returns.'],

  ['h2', 'ANOVA'],
  ['p', 'A test comparing feature values across class groups.'],
  ['p', 'It appears in notebook 03 feature engineering.'],
  ['callout', 'analogy', 'Simple analogy', 'A factory compares defect rates across production lines.'],

  ['h2', 'Permutation Importance'],
  ['p', 'Feature importance measured by shuffling one column.'],
  ['p', 'It appears in feature importance and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A store hides one report column and sees decisions worsen.'],

  ['h2', 'PCA'],
  ['p', 'A method compressing features into major variation directions.'],
  ['p', 'It appears in notebook 03 and dimensionality lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A manager summarizes many survey answers into main themes.'],

  ['h2', 't-SNE'],
  ['p', 'A visualization method that places similar rows nearby.'],
  ['p', 'It appears in interpretability and class overlap exploration.'],
  ['callout', 'analogy', 'Simple analogy', 'A museum groups similar paintings into nearby rooms.'],

  ['h2', 'Dimensionality Reduction'],
  ['p', 'Compressing many features into fewer useful dimensions.'],
  ['p', 'It appears in PCA, t-SNE, and interpretability lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A dashboard summarizes many reports into a few charts.'],

  ['h2', 'Attention'],
  ['p', 'A method weighting nearby examples more strongly.'],
  ['p', 'It appears in the AttentionClassifier and heatmap lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A doctor listens most to patients with similar symptoms.'],

  ['h2', 'Bandwidth'],
  ['p', 'A setting controlling how far attention spreads.'],
  ['p', 'It appears in attention and neighbour visualization lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A store decides how far away competitor prices matter.'],

  ['h2', 'Kernel'],
  ['p', 'A function turning distance into similarity weight.'],
  ['p', 'It appears in attention and decision boundary lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A loyalty program gives closer customers stronger influence.'],

  ['h2', 'Euclidean Distance'],
  ['p', 'Straight-line distance between two points.'],
  ['p', 'It appears in attention, neighbours, and decision boundary lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A map measures direct distance between two offices.'],

  ['h2', 'Docker'],
  ['p', 'A tool for packaging apps with their environment.'],
  ['p', 'It appears in Docker, FastAPI deployment, and production lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A shipping crate carries everything needed inside it.'],

  ['h2', 'Container'],
  ['p', 'A running packaged app isolated from the host.'],
  ['p', 'It appears in the Docker and deployment lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A food truck runs independently in any parking lot.'],

  ['h2', 'Image'],
  ['p', 'A saved template used to start containers.'],
  ['p', 'It appears in Docker build and Docker Hub sections.'],
  ['callout', 'analogy', 'Simple analogy', 'A bakery recipe card creates identical cakes repeatedly.'],

  ['h2', 'Layer'],
  ['p', 'One cached build step inside a Docker image.'],
  ['p', 'It appears in docker history and build cache lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A sandwich is built from reusable stacked ingredients.'],

  ['h2', 'Cache'],
  ['p', 'Saved work reused to avoid repeating expensive steps.'],
  ['p', 'It appears in Streamlit caching and Docker layer caching.'],
  ['callout', 'analogy', 'Simple analogy', 'A restaurant preps ingredients before the lunch rush.'],

  ['h2', 'FastAPI'],
  ['p', 'A Python framework for building typed web APIs.'],
  ['p', 'It appears in API, testing, and deployment lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A reception desk routes requests to the right department.'],

  ['h2', 'Pydantic'],
  ['p', 'A validation library for structured Python data.'],
  ['p', 'It appears in FastAPI request validation.'],
  ['callout', 'analogy', 'Simple analogy', 'A bank form rejects impossible account details.'],

  ['h2', 'REST API'],
  ['p', 'A web interface using standard HTTP requests.'],
  ['p', 'It appears in FastAPI and deployment lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A menu lets customers request services in expected ways.'],

  ['h2', 'Endpoint'],
  ['p', 'One URL route that performs one API action.'],
  ['p', 'It appears in health, predict, and metrics API sections.'],
  ['callout', 'analogy', 'Simple analogy', 'A hospital department has a specific front desk.'],

  ['h2', 'MLflow'],
  ['p', 'A tool for tracking experiments, artifacts, and models.'],
  ['p', 'It appears in MLflow and production training lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A lab notebook records every experiment and result.'],

  ['h2', 'Experiment Tracking'],
  ['p', 'Recording parameters, metrics, artifacts, and model versions.'],
  ['p', 'It appears in MLflow and reproducibility sections.'],
  ['callout', 'analogy', 'Simple analogy', 'A factory log records machine settings for each batch.'],

  ['h2', 'Artifact'],
  ['p', 'A saved file produced by training or evaluation.'],
  ['p', 'It appears in MLflow, Docker, FastAPI, and deployment lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A signed receipt proves what happened during a transaction.'],

  ['h2', 'Run'],
  ['p', 'One recorded execution of training or evaluation.'],
  ['p', 'It appears in MLflow search, comparison, and registry sections.'],
  ['callout', 'analogy', 'Simple analogy', 'A workout log records one session with its numbers.'],

  ['h2', 'CI/CD'],
  ['p', 'Automation for testing and deploying code changes.'],
  ['p', 'It appears in GitHub Actions and deployment lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A factory line checks each product before shipping.'],

  ['h2', 'GitHub Actions'],
  ['p', 'GitHub automation that runs workflows after code changes.'],
  ['p', 'It appears in CI and production lessons.'],
  ['callout', 'analogy', 'Simple analogy', 'A checklist runs automatically when a package arrives.'],

  ['h2', 'Matrix Strategy'],
  ['p', 'Running the same workflow across several environments.'],
  ['p', 'It appears in GitHub Actions and final exam questions.'],
  ['callout', 'analogy', 'Simple analogy', 'A product is tested in several store locations.'],
];
