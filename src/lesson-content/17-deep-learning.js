/* Deep-learning lessons verified against EnergyTypeNet notebooks 14-18. */

window.LESSON_TITLES[41] = 'Introduction to PyTorch';
window.BLOCKS[41] = [
  ['h2', 'From manual arrays to automatic differentiation'],
  ['p', 'Notebook 14 imports MLPCustom and ActivationFunctions from src/models/neural.py. That NumPy network explicitly performs its forward pass, backward pass, mini-batch updates, dropout, and early stopping inside fit(). Notebook 15 keeps the same mathematics but moves tensor bookkeeping and gradient calculation into PyTorch.'],
  ['math', '\\hat{y}=model(x), \\quad L=CrossEntropyLoss(\\hat{y},y), \\quad \\frac{\\partial L}{\\partial W}=autograd(L), \\quad W\\leftarrow W-lr\\frac{\\partial L}{\\partial W}'],
  ['callout', 'analogy', 'A spreadsheet versus a workshop', 'NumPy gives you raw materials and asks you to build every mechanism. PyTorch provides powered tools such as autograd, modules, optimizers, and device-aware tensors while leaving the design decisions to you.'],
  ['callout', 'warning', 'Clear accumulated gradients', 'PyTorch adds gradients by default. Forgetting optimizer.zero_grad() causes each batch to include gradients left from earlier batches, which changes the intended update.'],
  ['h2', 'EnergyNet and RegressionNet'],
  ['code', 'notebooks/15_pytorch_introduction.ipynb', `class EnergyNet(nn.Module):
    def __init__(self, input_dim, hidden_dims, n_classes, dropout_rate=0.0, use_batch_norm=False):
        super().__init__()
        layers = []
        prev = input_dim
        for hidden in hidden_dims:
            layers.append(nn.Linear(prev, hidden))
            if use_batch_norm:
                layers.append(nn.BatchNorm1d(hidden))
            layers.append(nn.ReLU())
            if dropout_rate > 0:
                layers.append(nn.Dropout(dropout_rate))
            prev = hidden
        layers.append(nn.Linear(prev, n_classes))
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)

class RegressionNet(nn.Module):
    def __init__(self, input_dim, hidden_dims, dropout_rate=0.0, use_batch_norm=False):
        super().__init__()
        self.base = EnergyNet(input_dim, hidden_dims, 1, dropout_rate, use_batch_norm)

    def forward(self, x):
        return self.base(x).squeeze(-1)`],
  ['p', 'EnergyNet is a notebook-local classification module whose final layer produces one logit per class. RegressionNet reuses it with one output and removes the final singleton dimension. Notebook 15 trains these models on standardized EnergyTypeNet tabular features; it does not define them in src/models.'],
  ['h2', 'Dataset and training loop'],
  ['code', 'notebooks/15_pytorch_introduction.ipynb', `class EnergyDataset(Dataset):
    def __init__(self, X, y, task='classification', transform=None, device=DEVICE):
        self.X = torch.tensor(X, dtype=torch.float32, device=device)
        dtype = torch.long if task == 'classification' else torch.float32
        self.y = torch.tensor(y, dtype=dtype, device=device)
        self.transform = transform

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        x = self.X[idx]
        if self.transform is not None:
            x = self.transform(x)
        return x, self.y[idx]`],
  ['code', 'notebooks/15_pytorch_introduction.ipynb', `optimizer.zero_grad()
logits = model(xb)
loss = nn.CrossEntropyLoss()(logits, yb)
loss.backward()
optimizer.step()`],
  ['p', 'The forward call creates predictions. Cross-entropy compares logits with integer class labels. loss.backward() asks autograd to calculate parameter gradients, and optimizer.step() applies the update. GPU support changes the tensor device, not the learning theory. In production, train.py and dashboard.py use sklearn MLPClassifier, not EnergyNet, RegressionNet, or MLPCustom.'],
  ['quiz', [
    {q:'What does autograd add beyond the NumPy implementation?',a:1,opts:[
      {t:'Automatic dataset labeling',e:'Autograd differentiates computations and does not invent target labels for training rows.'},
      {t:'Automatic gradient calculation',e:'Autograd records tensor operations and computes derivatives during the backward pass.'},
      {t:'Guaranteed model accuracy',e:'Automatic differentiation improves workflow but cannot guarantee generalization or predictive accuracy.'},
      {t:'Removal of the forward pass',e:'Every neural network still needs a forward computation to produce predictions.'}]},
    {q:'Why call optimizer.zero_grad() before backward?',a:2,opts:[
      {t:'To delete model parameters',e:'zero_grad clears stored gradients while preserving all learned parameter values.'},
      {t:'To move tensors onto the GPU',e:'Tensor device movement uses to(device), not the gradient-clearing optimizer method.'},
      {t:'To prevent unintended gradient accumulation',e:'PyTorch accumulates gradients, so each ordinary batch must clear previous values.'},
      {t:'To select the target class',e:'The target labels are already supplied to the classification loss function.'}]},
    {q:'Which neural model is used by production train.py?',a:3,opts:[
      {t:'EnergyNet',e:'EnergyNet is defined and trained inside Notebook 15 for education.'},
      {t:'RegressionNet',e:'RegressionNet demonstrates tabular regression and is not imported by train.py.'},
      {t:'MLPCustom',e:'MLPCustom teaches manual NumPy backpropagation but is not a production candidate.'},
      {t:'sklearn MLPClassifier',e:'The production trainer constructs sklearn MLPClassifier inside a standardized candidate pipeline.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Model Comparison', 'The current train.py trains MLPClassifier as one of nine candidates: logistic regression, MLP, XGBoost, soft voting, stacking, Extra Trees, histogram gradient boosting, custom bagging, and custom AdaBoost. The highest cross-validation mean is selected; the checked-in metrics select stacking at 0.628 CV mean and 0.65 test accuracy. Check artifacts/metrics.json after running python -m src.train to see your run.'],
];

window.LESSON_TITLES[42] = 'Autoencoders';
window.BLOCKS[42] = [
  ['h2', 'Learn by rebuilding the input'],
  ['p', 'An autoencoder has an encoder that compresses a row into a latent representation and a decoder that reconstructs the original features. The narrow latent bottleneck cannot copy every detail directly, so it must retain patterns that help reconstruction.'],
  ['math', 'z=encoder(x), \\quad \\hat{x}=decoder(z), \\quad L_{reconstruction}=\\frac{1}{d}\\sum_{j=1}^{d}(x_j-\\hat{x}_j)^2'],
  ['callout', 'analogy', 'Pack a suitcase and unpack it', 'The encoder packs the most useful information into a small suitcase. The decoder unpacks it and tries to recreate the original room from what was preserved.'],
  ['callout', 'warning', 'A pretty latent plot is not proof', 'Visible clusters in two dimensions can be partial or unstable. Reconstruction training does not explicitly optimize building-type separation.'],
  ['h2', 'The actual EnergyTypeNet autoencoder'],
  ['code', 'notebooks/16_autoencoders.ipynb', `class BaseAutoencoder(nn.Module):
    def __init__(self, input_dim=6, latent_dim=3):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, latent_dim),
        )
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 32),
            nn.ReLU(),
            nn.Linear(32, input_dim),
        )

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)

    def encode(self, x):
        return self.encoder(x)`],
  ['p', 'The class is named BaseAutoencoder, not Autoencoder. Its default path is 6 → 32 → 16 → latent_dim and then latent_dim → 16 → 32 → 6. Notebook 16 fits it on standardized EnergyTypeNet features, studies three-dimensional and two-dimensional bottlenecks, and plots a two-dimensional latent space colored afterward by building type. The classes separate only partially because labels never enter reconstruction training.'],
  ['h2', 'Reconstruction, anomalies, denoising, and VAE'],
  ['p', 'Classification loss asks which label is correct. Reconstruction loss asks how closely every output feature matches its input. A building row with reconstruction error far above the training distribution can be flagged as unusual, but unusual does not automatically mean fraudulent or incorrect. The notebook also defines DenoisingAutoencoder as a BaseAutoencoder subclass and a notebook-local VAE. The VAE uses sklearn digits for generative image experiments and EnergyTypeNet for a two-dimensional latent plot.'],
  ['p', 'These PyTorch autoencoders are educational notebook models. train.py and dashboard.py do not import them, and no “coming soon” claim is needed: reconstruction, anomaly detection, denoising, bottleneck comparison, feature extraction, and VAE experiments are executed in Notebook 16.'],
  ['quiz', [
    {q:'What is the bottleneck?',a:0,opts:[
      {t:'The compressed latent representation',e:'The bottleneck contains fewer dimensions and forces the encoder to compress patterns.'},
      {t:'The original target labels',e:'Labels are not required for ordinary unsupervised autoencoder reconstruction training.'},
      {t:'The production API endpoint',e:'An API route serves predictions and is unrelated to latent dimensionality.'},
      {t:'The DataLoader batch size',e:'Batch size controls optimization grouping rather than the learned representation width.'}]},
    {q:'How does reconstruction loss differ from classification loss?',a:2,opts:[
      {t:'It always uses class labels',e:'Reconstruction compares input features with output features and needs no class label.'},
      {t:'It cannot use gradients',e:'Reconstruction loss is differentiable and trains the network through ordinary backpropagation.'},
      {t:'It measures how well inputs are rebuilt',e:'Mean squared reconstruction error compares each original feature with its decoded value.'},
      {t:'It selects a deployment port',e:'Network loss functions do not control HTTP server or deployment configuration.'}]},
    {q:'What can unusually high reconstruction error indicate?',a:1,opts:[
      {t:'Guaranteed malicious activity',e:'An anomaly score signals unusual structure and does not establish intent or cause.'},
      {t:'A row unlike learned normal patterns',e:'Poor reconstruction suggests the row differs from patterns represented during training.'},
      {t:'A perfectly typical building',e:'Typical rows usually resemble training patterns and should reconstruct with lower error.'},
      {t:'Automatic production deployment',e:'Reconstruction error is an analysis result and does not deploy models automatically.'}]}
  ]],
  ['streamlit', 'Custom Dataset · Data Analysis', 'Inspect outliers and feature distributions in the live app; run Notebook 16 locally for the actual PyTorch reconstruction, latent-space, and anomaly experiments.'],
];

window.LESSON_TITLES[43] = 'Convolutional Neural Networks';
window.BLOCKS[43] = [
  ['h2', 'Local patterns and shared filters'],
  ['p', 'A convolution slides a small filter across spatial data and reuses the same weights at every location. A receptive field is the region of the input visible to one activation. Pooling reduces spatial size while retaining strong local signals. These ideas match images because nearby pixels have meaningful relationships.'],
  ['math', 'feature(i,j)=\\sigma\\left(\\sum_{u,v}K(u,v)X(i+u,j+v)+b\\right)'],
  ['callout', 'analogy', 'Inspect a building through a moving window', 'A sliding inspection window searches each local patch for the same pattern, just as a convolution filter scans every image location for edges or shapes.'],
  ['callout', 'warning', 'Do not invent spatial order in a spreadsheet', 'Adjacent tabular columns are not neighboring pixels. Convolution over an arbitrary column order creates a locality assumption that has no scientific justification.'],
  ['h2', 'DigitCNN on built-in image data'],
  ['code', 'notebooks/17_convolutional_neural_networks.ipynb', `class DigitCNN(nn.Module):
    def __init__(self, dropout=0.15):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.pool = nn.MaxPool2d(2)
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(32 * 4 * 4, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward_features(self, x):
        z1 = F.relu(self.bn1(self.conv1(x)))
        z2 = F.relu(self.bn2(self.conv2(z1)))
        pooled = self.pool(z2)
        return z1, z2, pooled

    def forward(self, x):
        _, _, pooled = self.forward_features(x)
        flat = pooled.view(pooled.size(0), -1)
        hidden = F.relu(self.fc1(flat))
        hidden = self.dropout(hidden)
        return self.fc2(hidden)`],
  ['p', 'Notebook 17 first demonstrates one-dimensional convolution with NumPy, then uses sklearn.datasets.load_digits for all main CNN experiments. Each digit is an 8×8 image. Optional MNIST is attempted only when torchvision and local MNIST files are available; otherwise that section skips cleanly without downloading data.'],
  ['h2', 'Why EnergyTypeNet does not use a CNN'],
  ['p', 'EnergyTypeNet rows contain square footage, occupants, appliances, temperature, day information, and energy measurements. They do not form a spatial grid. Notebook 17 explicitly does not train DigitCNN on those building rows. Linear models, trees, XGBoost, ensembles, and tabular MLPs have assumptions that better match spreadsheet data. DigitCNN is notebook-local and absent from train.py and dashboard.py.'],
  ['quiz', [
    {q:'Why do shared convolution filters suit images?',a:1,opts:[
      {t:'Every pixel has a unique class label',e:'Image labels usually describe the whole image rather than each individual pixel.'},
      {t:'Local patterns can appear in many positions',e:'A shared filter can detect the same edge or shape across locations.'},
      {t:'Images contain no spatial structure',e:'CNN usefulness depends precisely on meaningful spatial relationships between neighboring pixels.'},
      {t:'Pooling creates more pixels',e:'Pooling normally reduces spatial resolution while summarizing local activation regions.'}]},
    {q:'What dataset powers the main DigitCNN experiment?',a:2,opts:[
      {t:'EnergyTypeNet building rows',e:'The notebook explicitly rejects imposing image locality on the tabular building dataset.'},
      {t:'Required downloaded MNIST only',e:'MNIST is optional and skipped when local files or torchvision are unavailable.'},
      {t:'sklearn 8×8 digits',e:'The built-in sklearn digits dataset supports reliable CPU experiments without network downloads.'},
      {t:'A text corpus',e:'DigitCNN receives image tensors rather than word counts or token sequences.'}]},
    {q:'Why not convolve across EnergyTypeNet columns?',a:3,opts:[
      {t:'There are too many timestamps',e:'The main EnergyTypeNet CSV lacks genuine timestamped sequence structure entirely.'},
      {t:'CNNs cannot process numbers',e:'CNNs process numeric tensors but require meaningful local structure to justify convolution.'},
      {t:'XGBoost requires images first',e:'XGBoost naturally handles tabular features and does not require image conversion.'},
      {t:'Column adjacency is arbitrary',e:'Neighboring spreadsheet columns do not represent stable spatial neighborhoods like nearby pixels.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Model Comparison', 'Use the live app to compare models appropriate for tabular EnergyTypeNet data; run Notebook 17 locally for CNN filters, feature maps, and digits classification.'],
];

window.LESSON_TITLES[44] = 'Recurrent Neural Networks';
window.BLOCKS[44] = [
  ['h2', 'Carry information through time'],
  ['p', 'A recurrent neural network processes an ordered sequence and carries a hidden state from one step to the next. LSTMs add a cell state and gates so useful information can survive longer. The forget gate removes stale memory, the input gate writes new information, and the output gate controls what becomes visible as hidden state.'],
  ['math', 'f_t=\\sigma(W_f[x_t,h_{t-1}]), \\quad c_t=f_t\\odot c_{t-1}+i_t\\odot g_t, \\quad h_t=o_t\\odot\\tanh(c_t)'],
  ['callout', 'analogy', 'A shift log with three controls', 'The forget gate erases outdated notes, the input gate writes useful observations, and the output gate chooses which remembered details to report now.'],
  ['callout', 'warning', 'Row order is not automatically time', 'The main EnergyTypeNet CSV has no timestamp. Treating its row order as chronology creates an educational sequence, not a valid real-world forecast.'],
  ['h2', 'The actual forecasting model name'],
  ['code', 'notebooks/18_recurrent_neural_networks.ipynb', `class RecurrentRegressor(nn.Module):
    def __init__(self, kind='rnn', input_size=1, hidden_size=48, num_layers=1,
                 bidirectional=False, dropout=0.0, attention=False, horizon=1):
        super().__init__()
        self.attention = attention
        rnn_cls = {'rnn': nn.RNN, 'lstm': nn.LSTM, 'gru': nn.GRU}[kind]
        self.rnn = rnn_cls(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=bidirectional,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        multiplier = 2 if bidirectional else 1
        self.head = nn.Linear(hidden_size * multiplier, horizon)

    def forward(self, x):
        outputs, _ = self.rnn(x)
        return self.head(outputs[:, -1, :])`],
  ['p', 'Notebook 18 does not define a class named ForecastLSTM. That name labels results from RecurrentRegressor(kind="lstm", ...). The main forecasting comparison uses a noisy synthetic sine sequence with real sliding windows. An additional EnergyTypeNet row-order demo is explicitly synthetic because the CSV has no timestamps, and it performs worse than tabular linear and ridge baselines.'],
  ['h2', 'Cells from scratch and sequence classification'],
  ['code', 'notebooks/18_recurrent_neural_networks.ipynb', `class LSTMCellNumpy:
    def __init__(self, input_size=1, hidden_size=4, random_state=42):
        rng = np.random.default_rng(random_state)
        self.hidden_size = hidden_size
        self.W = rng.normal(0, 0.1, (4 * hidden_size, input_size + hidden_size))
        self.b = np.zeros((4 * hidden_size, 1))

    def forward(self, x_t, h_prev, c_prev):
        combined = np.vstack([x_t, h_prev])
        gates = self.W @ combined + self.b
        hs = self.hidden_size
        f = sigmoid_np(gates[:hs])
        i = sigmoid_np(gates[hs:2 * hs])
        g = np.tanh(gates[2 * hs:3 * hs])
        o = sigmoid_np(gates[3 * hs:])
        c_t = f * c_prev + i * g
        h_t = o * np.tanh(c_t)
        return h_t, c_t

class GRUCellNumpy:
    def __init__(self, input_size=1, hidden_size=4, random_state=42):
        rng = np.random.default_rng(random_state)
        self.hidden_size = hidden_size`],
  ['code', 'notebooks/18_recurrent_neural_networks.ipynb', `class ClassifierLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=48, n_classes=3):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers=2,
                            batch_first=True, bidirectional=True, dropout=0.1)
        self.head = nn.Linear(hidden_size * 2, n_classes)

    def forward(self, x):
        output, _ = self.lstm(x)
        return self.head(output[:, -1, :])`],
  ['p', 'LSTMCellNumpy and GRUCellNumpy expose gate equations and are checked against PyTorch cells. ClassifierLSTM distinguishes synthetic low-frequency sine, high-frequency sine, and random-walk sequences. A real building-energy RNN would require chronological readings such as the previous 24 hourly values to forecast the next hour. These recurrent classes are notebook-local and are not used by train.py or dashboard.py.'],
  ['quiz', [
    {q:'What does the LSTM forget gate control?',a:0,opts:[
      {t:'How much old cell memory remains',e:'The forget gate multiplies the previous cell state before new information is added.'},
      {t:'Which HTTP route is called',e:'LSTM gates operate on sequence tensors and never select web API routes.'},
      {t:'The number of target classes',e:'Class count belongs to the output head rather than the forget gate.'},
      {t:'Whether features are standardized',e:'Preprocessing decisions occur before the recurrent gate calculations even begin.'}]},
    {q:'What class actually implements the notebook forecasting networks?',a:2,opts:[
      {t:'ForecastLSTM',e:'ForecastLSTM is a results label and is not a defined Python class.'},
      {t:'ClassifierLSTM',e:'ClassifierLSTM handles synthetic sequence categories rather than scalar forecasting output.'},
      {t:'RecurrentRegressor',e:'The kind parameter selects RNN, LSTM, or GRU inside this forecasting module.'},
      {t:'EnergyNet',e:'EnergyNet is a feed-forward tabular module defined in Notebook 15.'}]},
    {q:'Why is the EnergyTypeNet row-order forecast educational only?',a:3,opts:[
      {t:'The CSV contains only image pixels',e:'EnergyTypeNet contains tabular building measurements rather than image pixel grids.'},
      {t:'LSTMs cannot predict numeric values',e:'LSTMs can perform regression when genuine temporal sequences are available.'},
      {t:'The model has no hidden state',e:'The configured LSTM maintains recurrent hidden and cell states across timesteps.'},
      {t:'The rows have no true timestamps',e:'Without chronology, adjacent CSV rows do not represent consecutive energy observations.'}]}
  ]],
  ['streamlit', 'EnergyTypeNet · Overview', 'Inspect the current tabular columns and notice the missing timestamp; run Notebook 18 locally for synthetic sine forecasting, gate checks, and the clearly labeled row-order demo.'],
];

window.BLOCKS[41].push(['prompt', 'PyTorch and Autograd', `I want to connect the PyTorch training loop to the NumPy neural network I already studied.
Explain why optimizer.zero_grad() is called before each backward pass and what happens if I omit it.
Trace what autograd records and computes for one layer, then compare it with the manual gradients in MLPCustom.
Explain why model.train() and model.eval() matter when dropout or batch normalization is present.
Connect the explanation to EnergyNet, RegressionNet, EnergyDataset, and their notebook training loop.
Finally, explain why EnergyTypeNet production training uses sklearn MLPClassifier rather than these educational notebook-local PyTorch models.`]);

window.BLOCKS[42].push(['prompt', 'Autoencoders and Latent Space', `I want to understand what an autoencoder learns rather than viewing the bottleneck as magic.
Explain why the bottleneck is smaller than the input and what information BaseAutoencoder must preserve there.
Compare reconstruction loss with cross-entropy classification loss using explicit formulas and outputs.
Show how I could establish a reconstruction-error threshold for anomaly detection on EnergyTypeNet building rows.
Explain what a high-error building would mean and what checks I should perform before calling it anomalous.
Finally, show how a variational autoencoder extends this architecture with a distributional latent space and KL loss.`]);

window.BLOCKS[43].push(['prompt', 'Convolutional Neural Networks', `I want to calculate a convolution rather than only seeing a CNN diagram.
Apply a small numeric filter to a concrete 2D image patch and show every multiplication and sum.
Explain why pooling reduces spatial dimensions and what local information it preserves or discards.
Connect those operations to the DigitCNN class in the EnergyTypeNet CNN notebook.
Explain why a CNN is not appropriate for independent tabular rows in the main building CSV.
Finally, describe building-data tasks where CNNs would fit naturally, such as thermal images or floor-plan images.`]);

window.BLOCKS[44].push(['prompt', 'Recurrent Neural Networks and LSTMs', `I want to trace one LSTM timestep with actual numbers.
Calculate the forget, input, candidate, and output gates and show how they produce the new cell and hidden states.
Explain why vanilla RNN gradients can vanish over long sequences and how the LSTM cell-state path helps.
Connect the equations to RecurrentRegressor, LSTMCellNumpy, GRUCellNumpy, and ClassifierLSTM in Notebook 18.
Explain why the main EnergyTypeNet CSV rows have no trustworthy temporal sequence structure.
Finally, design a realistic next-hour building-energy forecast using timestamped readings and a rolling input window.`]);
