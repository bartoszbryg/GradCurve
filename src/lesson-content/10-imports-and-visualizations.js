/* ── Import reference sections appended by Codex ─────────────── */
window.BLOCKS[1].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to load the CSV and turn building labels into model-ready numbers.'],
  ['code', 'Required imports',
`import pandas as pd

from src.data import CLASSES, FEATURE_COLS, LABEL_MAP, load_features, load_raw`]
);

window.BLOCKS[2].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to create engineered columns from the raw dataset.'],
  ['code', 'Required imports',
`import numpy as np
import pandas as pd

from src.data import make_engineered_features`]
);

window.BLOCKS[3].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when a model needs scaled numeric features before training.'],
  ['code', 'Required imports',
`import numpy as np
from sklearn.preprocessing import StandardScaler

from src.data import load_features`]
);

window.BLOCKS[4].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to train or inspect the custom one-vs-rest logistic regression model.'],
  ['code', 'Required imports',
`import numpy as np
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler

from src.data import CLASSES, load_features
from src.models import LogisticRegressionOvR`]
);

window.BLOCKS[5].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to train Softmax regression and inspect its matrix math.'],
  ['code', 'Required imports',
`import numpy as np
from sklearn.preprocessing import StandardScaler

from src.data import CLASSES, load_features
from src.models import LogisticRegressionOvR, LogisticRegressionSoftmax`]
);

window.BLOCKS[6].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to run the distance-weighted Attention classifier.'],
  ['code', 'Required imports',
`import numpy as np
from sklearn.preprocessing import StandardScaler

from src.data import CLASSES, load_features
from src.models import AttentionClassifier`]
);

window.BLOCKS[7].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to train or evaluate the XGBoost classifier.'],
  ['code', 'Required imports',
`from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import StratifiedKFold, cross_val_score
from xgboost import XGBClassifier

from src.data import CLASSES, load_features`]
);

window.BLOCKS[8].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to train the MLP neural network with scaled features.'],
  ['code', 'Required imports',
`from sklearn.metrics import accuracy_score, classification_report
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from src.data import CLASSES, load_features`]
);

window.BLOCKS[9].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to combine several trained models into voting or stacking ensembles.'],
  ['code', 'Required imports',
`from sklearn.ensemble import StackingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score

from src.data import load_features
from src.train import build_models`]
);

window.BLOCKS[10].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to measure model performance with stratified cross-validation.'],
  ['code', 'Required imports',
`from sklearn.model_selection import StratifiedKFold, cross_val_score

from src.data import load_features
from src.train import build_models, evaluate_models`]
);

window.BLOCKS[11].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want accuracy, confusion matrices, and classification reports.'],
  ['code', 'Required imports',
`from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from src.data import CLASSES, load_features`]
);

window.BLOCKS[12].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to draw decision boundaries over a two-feature model.'],
  ['code', 'Required imports',
`import matplotlib.pyplot as plt
import numpy as np
from sklearn.preprocessing import StandardScaler

from src.data import CLASSES, load_features`]
);

window.BLOCKS[13].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to log parameters, metrics, and trained models to MLflow.'],
  ['code', 'Required imports',
`from pathlib import Path

import mlflow
import mlflow.sklearn

from src.train import log_to_mlflow, train_best_model`]
);

window.BLOCKS[14].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to expose the trained model through the FastAPI service.'],
  ['code', 'Required imports',
`import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

from src.data import CLASSES`]
);

window.BLOCKS[15].push(
  ['h2', 'Imports you need'],
  ['p', 'Docker examples do not need Python imports. They need a Dockerfile, requirements.txt, and the application entrypoint.'],
  ['code', 'Required files',
`Dockerfile
requirements.txt
src/
dashboard.py or api.py

# Useful commands:
docker build -t energytypenet .
docker run -p 8000:8000 energytypenet`]
);

window.BLOCKS[16].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to build the Streamlit dashboard around the trained model and dataset.'],
  ['code', 'Required imports',
`import joblib
import numpy as np
import pandas as pd
import streamlit as st

from src.data import CLASSES, load_features, load_raw, make_engineered_features
from src.train import build_models`]
);

window.BLOCKS[17].push(
  ['h2', 'Imports you need'],
  ['p', 'GitHub Actions examples use YAML, not Python imports. These are the Python tools the workflow installs and runs.'],
  ['code', 'Required workflow tools',
`# .github/workflows/ci.yml
python -m pip install -r requirements.txt
python -m pytest
python src/train.py --no-mlflow`]
);

window.BLOCKS[18].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to rank columns and let the AutoML assistant test candidate models.'],
  ['code', 'Required imports',
`import numpy as np
import pandas as pd
from sklearn.feature_selection import f_classif
from sklearn.model_selection import cross_val_score

from src.automl import prepare_dataset, rank_features, train_baselines
from src.data import LABEL_MAP, make_engineered_features`]
);

window.BLOCKS[19].push(
  ['h2', 'Imports you need'],
  ['p', 'The codebase tour mostly explains files. These imports are the common project entry points you will see across the source tree.'],
  ['code', 'Common project imports',
`from src.data import CLASSES, LABEL_MAP, load_features, load_raw, make_engineered_features
from src.models import AttentionClassifier, LogisticRegressionOvR, LogisticRegressionSoftmax
from src.train import build_models, evaluate_models, train_best_model`]
);

window.BLOCKS[20].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to reproduce gradient descent updates by hand or with NumPy.'],
  ['code', 'Required imports',
`import numpy as np

from src.models import LogisticRegressionOvR, LogisticRegressionSoftmax`]
);

window.BLOCKS[21].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to compare training scores, validation scores, and regularised models.'],
  ['code', 'Required imports',
`from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from src.data import load_features
from src.train import build_models`]
);

window.BLOCKS[22].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to load saved metrics and inspect the trained artifact.'],
  ['code', 'Required imports',
`import json
from pathlib import Path

import joblib

from src.data import CLASSES`]
);

window.BLOCKS[23].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to reproduce Notebook 01 exploratory data analysis.'],
  ['code', 'Required imports',
`import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

from src.data import load_raw`]
);

window.BLOCKS[24].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want ANOVA scores, correlations, PCA, and feature ablations.'],
  ['code', 'Required imports',
`import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.feature_selection import f_classif
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import StandardScaler

from src.data import LABEL_MAP, make_engineered_features`]
);

window.BLOCKS[25].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to inspect fitted models and explain their predictions.'],
  ['code', 'Required imports',
`import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance
from sklearn.metrics import accuracy_score

from src.data import CLASSES, load_features
from src.train import build_models`]
);

window.BLOCKS[26].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to reproduce the ensemble notebook and compare voting with stacking.'],
  ['code', 'Required imports',
`from sklearn.ensemble import StackingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_score

from src.data import load_features
from src.train import build_models`]
);

window.BLOCKS[27].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to run synthetic experiments and estimate the accuracy ceiling.'],
  ['code', 'Required imports',
`import json
from pathlib import Path

import numpy as np
from sklearn.model_selection import train_test_split

from src.synthetic_experiment import run_experiment`]
);

window.BLOCKS[28].push(
  ['h2', 'Imports you need'],
  ['p', 'Use these imports when you want to tune model hyperparameters and compare candidate settings.'],
  ['code', 'Required imports',
`from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

from src.data import load_features
from src.train import build_models`]
);


/* ── Interactive visualization blocks appended by Codex ───────── */
window.BLOCKS[3].push(
  ['h2', 'Interactive scaling explorer'],
  ['viz', 'ScalingExplorer']
);

window.BLOCKS[4].push(
  ['h2', 'Interactive weight vector chart'],
  ['viz', 'WeightVectorViz']
);

window.BLOCKS[6].push(
  ['h2', 'Interactive attention neighbours'],
  ['viz', 'AttentionNeighbours']
);

window.BLOCKS[11].push(
  ['h2', 'Interactive confusion matrix'],
  ['viz', 'ConfusionMatrixExplorer']
);

window.BLOCKS[20].push(
  ['h2', 'Interactive gradient step trace'],
  ['viz', 'GradientStepTrace']
);

