/* Production expansions and new production lessons */

window.BLOCKS[13].push(
  ['h2', 'Full MLflow run output from a real training session'],
  ['p', 'This is the kind of run output I want to see after training. It is not just a score. It is the evidence trail for the model.'],
  ['code', 'artifacts/metrics.json',
`Params
param                  value
feature_set             core
best_model              stacking
registered_model_name   EnergyTypeNet

Metrics
model                  cv_mean   cv_std    cv_scores                         test_accuracy
logistic_regression    0.626     0.0166    [0.650,0.605,0.630,0.610,0.635]  -
mlp                    0.550     0.0270    [0.580,0.580,0.535,0.510,0.545]  -
xgboost                0.596     0.0410    [0.645,0.525,0.615,0.615,0.580]  -
soft_voting            0.615     0.0179    [0.645,0.590,0.620,0.610,0.610]  -
stacking               0.628     0.0136    [0.645,0.615,0.640,0.610,0.630]  0.650`],
  ['p', 'The important part is not only that stacking won. The important part is that the CV standard deviation is low. The model is fairly stable across folds.'],

  ['h2', 'How I compare two runs side by side'],
  ['p', 'In the MLflow UI, I open the EnergyTypeNet experiment. I tick two runs. Then I click Compare. I look at parameters first, metrics second, and artifacts last.'],
  ['code', 'MLflow UI comparison checklist',
`1. Start the UI:
   mlflow ui

2. Open:
   http://localhost:5000

3. Click the EnergyTypeNet experiment.

4. Select two runs:
   train-core
   train-all

5. Click Compare.

6. Check:
   feature_set
   best_model
   logistic_regression_cv_mean
   xgboost_cv_mean
   test_accuracy

7. If a run is much better, ask:
   Did it use fair features?
   Did any feature leak the label?
   Was the test set untouched?`],

  ['h2', 'registered_model_name and loading by alias'],
  ['p', 'registered_model_name tells MLflow to put the logged model into the Model Registry. That gives the model a name, versions, and aliases like Production.'],
  ['code', 'src/train.py',
`mlflow.sklearn.log_model(
    output['best_model'],
    name='model',
    serialization_format='cloudpickle',
    registered_model_name='EnergyTypeNet',
)`],
  ['code', 'Load a registered model by alias',
`import mlflow.sklearn

model = mlflow.sklearn.load_model("models:/EnergyTypeNet@Production")
predictions = model.predict(X_new)`],
  ['p', 'The alias is useful because production code does not need to know the exact version number. I can move the Production alias from version 1 to version 2 when I approve a better model.'],

  ['h2', 'log_artifact versus log_model'],
  ['code', 'Two different kinds of saved output',
`mlflow.log_artifact("artifacts/model.joblib", artifact_path="joblib")

mlflow.sklearn.log_model(
    output['best_model'],
    name='model',
    registered_model_name='EnergyTypeNet',
)`],
  ['p', 'log_artifact saves a file. MLflow does not know what the file means. log_model saves a model with MLflow metadata, environment information, and model-loading conventions. I use log_artifact for supporting files and log_model for the deployable model.'],

  ['h2', 'What mlruns/ looks like on disk'],
  ['code', 'mlruns directory shape',
`mlruns/
  0/
    meta.yaml
  <experiment_id>/
    meta.yaml
    <run_id>/
      meta.yaml
      params/
        feature_set
        best_model
      metrics/
        logistic_regression_cv_mean
        logistic_regression_cv_std
        xgboost_cv_mean
        test_accuracy
      artifacts/
        joblib/
          model.joblib
        model/
          MLmodel
          model.pkl
          conda.yaml
          requirements.txt`],

  ['h2', 'Minimum things to log for reproducibility'],
  ['code', 'Reproducibility checklist',
`Log these every time:

[ ] dataset path or dataset version
[ ] feature_set
[ ] random_state
[ ] model name
[ ] model hyperparameters
[ ] CV mean
[ ] CV standard deviation
[ ] per-fold CV scores
[ ] test accuracy
[ ] classification report
[ ] saved model artifact
[ ] code version or git commit
[ ] Python and package versions`],

  ['h2', 'Querying runs programmatically'],
  ['code', 'mlflow.search_runs()',
`import mlflow

mlflow.set_tracking_uri("mlruns")

runs = mlflow.search_runs(
    experiment_names=["EnergyTypeNet"],
    filter_string="params.feature_set = 'core'",
    order_by=["metrics.stacking_cv_mean DESC"],
)

cols = [
    "run_id",
    "params.feature_set",
    "params.best_model",
    "metrics.stacking_cv_mean",
    "metrics.test_accuracy",
]

print(runs[cols].head())`],
  ['callout', 'info', 'What MLflow really gave me', 'It gave me memory. I did not have to remember which model, feature set, or run produced a score. The run stored that story.']
);

window.BLOCKS[14].push(
  ['h2', 'The full HTTP request and response cycle'],
  ['code', 'FastAPI request flow',
`Client
  |
  | POST /predict
  | JSON body
  v
FastAPI route: predict(features: BuildingFeatures)
  |
  | Pydantic validates fields
  | square_footage > 0
  | energy_consumption >= 0
  v
Build one-row pandas DataFrame
  |
  v
get_model_artifact()
  |
  | loads artifacts/model.joblib once
  v
predict_dataframe(row, artifact)
  |
  | model.predict()
  | model.predict_proba()
  v
JSON response
  |
  v
Client receives class + probabilities`],

  ['h2', 'Status codes this API can return'],
  ['code', 'FastAPI status codes',
`200 OK
  Returned by GET /health.
  Returned by POST /predict when validation and inference succeed.

422 Unprocessable Entity
  Returned by FastAPI/Pydantic when the request body is invalid.
  Example: square_footage = -10 fails Field(..., gt=0).
  Example: energy_consumption is missing.

500 Internal Server Error
  Returned when application code fails.
  Example: artifacts/model.joblib is missing and load_artifact() raises.
  Example: the artifact has the wrong feature_set or broken model object.`],

  ['h2', 'Testing FastAPI with TestClient'],
  ['p', 'TestClient lets me test the API without starting uvicorn. The request still goes through FastAPI routing and Pydantic validation.'],
  ['code', 'tests/test_api.py',
`from fastapi.testclient import TestClient
import numpy as np

import src.api as api
from src.api import app


class DummyModel:
    def predict(self, X):
        return np.array([1])

    def predict_proba(self, X):
        return np.array([[0.2, 0.7, 0.1]])


def test_health_endpoint():
    client = TestClient(app)

    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_predict_endpoint_returns_probabilities(monkeypatch):
    monkeypatch.setattr(
        api,
        'artifact',
        {
            'feature_set': 'core',
            'model': DummyModel(),
            'classes': ['Residential', 'Commercial', 'Industrial'],
        },
    )

    client = TestClient(app)
    payload = {
        'square_footage': 25000,
        'number_of_occupants': 20,
        'appliances_used': 30,
        'average_temperature': 72,
        'day_of_week': 'Weekday',
        'energy_consumption': 4100,
    }

    response = client.post('/predict', json=payload)
    result = response.json()

    assert response.status_code == 200
    assert result['class'] in {'Residential', 'Commercial', 'Industrial'}
    assert set(result['probabilities']) == {'Residential', 'Commercial', 'Industrial'}`],

  ['h2', 'Testing with curl'],
  ['code', 'curl examples',
`# 1. Health check
curl http://127.0.0.1:8000/health

# 2. Valid prediction
curl -X POST http://127.0.0.1:8000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"square_footage\":25000,\"number_of_occupants\":20,\"appliances_used\":30,\"average_temperature\":72,\"day_of_week\":\"Weekday\",\"energy_consumption\":4100}"

# 3. Invalid prediction: square_footage must be > 0
curl -X POST http://127.0.0.1:8000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"square_footage\":-1,\"number_of_occupants\":20,\"appliances_used\":30,\"average_temperature\":72,\"day_of_week\":\"Weekday\",\"energy_consumption\":4100}"`],

  ['h2', 'What happens when the model artifact is missing'],
  ['p', 'The app uses a lifespan function. That means get_model_artifact() runs when FastAPI starts. If artifacts/model.joblib is missing, startup fails before the API is healthy.'],
  ['code', 'src/api.py',
`@asynccontextmanager
async def lifespan(app: FastAPI):
    get_model_artifact()
    yield`],
  ['p', 'That is good for production. I would rather crash early than accept requests with no model. A runtime error would be worse because /health might pass even though /predict is broken.'],

  ['h2', 'Could batch predictions run async?'],
  ['p', 'Yes, but only for the right kind of work. FastAPI BackgroundTasks can queue logging, email, or slow post-processing after a response. For heavy model inference, I would usually use a real worker queue.'],
  ['code', 'Background task sketch',
`from fastapi import BackgroundTasks

prediction_count = 0

def save_prediction_log(payload: dict, result: dict):
    # Write to a database or file.
    # Keep this outside the response path.
    pass

@app.post('/predict')
def predict(features: BuildingFeatures, background_tasks: BackgroundTasks):
    result = predict_dataframe(row, get_model_artifact())[0]
    background_tasks.add_task(save_prediction_log, features.model_dump(), result)
    return result`],

  ['h2', 'Adding a /metrics endpoint'],
  ['code', 'Simple API metrics endpoint',
`prediction_count = 0

@app.post('/predict')
def predict(features: BuildingFeatures) -> Dict:
    global prediction_count
    prediction_count += 1
    result = predict_dataframe(row, get_model_artifact())[0]
    return result

@app.get('/metrics')
def metrics() -> Dict:
    artifact = get_model_artifact()
    return {
        'model_name': artifact.get('best_name', 'unknown'),
        'feature_set': artifact.get('feature_set', 'unknown'),
        'classes': artifact.get('classes', []),
        'prediction_count': prediction_count,
    }`],

  ['h2', 'Latency breakdown'],
  ['code', 'Realistic local latency estimates',
`Step                         Estimate
Network localhost             1-3 ms
JSON parsing + validation      1-2 ms
DataFrame construction         1-3 ms
Model inference                2-10 ms
JSON serialisation             1-2 ms
Total local request            6-20 ms

On a hosted free tier:
Cold start                     2-30 seconds
Warm request                   20-150 ms`],
  ['callout', 'info', 'What this tells you', 'Most warm requests are not slow because of the model. Cold starts, artifact loading, and network distance are usually bigger production problems.']
);

window.BLOCKS[15].push(
  ['h2', 'docker history: what is inside the image'],
  ['code', 'docker history energytypenet',
`IMAGE          CREATED BY                                      SIZE      COMMENT
<image>        CMD ["uvicorn" "src.api:app" "--host"...        0B
<image>        EXPOSE map[8000/tcp:{}]                         0B
<image>        RUN python -m src.train --feature-set core...   4.7MB
<image>        COPY . .                                        5.2MB
<image>        RUN pip install --no-cache-dir -r requirements  610MB
<image>        COPY requirements.txt .                         4.1kB
<image>        WORKDIR /app                                    0B
<image>        FROM python:3.12-slim                           130MB`],
  ['p', 'The pip layer is the expensive layer. That is why requirements.txt is copied before the project code. Docker can cache the dependency install when only source files change.'],

  ['h2', 'Using .dockerignore to reduce image size'],
  ['code', '.dockerignore',
`.git
.venv
__pycache__
*.pyc
.ipynb_checkpoints
artifacts
results`],
  ['p', 'This keeps local virtual environments, cache files, notebooks checkpoints, and generated outputs out of the Docker build context. Smaller context means faster builds and fewer accidental secrets.'],

  ['h2', 'Multi-stage builds'],
  ['p', 'A multi-stage Dockerfile separates the build environment from the runtime environment. The build stage can contain compilers and training tools. The runtime stage only keeps what the API needs to serve predictions.'],
  ['code', 'Dockerfile multi-stage sketch',
`FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python -m src.train --feature-set core --no-mlflow

FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /app/src /app/src
COPY --from=build /app/artifacts /app/artifacts
EXPOSE 8000
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]`],

  ['h2', 'Inspecting container environment variables'],
  ['code', 'docker inspect',
`docker inspect energytypenet-smoke --format "{{json .Config.Env}}"

Example output:
[
  "PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  "LANG=C.UTF-8",
  "PYTHON_VERSION=3.12.12",
  "PYTHON_SHA256=<hash>"
]`],

  ['h2', 'Build-time feature set with ARG'],
  ['code', 'Dockerfile with ARG',
`ARG FEATURE_SET=core

RUN python -m src.train --feature-set \${FEATURE_SET} --no-mlflow

# Build core model:
docker build -t energytypenet:core --build-arg FEATURE_SET=core .

# Build all-feature model:
docker build -t energytypenet:all --build-arg FEATURE_SET=all .`],

  ['h2', 'Running API and MLflow with docker-compose'],
  ['code', 'Docker Compose example',
`services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./artifacts:/app/artifacts

  mlflow:
    image: python:3.12-slim
    working_dir: /app
    volumes:
      - .:/app
    command: >
      sh -c "pip install mlflow && mlflow ui --host 0.0.0.0 --port 5000"
    ports:
      - "5000:5000"`],

  ['h2', 'Real docker build output: cached versus rebuilt'],
  ['code', 'docker build -t energytypenet .',
`[+] Building 35.2s (10/10) FINISHED
 => [internal] load build definition from Dockerfile                 0.0s
 => [internal] load .dockerignore                                    0.0s
 => [1/6] FROM docker.io/library/python:3.12-slim                    0.0s CACHED
 => [2/6] WORKDIR /app                                               0.0s CACHED
 => [3/6] COPY requirements.txt .                                    0.0s CACHED
 => [4/6] RUN pip install --no-cache-dir --upgrade pip ...           0.0s CACHED
 => [5/6] COPY . .                                                   0.2s
 => [6/6] RUN python -m src.train --feature-set core --no-mlflow    33.8s
 => exporting to image                                               1.0s
 => naming to docker.io/library/energytypenet                        0.0s`],
  ['p', 'Changing Python source code rebuilds COPY . . and the training layer. Changing requirements.txt rebuilds the expensive pip install layer.'],

  ['h2', 'Pushing to Docker Hub and pulling on a server'],
  ['code', 'Docker Hub flow',
`docker login
docker tag energytypenet yourname/energytypenet:latest
docker push yourname/energytypenet:latest

# On the server:
docker pull yourname/energytypenet:latest
docker run -d --name energytypenet-api -p 8000:8000 yourname/energytypenet:latest
curl http://localhost:8000/health`],
  ['callout', 'info', 'What Docker really solved', 'Docker made the trained artifact, Python dependencies, and API command travel together. That is the difference between “works on my machine” and “can run somewhere else.”']
);

window.LESSON_TITLES[31] = 'Writing Good Tests';
window.BLOCKS[31] = [
  ['p', 'Tests are the safety net for the project. They check that data loading, models, the API, AutoML, and LLM fallback behavior still work after changes.'],

  ['h2', 'Section 1 - What the tests cover'],
  ['p', 'The tests/ directory covers five areas: data, models, API, AutoML, and the optional LLM assistant. Each file protects a different contract.'],
  ['code', 'tests directory',
`tests/
  test_data.py           # dataset shapes, engineered feature names
  test_models.py         # probability shapes, probability sums, loss decreases
  test_api.py            # health endpoint, predict endpoint, response probabilities
  test_automl.py         # profiling, target suggestion, preparation, baselines, reports
  test_llm_assistant.py  # context building, prompt grounding, fallback, stream parsing`],
  ['code', 'tests/test_data.py',
`from src.data import FEATURE_COLS, load_features, make_engineered_features, load_raw


def test_load_features_core_shape():
    X, y = load_features('data/train_energy_data.csv', 'core')

    assert X.shape[0] == y.shape[0]
    assert X.shape[1] == len(FEATURE_COLS['core'])


def test_engineered_features_have_expected_columns():
    df = load_raw('data/train_energy_data.csv').head(5)
    X, names = make_engineered_features(df)

    assert X.shape == (5, len(names))
    assert 'energy_per_sqft' in names
    assert 'occupancy_density' in names
    assert 'appliance_per_occ' in names`],
  ['code', 'tests/test_models.py',
`def test_attention_predict_proba_shape_and_sum():
    X = np.array([
        [0.0, 0.0],
        [1.0, 1.0],
        [5.0, 5.0],
        [6.0, 6.0],
    ])
    y = np.array([0, 0, 1, 1])
    model = AttentionClassifier(w=1.0).fit(X, y)

    proba = model.predict_proba(np.array([[0.5, 0.5], [5.5, 5.5]]))

    assert proba.shape == (2, 2)
    np.testing.assert_allclose(proba.sum(axis=1), np.ones(2))


def test_softmax_loss_decreases():
    X = np.array([
        [0.0, 0.0],
        [0.2, 0.1],
        [2.0, 2.0],
        [2.2, 2.1],
        [4.0, 4.0],
        [4.2, 4.1],
    ])
    y = np.array([0, 0, 1, 1, 2, 2])
    model = LogisticRegressionSoftmax(eta=0.1, n_iter=80, alpha=0.0)
    model.fit(X, y)

    assert model.loss_[0] > model.loss_[-1]
    assert model.predict(X).shape == y.shape`],
  ['p', 'test_api.py uses TestClient. test_automl.py checks profiling, target suggestion, dataset preparation, feature ranking, baseline training, reports, and overfitting answers. test_llm_assistant.py checks that prompts stay grounded and fallback answers work when local LLM mode is disabled.'],

  ['h2', 'Section 2 - How to write a new test'],
  ['p', 'A pytest test is just a function whose name starts with test_. It creates input, runs the code, and asserts the contract.'],
  ['code', 'Basic pytest structure',
`def test_function_name_describes_behavior():
    # Arrange
    input_data = ...

    # Act
    result = function_under_test(input_data)

    # Assert
    assert result.shape == expected_shape
    assert result.dtype == expected_dtype`],
  ['p', 'Fixtures matter because they remove repeated setup. A fixture can create a tiny DataFrame, a TestClient, or a fitted model once and share it across tests.'],
  ['code', 'Testing model output',
`def test_model_probabilities_are_valid():
    model = AttentionClassifier(w=1.0).fit(X_train, y_train)
    proba = model.predict_proba(X_test)

    assert proba.shape[0] == X_test.shape[0]
    assert np.all(proba >= 0)
    assert np.all(proba <= 1)
    np.testing.assert_allclose(proba.sum(axis=1), np.ones(X_test.shape[0]))`],
  ['code', 'Testing API without running a server',
`from fastapi.testclient import TestClient
from src.api import app


def test_health_endpoint():
    client = TestClient(app)
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}`],
  ['p', 'Edge cases are where bugs hide. I would test all-zero features, negative values that should be rejected, a single-row DataFrame, missing target columns, and classes with only one row.'],

  ['h2', 'Section 3 - Why some tests matter more'],
  ['p', 'Testing proba.sum(axis=1) == 1.0 matters because probability bugs are silent. A UI can display numbers that look plausible but do not form a valid distribution.'],
  ['p', 'Testing that loss decreases matters because it checks the gradient direction. If the sign is wrong, the model trains away from the solution.'],
  ['p', 'Testing imports separately from pytest catches syntax errors in files or functions that tests did not execute. It is a cheap smoke test for the whole source tree.'],
  ['code', 'Import smoke check',
`python -m compileall src tests
python -c "import src.data, src.models, src.train, src.api, src.automl"`],

  ['h2', 'Section 4 - Test coverage'],
  ['p', 'Coverage means “which lines ran during tests.” It does not prove the tests are good. It shows which code paths were exercised.'],
  ['code', 'Run coverage',
`pytest --cov=src --cov-report=term-missing`],
  ['p', 'term-missing tells me which lines were not executed. Those lines are a map for what to test next.'],
  ['p', 'The hardest functions to test are plotting functions, MLflow logging, Docker behavior, and optional Ollama streaming. They depend on external systems, files, or visuals. I would test their pure helper logic directly and smoke-test the external integration separately.'],

  ['quiz', [
    {q:'Why is testing proba.sum(axis=1) == 1.0 important?', a:1, opts:[
      {t:'It makes the model train faster', e:'No. It checks prediction validity, not speed.'},
      {t:'It catches silent probability-normalisation bugs', e:'Correct. Probabilities can look reasonable but still fail to sum to one.'},
      {t:'It guarantees the model is accurate', e:'No. Valid probabilities can still be wrong.'},
      {t:'It replaces cross-validation', e:'No. It checks a model contract, not generalisation.'},
    ]},
    {q:'Why use TestClient for FastAPI tests?', a:0, opts:[
      {t:'It sends requests through the app without starting uvicorn', e:'Correct. It tests routes and validation in-process.'},
      {t:'It skips Pydantic validation', e:'No. Pydantic validation still runs.'},
      {t:'It trains the model automatically', e:'No. Tests usually monkeypatch or load controlled artifacts.'},
      {t:'It only works for GET endpoints', e:'No. It supports POST, PUT, DELETE, and more.'},
    ]},
    {q:'What does pytest --cov=src --cov-report=term-missing show?', a:2, opts:[
      {t:'Only whether Docker builds', e:'No. Coverage is about Python lines executed by tests.'},
      {t:'The exact accuracy ceiling of the model', e:'No. Coverage is not a model metric.'},
      {t:'Which source lines were not executed during tests', e:'Correct. Missing lines point to untested paths.'},
      {t:'Whether Streamlit Cloud deployed successfully', e:'No. That is deployment monitoring.'},
    ]},
  ]],
];

window.LESSON_TITLES[32] = 'Real Deployment';
window.BLOCKS[32] = [
  ['p', 'Deployment is where the project stops being a notebook and starts behaving like a service. The goal is simple: push code, build the app, serve predictions, and notice when something breaks.'],

  ['h2', 'Section 1 - Render or Railway deployment'],
  ['p', 'For the FastAPI service, a beginner-friendly path is Render or Railway. Both can build from GitHub and give a live URL.'],
  ['code', 'Push to live API',
`1. Push the latest code to GitHub.
2. Create a new Web Service on Render or Railway.
3. Connect the GitHub repository.
4. Choose Docker deployment.
5. Set the start command through the Dockerfile:
   uvicorn src.api:app --host 0.0.0.0 --port 8000
6. Configure the health check path:
   /health
7. Deploy.
8. Open:
   https://your-service-url/health
9. Test prediction:
   POST https://your-service-url/predict`],
  ['p', 'Environment variables are minimal for the current API. The model artifact is built into the image. If I later use hosted MLflow, external storage, or API keys, those become environment variables.'],
  ['code', 'Useful deployment environment variables',
`PORT=8000
MLFLOW_TRACKING_URI=<optional remote tracking server>
MODEL_ALIAS=Production
LOG_LEVEL=info
OPENAI_API_KEY=<only if hosted LLM mode is added later>`],
  ['p', 'When a new commit is pushed, Render or Railway can auto-deploy. The platform pulls the commit, rebuilds the Docker image, runs the training command from the Dockerfile, starts the API, then calls /health.'],
  ['p', 'The health check should be /health. If startup fails because artifacts/model.joblib is missing, the service should not become healthy.'],

  ['h2', 'Section 2 - Streamlit Cloud deployment'],
  ['p', 'The README gives the easiest public deployment path for the dashboard. Streamlit Community Cloud is simpler than deploying the API.'],
  ['code', 'README Streamlit Cloud steps',
`1. Push the latest code to GitHub.
2. Go to Streamlit Community Cloud.
3. Create a new app.
4. Select this repository and the main branch.
5. Set the main file path to dashboard.py.
6. Deploy.`],
  ['p', 'requirements.txt must include every package the dashboard imports: streamlit, pandas, numpy, scikit-learn, xgboost, joblib, matplotlib, seaborn, plotly, mlflow, requests, and any other imported library.'],
  ['p', 'Ollama only works locally because it expects a local Ollama server running on the user machine. Streamlit Cloud does not run your local background services. Public deployments should keep local Ollama disabled or replace it with a hosted provider.'],
  ['code', 'Streamlit secrets',
`# .streamlit/secrets.toml
OPENAI_API_KEY = "sk-..."

# dashboard.py
api_key = st.secrets.get("OPENAI_API_KEY", None)`],
  ['p', 'secrets.toml keeps keys out of source control. In Streamlit Cloud, secrets are entered in the app settings, not committed to GitHub.'],

  ['h2', 'Section 3 - Monitoring in production'],
  ['p', 'Every prediction should leave a small log trail. Without logs, I cannot debug drift or bad predictions later.'],
  ['code', 'Prediction log fields',
`timestamp
request_id
input.square_footage
input.energy_consumption
input.number_of_occupants
input.appliances_used
input.average_temperature
input.day_of_week
predicted_class
confidence
probabilities
model_name
feature_set
latency_ms
status_code`],
  ['p', 'Model drift means the model becomes less accurate because the real world changed. I can detect it by comparing live prediction outcomes against later ground truth labels.'],
  ['p', 'I would retrain when accuracy drops, class distribution changes, feature ranges move outside training ranges, or business rules change. Retraining should be triggered by evidence, not by habit.'],

  ['h2', 'Section 4 - What breaks in production'],
  ['p', 'The most common production failures are boring. That is why they matter.'],
  ['code', 'Production failure modes',
`Model file missing
  Best behavior: startup crash.
  Bad behavior: /health passes but /predict fails later.

Feature set mismatch
  Example: model trained on core features, request sends five features.
  Fix: artifact must store feature_set, and prediction code must build exactly that shape.

Memory limits
  Free hosts can run out of RAM during pip install, XGBoost import, or training.
  Fix: train before deployment, reduce dependencies, or use a larger instance.

Cold start latency
  Serverless or free tiers may sleep.
  First request can be slow because the container starts and artifact loads.
  Fix: health pings, paid always-on service, or smaller image.`],
  ['callout', 'warning', 'Production lesson', 'A model that works locally is only half finished. Deployment tests the environment, artifacts, ports, memory, and monitoring.'],

  ['quiz', [
    {q:'Why should the API health check load the model at startup?', a:1, opts:[
      {t:'So training happens on every health check', e:'No. Health checks should not retrain.'},
      {t:'So a missing model artifact fails early instead of breaking the first real prediction', e:'Correct. Startup failure is easier to detect than runtime surprise.'},
      {t:'So Pydantic validation is disabled', e:'No. Validation stays enabled.'},
      {t:'So the Docker image becomes smaller', e:'Health checks do not reduce image size.'},
    ]},
    {q:'Why does local Ollama streaming not work on Streamlit Cloud?', a:2, opts:[
      {t:'Because Streamlit cannot display text', e:'Streamlit can display text.'},
      {t:'Because Ollama only supports FastAPI', e:'Ollama can be called from many Python apps.'},
      {t:'Because Streamlit Cloud cannot access the Ollama server running on your personal machine', e:'Correct. Local services do not exist inside the hosted cloud container.'},
      {t:'Because requirements.txt always blocks LLM packages', e:'requirements.txt controls packages, not access to your local background service.'},
    ]},
    {q:'What is the best response if live feature ranges drift far outside training ranges?', a:0, opts:[
      {t:'Investigate drift, collect labels if possible, and retrain or redesign features', e:'Correct. Drift means the training distribution may no longer match production.'},
      {t:'Ignore it if /health still returns ok', e:'/health only says the service is alive, not that predictions are still reliable.'},
      {t:'Delete logging to reduce noise', e:'Logging is how you detect and diagnose drift.'},
      {t:'Hard-code all predictions to the majority class', e:'That hides the problem and destroys useful predictions.'},
    ]},
  ]],
];
