'use strict';

/* ── tiny math helpers ──────────────────────────────────────────────── */
function dot(a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function sigmoid(z) {
  z = Math.max(-250, Math.min(250, z));
  return 1.0 / (1.0 + Math.exp(-z));
}
function euclidean(a, b) {
  var s = 0;
  for (var i = 0; i < a.length; i++) s += (a[i] - b[i]) * (a[i] - b[i]);
  return Math.sqrt(s);
}
function argmax(arr) {
  var best = 0;
  for (var i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}
function softmaxArr(z) {
  var mx = z[0];
  for (var i = 1; i < z.length; i++) if (z[i] > mx) mx = z[i];
  var e = z.map(function(v) { return Math.exp(v - mx); });
  var s = e.reduce(function(a, b) { return a + b; }, 0);
  return e.map(function(v) { return v / s; });
}

/* ── StandardScaler (matches sklearn.preprocessing.StandardScaler) ── */
function Scaler() {}
Scaler.prototype.fit = function(X) {
  var n = X.length, d = X[0].length;
  this.mu  = [];
  this.sig = [];
  for (var j = 0; j < d; j++) {
    var mean = 0;
    for (var i = 0; i < n; i++) mean += X[i][j];
    mean /= n;
    var variance = 0;
    for (var i = 0; i < n; i++) variance += (X[i][j] - mean) * (X[i][j] - mean);
    this.mu.push(mean);
    this.sig.push(Math.sqrt(variance / n) || 1);
  }
  return this;
};
Scaler.prototype.transform = function(X) {
  var mu = this.mu, sig = this.sig;
  return X.map(function(xi) {
    return xi.map(function(v, j) { return (v - mu[j]) / sig[j]; });
  });
};
Scaler.prototype.transformOne = function(xi) {
  var mu = this.mu, sig = this.sig;
  return xi.map(function(v, j) { return (v - mu[j]) / sig[j]; });
};
window.Scaler = Scaler;

/* ── Binary cross-entropy loss (for gradient-descent demo) ─────────── */
window.binaryLoss = function(X, yb, w, b, alpha) {
  alpha = alpha || 0;
  var n = X.length, L = 0;
  for (var i = 0; i < n; i++) {
    var yhat = sigmoid(dot(X[i], w) + b);
    L -= yb[i] * Math.log(Math.max(1e-10, yhat))
       + (1 - yb[i]) * Math.log(Math.max(1e-10, 1 - yhat));
  }
  L /= n;
  var reg = 0;
  for (var j = 0; j < w.length; j++) reg += w[j] * w[j];
  return L + (alpha / 2) * reg;
};

/* ── OvR logistic regression (matches LogisticRegressionOvR in models.py) */
window.trainOvR = function(X, y) {
  var n = X.length, d = X[0].length;
  var classifiers = [0, 1, 2].map(function(c) {
    var yb = y.map(function(yi) { return yi === c ? 1 : 0; });
    var w = [];
    for (var j = 0; j < d; j++) w.push((Math.random() - 0.5) * 0.02);
    var bias = 0;
    var eta = 0.05, alpha = 0.0, nIter = 400;
    for (var it = 0; it < nIter; it++) {
      var yhat = X.map(function(xi) { return sigmoid(dot(xi, w) + bias); });
      var dw = w.map(function(wj, j) {
        var grad = 0;
        for (var i = 0; i < n; i++) grad += X[i][j] * (yhat[i] - yb[i]);
        return grad / n + alpha * wj;
      });
      var db = 0;
      for (var i = 0; i < n; i++) db += yhat[i] - yb[i];
      db /= n;
      w = w.map(function(wj, j) { return wj - eta * dw[j]; });
      bias -= eta * db;
    }
    return { w: w, b: bias };
  });

  return {
    clfs: classifiers,
    proba: function(Xt) {
      return Xt.map(function(xi) {
        var scores = classifiers.map(function(clf) { return sigmoid(dot(xi, clf.w) + clf.b); });
        var s = scores.reduce(function(a, b) { return a + b; }, 0) + 1e-12;
        return scores.map(function(v) { return v / s; });
      });
    },
    predict: function(Xt) {
      return this.proba(Xt).map(argmax);
    }
  };
};

/* ── Softmax regression (matches LogisticRegressionSoftmax in models.py) */
window.trainSoftmax = function(X, y) {
  var n = X.length, d = X[0].length, K = 3;
  var eta = 0.08, alpha = 0.0, nIter = 350;
  var W = [];
  var b = [];
  for (var k = 0; k < K; k++) {
    var row = [];
    for (var j = 0; j < d; j++) row.push((Math.random() - 0.5) * 0.02);
    W.push(row);
    b.push(0);
  }
  var Y = y.map(function(yi) {
    var row = [0, 0, 0]; row[yi] = 1; return row;
  });

  for (var it = 0; it < nIter; it++) {
    var P = X.map(function(xi) {
      var z = W.map(function(wk, k) { return dot(xi, wk) + b[k]; });
      return softmaxArr(z);
    });
    var dL = P.map(function(p, i) { return p.map(function(pij, j) { return (pij - Y[i][j]) / n; }); });
    for (var k = 0; k < K; k++) {
      for (var j = 0; j < d; j++) {
        var grad = 0;
        for (var i = 0; i < n; i++) grad += dL[i][k] * X[i][j];
        W[k][j] -= eta * (grad + alpha * W[k][j]);
      }
      var db = 0;
      for (var i = 0; i < n; i++) db += dL[i][k];
      b[k] -= eta * db;
    }
  }

  return {
    W: W, b: b,
    proba: function(Xt) {
      return Xt.map(function(xi) {
        var z = W.map(function(wk, k) { return dot(xi, wk) + b[k]; });
        return softmaxArr(z);
      });
    },
    predict: function(Xt) { return this.proba(Xt).map(argmax); }
  };
};

/* ── Attention classifier (matches AttentionClassifier in models.py) ── */
window.attnProba = function(Xtr, ytr, xi, bw) {
  var weights = Xtr.map(function(xj) {
    return Math.exp(-euclidean(xi, xj) / bw);
  });
  var s = weights.reduce(function(a, b) { return a + b; }, 0) + 1e-12;
  var nw = weights.map(function(v) { return v / s; });
  return [0, 1, 2].map(function(c) {
    var acc = 0;
    for (var i = 0; i < ytr.length; i++) if (ytr[i] === c) acc += nw[i];
    return acc;
  });
};
window.attnWeights = function(Xtr, xi, bw) {
  var weights = Xtr.map(function(xj) {
    return Math.exp(-euclidean(xi, xj) / bw);
  });
  var s = weights.reduce(function(a, b) { return a + b; }, 0) + 1e-12;
  return weights.map(function(v) { return v / s; });
};

/* ── One-step gradient-descent helper (for the interactive GD demo) ── */
window.gdStep = function(X, yb, w, b, eta, alpha) {
  var n = X.length;
  var yhat = X.map(function(xi) { return sigmoid(dot(xi, w) + b); });
  var newW = w.map(function(wj, j) {
    var grad = 0;
    for (var i = 0; i < n; i++) grad += X[i][j] * (yhat[i] - yb[i]);
    return wj - eta * (grad / n + alpha * wj);
  });
  var db = 0;
  for (var i = 0; i < n; i++) db += yhat[i] - yb[i];
  var newB = b - eta * (db / n);
  return { w: newW, b: newB };
};

/* ── Synthetic data matching the real CSV distribution ──────────────
   Real CSV ranges (from data/train_energy_data.csv inspection):
     Residential : Energy  ~1 000–8 000 kWh,  Square Footage  ~500–2 000
     Commercial  : Energy  ~5 000–25 000 kWh, Square Footage  ~2 000–8 000
     Industrial  : Energy  ~15 000–60 000 kWh, Square Footage ~6 000–30 000
   Classes overlap intentionally — this is WHY accuracy plateaus at 60-67%.
─────────────────────────────────────────────────────────────────────── */
window.generateData = function() {
  var seed = 42;
  function lcg() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  }
  function rand(lo, hi) { return lo + lcg() * (hi - lo); }

  var X = [], y = [];

  for (var i = 0; i < 25; i++) { X.push([rand(1000, 8000),  rand(500,  2000)]);  y.push(0); }
  for (var i = 0; i < 30; i++) { X.push([rand(5000, 25000), rand(2000, 8000)]);  y.push(1); }
  for (var i = 0; i < 25; i++) { X.push([rand(15000,60000), rand(6000, 30000)]); y.push(2); }

  return { X: X, y: y };
};

/* ── Canvas renderers ───────────────────────────────────────────────── */
window.renderLandscape = function(canvas, X, yb, path, alpha) {
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var W1LO = -3, W1HI = 3, W2LO = -3, W2HI = 3;

  var grid = new Float32Array(W * H);
  var mn = Infinity, mx = -Infinity;
  for (var py = 0; py < H; py++) {
    for (var px = 0; px < W; px++) {
      var w1 = W1LO + (W1HI - W1LO) * px / (W - 1);
      var w2 = W2LO + (W2HI - W2LO) * py / (H - 1);
      var l = window.binaryLoss(X, yb, [w1, w2], 0, alpha);
      grid[py * W + px] = l;
      if (l < mn) mn = l;
      if (l > mx) mx = l;
    }
  }

  var img = ctx.createImageData(W, H);
  var rng = mx - mn + 1e-10;
  for (var i = 0; i < W * H; i++) {
    var t = Math.sqrt((grid[i] - mn) / rng);
    img.data[i*4]   = Math.round(20  + 235 * t);
    img.data[i*4+1] = Math.round(80  * (1 - t) + 20 * t);
    img.data[i*4+2] = Math.round(200 * (1 - t) + 20 * t);
    img.data[i*4+3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  if (path && path.length > 1) {
    ctx.strokeStyle = 'rgba(255,255,160,0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var k = 0; k < path.length; k++) {
      var px2 = (path[k][0] - W1LO) / (W1HI - W1LO) * (W - 1);
      var py2 = (path[k][1] - W2LO) / (W2HI - W2LO) * (H - 1);
      if (k === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);
    }
    ctx.stroke();
    var last = path[path.length - 1];
    var lpx = (last[0] - W1LO) / (W1HI - W1LO) * (W - 1);
    var lpy = (last[1] - W2LO) / (W2HI - W2LO) * (H - 1);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(lpx, lpy, 5, 0, Math.PI * 2); ctx.fill();

    var fpx = (path[0][0] - W1LO) / (W1HI - W1LO) * (W - 1);
    var fpy = (path[0][1] - W2LO) / (W2HI - W2LO) * (H - 1);
    ctx.fillStyle = '#4ade80';
    ctx.beginPath(); ctx.arc(fpx, fpy, 5, 0, Math.PI * 2); ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '11px monospace';
  ctx.fillText('w₁ (Energy) →', W - 110, H - 5);
  ctx.save(); ctx.translate(13, H / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText('↑ w₂ (Sqft)', 0, 0); ctx.restore();
};

window.renderBoundary = function(canvas, predictFn, Xsc, y, res) {
  if (!canvas) return;
  res = res || 65;
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  var x0vals = Xsc.map(function(x) { return x[0]; });
  var x1vals = Xsc.map(function(x) { return x[1]; });
  var x0mn = Math.min.apply(null, x0vals) - 0.5;
  var x0mx = Math.max.apply(null, x0vals) + 0.5;
  var x1mn = Math.min.apply(null, x1vals) - 0.5;
  var x1mx = Math.max.apply(null, x1vals) + 0.5;

  var grid = [];
  for (var row = 0; row < res; row++) {
    for (var col = 0; col < res; col++) {
      grid.push([
        x0mn + (x0mx - x0mn) * col / (res - 1),
        x1mn + (x1mx - x1mn) * row / (res - 1)
      ]);
    }
  }

  var proba = predictFn(grid);
  var cell = Math.ceil(W / res);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  for (var i = 0; i < res * res; i++) {
    var row2 = Math.floor(i / res), col2 = i % res;
    var p = proba[i];
    var cls = 0;
    if (p[1] > p[cls]) cls = 1;
    if (p[2] > p[cls]) cls = 2;
    var conf = p[cls];
    var rgb = window.CLASS_RGB[cls];
    ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.12 + conf * 0.35) + ')';
    ctx.fillRect(col2 * cell, row2 * cell, cell + 1, cell + 1);
  }

  for (var i = 0; i < Xsc.length; i++) {
    var px = (Xsc[i][0] - x0mn) / (x0mx - x0mn) * (W - 1);
    var py = (Xsc[i][1] - x1mn) / (x1mx - x1mn) * (H - 1);
    var rgb2 = window.CLASS_RGB[y[i]];
    ctx.fillStyle = 'rgb(' + rgb2[0] + ',' + rgb2[1] + ',' + rgb2[2] + ')';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  ctx.fillStyle = 'rgba(30,41,59,0.55)';
  ctx.font = '10px monospace';
  ctx.fillText('Energy Consumption (scaled) →', 6, H - 5);
  ctx.save();
  ctx.translate(13, H - 30);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('↑ Square Footage (scaled)', 0, 0);
  ctx.restore();
};
