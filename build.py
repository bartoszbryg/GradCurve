#!/usr/bin/env python3
"""Dev server for the GradCurve learning website.

Examples:
    python website/build.py
    python website/build.py --port 8080

Open: http://localhost:5000

Every URL is handled by the Flask server:
    /             -> index.html
    /src/<file>   -> static file from website/src/
    /#/dataset    -> index.html, then React reads the hash
"""

import argparse
from pathlib import Path

from flask import Flask, send_from_directory


ROOT = Path(__file__).parent
SRC = ROOT / 'src'

app = Flask(__name__)


@app.after_request
def disable_dev_cache(response):
    """Always serve the latest local CSS and lesson code during development."""
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.route('/src/<path:filename>')
def static_src(filename):
    """Serve files from website/src/ (JS, CSS, JSX)."""
    return send_from_directory(SRC, filename)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    """Return index.html for every other URL (SPA pattern)."""
    return send_from_directory(ROOT, 'index.html')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='GradCurve dev server')
    parser.add_argument('--port', type=int, default=5000)
    parser.add_argument('--host', default='127.0.0.1')
    args = parser.parse_args()

    print('\nGradCurve dev server')
    print(f'  http://{args.host}:{args.port}/')
    print(f'  http://{args.host}:{args.port}/#/dataset')
    print(f'  http://{args.host}:{args.port}/#/predictor')
    print(f'  http://{args.host}:{args.port}/#/exam\n')

    app.run(host=args.host, port=args.port, debug=True)
