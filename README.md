# GradCurve

Interactive machine learning companion for the EnergyTypeNet project. Teaches the complete story from raw CSV to production deployment.

## Coverage

- 47 numbered lessons covering the EnergyTypeNet journey from dataset exploration through deployment
- 20 ML course topics: dataset, linear models, regularization, SVM, decision trees, kNN, probabilistic models, dimensionality reduction, clustering, neural networks, autoencoders, PyTorch, CNNs, RNNs, and ensemble extensions
- 12 production topics: MLflow, FastAPI, Docker, Streamlit, CI/CD, AutoML, SHAP/LIME, data validation, model cards, and LLM streaming
- 5 standalone interactive tools, including a live in-browser classifier and the final exam
- 14 unique inline concept/formula visualizations, used in 15 lesson placements, with real-time controls where appropriate
- Final exam with 58 questions across all topics
- Searchable glossary with 101 terms

## Running locally

```bash
pip install flask
python build.py
```

Open: http://localhost:5000

## Architecture

No build step. No npm. Static HTML + CDN React 18 + ordered global JavaScript. Lesson content lives in `src/lesson-content/*.js` files that push to `window.BLOCKS[n]`. Script load order in `index.html` is the contract.

## Adding a lesson

1. Add a `NAV` entry in `src/app.jsx`.
2. Add a `LESSON_IDX` mapping in `src/app.jsx`.
3. Set `window.LESSON_TITLES[n]` and push to `window.BLOCKS[n]` in a `src/lesson-content/*.js` file.
4. Add the script tag in `index.html` in load order.

## EnergyTypeNet

The ML project this website teaches: https://github.com/bartoszbryg/EnergyTypeNet
