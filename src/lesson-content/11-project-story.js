/* ── BLOCKS[30] = How I Built This Project ───────────────────────── */
window.LESSON_TITLES[30] = 'How I Built This Project';

window.BLOCKS[30] = [
  ['p', 'This is the honest story of how I built the project. Not the polished version. The real version.'],

  ['h2', 'Section 1 — The question I started with'],
  ['p', 'I started with a simple question: can I predict building type from energy data?'],
  ['p', 'That question matters because buildings use energy differently. A house, an office, and a factory do not behave the same way. If I can classify the type, I can make better dashboards, alerts, and recommendations.'],
  ['p', 'The real-world problem is operations. A company may have many buildings but messy labels. Energy data can help identify what kind of site each one probably is.'],
  ['p', 'I chose this dataset because it was small enough to understand, but messy enough to be interesting. It had energy, square footage, occupants, appliances, temperature, day type, and the building label. That was enough to build the full machine learning path.'],

  ['h2', 'Section 2 — Starting with EDA (notebook 01)'],
  ['p', 'I started with EDA because I did not trust the models yet. I wanted to see the data first.'],
  ['p', 'The first thing I checked was class balance. The classes were close: Residential 347, Commercial 336, Industrial 317. That was good. Accuracy would not be dominated by one class.'],
  ['p', 'Then I looked at the scatter plots. Industrial buildings were easier to see. Residential and Commercial overlapped much more.'],
  ['p', 'That overlap was the first warning. With only Energy Consumption and Square Footage, I knew the model would struggle. The two features had signal, but not enough clean separation.'],

  ['h2', 'Section 3 — Building models from scratch'],
  ['p', 'I implemented OvR, Softmax, and Attention in NumPy because I wanted to understand the machinery. Sklearn gives a result. NumPy shows the reason.'],
  ['p', 'OvR taught me how three binary classifiers can become one multiclass model. Softmax taught me how classes compete inside one shared probability distribution. Attention taught me how distance can become a weighted vote.'],
  ['p', 'The biggest lesson was that model code is mostly shapes. If the arrays are wrong, everything breaks. If the shapes are right, the math becomes readable.'],
  ['p', 'One thing surprised me: the normalization step in OvR predict_proba. The three sigmoid outputs are independent. They do not naturally sum to 1. I had to normalize them after the fact. That made Softmax feel cleaner.'],

  ['h2', 'Section 4 — Feature engineering decisions (notebook 03)'],
  ['p', 'I tried ANOVA because I wanted a simple score for each feature. I wanted to know which columns were actually separating the classes.'],
  ['p', 'I tried PCA because I wanted to see whether the feature space had hidden structure. PCA did not magically solve the problem, but it helped me see how spread out the information was.'],
  ['p', 'The extended feature set looked much better at first. Adding occupants and appliances gave the model much more signal.'],
  ['p', 'Then I saw near-perfect CV. At first it looked like a win. Then it felt suspicious. Real data almost never becomes perfect that easily.'],
  ['p', 'That was the leakage discovery. Some engineered or extended features were too close to the label pattern. Near-perfect CV was not a trophy. It was a red flag.'],

  ['h2', 'Section 5 — The accuracy ceiling investigation (notebook 06)'],
  ['p', 'I first noticed the accuracy problem when the core-feature models kept landing around 63%. Different models. Same ceiling.'],
  ['p', 'That made me stop blaming the algorithm. If linear models, neural nets, and XGBoost all struggle in the same region, the problem may be the data geometry.'],
  ['p', 'I built a synthetic experiment because I did not want to say “we need more data” too early. More data only helps if the classes are separable. If the classes overlap, more rows can just confirm the same limit.'],
  ['p', 'The heatmap changed how I think about ML. It showed that separation matters as much as sample size. When classes overlap, accuracy has a ceiling. The model cannot invent information that is not in the features.'],

  ['h2', 'Section 6 — Building the production stack'],
  ['p', 'I chose FastAPI over Flask because the API contract is clearer. Pydantic models make the request shape explicit. That matters when a model becomes a service.'],
  ['p', 'Docker was important because the project had many moving pieces. Python packages, model artifacts, API code, and runtime commands all needed to work the same way on another machine.'],
  ['p', 'MLflow helped more than I expected. It gave me a place to compare runs, save parameters, and keep model artifacts connected to metrics. It made training feel less like random experiments.'],

  ['h2', 'Section 7 — What I would do differently'],
  ['p', 'For feature engineering, I would separate “real deployable features” from “analysis-only features” earlier. That would make leakage easier to catch.'],
  ['p', 'For model selection, I would start with the simplest baseline and write down the ceiling expectation before trying complex models. That would stop me from chasing small gains too quickly.'],
  ['p', 'For the dashboard, I would design the user flow earlier. I added many useful pages, but the learning path became clearer only after I built the website.'],

  ['h2', 'Section 8 — Key numbers to remember'],
  ['code', 'Key numbers',
`Metric                             | Value               | What it means
Best model                         | XGBoost             | 0.67 test accuracy on 2 features
Custom model that matched sklearn   | AttentionClassifier | matched LogisticRegression CV score
CV folds                           | 5                   | stratified, reproducible
Accuracy ceiling                   | ~63-67%             | caused by class overlap, not sample size
Features that leaked the label      | extended set        | near-perfect CV is suspicious`],
  ['callout', 'info', 'What I took from this', 'The biggest lesson was not that one model won. The biggest lesson was that data shape controls what any model can realistically learn.'],

  ['quiz', [
    {q:'Why did I implement OvR, Softmax, and Attention from scratch instead of only using sklearn?', a:1, opts:[
      {t:'Because sklearn cannot train classifiers', e:'Sklearn can train classifiers very well.'},
      {t:'Because writing the NumPy versions forced me to understand the math, shapes, and probability steps', e:'Correct. From-scratch code makes the hidden machinery visible.'},
      {t:'Because NumPy is always more accurate than sklearn', e:'No. Sklearn is usually stronger and more optimized.'},
      {t:'Because the dashboard required custom NumPy code only', e:'No. The dashboard could use sklearn models too.'},
    ]},
    {q:'Why was near-perfect CV on the extended features suspicious instead of exciting?', a:2, opts:[
      {t:'Because high accuracy is always bad', e:'High accuracy can be good when the validation setup is clean.'},
      {t:'Because cross-validation cannot be used with extended features', e:'Cross-validation can be used with any feature set.'},
      {t:'Because the result was too easy and suggested feature leakage or label-like information', e:'Correct. A sudden perfect score should trigger investigation.'},
      {t:'Because XGBoost is not allowed to score above 70%', e:'No. There is no such rule.'},
    ]},
    {q:'Why was the synthetic experiment necessary before concluding “we need more data”?', a:0, opts:[
      {t:'Because it tested whether class separation, not just sample size, was limiting accuracy', e:'Correct. More rows do not fix overlapping classes by themselves.'},
      {t:'Because synthetic data always replaces real data', e:'No. It is a diagnostic tool, not a replacement.'},
      {t:'Because notebooks cannot show accuracy', e:'Notebooks can show accuracy.'},
      {t:'Because FastAPI needs synthetic data to start', e:'The API can start without synthetic experiments.'},
    ]},
  ]],
];
