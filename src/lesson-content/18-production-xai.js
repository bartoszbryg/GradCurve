/* Production and responsible-AI lessons verified against EnergyTypeNet src/. */

window.LESSON_TITLES[45] = 'SHAP and LIME Explainability';
window.BLOCKS[45] = [
  ['h2', 'A prediction needs a reason'],
  ['p', 'Accuracy measures aggregate correctness, but it cannot tell a facility manager why one building was labeled Industrial. SHAP treats features as players in a cooperative game and fairly divides the difference between a baseline output and this prediction. LIME instead perturbs points near one row and fits a simple local surrogate. SHAP can support local and global analysis; LIME answers the narrower question: what simple rule approximates the model around this prediction?'],
  ['math', 'f(x)=E[f(X)]+\\sum_{j=1}^{p}\\phi_j'],
  ['callout', 'analogy', 'Dividing credit after a team project', 'Shapley values ask how much each teammate contributed across every possible team order. LIME interviews the team immediately around one decision and writes a short local rule.'],
  ['callout', 'warning', 'Explanations are evidence, not causality', 'A positive contribution means a feature pushed this model output upward relative to its reference. It does not prove that changing the real building feature will cause the predicted class to change.'],
  ['h2', 'How EnergyTypeNet selects a SHAP explainer'],
  ['code', 'src/explainability.py', `def detect_explainer_type(estimator):
    class_name = type(estimator).__name__
    module_name = type(estimator).__module__.lower()
    if "XGB" in class_name or "xgboost" in module_name:
        return XGBOOST
    if class_name in _CUSTOM_TREE_MODELS:
        return KERNEL
    if class_name in _SKLEARN_TREE_MODELS:
        return TREE
    if class_name in _CUSTOM_LINEAR_MODELS:
        return KERNEL
    if class_name in _SKLEARN_LINEAR_MODELS:
        return LINEAR
    return KERNEL`],
  ['p', 'Recognized sklearn trees and XGBoost models route to TreeExplainer, which exploits tree structure and is normally fast and exact for tree outputs. Recognized sklearn linear models use LinearExplainer. Custom NumPy trees, custom linear models, MLPCustom, and unknown estimators route to model-agnostic KernelExplainer because TreeExplainer cannot interpret their internal structure. Kernel SHAP estimates contributions from sampled feature coalitions, so it is slower and approximate.'],
  ['h2', 'One serializable result and two API views'],
  ['code', 'src/explainability.py', `@dataclass
class ExplanationResult:
    sample_index: int | None
    feature_names: list[str]
    feature_values: list[Any]
    predicted_class: str | float
    predicted_probability: float | None
    class_names: list[str]
    shap_values: list[float] | None
    shap_base_value: float | None
    shap_explainer_type: str | None
    lime_weights: list[float] | None
    lime_intercept: float | None
    lime_local_r2: float | None
    timestamp: str`],
  ['p', 'ExplanationResult stores aligned feature values and contributions; summary_text() is a method that derives a plain-language summary rather than a dataclass field. POST /predict/explain returns class, probabilities, optional shap_explanation and lime_explanation objects, summary, computation_time, and explanation_available. GET /explain/global returns the model name and cached mean-absolute SHAP importance with per-class values. Prediction delivery survives an optional local explanation failure.'],
  ['p', 'SHAP and LIME can disagree because they use different reference distributions and because LIME approximates only a perturbed neighborhood. Check LIME local R², repeat with stable background data, inspect correlated features, and treat agreement on direction and ranking as stronger evidence than either number alone.'],
  ['streamlit', 'EnergyTypeNet · Explanations', 'Open EnergyTypeNet mode and choose Explanations. In the local section, adjust the feature controls and click “Explain prediction.” Inspect the SHAP waterfall, LIME bar chart, and the “Compare SHAP and LIME” table.'],
  ['quiz', [
    {q:'Why does MLPCustom route to KernelExplainer?',a:2,opts:[
      {t:'It is always a tree',e:'MLPCustom is a neural network and contains no recognized tree structure.'},
      {t:'Kernel SHAP is exact',e:'Kernel SHAP estimates contributions and is generally slower than specialized explainers.'},
      {t:'Its internals are unrecognized',e:'The custom NumPy model is not recognized by specialized SHAP explainer routing.'},
      {t:'It has no predictions',e:'MLPCustom exposes predictions, which KernelExplainer uses as its model function.'}]},
    {q:'What does a positive SHAP value establish?',a:1,opts:[
      {t:'The feature caused the outcome',e:'Feature attribution describes model behavior and does not establish real-world causality.'},
      {t:'It pushed toward the output',e:'The feature raised the explained output relative to the selected reference baseline.'},
      {t:'The model is accurate',e:'One local contribution does not measure accuracy across an evaluation dataset.'},
      {t:'LIME must agree',e:'Different reference and approximation methods can legitimately produce differing local rankings.'}]},
    {q:'What should you inspect when SHAP and LIME disagree?',a:3,opts:[
      {t:'Only training accuracy',e:'Aggregate accuracy cannot diagnose differences between two local attribution methods.'},
      {t:'Only the largest coefficient',e:'A single coefficient ignores background choice, correlation, and local approximation quality.'},
      {t:'Delete the explanation',e:'Disagreement is useful diagnostic information and should be investigated rather than hidden.'},
      {t:'Background and local R²',e:'Reference data and LIME surrogate fidelity help explain unstable or conflicting attributions.'}]}
  ]],
];

window.LESSON_TITLES[46] = 'Data Validation Suite';
window.BLOCKS[46] = [
  ['h2', 'Garbage in, garbage out'],
  ['p', 'A training pipeline should reject dangerous data before model selection begins. EnergyTypeNet checks schema problems such as excess missingness, constant columns, high cardinality, identifier-like fields, and duplicate columns. It can compare new and reference distributions and search for features that reveal the target too directly.'],
  ['math', 'D_{KS}=\\sup_x |F_{new}(x)-F_{reference}(x)|'],
  ['callout', 'analogy', 'Inspecting ingredients before cooking', 'A skilled chef does not wait until dinner is served to notice spoiled ingredients. Validation checks the dataset before expensive training turns defects into confident predictions.'],
  ['callout', 'warning', 'A warning is not an error', 'Only error-severity findings make ValidationReport.passed false. Warnings request review and informational findings preserve useful context without automatically blocking training.'],
  ['h2', 'Structured findings and the training gate'],
  ['code', 'src/data_validation.py', `VALID_SEVERITIES = {"error", "warning", "info"}

@dataclass(frozen=True)
class ValidationIssue:
    severity: str
    category: str
    column: str | None
    message: str
    suggestion: str | None = None

@dataclass
class ValidationReport:
    issues: list[ValidationIssue] = field(default_factory=list)
    passed: bool = field(init=False)

    def __post_init__(self):
        self.passed = not any(issue.severity == "error" for issue in self.issues)`],
  ['p', 'run_schema_checks() validates inputs and emits actionable ValidationIssue records. Its configurable checks cover missing ratios, constant columns, high cardinality, likely identifiers, duplicate columns, unexpected columns, dtype changes, and category drift. run_complete_validation() combines schema, drift, and leakage findings into one report.'],
  ['h2', 'Drift and leakage'],
  ['p', 'For numeric columns, the two-sample Kolmogorov–Smirnov statistic measures the largest gap between the two empirical cumulative distributions: larger gaps mean the new values are distributed differently. Categorical drift uses a chi-squared comparison. A statistically detected shift is a warning to investigate context and effect size, not automatic proof that the model has failed.'],
  ['code', 'src/data_validation.py', `def run_leakage_checks(dataframe, target_column, task_type):
    issues = []
    for column, score in compute_leakage_scores(
        dataframe, target_column, task_type
    ).items():
        if score > 0.95:
            issues.append(ValidationIssue(
                "error", "leakage", column,
                f"The feature has an extremely strong target association (leakage score {score:.3f}).",
                "Remove it unless it is genuinely available before the prediction is made.",
            ))
    return issues`],
  ['p', 'The leakage score is normalized mutual information for classification and normalized absolute correlation for regression. A score above 0.95 is an error because a feature may be a copy, post-outcome measurement, or identifier encoding the target. Scores from 0.80 through 0.95 are warnings; scores from 0.60 through 0.80 are informational findings. High association can be legitimate, so availability at prediction time is the decisive question.'],
  ['streamlit', 'AI Dataset Assistant · Validation', 'Upload a CSV containing a feature copied from the target. The validation panel should show: “The feature has an extremely strong target association (leakage score 1.000).” The report fails because this is an error; remove the copied column before training.'],
  ['quiz', [
    {q:'Which severity makes ValidationReport.passed false?',a:0,opts:[
      {t:'Error',e:'The report passes only when none of its issues has error severity.'},
      {t:'Warning',e:'Warnings request investigation but do not automatically fail the validation report.'},
      {t:'Info',e:'Informational notes record context without blocking the downstream training workflow.'},
      {t:'Every severity',e:'The implementation distinguishes blocking errors from non-blocking warnings and information.'}]},
    {q:'What does a large numeric KS statistic mean?',a:2,opts:[
      {t:'The target leaked',e:'KS distribution drift does not by itself identify leakage into the target.'},
      {t:'Every value is missing',e:'Missingness is evaluated by schema checks rather than the KS statistic.'},
      {t:'Distributions differ strongly',e:'The largest cumulative-distribution gap is large between reference and new samples.'},
      {t:'The model is accurate',e:'KS compares data distributions and does not measure predictive model correctness.'}]},
    {q:'Why is mutual information above 0.95 suspicious?',a:1,opts:[
      {t:'It proves causation',e:'Strong statistical association cannot prove that a feature causes the target.'},
      {t:'It may reveal the target',e:'Near-perfect association can indicate copied or post-outcome information unavailable during prediction.'},
      {t:'It means constant data',e:'A constant feature cannot carry near-perfect information about a varying target.'},
      {t:'It guarantees deployment',e:'A leakage-driven score usually collapses when deployed on genuinely unseen information.'}]}
  ]],
];

window.LESSON_TITLES[47] = 'Model Cards and Transparency';
window.BLOCKS[47] = [
  ['h2', 'Documentation that travels with the model'],
  ['p', 'A model card records what a model does, the data and task it represents, measured results, intended interpretation, and known limitations. The model-card research proposal appeared in 2018 and the practice is now common in responsible-AI and regulated workflows. A score without scope is easy to misuse; a model card keeps the scope attached.'],
  ['math', 'trustworthy\ report = results + context + limitations + provenance'],
  ['callout', 'analogy', 'A nutrition label for a model', 'A product name alone does not tell you ingredients, serving size, or warnings. A model card makes the conditions behind the headline metric inspectable.'],
  ['callout', 'warning', 'Limitations matter more than the best score', 'Accuracy describes evaluation on a particular split. Limitations reveal distribution boundaries, sample-size concerns, missing subgroup analysis, and situations where that number should not be trusted.'],
  ['h2', 'Collect structured evidence'],
  ['code', 'src/model_card.py', `@dataclass
class ModelCardData:
    dataset_name: str | None = None
    n_rows: int | None = None
    n_columns: int | None = None
    target_column: str | None = None
    task_type: str | None = None
    feature_names: list[str] = field(default_factory=list)
    model_results: list[dict[str, Any]] = field(default_factory=list)
    best_model_name: str | None = None
    best_model_score: float | None = None
    chat_explanations: list[dict[str, Any]] = field(default_factory=list)
    limitations: str | None = None`],
  ['p', 'collect_from_automl() converts the uploaded dataset profile, prepared task, leaderboard, feature ranking, and configuration into ModelCardData. The actual schema uses individual dataset fields rather than one dataset_info dictionary. render_full_model_card() validates first, then assembles header, dataset overview, feature analysis, model results, configuration, limitations, and grounded chat explanations.'],
  ['h2', 'Grounding, validation, and export'],
  ['code', 'src/model_card.py', `def add_chat_explanations(card, messages):
    selected = []
    pending_question = None
    for message in messages or []:
        if message.get("role") == "user":
            pending_question = message
            continue
        if message.get("role") != "assistant" or message.get("grounded") is not True:
            continue
        selected.append(dict(message))
    return replace(card, chat_explanations=selected)`],
  ['p', 'Only assistant messages explicitly marked grounded=True enter the evidence document. validate_model_card() returns separate errors and warnings: missing dataset name, invalid task type, or no model results prevent rendering; missing importance, absent chat explanations, or default limitations add export notes but still allow rendering. Markdown export always uses the core renderer. PDF export is optional and requires Markdown and WeasyPrint dependencies.'],
  ['streamlit', 'Custom Dataset · Export Model Card', 'After AutoML results are available, expand “Export Model Card” below the results or assistant analysis. Review Limitations and Caveats before using the Markdown download; choose PDF only when the optional export dependencies are installed.'],
  ['quiz', [
    {q:'Which omission prevents model-card rendering?',a:2,opts:[
      {t:'No chat explanations',e:'Missing chat explanations produces a warning and an empty explanation section.'},
      {t:'No feature importance',e:'Missing importance creates a warning and omits the optional feature analysis.'},
      {t:'No model results',e:'At least one model result is required before the card can render.'},
      {t:'Default limitations',e:'Auto-generated limitations produce a warning but do not prevent rendering.'}]},
    {q:'Which assistant messages are exported?',a:1,opts:[
      {t:'Every assistant message',e:'Ungrounded answers are deliberately excluded from the model card evidence record.'},
      {t:'Only grounded messages',e:'The filter requires assistant role and grounded set explicitly to true.'},
      {t:'Only error messages',e:'Severity is part of validation findings rather than chat-message export selection.'},
      {t:'Only first messages',e:'Selection depends on grounding and representative exchanges rather than earliest position alone.'}]},
    {q:'Why prioritize limitations over headline accuracy?',a:3,opts:[
      {t:'Accuracy is never useful',e:'Accuracy remains useful when paired with its dataset, split, and operating context.'},
      {t:'Limitations improve training',e:'Writing limitations documents risk but does not directly optimize model parameters.'},
      {t:'PDF requires limitations',e:'Rendering format is separate from the substantive purpose of limitations and caveats.'},
      {t:'They define safe scope',e:'Limitations identify where evaluation evidence may not support real-world model use.'}]}
  ]],
];

window.LESSON_TITLES[48] = 'LLM Chat Assistant and Multi-Provider Streaming';
window.BLOCKS[48] = [
  ['h2', 'Grounded assistance rather than generic chat'],
  ['p', 'A general chatbot answers from broad learned patterns. EnergyTypeNet first computes a dataset profile, task setup, model results, and feature ranking, then wraps those facts and recent history into the prompt. The assistant is instructed to use those facts, admit missing evidence, and never imply that it executed work the chat cannot perform.'],
  ['math', 'answer = route(question, facts, history, available\ provider)'],
  ['callout', 'analogy', 'An analyst with a case file', 'The language model is not asked to remember the dataset from intuition. It receives a compact case file of measured facts before answering each question.'],
  ['callout', 'warning', 'Grounded does not mean infallible', 'Context reduces hallucination but cannot repair incorrect source statistics or ambiguous questions. Verify important claims against the displayed metrics and validation results.'],
  ['h2', 'Transparent routing and bounded history'],
  ['code', 'src/chat_agent.py', `def build_contextualized_prompt(question, history, profile, prepared,
                                results, feature_ranking, question_type,
                                tool_result=None):
    dataset_context = build_dataset_context(
        profile, prepared, results, feature_ranking
    )
    conversation_context = history.to_context_string(n=4)
    return (
        "You are an ML dataset assistant. Use the computed facts "
        "and the recent conversation only.\\n\\n"
        f"Computed facts:\\n{dataset_context}\\n\\n"
        f"Recent conversation:\\n{conversation_context}\\n\\n"
        f"Current question: {question}"
    )`],
  ['p', 'The prompt requested seven categories, but the current classify_question() can return nine: target_selection, computation, feature_importance, follow_up, comparison, recommendation, model_performance, dataset_stats, and general. Transparent phrase rules and should_run_computation() determine the route. handle_follow_up() uses the last assistant message for deterministic examples and clarifications. ChatHistory(max_turns=20) trims storage to at most forty user/assistant messages, while prompt context uses the four most recent turns.'],
  ['h2', 'Provider streaming, fallback, and cost'],
  ['code', 'src/llm_assistant.py', `PROVIDERS = ['ollama', 'openai', 'anthropic', 'none']

def stream_with_fallback(prompt, provider, model, fallback_answer,
                         api_key=None):
    if provider == 'none':
        return _single_chunk(fallback_answer), 'deterministic'
    try:
        primary = stream_llm(prompt, provider, model, api_key)
        first = next(primary)
        return _prepend_chunk(first, primary), provider
    except Exception:
        pass
    if provider != 'ollama':
        try:
            fallback = stream_ollama(prompt, model=DEFAULT_OLLAMA_MODEL)
            first = next(fallback)
            return _prepend_chunk(first, fallback), 'ollama_fallback'
        except Exception:
            pass
    return _single_chunk(fallback_answer), 'deterministic'`],
  ['p', 'Ollama needs a local server and downloaded model but no API key. OpenAI and Anthropic need their provider SDK plus an API key. Provider none and the final deterministic answer need neither. The fallback order is selected primary, then local Ollama when the primary was hosted, then deterministic pattern-matched output. COST_PER_1K_TOKENS contains model-specific input and output prices; estimate_cost multiplies approximate token counts by those rates. UsageTracker records timestamp, provider, model, estimated tokens, and estimated cost, then reports session totals. Ollama and deterministic calls estimate zero hosted cost because they have no entry in the price table.'],
  ['streamlit', 'AI Dataset Assistant · Chat', 'Upload train_energy_data.csv. Choose provider “none,” or leave Ollama unavailable, then ask “Is the model overfitting?” The deterministic dataset-question path still responds from computed training and test statistics without an API key.'],
  ['quiz', [
    {q:'Which mode works without Ollama or an API key?',a:0,opts:[
      {t:'Deterministic fallback',e:'Pattern-matched answers use already computed facts and require no language-model service.'},
      {t:'OpenAI streaming',e:'The hosted OpenAI path requires its client dependency and an API key.'},
      {t:'Anthropic streaming',e:'The hosted Anthropic path requires its client dependency and an API key.'},
      {t:'Local Ollama streaming',e:'Ollama avoids API keys but still requires a running local model server.'}]},
    {q:'How many categories can classify_question currently return?',a:2,opts:[
      {t:'Four',e:'Four is the provider count and not the number of question routes.'},
      {t:'Seven',e:'The prompt says seven, but the current source defines additional routes.'},
      {t:'Nine',e:'The source returns nine named categories including computation and target selection.'},
      {t:'Twenty',e:'Twenty is the default history turn limit rather than route count.'}]},
    {q:'What follows a failed hosted provider?',a:1,opts:[
      {t:'Immediate exception only',e:'The wrapper catches provider failure so the dashboard can still answer.'},
      {t:'Ollama then deterministic',e:'A hosted failure tries local Ollama before returning the supplied deterministic answer.'},
      {t:'Automatic model training',e:'The chat wrapper never trains models as part of provider fallback handling.'},
      {t:'Unlimited retries',e:'The implementation follows a bounded fallback chain rather than retrying forever.'}]}
  ]],
];
