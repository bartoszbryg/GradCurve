window.LESSON_TITLES[23] = "EDA: Reading the Data";
window.LESSON_TITLES[24] = "Feature Importance";
window.LESSON_TITLES[25] = "Model Interpretability";
window.LESSON_TITLES[26] = "Ensembles: Notebook 05 Deep Dive";
window.LESSON_TITLES[27] = "The Accuracy Ceiling";
window.LESSON_TITLES[28] = "Hyperparameter Tuning";
window.BLOCKS[23] = [
  [
    "h2",
    "Notebook 01: what EDA proved"
  ],
  [
    "p",
    "Exploratory data analysis checks whether the dataset is balanced, which features separate classes, and where the accuracy ceiling comes from."
  ],
  [
    "streamlit",
    "EDA",
    "Open the Streamlit dashboard, choose the EnergyTypeNet mode, then open the EDA or data exploration page. Compare class counts, feature histograms, and the Energy x Square Footage scatter before looking at any model."
  ],
  [
    "h2",
    "1. Class balance"
  ],
  [
    "p",
    "Training set counts are Residential = 347, Commercial = 336, Industrial = 317. The classes are close to one third each, so the dataset is approximately balanced."
  ],
  [
    "p",
    "Balance matters because StratifiedKFold can preserve similar class proportions in every fold. If one class dominated, plain accuracy could look high even when the minority class was ignored."
  ],
  [
    "code",
    "Notebook 01 class-count code",
    "counts = train_df['Building Type'].value_counts()\nprint('Class counts:', counts.to_dict())\n\n# Real output:\n# {'Residential': 347, 'Commercial': 336, 'Industrial': 317}"
  ],
  [
    "callout",
    "info",
    "What this tells you",
    "- Accuracy is meaningful because no class dominates.\n- Stratified folds should contain examples from all three classes.\n- A random baseline is still about 33%, not 50% or 90%."
  ],
  [
    "h2",
    "2. Feature distributions"
  ],
  [
    "code",
    "Real per-class ranges",
    "Energy Consumption:\n  Residential: 1683.95 to 5746.40, mean 3681.63\n  Commercial:  2241.96 to 5980.98, mean 4130.02\n  Industrial:  2724.82 to 6530.60, mean 4735.14\n\nSquare Footage:\n  Residential: 802 to 49969, mean 25825.61\n  Commercial:  560 to 49653, mean 24386.55\n  Industrial:  626 to 49997, mean 26205.10\n\nNumber of Occupants:\n  Residential: 1 to 99, mean 47.73\n  Commercial:  1 to 99, mean 47.88\n  Industrial:  1 to 99, mean 49.60\n\nAppliances Used:\n  Residential: 1 to 49, mean 25.05\n  Commercial:  1 to 49, mean 25.90\n  Industrial:  1 to 49, mean 25.90"
  ],
  [
    "p",
    "Energy Consumption separates classes best. Square Footage, Occupants, Appliances, and Temperature overlap heavily across all three classes."
  ],
  [
    "h2",
    "3. Feature correlation"
  ],
  [
    "code",
    "Notebook 01 correlation code",
    "numeric_df = train_df.copy()\nnumeric_df['Building Type (enc)'] = numeric_df['Building Type'].map(LABEL_MAP)\nnumeric_df['Is Weekend'] = (train_df['Day of Week'] == 'Weekend').astype(int)\n\ncorr_cols = [\n    'Square Footage', 'Number of Occupants', 'Appliances Used',\n    'Average Temperature', 'Energy Consumption',\n    'Is Weekend', 'Building Type (enc)'\n]\ncorr = numeric_df[corr_cols].corr()"
  ],
  [
    "code",
    "Real correlation values",
    "Correlation with Building Type (enc):\n  Energy Consumption:     0.459\n  Is Weekend:             0.027\n  Number of Occupants:    0.026\n  Appliances Used:        0.025\n  Square Footage:         0.009\n  Average Temperature:   -0.006\n\nStrongest feature-feature correlation:\n  Square Footage vs Energy Consumption = 0.775\n\nOther useful correlations:\n  Number of Occupants vs Energy Consumption = 0.354\n  Appliances Used vs Energy Consumption = 0.313"
  ],
  [
    "p",
    "Multicollinearity is not severe enough to block modeling. Square Footage and Energy are redundant in part, but each still describes the 2D space used for decision-boundary lessons."
  ],
  [
    "h2",
    "4. Class overlap"
  ],
  [
    "p",
    "The Energy x Square Footage scatter is noisy. Residential and Commercial overlap in the lower and middle energy bands. Industrial is cleanest at the high-energy end, but it still shares square-footage ranges with other classes."
  ],
  [
    "p",
    "This overlap creates a hard ceiling: a model cannot perfectly separate examples that share the same feature region but have different labels."
  ],
  [
    "h2",
    "5. Conclusion"
  ],
  [
    "p",
    "Two features can show the broad energy pattern. They cannot fully separate Residential from Commercial. Adding Occupants and Appliances gives more signals, but the notebook warns that near-perfect scores can also mean leakage."
  ],
  [
    "callout",
    "info",
    "EDA conclusion",
    "Notebook 01 shapes everything later: use stratified CV, expect about a 65-70% ceiling with core features, and prefer better features over blindly trying bigger models."
  ],
  [
    "quiz",
    [
      {
        "q": "Why is accuracy acceptable as a first metric here?",
        "a": 1,
        "opts": [
          {
            "t": "Because there are exactly 1,000 rows.",
            "e": "Row count alone does not make accuracy fair."
          },
          {
            "t": "Because the classes are roughly balanced: 347, 336, and 317.",
            "e": "Correct. No class dominates the target."
          },
          {
            "t": "Because all features are numeric.",
            "e": "Numeric features do not fix class imbalance."
          },
          {
            "t": "Because XGBoost is used later.",
            "e": "Model choice does not make the metric fair."
          }
        ]
      },
      {
        "q": "Which raw feature has the clearest relationship with Building Type?",
        "a": 2,
        "opts": [
          {
            "t": "Average Temperature",
            "e": "Its target correlation is -0.006."
          },
          {
            "t": "Square Footage",
            "e": "Its target correlation is only 0.009 in this CSV."
          },
          {
            "t": "Energy Consumption",
            "e": "Correct. Its target correlation is 0.459 and class means rise from Residential to Industrial."
          },
          {
            "t": "Is Weekend",
            "e": "Its target correlation is 0.027."
          }
        ]
      },
      {
        "q": "What happens if the classes were 900 Residential, 80 Commercial, and 20 Industrial?",
        "a": 0,
        "opts": [
          {
            "t": "Accuracy could look high even if minority classes are ignored.",
            "e": "Correct. A majority-class model would already score 90%."
          },
          {
            "t": "StratifiedKFold would stop working entirely.",
            "e": "It would still work, but folds would be fragile."
          },
          {
            "t": "Correlation values would become impossible to compute.",
            "e": "Correlation can still be computed."
          },
          {
            "t": "The test set would automatically rebalance itself.",
            "e": "No automatic rebalancing happens."
          }
        ]
      }
    ,
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
    ]}]
  ],
  [
    "prompt",
    "EDA deeper exploration",
    "I am studying notebook 01 for a building-type classifier.\nUse these real findings: class counts are Residential=347, Commercial=336, Industrial=317; Energy Consumption has the strongest target correlation at 0.459; Square Footage and Energy correlate at 0.775; core features create class overlap.\nExplain what this means for model choice, cross-validation, and the accuracy ceiling in simple language."
  ]
];

/* Extra numeric walkthroughs for the custom models in src/models/. */
window.BLOCKS[4].push(
  ['h2', 'What the weights look like after training'],
  ['p', 'These numbers come from training LogisticRegressionOvR on the scaled core features: Energy Consumption and Square Footage.'],
  ['code', 'weights_ after fit()',
`model = LogisticRegressionOvR(eta=0.01, n_iter=1000, alpha=0.01, random_state=42)
model.fit(X_train_scaled, y_train)

len(model.weights_) = 3
model.weights_[0].shape = (3,)   # Residential: [bias, w_energy, w_sqft]
model.weights_[1].shape = (3,)   # Commercial:  [bias, w_energy, w_sqft]
model.weights_[2].shape = (3,)   # Industrial:  [bias, w_energy, w_sqft]

Class         bias       w_energy    w_sqft
Residential  -1.370467  -3.426511   +3.583606
Commercial   -1.745282  +1.647572   +1.184568
Industrial   -1.553598  +3.423133   -2.940121`],
  ['callout', 'info', 'What this tells you', 'Industrial has the largest positive energy weight, so higher scaled energy strongly pushes the Industrial yes/no classifier upward. Residential has a negative energy weight, so high energy pushes the Residential classifier downward.'],

  ['h2', 'Tracing one full forward pass with numbers'],
  ['p', 'The prompt example used energy=45000, but this CSV stores energy around 1700-6500, so 45000 is outside the training range. The same "clearly Industrial" idea in this dataset is energy=4500 and sqft=22000.'],
  ['code', 'OvR forward pass: Industrial-looking building',
`raw building = [energy=4500, sqft=22000]
scaled x = [0.3578, -0.2423]

Residential net = x @ [-3.426511, +3.583606] + -1.370467 = -3.4646
Commercial  net = x @ [+1.647572, +1.184568] + -1.745282 = -1.4425
Industrial  net = x @ [+3.423133, -2.940121] + -1.553598 = +0.3838

sigmoid nets = [0.0303, 0.1912, 0.5948]
normalised probabilities = [0.0371, 0.2341, 0.7288]
prediction = Industrial`],
  ['callout', 'info', 'What this tells you', 'The Industrial classifier wins because high scaled energy raises its score while lowering the Residential score. Normalisation turns three independent yes/no scores into one probability vector.'],

  ['h2', 'Tracing a hard case with numbers'],
  ['p', 'A hard case is a building near the middle of the training distribution, where the class scores are close and the model has no obvious winner.'],
  ['code', 'OvR forward pass: borderline building',
`raw building = [energy=4252.6, sqft=26315.8]
scaled x = [0.0926, 0.0597]

Residential net = -1.4737
Commercial  net = -1.5220
Industrial  net = -1.4117

sigmoid nets = [0.1864, 0.1792, 0.1959]
normalised probabilities = [0.3319, 0.3192, 0.3489]
prediction = Industrial

This is hard because all three probabilities are close.`],
  ['callout', 'info', 'What this tells you', 'The model struggles near class boundaries because small changes in energy or square footage can flip the winning class. Close probabilities are a warning to treat the prediction as uncertain.'],

  ['h2', 'Effect of L2 regularisation on weights'],
  ['code', 'Regularisation sweep',
`for alpha in [0, 0.01, 0.1]:
    model = LogisticRegressionOvR(
        eta=0.01,
        n_iter=1000,
        alpha=alpha,
        random_state=42,
    )
    scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
    model.fit(X_train_scaled, y_train)
    weight_magnitude = sum(np.sum(w[1:] ** 2) for w in model.weights_)

alpha   weight_magnitude   CV scores                         CV mean
0       49.085766          [0.585, 0.565, 0.535, 0.540, 0.595] 0.564
0.01    49.063059          [0.585, 0.565, 0.535, 0.540, 0.595] 0.564
0.1     48.860962          [0.580, 0.565, 0.535, 0.540, 0.595] 0.563`],
  ['callout', 'info', 'What this tells you', 'L2 regularisation makes the weights slightly smaller. Here alpha=0 and alpha=0.01 tie on CV accuracy, so alpha=0.01 is a reasonable safer default because it keeps weights a little more controlled.'],

  ['h2', 'Why 1000 iterations and not 100 or 10000'],
  ['code', 'Loss by iteration',
`model = LogisticRegressionOvR(eta=0.01, n_iter=2000, alpha=0.01, random_state=42)
model.fit(X_train_scaled, y_train)

iteration   total binary loss
50          2172.2692
100         2172.5309
500         2172.5767
1000        2172.5767
2000        2172.5767`],
  ['callout', 'info', 'What this tells you', 'The loss has stopped changing by about 500 iterations, so 1000 iterations is enough for this dataset. Running to 10000 would mostly waste time without improving the fitted model.']
);

window.BLOCKS[5].push(
  ['h2', 'Shape of W_ matrix and what each row means'],
  ['p', 'Softmax stores one row of weights per class, and each row has one value per input feature.'],
  ['code', 'W_ after fit()',
`model = LogisticRegressionSoftmax(eta=0.1, n_iter=1000, alpha=0.01, random_state=42)
model.fit(X_train_scaled, y_train)

W_.shape = (3, 2)
b_.shape = (3,)

                 w_energy    w_sqft      bias
Residential      -1.760540   +1.319729   -0.063462
Commercial       -0.009551   -0.072220   +0.286183
Industrial       +1.773439   -1.243278   -0.222722`],
  ['callout', 'info', 'What this tells you', 'Industrial has the largest energy weight because higher energy is the strongest signal for that class. Residential has the most negative energy weight, so high energy pulls probability away from Residential.'],

  ['h2', 'Complete forward pass with matrix math'],
  ['code', 'Softmax forward pass',
`raw building = [energy=5000, sqft=3000]
scaled x = [0.8938, -1.5722]

logits = x @ W_.T + b_
Residential = 0.8938*(-1.760540) + -1.5722*(+1.319729) + -0.063462 = -3.7118
Commercial  = 0.8938*(-0.009551) + -1.5722*(-0.072220) + +0.286183 = +0.3912
Industrial  = 0.8938*(+1.773439) + -1.5722*(-1.243278) + -0.222722 = +3.3170

shifted logits = [-7.0288, -2.9258, 0.0000]
exp values     = [0.0009, 0.0536, 1.0000]
probabilities  = [0.0008, 0.0509, 0.9483]
prediction     = Industrial

OvR on the same building = [0.0000, 0.0958, 0.9042]
Both models predict Industrial, but Softmax is more confident.`],
  ['callout', 'info', 'What this tells you', 'Softmax compares all classes in one shared calculation, while OvR combines three separate yes/no classifiers. They often agree, but their probabilities do not have to match.'],

  ['h2', 'Cross-entropy loss computed step by step'],
  ['code', 'Cross-entropy examples',
`Formula:
L = -sum(y_true * log(p_predicted))

Residential true label:
y_true = [1, 0, 0]

Good prediction:
p = [0.72, 0.21, 0.07]
L = -log(0.72) = 0.3285

Wrong prediction:
p = [0.10, 0.80, 0.10]
L = -log(0.10) = 2.3026

Gradient for one good example:
dL = P - Y
dL = [0.72, 0.21, 0.07] - [1, 0, 0]
dL = [-0.28, 0.21, 0.07]`],
  ['callout', 'info', 'What this tells you', 'Cross-entropy punishes confident wrong answers much more than mostly-correct answers. The gradient says to raise the true class probability and lower the others.'],

  ['h2', 'How Softmax and OvR decisions compare'],
  ['code', 'Same buildings, two classifiers',
`Building                         True          OvR           Softmax       Same?
[2713.95, 7063]                  Residential   Residential   Residential   yes
[5744.99, 44372]                 Commercial    Commercial    Industrial    no
[4101.24, 19255]                 Industrial    Industrial    Commercial    no
[3009.14, 13265]                 Residential   Residential   Residential   yes
[3279.17, 13375]                 Commercial    Residential   Residential   yes
[4318.61, 27702]                 Commercial    Commercial    Commercial    yes
[4993.70, 37912]                 Commercial    Commercial    Industrial    no
[4230.09, 13499]                 Commercial    Industrial    Industrial    yes
[4892.22, 20920]                 Industrial    Industrial    Industrial    yes
[3872.54, 12615]                 Residential   Industrial    Commercial    no`],
  ['callout', 'info', 'What this tells you', 'OvR and Softmax can disagree because OvR draws three independent one-vs-rest boundaries, while Softmax learns one joint multiclass geometry. Disagreement rows are useful examples to inspect during evaluation.']
);

window.BLOCKS[6].push(
  ['h2', 'predict_proba traced with array shapes'],
  ['p', 'This trace uses the first 80 training rows so the shapes match the small classroom example. The production idea is the same with all 1000 rows.'],
  ['code', 'Attention forward pass shapes',
`query building = [energy=4500, sqft=22000]
x_scaled = [0.3578, -0.2423]

Step 1:
diff = X_query[:, np.newaxis, :] - X_train[np.newaxis, :, :]
diff.shape = (1, 80, 2)

Step 2:
dist = sqrt(sum(diff ** 2, axis=2))
dist.shape = (1, 80)
first 5 distances = [2.1815, 2.0574, 0.4687, 1.7111, 1.4412]

Step 3:
weights = exp(-dist / w), with w=2.0
first 5 weights after normalising = [0.008110, 0.008629, 0.019097, 0.010261, 0.011743]

Step 4:
weights.sum() = 1.000000

Step 5:
sum weights where y_train == Residential
sum weights where y_train == Commercial
sum weights where y_train == Industrial

Step 6:
probabilities = [0.3287, 0.2612, 0.4101]
prediction = Industrial`],
  ['callout', 'info', 'What this tells you', 'Attention turns distance into voting strength. The probabilities are just the total normalised vote weight for each class.'],

  ['h2', 'Top 5 most influential neighbours for one query'],
  ['code', 'Highest attention weights',
`query building = [energy=4500, sqft=22000]
bandwidth w = 2.0

Rank   Building energy   Building sqft   True class    Weight
1      4892.22           20920           Industrial    0.019497
2      4318.61           27702           Commercial    0.019335
3      4101.24           19255           Industrial    0.019097
4      4134.35           18274           Industrial    0.019077
5      4329.50           28587           Industrial    0.018839

Top 5 class counts:
Industrial = 4
Commercial = 1
Residential = 0

Prediction = Industrial`],
  ['callout', 'info', 'What this tells you', 'The top neighbors mostly belong to Industrial, and the final prediction matches that local majority. A farther neighbor still contributes, but with a smaller vote.'],

  ['h2', 'Bandwidth w: three regimes with real probability outputs'],
  ['p', 'Using a real Industrial training row makes the bandwidth effect easy to see because the nearest neighbor is exactly known.'],
  ['code', 'Bandwidth comparison',
`query building = [energy=6493.48, sqft=45162]
true class = Industrial
x_scaled = [2.4948, 1.3788]

w = 0.3
probabilities = [0.0080, 0.0450, 0.9470]
prediction = Industrial

w = 2.0
probabilities = [0.2323, 0.1999, 0.5678]
prediction = Industrial

w = 8.0
probabilities = [0.3273, 0.2384, 0.4343]
prediction = Industrial`],
  ['callout', 'info', 'What this tells you', 'Small bandwidth makes the closest examples dominate, which is useful for clean local clusters but dangerous near noisy points. Large bandwidth smooths the result toward the overall class frequency.'],

  ['h2', 'Why this is called Attention'],
  ['p', 'This classifier and transformer attention share the same core move: compute weights, then take a weighted sum of values.'],
  ['code', 'Attention idea',
`This classifier:
similarity = fixed Euclidean distance
weights = exp(-distance / w)
value = class label
output = sum(weights for each class)

Transformer attention:
similarity = learned query-key score
weights = softmax(query @ key)
value = learned value vector
output = sum(weights * value_vectors)`],
  ['callout', 'info', 'What this tells you', 'The project classifier uses a fixed distance rule, while transformers learn the similarity function and the value vectors from data. Both are weighted-sum machines.']
);
window.BLOCKS[24] = [
  [
    "h2",
    "Notebook 03: feature importance and feature leakage"
  ],
  [
    "p",
    "Notebook 03 asks which features really help and whether engineered features improve cross-validation accuracy."
  ],
  [
    "h2",
    "1. ANOVA F-scores"
  ],
  [
    "p",
    "ANOVA tests whether feature means differ across classes. A large F-score means class means are far apart relative to within-class variation."
  ],
  [
    "code",
    "ANOVA formula",
    "F = variance_between_class_means / variance_within_classes\n\nHigh F-score: class means are different.\nLow F-score: class distributions overlap."
  ],
  [
    "code",
    "Notebook 03 ANOVA code",
    "selector = SelectKBest(f_classif, k='all')\nselector.fit(X_eng_train, y_train)\n\nf_scores = selector.scores_\np_values = selector.pvalues_\norder = np.argsort(f_scores)[::-1]"
  ],
  [
    "code",
    "Real ANOVA output",
    "energy_consumption    F=134.16   p=2.53e-52\nenergy_per_sqft       F=3.64     p=2.67e-02\nsquare_footage        F=1.49     p=2.25e-01\navg_temperature       F=0.85     p=4.26e-01\nappliance_per_occ     F=0.78     p=4.59e-01\nis_weekend            F=0.44     p=6.43e-01\nnum_occupants         F=0.42     p=6.60e-01\nappliances_used       F=0.41     p=6.64e-01\noccupancy_density     F=0.32     p=7.23e-01"
  ],
  [
    "p",
    "Energy Consumption ranks first by a wide margin. It is the only raw feature with a strong class signal."
  ],
  [
    "h2",
    "2. PCA"
  ],
  [
    "p",
    "PCA finds directions of maximum variance after scaling the engineered features. It is a visualization and compression tool, not a classifier."
  ],
  [
    "code",
    "Notebook 03 PCA code",
    "sc = StandardScaler()\nX_sc = sc.fit_transform(X_eng_train)\n\npca = PCA(n_components=min(X_sc.shape[1], 9))\npca.fit(X_sc)\ncumvar = np.cumsum(pca.explained_variance_ratio_)\nX_pca = pca.transform(X_sc)[:, :2]"
  ],
  [
    "code",
    "Real PCA values",
    "Explained variance ratios:\n  PC1=0.2878, PC2=0.1851, PC3=0.1446, PC4=0.1120, PC5=0.1078,\n  PC6=0.0762, PC7=0.0535, PC8=0.0229, PC9=0.0101\n\nCumulative variance:\n  2 PCs = 0.4729\n  5 PCs = 0.8373\n  6 PCs = 0.9135\n  7 PCs = 0.9670\n\nComponents for 95% variance: 7\n\nPC1 largest loadings:\n  square_footage=+0.539, energy_per_sqft=-0.503,\n  energy_consumption=+0.480, occupancy_density=-0.468\n\nPC2 largest loadings:\n  num_occupants=+0.680, appliance_per_occ=-0.562,\n  occupancy_density=+0.343, energy_consumption=+0.292"
  ],
  [
    "h2",
    "3. t-SNE"
  ],
  [
    "p",
    "t-SNE builds a nonlinear 2D map that preserves local neighborhoods. Notebook 03 used it for visualization only. It cannot be used as the production predictor because it does not learn a stable transformation for new rows in the same way a model pipeline does."
  ],
  [
    "code",
    "Notebook 03 t-SNE code",
    "tsne = TSNE(n_components=2, perplexity=40, random_state=42, max_iter=1000)\nX_tsne = tsne.fit_transform(X_sc)"
  ],
  [
    "p",
    "The t-SNE plot confirmed the same story as PCA: some local clusters exist, but the classes still overlap."
  ],
  [
    "h2",
    "4. Ablation study"
  ],
  [
    "p",
    "An ablation study changes the feature set and measures the score. If accuracy drops after removing a feature, that feature mattered."
  ],
  [
    "code",
    "Real feature-set CV results",
    "Config             LR mean?std     MLP mean?std    XGB mean?std\nCore (2)           0.627?0.015     0.612?0.046     0.590?0.029\nExtended (4)       1.000?0.000     0.985?0.009     0.813?0.012\nAll raw (5)        1.000?0.000     0.979?0.029     0.793?0.031\nEngineered (9)     0.998?0.002     0.864?0.232     0.828?0.023"
  ],
  [
    "h2",
    "5. Feature leakage warning"
  ],
  [
    "p",
    "The extended feature set scores near-perfect for Logistic Regression. That is suspicious. It suggests some features may encode the label too directly."
  ],
  [
    "p",
    "Encoding the label means a feature acts like a hidden answer key. Example: if ?Appliances Used? was generated differently for each class, the model can infer the class from that column instead of learning a realistic pattern."
  ],
  [
    "p",
    "The honest benchmark is the 2-feature core set: Energy Consumption and Square Footage. It is harder, but it better reflects the visible class overlap."
  ],
  [
    "callout",
    "warning",
    "Leakage test",
    "If CV accuracy is near 1.000 but test accuracy or real-world performance is much lower, suspect leakage or a feature that was generated from the target."
  ],
  [
    "quiz",
    [
      {
        "q": "What does a high ANOVA F-score mean?",
        "a": 1,
        "opts": [
          {
            "t": "The feature has many missing values.",
            "e": "ANOVA does not measure missingness."
          },
          {
            "t": "Feature means differ across classes.",
            "e": "Correct."
          },
          {
            "t": "The feature is perfectly calibrated.",
            "e": "Calibration is about probabilities."
          },
          {
            "t": "The feature must be removed.",
            "e": "High signal is usually useful, unless leakage is involved."
          }
        ]
      },
      {
        "q": "How many PCA components explain at least 95% of variance?",
        "a": 2,
        "opts": [
          {
            "t": "2",
            "e": "2 PCs explain 0.4729."
          },
          {
            "t": "5",
            "e": "5 PCs explain 0.8373."
          },
          {
            "t": "7",
            "e": "Correct. 7 PCs explain 0.9670."
          },
          {
            "t": "9 only",
            "e": "9 explains 1.0, but 7 already passes 95%."
          }
        ]
      },
      {
        "q": "What happens if a feature set gives 1.000?0.000 CV accuracy on this noisy problem?",
        "a": 3,
        "opts": [
          {
            "t": "The project is solved forever.",
            "e": "Probably not. It may be too good to be true."
          },
          {
            "t": "The model is definitely underfitting.",
            "e": "Perfect CV is not underfitting."
          },
          {
            "t": "The feature has no signal.",
            "e": "Perfect CV means extremely high signal or leakage."
          },
          {
            "t": "You should check for leakage or label encoding.",
            "e": "Correct."
          }
        ]
      }
    ,
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
    ]}]
  ]
];
window.BLOCKS[25] = [
  [
    "h2",
    "Notebook 04: diagnostics beyond accuracy"
  ],
  [
    "p",
    "Notebook 04 adds ROC/AUC, precision-recall curves, permutation importance, calibration curves, and learning curves. These explain why a model succeeds or fails."
  ],
  [
    "h2",
    "1. ROC curves and AUC"
  ],
  [
    "p",
    "ROC measures true positive rate versus false positive rate at every threshold. AUC is the area under that curve. AUC=0.5 is random. AUC=1.0 is perfect."
  ],
  [
    "code",
    "Notebook 04 ROC code",
    "for class_idx, class_name in enumerate(CLASSES):\n    y_bin = (y_test == class_idx).astype(int)\n    proba = model.predict_proba(X)[:, class_idx]\n    fpr, tpr, _ = roc_curve(y_bin, proba)\n    roc_auc = auc(fpr, tpr)"
  ],
  [
    "p",
    "Notebook 04 plotted one-vs-rest AUC for each class. The saved notebook stores those values inside the rendered plot image, not as printed text. The notebook conclusion says classes with AUC > 0.80 are well-separated and weaker AUC classes reveal where accuracy is lost."
  ],
  [
    "p",
    "Industrial is the cleanest class because high Energy Consumption separates it better than Residential vs Commercial."
  ],
  [
    "h2",
    "2. Precision-Recall curves"
  ],
  [
    "p",
    "Precision-recall curves are more useful than ROC curves when classes are imbalanced. They show the trade-off between catching positives and avoiding false alarms."
  ],
  [
    "code",
    "Notebook 04 PR threshold sweep",
    "proba_xgb = xgb_model.predict_proba(X_test)\ny_ind = (y_test == 2).astype(int)\nprec, rec, thresholds = precision_recall_curve(y_ind, proba_xgb[:, 2])"
  ],
  [
    "p",
    "The threshold sweep in notebook 04 used XGBoost for the Industrial class. Raising the threshold increases precision but lowers recall. Lowering the threshold catches more Industrial buildings but creates more false positives."
  ],
  [
    "h2",
    "3. Permutation importance"
  ],
  [
    "p",
    "Permutation importance shuffles one feature and measures how much accuracy drops. A large drop means the model needed that feature. A score near 0 means the feature contributed little."
  ],
  [
    "code",
    "Notebook 04 permutation code",
    "result = permutation_importance(\n    model, X, y_test,\n    n_repeats=30,\n    random_state=42,\n    scoring='accuracy',\n)\nmeans = result.importances_mean\nstds = result.importances_std\norder = np.argsort(means)[::-1]"
  ],
  [
    "p",
    "The notebook conclusion says permutation importance confirms the EDA: Energy Consumption and Square Footage carry most of the predictive signal. This is more reliable than raw coefficients because it measures actual score loss."
  ],
  [
    "h2",
    "4. Calibration curves"
  ],
  [
    "p",
    "Calibration asks: when the model says 70%, is it correct about 70% of the time? Logistic Regression is usually best calibrated. XGBoost and MLP often become overconfident and may need Platt scaling."
  ],
  [
    "code",
    "Notebook 04 calibration code",
    "frac_pos, mean_pred = calibration_curve(\n    (y_test == k).astype(int),\n    proba,\n    n_bins=8,\n    strategy='uniform',\n)"
  ],
  [
    "h2",
    "5. Learning curves"
  ],
  [
    "p",
    "A learning curve plots accuracy against training-set size. Notebook 04 concluded that train and CV accuracy plateau early. That means more rows alone are not the bottleneck. Better features matter more."
  ],
  [
    "code",
    "Notebook 04 model accuracies",
    "LR           test acc=0.6400\nMLP          test acc=0.6000\nXGBoost      test acc=0.6500\nAttention    test acc=0.5300\nSoftmax LR   test acc=0.6000"
  ],
  [
    "quiz",
    [
      {
        "q": "What does AUC=0.5 mean?",
        "a": 0,
        "opts": [
          {
            "t": "Random discrimination.",
            "e": "Correct."
          },
          {
            "t": "Perfect discrimination.",
            "e": "That is AUC=1.0."
          },
          {
            "t": "Perfect calibration.",
            "e": "AUC is not calibration."
          },
          {
            "t": "Zero false positives.",
            "e": "AUC does not mean that."
          }
        ]
      },
      {
        "q": "What does permutation importance measure?",
        "a": 2,
        "opts": [
          {
            "t": "How often a feature appears in a tree split.",
            "e": "That is a tree-specific importance."
          },
          {
            "t": "The raw model coefficient.",
            "e": "Coefficients are model-specific."
          },
          {
            "t": "Accuracy drop after shuffling one feature.",
            "e": "Correct."
          },
          {
            "t": "The number of missing values.",
            "e": "No."
          }
        ]
      },
      {
        "q": "What happens if train accuracy rises but CV accuracy stays flat?",
        "a": 1,
        "opts": [
          {
            "t": "The model is calibrated.",
            "e": "Calibration is separate."
          },
          {
            "t": "The model is likely overfitting.",
            "e": "Correct."
          },
          {
            "t": "The dataset is perfectly separable.",
            "e": "Flat CV says no."
          },
          {
            "t": "More thresholds are needed.",
            "e": "Thresholds do not fix overfitting."
          }
        ]
      }
    ,
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
    ]}]
  ]
];
window.BLOCKS[26] = [
  [
    "h2",
    "Notebook 05: voting and stacking"
  ],
  [
    "p",
    "Notebook 05 compared individual models with Soft Voting and Stacking on the core feature set. The goal was to see whether ensembles beat the accuracy ceiling."
  ],
  [
    "h2",
    "1. What was tested"
  ],
  [
    "code",
    "Notebook 05 ensemble code",
    "voting = VotingClassifier(\n    estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],\n    voting='soft',\n)\n\nstacking = StackingClassifier(\n    estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],\n    final_estimator=LogisticRegression(max_iter=1000),\n    stack_method='predict_proba',\n    cv=5,\n    n_jobs=1,\n)"
  ],
  [
    "code",
    "Saved project CV metrics for the same ensemble family",
    "logistic_regression: CV=0.626 ? 0.0166, scores=[0.650, 0.605, 0.630, 0.610, 0.635]\nmlp:                 CV=0.550 ? 0.0270, scores=[0.580, 0.580, 0.535, 0.510, 0.545]\nxgboost:             CV=0.596 ? 0.0410, scores=[0.645, 0.525, 0.615, 0.615, 0.580]\nsoft_voting:         CV=0.615 ? 0.0179, scores=[0.645, 0.590, 0.620, 0.610, 0.610]\nstacking:            CV=0.628 ? 0.0136, scores=[0.645, 0.615, 0.640, 0.610, 0.630]\nstacking test accuracy: 0.650"
  ],
  [
    "h2",
    "2. When ensembles beat single models"
  ],
  [
    "p",
    "Stacking slightly beat the best single model by mean CV: 0.628 versus Logistic Regression at 0.626. The gain is tiny but the std is lower: 0.0136. That means the ensemble was slightly more stable."
  ],
  [
    "p",
    "The saved stacking report shows Residential was strongest: precision=0.750, recall=0.750. Commercial was hardest: precision=0.462, recall=0.462."
  ],
  [
    "h2",
    "3. When ensembles do not help"
  ],
  [
    "p",
    "Soft voting scored 0.615, below Logistic Regression at 0.626. That means averaging weak or similar learners can dilute the strongest model. Diversity matters. If all models make the same mistakes in the same overlapping region, an ensemble cannot magically separate the classes."
  ],
  [
    "h2",
    "4. Stacking meta-model"
  ],
  [
    "p",
    "Stacking trains a LogisticRegression meta-model on base-model probability outputs. It learns which base learner to trust for each probability pattern. On this small core dataset, it mostly stabilizes predictions rather than creating a large accuracy jump."
  ],
  [
    "quiz",
    [
      {
        "q": "Which ensemble had the best saved CV mean?",
        "a": 2,
        "opts": [
          {
            "t": "Soft Voting at 0.615.",
            "e": "Soft voting was lower."
          },
          {
            "t": "XGBoost at 0.596.",
            "e": "XGBoost was lower."
          },
          {
            "t": "Stacking at 0.628.",
            "e": "Correct."
          },
          {
            "t": "MLP at 0.550.",
            "e": "MLP was lowest here."
          }
        ]
      },
      {
        "q": "Why did soft voting not beat Logistic Regression?",
        "a": 1,
        "opts": [
          {
            "t": "Voting cannot use probabilities.",
            "e": "It used soft probability voting."
          },
          {
            "t": "The base models were not diverse enough to fix shared overlap errors.",
            "e": "Correct."
          },
          {
            "t": "The dataset had no labels.",
            "e": "It had labels."
          },
          {
            "t": "XGBoost cannot be ensembled.",
            "e": "It can be ensembled."
          }
        ]
      },
      {
        "q": "What happens if all base models make the same Residential vs Commercial mistakes?",
        "a": 3,
        "opts": [
          {
            "t": "Stacking becomes perfect.",
            "e": "No. Shared errors remain hard."
          },
          {
            "t": "Voting automatically removes overlap.",
            "e": "Voting cannot remove feature overlap."
          },
          {
            "t": "The test set gets larger.",
            "e": "No."
          },
          {
            "t": "The ensemble gain stays small.",
            "e": "Correct."
          }
        ]
      }
    ,
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
    ]}]
  ]
];
window.BLOCKS[27] = [
  [
    "h2",
    "Notebook 06: sample size or class overlap?"
  ],
  [
    "p",
    "Notebook 06 tested whether the 60-67% ceiling comes from too few rows or from overlapping features."
  ],
  [
    "h2",
    "1. Research question"
  ],
  [
    "p",
    "Hypothesis A: more samples will fix the score. Hypothesis B: class overlap is the bottleneck, so better features are needed. This matters before spending time collecting 10x more data."
  ],
  [
    "h2",
    "2. Experimental design"
  ],
  [
    "p",
    "Synthetic data varied sample size and class separability. In sklearn make_classification, class_sep controls how far apart the class clusters are. Higher class_sep means cleaner separation."
  ],
  [
    "code",
    "Exact synthetic_experiment.py core",
    "def build_synthetic_models(random_state: int = 42) -> dict:\r\n    \"\"\"Create the models used in the synthetic separability experiment.\"\"\"\r\n    logistic_regression = make_pipeline(\r\n        StandardScaler(),\r\n        LogisticRegression(max_iter=1000),\r\n    )\r\n\r\n    xgboost = XGBClassifier(\r\n        objective='multi:softprob',\r\n        num_class=3,\r\n        eval_metric='mlogloss',\r\n        max_depth=4,\r\n        learning_rate=0.05,\r\n        n_estimators=100,\r\n        random_state=random_state,\r\n        verbosity=0,\r\n    )\r\n\r\n    return {\r\n        'logistic_regression': logistic_regression,\r\n        'xgboost': xgboost,\r\n    }\r\n\r\n\r\ndef run_experiment(random_state: int = 42) -> list:\r\n    \"\"\"Run synthetic datasets across sample sizes and class separability levels.\"\"\"\r\n    rows = []\r\n    sample_sizes = [300, 1000, 3000]\r\n    class_separations = [0.4, 0.7, 1.0, 1.5, 2.0]\r\n    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)\r\n\r\n    for n_samples in sample_sizes:\r\n        for class_sep in class_separations:\r\n            X, y = make_classification(\r\n                n_samples=n_samples,\r\n                n_features=6,\r\n                n_informative=2,\r\n                n_redundant=2,\r\n                n_classes=3,\r\n                n_clusters_per_class=1,\r\n                class_sep=class_sep,\r\n                random_state=random_state,\r\n            )\r\n\r\n            models = build_synthetic_models(random_state=random_state)\r\n\r\n            for name, model in models.items():\r\n                scores = cross_val_score(\r\n                    model,\r\n                    X,\r\n                    y,\r\n                    cv=cv,\r\n                    scoring='accuracy',\r\n                    n_jobs=1,\r\n                )\r\n\r\n                rows.append({\r\n                    'model': name,\r\n                    'n_samples': n_samples,\r\n                    'class_sep': class_sep,\r\n                    'cv_mean': float(scores.mean()),\r\n                    'cv_std': float(scores.std()),\r"
  ],
  [
    "h2",
    "3. Results"
  ],
  [
    "code",
    "Real saved synthetic results",
    "Logistic Regression:\n  n=300:  sep 0.4=0.647, 0.7=0.817, 1.0=0.913, 1.5=0.983, 2.0=0.997\n  n=1000: sep 0.4=0.512, 0.7=0.749, 1.0=0.878, 1.5=0.974, 2.0=0.989\n  n=3000: sep 0.4=0.676, 0.7=0.836, 1.0=0.919, 1.5=0.972, 2.0=0.988\n\nXGBoost:\n  n=300:  sep 0.4=0.763, 0.7=0.887, 1.0=0.937, 1.5=0.990, 2.0=0.997\n  n=1000: sep 0.4=0.733, 0.7=0.846, 1.0=0.900, 1.5=0.977, 2.0=0.991\n  n=3000: sep 0.4=0.702, 0.7=0.846, 1.0=0.921, 1.5=0.973, 2.0=0.989"
  ],
  [
    "p",
    "Increasing class_sep changes accuracy much more than increasing n_samples. At fixed low separation, more data does not guarantee a higher score. At high separation, even 300 rows can reach about 0.99."
  ],
  [
    "h2",
    "4. Conclusion"
  ],
  [
    "p",
    "One-sentence conclusion: the ceiling is mostly a feature-overlap problem, not a sample-size problem."
  ],
  [
    "p",
    "Collecting 10x more buildings with the same overlapping features would not reliably fix 63% accuracy. Better features would raise accuracy: building age, HVAC type, operating hours, equipment type, or energy per business activity."
  ],
  [
    "h2",
    "5. Implications"
  ],
  [
    "p",
    "Collect more data when variance is high and learning curves are still rising. Engineer better features when classes occupy the same region of feature space. Class_sep=0.1 looks like mixed clouds. Class_sep=1.0 starts to show visible clusters."
  ],
  [
    "quiz",
    [
      {
        "q": "Which axis mattered more in the synthetic experiment?",
        "a": 1,
        "opts": [
          {
            "t": "n_samples only.",
            "e": "More rows helped less than separation."
          },
          {
            "t": "class_sep.",
            "e": "Correct. Separability changed accuracy most."
          },
          {
            "t": "random_state.",
            "e": "It controls reproducibility."
          },
          {
            "t": "n_features only.",
            "e": "The experiment held feature count fixed."
          }
        ]
      },
      {
        "q": "What does class_sep control?",
        "a": 0,
        "opts": [
          {
            "t": "How far apart synthetic class clusters are.",
            "e": "Correct."
          },
          {
            "t": "The number of test folds.",
            "e": "No."
          },
          {
            "t": "The number of target classes.",
            "e": "No."
          },
          {
            "t": "The learning rate.",
            "e": "No."
          }
        ]
      },
      {
        "q": "What happens if you collect 10x more rows but keep the same overlapping features?",
        "a": 2,
        "opts": [
          {
            "t": "Accuracy must become 100%.",
            "e": "No."
          },
          {
            "t": "The labels disappear.",
            "e": "No."
          },
          {
            "t": "Accuracy may plateau because the geometry did not change.",
            "e": "Correct."
          },
          {
            "t": "class_sep automatically increases.",
            "e": "No. Better features increase separability."
          }
        ]
      }
    ,
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
    ]}]
  ]
];
window.BLOCKS[28] = [
  [
    "h2",
    "How the project tuned models"
  ],
  [
    "p",
    "Hyperparameters are choices made before training. Learned parameters are values the model fits during training. Tune hyperparameters with validation or CV, then evaluate once on the holdout test set."
  ],
  [
    "h2",
    "1. Why not tune on test?"
  ],
  [
    "p",
    "The test set must stay untouched until the end. If you tune on it, it becomes part of training and the final score is no longer honest."
  ],
  [
    "h2",
    "2. Grid search for sklearn models"
  ],
  [
    "code",
    "Notebook 02 Logistic Regression grid",
    "Cs = [0.01, 0.1, 1, 10]\nsolvers = ['lbfgs', 'newton-cg']\n\nfor C in Cs:\n    for solver in solvers:\n        model = LogisticRegression(C=C, solver=solver, max_iter=1000)\n        model.fit(X_train_sc, y_train)\n        val_acc = accuracy_score(y_val, model.predict(X_val_sc))\n\n# Best: C=1, solver=lbfgs\n# Val acc=0.6950 | Test acc=0.6400"
  ],
  [
    "code",
    "Notebook 02 MLP and XGBoost best values",
    "MLP search:\n  hidden_layer_sizes: multiple candidates\n  alpha: multiple candidates\n  activation: ['relu', 'tanh']\nBest MLP: hidden=(40, 20), alpha=1e-05, activation=tanh\nVal acc=0.6800 | Test acc=0.6300\n\nXGBoost search:\n  max_depths = [3, 5, 7]\n  learning_rates = [0.01, 0.05, 0.1, 0.3]\n  n_estimators = [100, 200]\n  subsample = [0.8, 1.0]\n  colsample_bytree = [0.8, 1.0]\n  gamma = [0, 1]\nBest XGBoost: depth=5, lr=0.05, n_est=100\nVal acc=0.6650 | Test acc=0.6700"
  ],
  [
    "h2",
    "3. Manual tuning for custom models"
  ],
  [
    "code",
    "Notebook 02 custom tuning results",
    "AttentionClassifier:\n  Best w=0.1 | Val acc=0.6500 | Test acc=0.6300\n\nLogisticRegressionOvR:\n  eta=0.0001, n_iter=1000\n  alpha candidates tested with Linear and Quadratic features\n  Best: alpha=0.0, features=Quadratic\n  Val acc=0.6700 | Test acc=0.6200\n\nSoftmax LR:\n  eta=0.01, n_iter=1000, alpha=0.0\n  Val acc=0.5950 | Test acc=0.6000"
  ],
  [
    "h2",
    "4. What makes a good search"
  ],
  [
    "p",
    "Use log-scale grids for parameters like C, eta, and alpha because useful values often differ by powers of ten. Example: 0.001, 0.01, 0.1, 1.0 is better than 0.1, 0.2, 0.3."
  ],
  [
    "p",
    "Do not test endless combinations on one validation fold. That overfits the validation split. Use CV when the search becomes large. Notebook 02 tested 8 Logistic Regression combos and 192 XGBoost combos."
  ],
  [
    "code",
    "train.py production fixed best-style models",
    "def build_models(random_state: int = 42) -> dict:\r\n    \"\"\"Build all candidate models used by the training script.\"\"\"\r\n    lr = make_pipeline(\r\n        StandardScaler(),\r\n        LogisticRegression(C=10, max_iter=1000, random_state=random_state),\r\n    )\r\n\r\n    mlp = make_pipeline(\r\n        StandardScaler(),\r\n        MLPClassifier(\r\n            hidden_layer_sizes=(40, 20),\r\n            activation='tanh',\r\n            alpha=1e-5,\r\n            max_iter=3000,\r\n            early_stopping=True,\r\n            random_state=random_state,\r\n        ),\r\n    )\r\n\r\n    xgb = XGBClassifier(\r\n        objective='multi:softprob',\r\n        num_class=3,\r\n        eval_metric='mlogloss',\r\n        max_depth=5,\r\n        learning_rate=0.05,\r\n        n_estimators=100,\r\n        subsample=0.8,\r\n        colsample_bytree=1.0,\r\n        gamma=0,\r\n        random_state=random_state,\r\n        verbosity=0,\r\n    )\r\n\r\n    voting = VotingClassifier(\r\n        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],\r\n        voting='soft',\r\n    )\r\n\r\n    stacking = StackingClassifier(\r\n        estimators=[('lr', lr), ('mlp', mlp), ('xgb', xgb)],\r\n        final_estimator=LogisticRegression(max_iter=1000),\r\n        stack_method='predict_proba',\r\n        cv=5,\r\n        n_jobs=1,\r\n    )\r\n\r\n    return {\r\n        'logistic_regression': lr,\r\n        'mlp': mlp,\r\n        'xgboost': xgb,\r\n        'soft_voting': voting,\r\n        'stacking': stacking,\r\n    }\r"
  ],
  [
    "quiz",
    [
      {
        "q": "What is a hyperparameter?",
        "a": 0,
        "opts": [
          {
            "t": "A value chosen before training, like C or max_depth.",
            "e": "Correct."
          },
          {
            "t": "A fitted coefficient inside the model.",
            "e": "That is a learned parameter."
          },
          {
            "t": "A row in the CSV.",
            "e": "No."
          },
          {
            "t": "The final test accuracy.",
            "e": "No."
          }
        ]
      },
      {
        "q": "Why use log-scale values for C or eta?",
        "a": 1,
        "opts": [
          {
            "t": "Because they must be integers.",
            "e": "They can be floats."
          },
          {
            "t": "Because useful values often differ by powers of ten.",
            "e": "Correct."
          },
          {
            "t": "Because sklearn rejects linear grids.",
            "e": "No."
          },
          {
            "t": "Because it removes the need for CV.",
            "e": "No."
          }
        ]
      },
      {
        "q": "What happens if you tune hyperparameters on the test set?",
        "a": 2,
        "opts": [
          {
            "t": "The score becomes more honest.",
            "e": "No."
          },
          {
            "t": "The model trains faster.",
            "e": "No."
          },
          {
            "t": "The test set leaks into model selection.",
            "e": "Correct."
          },
          {
            "t": "Cross-validation becomes impossible.",
            "e": "Not necessarily, but the final test is contaminated."
          }
        ]
      }
    ,
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
    ]}]
  ]
];

