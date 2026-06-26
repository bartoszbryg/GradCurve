window.BLOCKS[16].push(
  ['h2', "Exact source code - Streamlit Dashboard"],
  ['p', "Why this exists: without caching, every slider movement would reload data or retrain models and the dashboard would feel broken."],
  ['code', "dashboard.py (exact source)", `def _load_energy():
    train_df = load_raw('data/train_energy_data.csv')
    test_df = load_raw('data/test_energy_data.csv')

    X_tr, y_tr = load_features('data/train_energy_data.csv', 'core')
    X_te, y_te = load_features('data/test_energy_data.csv', 'core')
    sc = StandardScaler().fit(X_tr)

    return train_df, test_df, X_tr, y_tr, X_te, y_te, sc

def _train_energy_models(_sc):
    _, _, X_tr, y_tr, _, _, _ = _load_energy()
    X_sc = _sc.transform(X_tr)

    lr = make_pipeline(
        StandardScaler(),
        LogisticRegression(C=10, max_iter=1000, random_state=42),
    )

    mlp = make_pipeline(
        StandardScaler(),
        MLPClassifier(
            hidden_layer_sizes=(20, 20),
            activation='relu',
            alpha=0.01,
            max_iter=1200,
            early_stopping=True,
            random_state=42,
        ),
    )

    xgb = XGBClassifier(
        max_depth=3,
        learning_rate=0.05,
        n_estimators=100,
        objective='multi:softprob',
        num_class=3,
        eval_metric='mlogloss',
        verbosity=0,
        random_state=42,
    )

    attn = AttentionClassifier(w=2.0).fit(X_sc, y_tr)
    softmax = LogisticRegressionSoftmax(
        eta=0.01,
        n_iter=1000,
        alpha=0.01,
        random_state=42,
    ).fit(X_sc, y_tr)

    for m in [lr, mlp, xgb]:
        m.fit(X_tr, y_tr)

    return {
        'LR (sklearn)': (lr, X_tr, False),
        'MLP': (mlp, X_tr, False),
        'XGBoost': (xgb, X_tr, False),
        'AttentionNet': (attn, X_sc, True),
        'LR Softmax': (softmax, X_sc, True),
    }

def render_energy_dashboard(page: str):
    train_df, test_df, X_tr, y_tr, X_te, y_te, sc = _load_energy()

    with st.spinner('Training models - cached after first run...'):
        models = _train_energy_models(sc)

    X_te_sc = sc.transform(X_te)
    X_tr_sc = sc.transform(X_tr)

    if page == 'Overview':
        st.title('EnergyTypeNet - Overview')
        c1, c2, c3, c4 = st.columns(4)

        c1.metric('Training buildings', len(train_df))
        c2.metric('Test buildings', len(test_df))
        c3.metric('Classes', 3)
        c4.metric('Core features', 2)

        accs = {
            n: accuracy_score(y_te, m.predict(X_te_sc if s else X_te))
            for n, (m, _, s) in models.items()
        }
        acc_df = pd.DataFrame({
            'Model': list(accs),
            'Test Accuracy': list(accs.values()),
        }).sort_values('Test Accuracy', ascending=False)

        st.subheader('Test-set accuracy')
        st.bar_chart(acc_df.set_index('Model')['Test Accuracy'])
        st.dataframe(
            acc_df.style.format({'Test Accuracy': '{:.3f}'}),
            width='stretch',
            hide_index=True,
        )
        st.info('All models use only **Energy Consumption** and **Square Footage**. '
                'The 60-67 % ceiling reflects class overlap in this 2-D space.')

    elif page == 'EDA':
        st.title('Exploratory Data Analysis')
        st.bar_chart(train_df['Building Type'].value_counts())
        feat = st.selectbox(
            'Feature distribution',
            [
                'Energy Consumption',
                'Square Footage',
                'Number of Occupants',
                'Appliances Used',
                'Average Temperature',
            ],
        )

        fig, ax = plt.subplots(figsize=(8, 3.5))

        for cls, col in zip(ENERGY_CLASSES, CLASS_COLORS):
            ax.hist(
                train_df[train_df['Building Type'] == cls][feat],
                bins=30,
                alpha=0.55,
                color=col,
                label=cls,
                edgecolor='white',
            )

        ax.set_xlabel(feat)
        ax.legend()
        plt.tight_layout()
        st.pyplot(fig)
        plt.close(fig)
        st.dataframe(train_df, width='stretch')

    elif page == 'Model Comparison':
        st.title('Model Comparison - 5-fold CV')
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        rows = []

        for name, (m, _, is_sc) in models.items():
            X_cv = X_tr_sc if is_sc else X_tr
            scores = cross_val_score(m, X_cv, y_tr, cv=skf, scoring='accuracy')

            rows.append({
                'Model': name,
                'CV Mean': scores.mean(),
                'CV Std': scores.std(),
                'Test Acc': accuracy_score(y_te, m.predict(X_te_sc if is_sc else X_te)),
            })

        cmp_df = pd.DataFrame(rows).sort_values('CV Mean', ascending=False)
        st.dataframe(
            cmp_df.style.format({
                'CV Mean': '{:.3f}',
                'CV Std': '{:.3f}',
                'Test Acc': '{:.3f}',
            }),
            width='stretch',
            hide_index=True,
        )

    elif page == 'Decision Boundaries':
        st.title('Decision Boundaries')
        st.caption('Energy Consumption x Square Footage (scaled). Background = predicted class.')
        cols = st.columns(3)

        for idx, (name, (m, _, _s)) in enumerate(models.items()):
            fig = fig_decision_boundary_2d(m, X_tr_sc, y_tr, ENERGY_CLASSES, sc, name)
            cols[idx % 3].pyplot(fig)
            plt.close(fig)

    elif page == 'Confusion Matrices':
        st.title('Confusion Matrices - Test Set')
        cols = st.columns(3)

        for idx, (name, (m, _, is_sc)) in enumerate(models.items()):
            fig = fig_confusion(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)
            cols[idx % 3].pyplot(fig)
            plt.close(fig)

    elif page == 'ROC / AUC':
        st.title('ROC Curves')
        cols = st.columns(3)

        for idx, (name, (m, _, is_sc)) in enumerate(models.items()):
            fig = fig_roc(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)

            if fig:
                cols[idx % 3].pyplot(fig)
                plt.close(fig)

    elif page == 'Precision-Recall':
        st.title('Precision-Recall Curves + Threshold Tuning')
        cols = st.columns(3)
        idx = 0

        for name, (m, _, is_sc) in models.items():
            fig = fig_pr(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)

            if fig:
                cols[idx % 3].pyplot(fig)
                plt.close(fig)
                idx += 1

        st.subheader('Threshold sweep - XGBoost, Industrial class')
        xgb_m = models['XGBoost'][0]
        proba = xgb_m.predict_proba(X_te)
        y_ind = (y_te == 2).astype(int)
        prec, rec, thresholds = precision_recall_curve(y_ind, proba[:, 2])

        fig2, axes = plt.subplots(1, 2, figsize=(11, 4))
        axes[0].plot(thresholds, prec[:-1], 'b-', label='Precision')
        axes[0].plot(thresholds, rec[:-1], 'r-', label='Recall')
        axes[0].axvline(0.5, color='gray', ls='--', alpha=0.6, label='Default (0.5)')
        axes[0].set_xlabel('Threshold')
        axes[0].legend()
        axes[0].set_title('Precision & Recall vs threshold')

        sc2 = axes[1].scatter(rec[:-1], prec[:-1], c=thresholds, cmap='viridis', s=8)
        plt.colorbar(sc2, ax=axes[1], label='Threshold')
        axes[1].set_xlabel('Recall')
        axes[1].set_ylabel('Precision')
        axes[1].set_title('PR curve colored by threshold')

        plt.tight_layout()
        st.pyplot(fig2)
        plt.close(fig2)

    elif page == 'Learning Curves':
        st.title('Learning Curves')
        cols = st.columns(3)
        idx = 0

        for name, (m, _, _s) in models.items():
            if not hasattr(m, 'named_steps'):
                continue

            fig = fig_learning(m, X_tr, y_tr, name)
            cols[idx % 3].pyplot(fig)
            plt.close(fig)
            idx += 1

    elif page == 'Live Prediction':
        st.title('Live Prediction')

        with st.sidebar:
            st.subheader('Building features')
            energy = st.slider('Energy Consumption (kWh)', 500.0, 10000.0, 4100.0, 50.0)
            sqft = st.slider('Square Footage (ft2)', 500.0, 80000.0, 25000.0, 500.0)

        row_raw = np.array([[energy, sqft]])
        row_sc = sc.transform(row_raw)
        pred_cols = st.columns(len(models))

        for col, (name, (m, _, is_sc)) in zip(pred_cols, models.items()):
            X_in = row_sc if is_sc else row_raw
            pred = int(m.predict(X_in)[0])
            proba = m.predict_proba(X_in)[0]

            col.metric(name, ENERGY_CLASSES[pred])

            fig, ax = plt.subplots(figsize=(2.8, 2))
            ax.barh(ENERGY_CLASSES, proba, color=CLASS_COLORS[:3])
            ax.set_xlim(0, 1)
            ax.set_xlabel('Probability')
            ax.tick_params(labelsize=7)

            plt.tight_layout()
            col.pyplot(fig)
            plt.close(fig)`],
  ['code', 'Line by line explanation', `def _load_energy():  # define function
    train_df = load_raw('data/train_energy_data.csv')  # assign value
    test_df = load_raw('data/test_energy_data.csv')  # assign value

    X_tr, y_tr = load_features('data/train_energy_data.csv', 'core')  # assign value
    X_te, y_te = load_features('data/test_energy_data.csv', 'core')  # assign value
    sc = StandardScaler().fit(X_tr)  # assign value

    return train_df, test_df, X_tr, y_tr, X_te, y_te, sc  # return result

def _train_energy_models(_sc):  # define function
    _, _, X_tr, y_tr, _, _, _ = _load_energy()  # assign value
    X_sc = _sc.transform(X_tr)  # assign value

    lr = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        LogisticRegression(C=10, max_iter=1000, random_state=42),  # assign value
    )  # continue statement

    mlp = make_pipeline(  # assign value
        StandardScaler(),  # continue statement
        MLPClassifier(  # continue statement
            hidden_layer_sizes=(20, 20),  # assign value
            activation='relu',  # assign value
            alpha=0.01,  # assign value
            max_iter=1200,  # assign value
            early_stopping=True,  # assign value
            random_state=42,  # assign value
        ),  # continue statement
    )  # continue statement

    xgb = XGBClassifier(  # assign value
        max_depth=3,  # assign value
        learning_rate=0.05,  # assign value
        n_estimators=100,  # assign value
        objective='multi:softprob',  # assign value
        num_class=3,  # assign value
        eval_metric='mlogloss',  # assign value
        verbosity=0,  # assign value
        random_state=42,  # assign value
    )  # continue statement

    attn = AttentionClassifier(w=2.0).fit(X_sc, y_tr)  # assign value
    softmax = LogisticRegressionSoftmax(  # assign value
        eta=0.01,  # assign value
        n_iter=1000,  # assign value
        alpha=0.01,  # assign value
        random_state=42,  # assign value
    ).fit(X_sc, y_tr)  # continue statement

    for m in [lr, mlp, xgb]:  # loop through values
        m.fit(X_tr, y_tr)  # continue statement

    return {  # return result
        'LR (sklearn)': (lr, X_tr, False),  # continue statement
        'MLP': (mlp, X_tr, False),  # continue statement
        'XGBoost': (xgb, X_tr, False),  # continue statement
        'AttentionNet': (attn, X_sc, True),  # continue statement
        'LR Softmax': (softmax, X_sc, True),  # continue statement
    }  # continue statement

def render_energy_dashboard(page: str):  # define function
    train_df, test_df, X_tr, y_tr, X_te, y_te, sc = _load_energy()  # assign value

    with st.spinner('Training models - cached after first run...'):  # open managed block
        models = _train_energy_models(sc)  # assign value

    X_te_sc = sc.transform(X_te)  # assign value
    X_tr_sc = sc.transform(X_tr)  # assign value

    if page == 'Overview':  # check condition
        st.title('EnergyTypeNet - Overview')  # continue statement
        c1, c2, c3, c4 = st.columns(4)  # assign value

        c1.metric('Training buildings', len(train_df))  # continue statement
        c2.metric('Test buildings', len(test_df))  # continue statement
        c3.metric('Classes', 3)  # continue statement
        c4.metric('Core features', 2)  # continue statement

        accs = {  # assign value
            n: accuracy_score(y_te, m.predict(X_te_sc if s else X_te))  # continue statement
            for n, (m, _, s) in models.items()  # loop through values
        }  # continue statement
        acc_df = pd.DataFrame({  # assign value
            'Model': list(accs),  # continue statement
            'Test Accuracy': list(accs.values()),  # continue statement
        }).sort_values('Test Accuracy', ascending=False)  # assign value

        st.subheader('Test-set accuracy')  # continue statement
        st.bar_chart(acc_df.set_index('Model')['Test Accuracy'])  # continue statement
        st.dataframe(  # continue statement
            acc_df.style.format({'Test Accuracy': '{:.3f}'}),  # continue statement
            width='stretch',  # assign value
            hide_index=True,  # assign value
        )  # continue statement
        st.info('All models use only **Energy Consumption** and **Square Footage**. '  # continue statement
                'The 60-67 % ceiling reflects class overlap in this 2-D space.')  # continue statement

    elif page == 'EDA':  # check alternate condition
        st.title('Exploratory Data Analysis')  # continue statement
        st.bar_chart(train_df['Building Type'].value_counts())  # continue statement
        feat = st.selectbox(  # assign value
            'Feature distribution',  # continue statement
            [  # continue statement
                'Energy Consumption',  # continue statement
                'Square Footage',  # continue statement
                'Number of Occupants',  # continue statement
                'Appliances Used',  # continue statement
                'Average Temperature',  # continue statement
            ],  # continue statement
        )  # continue statement

        fig, ax = plt.subplots(figsize=(8, 3.5))  # assign value

        for cls, col in zip(ENERGY_CLASSES, CLASS_COLORS):  # loop through values
            ax.hist(  # continue statement
                train_df[train_df['Building Type'] == cls][feat],  # assign value
                bins=30,  # assign value
                alpha=0.55,  # assign value
                color=col,  # assign value
                label=cls,  # assign value
                edgecolor='white',  # assign value
            )  # continue statement

        ax.set_xlabel(feat)  # continue statement
        ax.legend()  # continue statement
        plt.tight_layout()  # continue statement
        st.pyplot(fig)  # continue statement
        plt.close(fig)  # continue statement
        st.dataframe(train_df, width='stretch')  # assign value

    elif page == 'Model Comparison':  # check alternate condition
        st.title('Model Comparison - 5-fold CV')  # continue statement
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)  # assign value
        rows = []  # assign value

        for name, (m, _, is_sc) in models.items():  # loop through values
            X_cv = X_tr_sc if is_sc else X_tr  # assign value
            scores = cross_val_score(m, X_cv, y_tr, cv=skf, scoring='accuracy')  # assign value

            rows.append({  # continue statement
                'Model': name,  # continue statement
                'CV Mean': scores.mean(),  # continue statement
                'CV Std': scores.std(),  # continue statement
                'Test Acc': accuracy_score(y_te, m.predict(X_te_sc if is_sc else X_te)),  # continue statement
            })  # continue statement

        cmp_df = pd.DataFrame(rows).sort_values('CV Mean', ascending=False)  # assign value
        st.dataframe(  # continue statement
            cmp_df.style.format({  # continue statement
                'CV Mean': '{:.3f}',  # continue statement
                'CV Std': '{:.3f}',  # continue statement
                'Test Acc': '{:.3f}',  # continue statement
            }),  # continue statement
            width='stretch',  # assign value
            hide_index=True,  # assign value
        )  # continue statement

    elif page == 'Decision Boundaries':  # check alternate condition
        st.title('Decision Boundaries')  # continue statement
        st.caption('Energy Consumption x Square Footage (scaled). Background = predicted class.')  # assign value
        cols = st.columns(3)  # assign value

        for idx, (name, (m, _, _s)) in enumerate(models.items()):  # loop through values
            fig = fig_decision_boundary_2d(m, X_tr_sc, y_tr, ENERGY_CLASSES, sc, name)  # assign value
            cols[idx % 3].pyplot(fig)  # continue statement
            plt.close(fig)  # continue statement

    elif page == 'Confusion Matrices':  # check alternate condition
        st.title('Confusion Matrices - Test Set')  # continue statement
        cols = st.columns(3)  # assign value

        for idx, (name, (m, _, is_sc)) in enumerate(models.items()):  # loop through values
            fig = fig_confusion(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)  # assign value
            cols[idx % 3].pyplot(fig)  # continue statement
            plt.close(fig)  # continue statement

    elif page == 'ROC / AUC':  # check alternate condition
        st.title('ROC Curves')  # continue statement
        cols = st.columns(3)  # assign value

        for idx, (name, (m, _, is_sc)) in enumerate(models.items()):  # loop through values
            fig = fig_roc(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)  # assign value

            if fig:  # check condition
                cols[idx % 3].pyplot(fig)  # continue statement
                plt.close(fig)  # continue statement

    elif page == 'Precision-Recall':  # check alternate condition
        st.title('Precision-Recall Curves + Threshold Tuning')  # continue statement
        cols = st.columns(3)  # assign value
        idx = 0  # assign value

        for name, (m, _, is_sc) in models.items():  # loop through values
            fig = fig_pr(m, X_te_sc if is_sc else X_te, y_te, ENERGY_CLASSES, name)  # assign value

            if fig:  # check condition
                cols[idx % 3].pyplot(fig)  # continue statement
                plt.close(fig)  # continue statement
                idx += 1  # assign value

        st.subheader('Threshold sweep - XGBoost, Industrial class')  # continue statement
        xgb_m = models['XGBoost'][0]  # assign value
        proba = xgb_m.predict_proba(X_te)  # assign value
        y_ind = (y_te == 2).astype(int)  # assign value
        prec, rec, thresholds = precision_recall_curve(y_ind, proba[:, 2])  # assign value

        fig2, axes = plt.subplots(1, 2, figsize=(11, 4))  # assign value
        axes[0].plot(thresholds, prec[:-1], 'b-', label='Precision')  # assign value
        axes[0].plot(thresholds, rec[:-1], 'r-', label='Recall')  # assign value
        axes[0].axvline(0.5, color='gray', ls='--', alpha=0.6, label='Default (0.5)')  # assign value
        axes[0].set_xlabel('Threshold')  # continue statement
        axes[0].legend()  # continue statement
        axes[0].set_title('Precision & Recall vs threshold')  # continue statement

        sc2 = axes[1].scatter(rec[:-1], prec[:-1], c=thresholds, cmap='viridis', s=8)  # assign value
        plt.colorbar(sc2, ax=axes[1], label='Threshold')  # assign value
        axes[1].set_xlabel('Recall')  # continue statement
        axes[1].set_ylabel('Precision')  # continue statement
        axes[1].set_title('PR curve colored by threshold')  # continue statement

        plt.tight_layout()  # continue statement
        st.pyplot(fig2)  # continue statement
        plt.close(fig2)  # continue statement

    elif page == 'Learning Curves':  # check alternate condition
        st.title('Learning Curves')  # continue statement
        cols = st.columns(3)  # assign value
        idx = 0  # assign value

        for name, (m, _, _s) in models.items():  # loop through values
            if not hasattr(m, 'named_steps'):  # check condition
                continue  # continue statement

            fig = fig_learning(m, X_tr, y_tr, name)  # assign value
            cols[idx % 3].pyplot(fig)  # continue statement
            plt.close(fig)  # continue statement
            idx += 1  # assign value

    elif page == 'Live Prediction':  # check alternate condition
        st.title('Live Prediction')  # continue statement

        with st.sidebar:  # open managed block
            st.subheader('Building features')  # continue statement
            energy = st.slider('Energy Consumption (kWh)', 500.0, 10000.0, 4100.0, 50.0)  # assign value
            sqft = st.slider('Square Footage (ft2)', 500.0, 80000.0, 25000.0, 500.0)  # assign value

        row_raw = np.array([[energy, sqft]])  # assign value
        row_sc = sc.transform(row_raw)  # assign value
        pred_cols = st.columns(len(models))  # assign value

        for col, (name, (m, _, is_sc)) in zip(pred_cols, models.items()):  # loop through values
            X_in = row_sc if is_sc else row_raw  # assign value
            pred = int(m.predict(X_in)[0])  # assign value
            proba = m.predict_proba(X_in)[0]  # assign value

            col.metric(name, ENERGY_CLASSES[pred])  # continue statement

            fig, ax = plt.subplots(figsize=(2.8, 2))  # assign value
            ax.barh(ENERGY_CLASSES, proba, color=CLASS_COLORS[:3])  # assign value
            ax.set_xlim(0, 1)  # continue statement
            ax.set_xlabel('Probability')  # continue statement
            ax.tick_params(labelsize=7)  # assign value

            plt.tight_layout()  # continue statement
            col.pyplot(fig)  # continue statement
            plt.close(fig)  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: load cached data
train_df, test_df, X_tr, y_tr, X_te, y_te, sc = _load_energy()
# Output: repeated calls reuse cached data

# Call 2: train cached models
models = _train_energy_models(sc)
# Output: repeated calls reuse model objects

# Call 3: render a page
render_energy_dashboard('Live Prediction')
# Output changes: the selected Streamlit page is drawn`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change @st.cache_resource to no cache on _train_energy_models?",a:2,opts:[{t:"The dashboard loads faster.",e:"Removing cache makes repeated runs slower."},{t:"Only CSV loading changes.",e:"Model training is affected."},{t:"Every rerun can retrain models, making sliders feel slow.",e:"Correct. Streamlit reruns the script often."},{t:"The API endpoint changes.",e:"Streamlit caching does not affect FastAPI."}]},
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
window.BLOCKS[17].push(
  ['h2', "Exact source code - GitHub Actions CI"],
  ['p', "Why this exists: without CI, syntax errors and broken imports can reach the repository without an automatic safety check."],
  ['code', ".github/workflows/ci.yml (exact source)", `name: CI

on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.10', '3.12']

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run tests
        run: pytest -q

      - name: Verify imports
        run: |
          python -c "from src.data import load_features, make_engineered_features"
          python -c "from src.models import AttentionClassifier, LogisticRegressionOvR, LogisticRegressionSoftmax"
          python -c "from src.evaluation import cross_validate_custom, make_skf"`],
  ['code', 'Line by line explanation', `name: CI  # continue statement

on:  # continue statement
  push:  # continue statement
  pull_request:  # continue statement

jobs:  # continue statement
  test:  # continue statement
    runs-on: ubuntu-latest  # continue statement
    strategy:  # continue statement
      matrix:  # continue statement
        python-version: ['3.10', '3.12']  # continue statement

    steps:  # continue statement
      - uses: actions/checkout@v4  # continue statement

      - uses: actions/setup-python@v5  # continue statement
        with:  # continue statement
          python-version: \${{ matrix.python-version }}  # continue statement

      - name: Install dependencies  # continue statement
        run: |  # continue statement
          python -m pip install --upgrade pip  # continue statement
          pip install -r requirements.txt  # continue statement

      - name: Run tests  # continue statement
        run: pytest -q  # continue statement

      - name: Verify imports  # continue statement
        run: |  # continue statement
          python -c "from src.data import load_features, make_engineered_features"  # continue statement
          python -c "from src.models import AttentionClassifier, LogisticRegressionOvR, LogisticRegressionSoftmax"  # continue statement
          python -c "from src.evaluation import cross_validate_custom, make_skf"  # continue statement`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: push branch
git push
# Output: CI runs automatically

# Call 2: open pull request
# Output changes: CI runs on pull_request too

# Call 3: add a syntax error
# Output changes: pytest or import verification fails`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change the CI matrix from Python 3.10 and 3.12 to only 3.12?",a:3,opts:[{t:"The test suite runs on more Python versions.",e:"It runs on fewer versions."},{t:"pytest stops running.",e:"The Run tests step remains."},{t:"Imports are no longer checked.",e:"The import verification step remains."},{t:"Compatibility with Python 3.10 is no longer automatically verified.",e:"Correct. CI coverage becomes narrower."}]},
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
window.BLOCKS[18].push(
  ['h2', "Exact source code - AutoML Assistant"],
  ['p', "Why this exists: without a profile step, the assistant cannot quickly spot missing values, likely targets, or unusable columns."],
  ['code', "src/automl.py (exact source)", `def profile_dataset(df: pd.DataFrame) -> dict[str, Any]:
    """Create a compact profile used by the assistant and dashboard."""
    rows = []

    for col in df.columns:
        series = df[col]
        missing = int(series.isna().sum())
        unique = int(series.nunique(dropna=True))
        dtype = str(series.dtype)

        rows.append({
            'column': col,
            'dtype': dtype,
            'missing': missing,
            'missing_pct': float(missing / max(len(df), 1)),
            'unique': unique,
            'example': _safe_example(series),
        })

    return {
        'n_rows': int(len(df)),
        'n_columns': int(df.shape[1]),
        'columns': rows,
        'missing_cells': int(df.isna().sum().sum()),
        'duplicate_rows': int(df.duplicated().sum()),
    }`],
  ['code', 'Line by line explanation', `def profile_dataset(df: pd.DataFrame) -> dict[str, Any]:  # define function
    """Create a compact profile used by the assistant and dashboard."""  # document behavior
    rows = []  # assign value

    for col in df.columns:  # loop through values
        series = df[col]  # assign value
        missing = int(series.isna().sum())  # assign value
        unique = int(series.nunique(dropna=True))  # assign value
        dtype = str(series.dtype)  # assign value

        rows.append({  # continue statement
            'column': col,  # continue statement
            'dtype': dtype,  # continue statement
            'missing': missing,  # continue statement
            'missing_pct': float(missing / max(len(df), 1)),  # continue statement
            'unique': unique,  # continue statement
            'example': _safe_example(series),  # continue statement
        })  # continue statement

    return {  # return result
        'n_rows': int(len(df)),  # continue statement
        'n_columns': int(df.shape[1]),  # continue statement
        'columns': rows,  # continue statement
        'missing_cells': int(df.isna().sum().sum()),  # continue statement
        'duplicate_rows': int(df.duplicated().sum()),  # continue statement
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
  ['code', 'Three ways to call this', `# Call 1: profile energy data
profile = profile_dataset(train_df)
# Output: n_rows=1000 and column summaries

# Call 2: profile a tiny sample
profile = profile_dataset(train_df.head(5))
# Output changes: n_rows=5

# Call 3: profile a DataFrame with missing cells
profile = profile_dataset(df_with_nulls)
# Output changes: missing_cells increases`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[19].push(
  ['h2', "Exact source code - Codebase Tour"],
  ['p', "Why this exists: without prediction helpers, the API and command line would duplicate fragile artifact-loading logic."],
  ['code', "src/predict.py (exact source)", `def load_artifact(model_path: str = 'artifacts/model.joblib') -> dict:
    """Load a saved model artifact from disk."""
    path = Path(model_path)

    if not path.exists():
        raise FileNotFoundError(
            f'Model artifact not found at {path}. Run: python -m src.train'
        )

    return joblib.load(path)

def predict_dataframe(df: pd.DataFrame, artifact: dict) -> list:
    """Predict class labels and probabilities for a dataframe."""
    feature_set = artifact['feature_set']
    model = artifact['model']
    classes = artifact['classes']

    X = df[FEATURE_COLS[feature_set]].values.astype(float)
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)

    rows = []

    for pred, proba in zip(predictions, probabilities):
        rows.append({
            'class': classes[int(pred)],
            'probabilities': {
                classes[i]: float(probability)
                for i, probability in enumerate(proba)
            },
        })

    return rows`],
  ['code', 'Line by line explanation', `def load_artifact(model_path: str = 'artifacts/model.joblib') -> dict:  # define function
    """Load a saved model artifact from disk."""  # document behavior
    path = Path(model_path)  # assign value

    if not path.exists():  # check condition
        raise FileNotFoundError(  # continue statement
            f'Model artifact not found at {path}. Run: python -m src.train'  # continue statement
        )  # continue statement

    return joblib.load(path)  # return result

def predict_dataframe(df: pd.DataFrame, artifact: dict) -> list:  # define function
    """Predict class labels and probabilities for a dataframe."""  # document behavior
    feature_set = artifact['feature_set']  # assign value
    model = artifact['model']  # assign value
    classes = artifact['classes']  # assign value

    X = df[FEATURE_COLS[feature_set]].values.astype(float)  # assign value
    predictions = model.predict(X)  # assign value
    probabilities = model.predict_proba(X)  # assign value

    rows = []  # assign value

    for pred, proba in zip(predictions, probabilities):  # loop through values
        rows.append({  # continue statement
            'class': classes[int(pred)],  # continue statement
            'probabilities': {  # continue statement
                classes[i]: float(probability)  # continue statement
                for i, probability in enumerate(proba)  # loop through values
            },  # continue statement
        })  # continue statement

    return rows  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: default artifact
artifact = load_artifact()
# Output: loads artifacts/model.joblib

# Call 2: custom artifact path
artifact = load_artifact('artifacts/model_ext.joblib')
# Output changes: loads a different saved model

# Call 3: batch prediction
rows = predict_dataframe(test_df.head(10), artifact)
# Output changes: returns a list of 10 prediction dictionaries`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[20].push(
  ['h2', "Exact source code - Gradient Descent"],
  ['p', "Why this exists: without the gradient update, the model would never improve its weights from their random starting values."],
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
  ['code', 'Three ways to call this', `# Call 1: small learning rate
LogisticRegressionOvR(eta=0.0001).fit(X_scaled, y)
# Output: stable convergence

# Call 2: huge learning rate
LogisticRegressionOvR(eta=0.5).fit(X_scaled, y)
# Output changes: updates can overshoot badly

# Call 3: stronger regularization
LogisticRegressionOvR(alpha=0.1).fit(X_scaled, y)
# Output changes: weights shrink toward zero`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
);
window.BLOCKS[21].push(
  ['h2', "Exact source code - Overfitting"],
  ['p', "Why this exists: without repeated validation, a model can memorize training rows and still look successful on paper."],
  ['code', "src/train.py (exact source)", `def evaluate_models(models: dict, X: np.ndarray, y: np.ndarray) -> dict:
    """Evaluate candidate models with stratified cross-validation."""
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}

    for name, model in models.items():
        scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy', n_jobs=1)

        results[name] = {
            'cv_mean': float(scores.mean()),
            'cv_std': float(scores.std()),
            'cv_scores': [float(score) for score in scores],
        }

    return results`],
  ['code', 'Line by line explanation', `def evaluate_models(models: dict, X: np.ndarray, y: np.ndarray) -> dict:  # define function
    """Evaluate candidate models with stratified cross-validation."""  # document behavior
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)  # assign value
    results = {}  # assign value

    for name, model in models.items():  # loop through values
        scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy', n_jobs=1)  # assign value

        results[name] = {  # assign value
            'cv_mean': float(scores.mean()),  # continue statement
            'cv_std': float(scores.std()),  # continue statement
            'cv_scores': [float(score) for score in scores],  # continue statement
        }  # continue statement

    return results  # return result`],
  ['code', 'Real output', `# Real values from data/train_energy_data.csv:
X.shape = (1000, 2)
y_counts = [347, 336, 317]
scaler.mean_ = [4166.25257, 25462.388]
scaler.scale_ = [932.8462912145254, 14287.4049348178]
first_scaled_row = [-1.556850880662413, -1.2878047541832787]
OvR CV scores = [0.615, 0.575, 0.665, 0.595, 0.58]
Softmax first-row probabilities = [0.5452607252571006, 0.33408680089705906, 0.12065247384584046]
Stacking CV mean = 0.6280, std = 0.0136`],
  ['code', 'Three ways to call this', `# Call 1: evaluate all models
results = evaluate_models(build_models(), X, y)
# Output: CV mean, std, and scores per model

# Call 2: evaluate only XGBoost
results = evaluate_models({'xgboost': build_models()['xgboost']}, X, y)
# Output changes: only one result entry

# Call 3: evaluate extended features
results = evaluate_models(build_models(), X_ext, y)
# Output changes: scores reflect the richer feature set`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change alpha from 0.01 to 1.0 in LogisticRegressionOvR?",a:1,opts:[{t:"Weights grow larger and overfitting increases.",e:"Higher alpha penalizes large weights."},{t:"Weights shrink strongly and the model can underfit.",e:"Correct. Too much regularization removes signal."},{t:"The number of classes becomes one.",e:"alpha does not change classes."},{t:"Cross-validation is skipped.",e:"Evaluation still runs."}]},
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
window.BLOCKS[22].push(
  ['h2', "Exact source code - Reading Your Results"],
  ['p', "Why this exists: without a single results dictionary, the app cannot consistently pick the best model, save metrics, or explain tradeoffs."],
  ['code', "src/train.py (exact source)", `def evaluate_models(models: dict, X: np.ndarray, y: np.ndarray) -> dict:
    """Evaluate candidate models with stratified cross-validation."""
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    results = {}

    for name, model in models.items():
        scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy', n_jobs=1)

        results[name] = {
            'cv_mean': float(scores.mean()),
            'cv_std': float(scores.std()),
            'cv_scores': [float(score) for score in scores],
        }

    return results

def train_best_model(train_path: str, test_path: str, feature_set: str) -> dict:
    """Train all candidates and return the best fitted model artifact."""
    X_train, y_train = load_features(train_path, feature_set)
    X_test, y_test = load_features(test_path, feature_set)

    models = build_models()
    results = evaluate_models(models, X_train, y_train)

    best_name = max(results, key=lambda name: results[name]['cv_mean'])
    best_model = models[best_name]
    best_model.fit(X_train, y_train)

    y_pred = best_model.predict(X_test)
    results[best_name]['test_accuracy'] = float(accuracy_score(y_test, y_pred))
    results[best_name]['classification_report'] = classification_report(
        y_test,
        y_pred,
        target_names=CLASSES,
        output_dict=True,
    )

    return {
        'best_name': best_name,
        'best_model': best_model,
        'results': results,
        'feature_set': feature_set,
        'classes': CLASSES,
    }`],
  ['code', 'Line by line explanation', `def evaluate_models(models: dict, X: np.ndarray, y: np.ndarray) -> dict:  # define function
    """Evaluate candidate models with stratified cross-validation."""  # document behavior
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)  # assign value
    results = {}  # assign value

    for name, model in models.items():  # loop through values
        scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy', n_jobs=1)  # assign value

        results[name] = {  # assign value
            'cv_mean': float(scores.mean()),  # continue statement
            'cv_std': float(scores.std()),  # continue statement
            'cv_scores': [float(score) for score in scores],  # continue statement
        }  # continue statement

    return results  # return result

def train_best_model(train_path: str, test_path: str, feature_set: str) -> dict:  # define function
    """Train all candidates and return the best fitted model artifact."""  # document behavior
    X_train, y_train = load_features(train_path, feature_set)  # assign value
    X_test, y_test = load_features(test_path, feature_set)  # assign value

    models = build_models()  # assign value
    results = evaluate_models(models, X_train, y_train)  # assign value

    best_name = max(results, key=lambda name: results[name]['cv_mean'])  # assign value
    best_model = models[best_name]  # assign value
    best_model.fit(X_train, y_train)  # continue statement

    y_pred = best_model.predict(X_test)  # assign value
    results[best_name]['test_accuracy'] = float(accuracy_score(y_test, y_pred))  # assign value
    results[best_name]['classification_report'] = classification_report(  # assign value
        y_test,  # continue statement
        y_pred,  # continue statement
        target_names=CLASSES,  # assign value
        output_dict=True,  # assign value
    )  # continue statement

    return {  # return result
        'best_name': best_name,  # continue statement
        'best_model': best_model,  # continue statement
        'results': results,  # continue statement
        'feature_set': feature_set,  # continue statement
        'classes': CLASSES,  # continue statement
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
  ['code', 'Three ways to call this', `# Call 1: evaluate candidates
results = evaluate_models(models, X_train, y_train)
# Output: model-by-model CV table

# Call 2: train best core model
output = train_best_model(train_path, test_path, 'core')
# Output: best_name plus test accuracy

# Call 3: train best all-feature model
output = train_best_model(train_path, test_path, 'all')
# Output changes: feature_set is all and model inputs have 5 columns`],
  ['callout', 'info', 'What this tells you', '- Real code uses the same names you see in src/.\n- Real outputs anchor the lesson in training data, not guesses.\n- Changing arguments changes shapes, scores, speed, or validation behavior.'],
  ['callout', 'analogy', 'Real world', "In a bank, hospital, factory, or retail chain, this same pattern prevents teams from trusting examples that do not match the production code."],
  ['quiz', [{q:"What happens if you change the selected best model from max cv_mean to min cv_std only?",a:0,opts:[{t:"You may choose the most stable model even if its accuracy is poor.",e:"Correct. Stability alone is not enough."},{t:"You always get the highest test accuracy.",e:"Test accuracy is not used in selection."},{t:"The model trains on the test set.",e:"Selection logic does not train on test."},{t:"All CV scores become identical.",e:"Selection does not alter scores."}]},
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

/* === Notebook deep-dive lessons added from notebooks 01-06 === */
