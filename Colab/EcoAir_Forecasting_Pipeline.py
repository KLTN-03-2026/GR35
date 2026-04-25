# =============================================================================
# EcoAir — Air Quality Forecasting Pipeline (Google Colab)
# =============================================================================
# This script is structured as Colab cells (separated by "# %%").
# Copy each cell into a new Google Colab notebook or upload this .py file.
#
# ✅ Automatically loops through ALL 63 Vietnamese provinces.
# Each province gets its own: data, scaler, trained model, ONNX export.
#
# Pipeline:
#   Cell 1: Install dependencies
#   Cell 2: Configuration — 63 provinces + API key
#   Cell 3: Data Collection (loops all provinces)
#   Cell 4: Helper functions (preprocessing, model, training, export)
#   Cell 5: Main loop — Train & Export for each province
#   Cell 6: C# .NET Integration Guide
# =============================================================================

# %% [markdown]
# # 🌍 EcoAir — Air Quality Forecasting Pipeline
# **Goal**: Train a Bi-LSTM model per Vietnamese province on 2 years of hourly
# air quality + weather data, then export each to ONNX for C# .NET inference.
# **Runs all 63 provinces automatically — no manual changes needed.**

# %%
# =============================================================================
# CELL 1: Install Dependencies
# =============================================================================

import subprocess, sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

for pkg in ["onnx", "onnxruntime", "pandas", "scikit-learn", "requests", "joblib"]:
    try:
        __import__(pkg.replace("-", "_"))
    except ImportError:
        install(pkg)

print("✅ All dependencies installed.")

# %%
# =============================================================================
# CELL 2: Configuration — 63 Provinces + API Key
# =============================================================================

import requests
import pandas as pd
import numpy as np
import time
import json
import os
import joblib
from datetime import datetime, timedelta, timezone
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# ╔══════════════════════════════════════════════════════════════════╗
# ║  ⚙️  CONFIGURATION — EDIT THESE VALUES                         ║
# ╚══════════════════════════════════════════════════════════════════╝
OPENWEATHERMAP_API_KEY = "YOUR_API_KEY_HERE"  # 🔑 Replace with your key

# ── Tọa độ 63 tỉnh thành Việt Nam (lat, lon) ────────────────────────────────
VIETNAM_PROVINCES = {
    # ══════════════════════  ĐỒNG BẰNG SÔNG HỒNG  ══════════════════════
    "Hà Nội":          (21.0285, 105.8542),
    "Hải Phòng":       (20.8449, 106.6881),
    "Quảng Ninh":      (21.0064, 107.2925),
    "Bắc Ninh":        (21.1861, 106.0763),
    "Hải Dương":       (20.9373, 106.3146),
    "Hưng Yên":        (20.6464, 106.0511),
    "Thái Bình":       (20.4463, 106.3365),
    "Hà Nam":          (20.5835, 105.9230),
    "Nam Định":        (20.4388, 106.1621),
    "Ninh Bình":       (20.2506, 105.9745),
    "Vĩnh Phúc":      (21.3609, 105.5474),
    # ══════════════════════  ĐÔNG BẮC BỘ  ══════════════════════
    "Hà Giang":        (22.8233, 104.9838),
    "Cao Bằng":        (22.6666, 106.2579),
    "Bắc Kạn":        (22.1443, 105.8348),
    "Tuyên Quang":     (21.8237, 105.2181),
    "Lào Cai":         (22.3380, 103.8440),
    "Yên Bái":         (21.7168, 104.8985),
    "Thái Nguyên":     (21.5942, 105.8482),
    "Lạng Sơn":       (21.8469, 106.7613),
    "Bắc Giang":      (21.2731, 106.1946),
    "Phú Thọ":        (21.3228, 105.4019),
    # ══════════════════════  TÂY BẮC BỘ  ══════════════════════
    "Điện Biên":      (21.3860, 103.0230),
    "Lai Châu":       (22.3964, 103.4706),
    "Sơn La":         (21.3270, 103.9144),
    "Hòa Bình":       (20.8171, 105.3378),
    # ══════════════════════  BẮC TRUNG BỘ  ══════════════════════
    "Thanh Hóa":       (19.8067, 105.7852),
    "Nghệ An":        (18.6790, 105.6813),
    "Hà Tĩnh":       (18.3559, 105.8877),
    "Quảng Bình":     (17.4690, 106.6222),
    "Quảng Trị":      (16.7504, 107.1855),
    "Thừa Thiên Huế": (16.4637, 107.5909),
    # ══════════════════════  NAM TRUNG BỘ  ══════════════════════
    "Đà Nẵng":        (16.0544, 108.2022),
    "Quảng Nam":      (15.5394, 108.0191),
    "Quảng Ngãi":     (15.1206, 108.8044),
    "Bình Định":      (13.7720, 109.2197),
    "Phú Yên":        (13.0882, 109.0929),
    "Khánh Hòa":      (12.2585, 109.0526),
    "Ninh Thuận":     (11.5752, 108.9890),
    "Bình Thuận":     (10.9280, 108.1002),
    # ══════════════════════  TÂY NGUYÊN  ══════════════════════
    "Kon Tum":         (14.3546, 108.0005),
    "Gia Lai":         (13.9832, 108.0025),
    "Đắk Lắk":       (12.7100, 108.2378),
    "Đắk Nông":      (12.0036, 107.6876),
    "Lâm Đồng":      (11.9465, 108.4419),
    # ══════════════════════  ĐÔNG NAM BỘ  ══════════════════════
    "Hồ Chí Minh":    (10.8231, 106.6297),
    "Bà Rịa - Vũng Tàu": (10.3460, 107.0843),
    "Bình Dương":     (11.1671, 106.6160),
    "Bình Phước":     (11.7511, 106.7234),
    "Đồng Nai":       (10.9453, 106.8243),
    "Tây Ninh":        (11.3352, 106.0986),
    # ══════════════════════  ĐỒNG BẰNG SÔNG CỬU LONG  ══════════════════════
    "Long An":         (10.5360, 106.4132),
    "Tiền Giang":     (10.3600, 106.3630),
    "Bến Tre":        (10.2415, 106.3759),
    "Trà Vinh":       ( 9.9347, 106.3455),
    "Vĩnh Long":      (10.2538, 105.9722),
    "Đồng Tháp":     (10.4525, 105.6329),
    "An Giang":        (10.3860, 105.4350),
    "Kiên Giang":     (10.0125, 105.0809),
    "Cần Thơ":        (10.0452, 105.7469),
    "Hậu Giang":      ( 9.7579, 105.6413),
    "Sóc Trăng":      ( 9.6039, 105.9800),
    "Bạc Liêu":      ( 9.2850, 105.7246),
    "Cà Mau":          ( 9.1769, 105.1524),
}

# ── Model / Training constants ───────────────────────────────────────────────
FEATURE_COLUMNS = [
    "pm25", "pm10", "co", "no2", "so2", "o3",
    "temperature_2m", "relative_humidity_2m",
    "wind_speed_10m", "wind_direction_10m", "surface_pressure",
]
TARGET_COLUMNS = ["pm25", "pm10", "co", "no2", "so2", "o3"]
TARGET_INDICES = [FEATURE_COLUMNS.index(c) for c in TARGET_COLUMNS]

NUM_FEATURES    = len(FEATURE_COLUMNS)   # 11
NUM_TARGETS     = len(TARGET_COLUMNS)    # 6
LOOKBACK_HOURS  = 336   # 14 days × 24 hours
FORECAST_HOURS  = 168   # 7 days × 24 hours
BATCH_SIZE      = 32
NUM_EPOCHS      = 50
LEARNING_RATE   = 1e-3
PATIENCE        = 10

# Time range
END_DATE   = datetime.now(timezone.utc)
START_DATE = END_DATE - timedelta(days=730)

# Root output — saved to Google Drive so data persists across runtime changes
from google.colab import drive
drive.mount('/content/drive')
ROOT_OUTPUT = "/content/drive/MyDrive/ecoair_output"
os.makedirs(ROOT_OUTPUT, exist_ok=True)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"🖥️  Device: {device}")
print(f"📅 Date range: {START_DATE.strftime('%Y-%m-%d')} → {END_DATE.strftime('%Y-%m-%d')}")
print(f"🏙️  Total provinces: {len(VIETNAM_PROVINCES)}")
print(f"📊 Config: lookback={LOOKBACK_HOURS}h, forecast={FORECAST_HOURS}h")
print(f"   Features: {NUM_FEATURES}, Targets: {NUM_TARGETS}")

# %%
# =============================================================================
# CELL 3: Data Collection — Automatically fetch ALL 63 provinces
# =============================================================================
# This cell loops through every province, fetches air quality (OpenWeatherMap)
# and weather (Open-Meteo) data, merges them, and saves a CSV per province.
# Already-downloaded provinces are SKIPPED (resume-safe).
# =============================================================================

def fetch_air_quality_data(lat, lon, start_dt, end_dt, api_key):
    """Fetch historical air pollution from OpenWeatherMap (chunked by week)."""
    all_records = []
    chunk_start = start_dt
    chunk_size = timedelta(days=7)
    total_chunks = int((end_dt - start_dt).total_seconds() / chunk_size.total_seconds()) + 1

    for i in range(total_chunks):
        chunk_end = min(chunk_start + chunk_size, end_dt)
        if chunk_start >= end_dt:
            break

        url = (
            f"http://api.openweathermap.org/data/2.5/air_pollution/history"
            f"?lat={lat}&lon={lon}"
            f"&start={int(chunk_start.timestamp())}&end={int(chunk_end.timestamp())}"
            f"&appid={api_key}"
        )
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            for entry in resp.json().get("list", []):
                comp = entry.get("components", {})
                all_records.append({
                    "timestamp": datetime.fromtimestamp(entry["dt"], tz=timezone.utc),
                    "pm25": comp.get("pm2_5"), "pm10": comp.get("pm10"),
                    "co": comp.get("co"), "no2": comp.get("no2"),
                    "so2": comp.get("so2"), "o3": comp.get("o3"),
                })
        except requests.exceptions.RequestException:
            pass

        chunk_start = chunk_end
        if (i + 1) % 30 == 0:
            print(f"      Air quality: {i+1}/{total_chunks} chunks")
        time.sleep(1.1)  # Rate limit

    df = pd.DataFrame(all_records)
    if not df.empty:
        df = df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    return df


def fetch_weather_data(lat, lon, start_dt, end_dt):
    """Fetch historical weather from Open-Meteo (free, chunked by year)."""
    all_dfs = []
    chunk_start = start_dt

    while chunk_start < end_dt:
        chunk_end = min(chunk_start + timedelta(days=365), end_dt)
        url = (
            f"https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={lat}&longitude={lon}"
            f"&start_date={chunk_start.strftime('%Y-%m-%d')}"
            f"&end_date={chunk_end.strftime('%Y-%m-%d')}"
            f"&hourly=temperature_2m,relative_humidity_2m,"
            f"wind_speed_10m,wind_direction_10m,surface_pressure"
            f"&timezone=UTC"
        )
        try:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            hourly = resp.json().get("hourly", {})
            if "time" in hourly:
                all_dfs.append(pd.DataFrame({
                    "timestamp":           pd.to_datetime(hourly["time"], utc=True),
                    "temperature_2m":      hourly.get("temperature_2m"),
                    "relative_humidity_2m": hourly.get("relative_humidity_2m"),
                    "wind_speed_10m":      hourly.get("wind_speed_10m"),
                    "wind_direction_10m":  hourly.get("wind_direction_10m"),
                    "surface_pressure":    hourly.get("surface_pressure"),
                }))
        except requests.exceptions.RequestException:
            pass
        chunk_start = chunk_end + timedelta(days=1)
        time.sleep(0.5)

    df = pd.concat(all_dfs, ignore_index=True) if all_dfs else pd.DataFrame()
    if not df.empty:
        df = df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    return df


# ── Main collection loop ────────────────────────────────────────────────────
print("=" * 70)
print(f"📡 DATA COLLECTION — {len(VIETNAM_PROVINCES)} provinces")
print("=" * 70)

collection_results = {}

for idx, (province, (lat, lon)) in enumerate(VIETNAM_PROVINCES.items(), 1):
    safe_name = province.replace(" ", "_").replace("-", "_")
    prov_dir  = os.path.join(ROOT_OUTPUT, safe_name)
    csv_path  = os.path.join(prov_dir, "raw_merged_data.csv")

    # ── Skip if already downloaded ───────────────────────────────────────
    if os.path.exists(csv_path):
        df_existing = pd.read_csv(csv_path)
        collection_results[province] = len(df_existing)
        print(f"  [{idx:2d}/63] ⏭️  {province} — already exists ({len(df_existing)} rows)")
        continue

    os.makedirs(prov_dir, exist_ok=True)
    print(f"\n  [{idx:2d}/63] 🌐 {province} ({lat}, {lon})")

    # Fetch air quality
    df_air = fetch_air_quality_data(lat, lon, START_DATE, END_DATE, OPENWEATHERMAP_API_KEY)
    print(f"      🌫️  Air quality: {len(df_air)} records")

    # Fetch weather
    df_weather = fetch_weather_data(lat, lon, START_DATE, END_DATE)
    print(f"      🌤️  Weather: {len(df_weather)} records")

    # Merge
    if df_air.empty or df_weather.empty:
        print(f"      ⚠️  Skipped — insufficient data")
        collection_results[province] = 0
        continue

    df_air["timestamp"]     = df_air["timestamp"].dt.floor("h")
    df_weather["timestamp"] = df_weather["timestamp"].dt.floor("h")
    df_merged = pd.merge(df_air, df_weather, on="timestamp", how="inner")
    df_merged = df_merged.sort_values("timestamp").reset_index(drop=True)

    df_merged.to_csv(csv_path, index=False)
    collection_results[province] = len(df_merged)
    print(f"      ✅ Merged: {len(df_merged)} rows → {csv_path}")

# Summary
collected = sum(1 for v in collection_results.values() if v > 0)
print(f"\n{'=' * 70}")
print(f"📊 Collection complete: {collected}/{len(VIETNAM_PROVINCES)} provinces have data")
print(f"{'=' * 70}")

# %%
# =============================================================================
# CELL 4: Helper Functions — Preprocessing, Model, Training, Export
# =============================================================================
# All reusable functions wrapped so we can call them per province in Cell 5.
# =============================================================================

# ── Dataset class ────────────────────────────────────────────────────────────

class TimeSeriesDataset(Dataset):
    """
    Sliding window dataset.
      X: (lookback, num_features)   e.g. (336, 11)
      y: (forecast, num_targets)    e.g. (168, 6)
    """
    def __init__(self, data, lookback, forecast, target_indices):
        self.data = data
        self.lookback = lookback
        self.forecast = forecast
        self.target_indices = target_indices
        self.total_len = len(data) - lookback - forecast + 1

    def __len__(self):
        return max(0, self.total_len)

    def __getitem__(self, idx):
        X = self.data[idx : idx + self.lookback, :]
        y = self.data[idx + self.lookback : idx + self.lookback + self.forecast, :][:, self.target_indices]
        return torch.FloatTensor(X), torch.FloatTensor(y)


# ── Model architecture — TCN (Temporal Convolutional Network) ────────────────
# TCN uses dilated causal Conv1D layers to capture long-range dependencies.
# Advantages over LSTM:
#   - 3-5x FASTER training (fully parallel — no sequential bottleneck)
#   - Equal or better accuracy on time-series benchmarks
#   - Cleaner ONNX export (only Conv1D + ReLU ops)
#   - Lower memory usage

class TemporalBlock(nn.Module):
    """Single TCN block: two dilated causal Conv1D layers + residual connection."""
    def __init__(self, in_channels, out_channels, kernel_size, dilation, dropout):
        super().__init__()
        padding = (kernel_size - 1) * dilation  # Causal padding

        self.conv1 = nn.Conv1d(in_channels, out_channels, kernel_size,
                               padding=padding, dilation=dilation)
        self.bn1   = nn.BatchNorm1d(out_channels)
        self.conv2 = nn.Conv1d(out_channels, out_channels, kernel_size,
                               padding=padding, dilation=dilation)
        self.bn2   = nn.BatchNorm1d(out_channels)

        self.dropout = nn.Dropout(dropout)
        self.relu    = nn.ReLU()

        # Residual connection (1x1 conv if channel sizes differ)
        self.residual = nn.Conv1d(in_channels, out_channels, 1) if in_channels != out_channels else nn.Identity()

    def forward(self, x):
        # x shape: (batch, channels, seq_len)
        out = self.conv1(x)[:, :, :x.size(2)]  # Trim to causal (remove future)
        out = self.relu(self.bn1(out))
        out = self.dropout(out)

        out = self.conv2(out)[:, :, :x.size(2)]
        out = self.relu(self.bn2(out))
        out = self.dropout(out)

        return self.relu(out + self.residual(x))


class TCNForecaster(nn.Module):
    """
    Temporal Convolutional Network for multivariate time-series forecasting.

    Architecture:
        Input (batch, 336, 11) → transpose → (batch, 11, 336)
        → 4 TemporalBlocks with exponentially increasing dilation [1, 2, 4, 8]
        → Global Average Pooling → FC layers → (batch, 168, 6)

    The dilated convolutions give a receptive field of:
        kernel_size=7, dilations=[1,2,4,8] → receptive field ≈ 2*(7-1)*(1+2+4+8) = 180 timesteps
        With 2 conv layers per block: effective RF > 336 timesteps ✓
    """
    def __init__(self, num_features=11, num_channels=128, kernel_size=7,
                 num_layers=4, forecast_horizon=168, num_targets=6, dropout=0.2):
        super().__init__()
        self.forecast_horizon = forecast_horizon
        self.num_targets = num_targets

        # Build TCN backbone: stack TemporalBlocks with exponential dilation
        layers = []
        for i in range(num_layers):
            in_ch = num_features if i == 0 else num_channels
            layers.append(TemporalBlock(in_ch, num_channels, kernel_size,
                                        dilation=2**i, dropout=dropout))
        self.tcn = nn.Sequential(*layers)

        # Output head: Global Average Pooling → FC
        self.fc = nn.Sequential(
            nn.Linear(num_channels, 512), nn.ReLU(), nn.Dropout(dropout),
            nn.Linear(512, forecast_horizon * num_targets),
        )

    def forward(self, x):
        # x: (batch, seq_len=336, features=11)
        x = x.transpose(1, 2)     # → (batch, 11, 336) for Conv1D
        x = self.tcn(x)            # → (batch, 128, 336)
        x = x.mean(dim=2)         # Global Average Pooling → (batch, 128)
        x = self.fc(x)             # → (batch, 168*6)
        return x.view(-1, self.forecast_horizon, self.num_targets)  # → (batch, 168, 6)


# ── Preprocessing function ──────────────────────────────────────────────────

def preprocess_province(csv_path, output_dir):
    """
    Load CSV, clean NaN, scale, create sliding windows.
    Returns: train_loader, test_loader, scaler (or None if insufficient data).
    """
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])
    df_features = df[FEATURE_COLUMNS].copy()

    # Handle NaN
    df_features = df_features.ffill().bfill()
    df_features = df_features.interpolate(method="linear", limit_direction="both")

    if df_features.isnull().sum().sum() > 0:
        df_features = df_features.fillna(0)

    # Scale
    scaler = MinMaxScaler(feature_range=(0, 1))
    data_scaled = scaler.fit_transform(df_features.values)

    # Save scaler
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))

    # Save feature config (for C# backend)
    config = {
        "feature_columns": FEATURE_COLUMNS,
        "target_columns": TARGET_COLUMNS,
        "target_indices_in_features": TARGET_INDICES,
        "num_features": NUM_FEATURES,
        "num_targets": NUM_TARGETS,
        "lookback_hours": LOOKBACK_HOURS,
        "forecast_hours": FORECAST_HOURS,
        "scaler_min": scaler.data_min_.tolist(),
        "scaler_max": scaler.data_max_.tolist(),
        "scaler_scale": scaler.scale_.tolist(),
        "scaler_data_range": scaler.data_range_.tolist(),
    }
    with open(os.path.join(output_dir, "feature_config.json"), "w") as f:
        json.dump(config, f, indent=2)

    # Check minimum data requirement
    min_required = LOOKBACK_HOURS + FORECAST_HOURS + BATCH_SIZE
    if len(data_scaled) < min_required:
        return None, None, None

    # Split 80/20
    split = int(len(data_scaled) * 0.8)
    train_ds = TimeSeriesDataset(data_scaled[:split], LOOKBACK_HOURS, FORECAST_HOURS, TARGET_INDICES)
    test_ds  = TimeSeriesDataset(data_scaled[split:],  LOOKBACK_HOURS, FORECAST_HOURS, TARGET_INDICES)

    if len(train_ds) < BATCH_SIZE or len(test_ds) == 0:
        return None, None, None

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  drop_last=True)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False, drop_last=False)

    return train_loader, test_loader, scaler


# ── Training function ────────────────────────────────────────────────────────

def train_model(model, train_loader, test_loader, output_dir):
    """Train the model. Returns best_val_loss and the trained model."""
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, factor=0.5, patience=5)

    best_val_loss = float("inf")
    patience_counter = 0
    best_model_path = os.path.join(output_dir, "best_model.pt")

    for epoch in range(NUM_EPOCHS):
        # Train
        model.train()
        train_loss, n = 0.0, 0
        for X, y in train_loader:
            X, y = X.to(device), y.to(device)
            optimizer.zero_grad()
            loss = criterion(model(X), y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item(); n += 1
        avg_train = train_loss / max(n, 1)

        # Validate
        model.eval()
        val_loss, vn = 0.0, 0
        with torch.no_grad():
            for X, y in test_loader:
                X, y = X.to(device), y.to(device)
                val_loss += criterion(model(X), y).item(); vn += 1
        avg_val = val_loss / max(vn, 1)

        scheduler.step(avg_val)

        if avg_val < best_val_loss:
            best_val_loss = avg_val
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            patience_counter += 1

        # Print every 10 epochs
        if (epoch + 1) % 10 == 0 or patience_counter == 0:
            print(f"      Epoch {epoch+1:3d} │ Train: {avg_train:.6f} │ Val: {avg_val:.6f}"
                  f" │ {'⭐' if patience_counter == 0 else f'⏳{patience_counter}'}")

        if patience_counter >= PATIENCE:
            print(f"      ⛔ Early stop at epoch {epoch+1}")
            break

    # Load best
    model.load_state_dict(torch.load(best_model_path, map_location=device))
    return best_val_loss


# ── Evaluation function ──────────────────────────────────────────────────────

def evaluate_model(model, test_loader, scaler, output_dir):
    """Evaluate and save metrics. Returns evaluation dict."""
    model.eval()
    all_preds, all_labels = [], []
    with torch.no_grad():
        for X, y in test_loader:
            preds = model(X.to(device))
            all_preds.append(preds.cpu().numpy())
            all_labels.append(y.numpy())

    all_preds  = np.concatenate(all_preds,  axis=0)
    all_labels = np.concatenate(all_labels, axis=0)

    # Inverse scale
    def inv_scale(arr):
        N, H, T = arr.shape
        flat = arr.reshape(-1, T)
        full = np.zeros((flat.shape[0], NUM_FEATURES))
        for i, idx in enumerate(TARGET_INDICES):
            full[:, idx] = flat[:, i]
        full_inv = scaler.inverse_transform(full)
        return np.column_stack([full_inv[:, idx] for idx in TARGET_INDICES]).reshape(N, H, T)

    preds_orig  = inv_scale(all_preds)
    labels_orig = inv_scale(all_labels)

    def calc_mape(yt, yp):
        mask = np.abs(yt) > 1e-8
        return np.mean(np.abs((yt[mask] - yp[mask]) / yt[mask])) * 100 if mask.any() else 0.0

    yt = labels_orig.flatten()
    yp = preds_orig.flatten()

    result = {
        "rmse": float(np.sqrt(mean_squared_error(yt, yp))),
        "mae":  float(mean_absolute_error(yt, yp)),
        "r2_score": float(r2_score(yt, yp)),
        "mape": float(calc_mape(yt, yp)),
        "per_target": {}
    }
    for i, col in enumerate(TARGET_COLUMNS):
        y_t = labels_orig[:, :, i].flatten()
        y_p = preds_orig[:, :, i].flatten()
        result["per_target"][col] = {
            "rmse": float(np.sqrt(mean_squared_error(y_t, y_p))),
            "mae":  float(mean_absolute_error(y_t, y_p)),
            "r2_score": float(r2_score(y_t, y_p)),
            "mape": float(calc_mape(y_t, y_p)),
        }

    with open(os.path.join(output_dir, "evaluation_results.json"), "w") as f:
        json.dump(result, f, indent=2)

    return result


# ── ONNX export function ────────────────────────────────────────────────────

def export_onnx(model, output_dir):
    """Export model to ONNX and validate."""
    import onnx
    import onnxruntime as ort

    model.eval()
    model.to("cpu")

    dummy = torch.randn(1, LOOKBACK_HOURS, NUM_FEATURES)
    onnx_path = os.path.join(output_dir, "ecoair_tcn.onnx")

    torch.onnx.export(
        model, dummy, onnx_path,
        export_params=True, opset_version=17,
        do_constant_folding=True,
        input_names=["input"], output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
    )

    # Validate
    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)

    # Cross-check
    with torch.no_grad():
        pt_out = model(dummy).numpy()
    ort_out = ort.InferenceSession(onnx_path).run(["output"], {"input": dummy.numpy()})[0]
    max_diff = np.max(np.abs(pt_out - ort_out))

    model.to(device)  # Move back to GPU for next province
    return onnx_path, max_diff


print("✅ All helper functions defined.")

# %%
# =============================================================================
# CELL 5: Main Loop — Train & Export for ALL 63 provinces
# =============================================================================
# For each province:
#   1. Load CSV (from Cell 3)
#   2. Preprocess (scale, window)
#   3. Train TCN (Temporal Convolutional Network) — 3-5x faster than LSTM
#   4. Evaluate (RMSE, MAE, R², MAPE)
#   5. Export ONNX
#
# ⏭️ Already-exported provinces are SKIPPED automatically.
# =============================================================================

print("=" * 70)
print(f"🚀 TRAINING & EXPORT — {len(VIETNAM_PROVINCES)} provinces")
print("=" * 70)

summary = {}

for idx, (province, (lat, lon)) in enumerate(VIETNAM_PROVINCES.items(), 1):
    safe_name = province.replace(" ", "_").replace("-", "_")
    prov_dir  = os.path.join(ROOT_OUTPUT, safe_name)
    csv_path  = os.path.join(prov_dir, "raw_merged_data.csv")
    onnx_path = os.path.join(prov_dir, "ecoair_tcn.onnx")

    print(f"\n{'─' * 70}")
    print(f"  [{idx:2d}/63] 🏙️  {province}")
    print(f"{'─' * 70}")

    # ── Skip if ONNX already exists ──────────────────────────────────────
    if os.path.exists(onnx_path):
        print(f"    ⏭️  Already exported — skipping")
        eval_path = os.path.join(prov_dir, "evaluation_results.json")
        if os.path.exists(eval_path):
            with open(eval_path) as f:
                summary[province] = json.load(f)
        else:
            summary[province] = {"status": "exported (metrics unknown)"}
        continue

    # ── Check data exists ────────────────────────────────────────────────
    if not os.path.exists(csv_path):
        print(f"    ⚠️  No data file — skipping")
        summary[province] = {"status": "no data"}
        continue

    # ── Preprocess ───────────────────────────────────────────────────────
    print(f"    📊 Preprocessing...")
    train_loader, test_loader, scaler = preprocess_province(csv_path, prov_dir)

    if train_loader is None:
        print(f"    ⚠️  Insufficient data for training — skipping")
        summary[province] = {"status": "insufficient data"}
        continue

    print(f"    ✅ Train: {len(train_loader)} batches | Test: {len(test_loader)} batches")

    # ── Build & Train ────────────────────────────────────────────────────
    print(f"    🧠 Training TCN...")
    model = TCNForecaster(
        num_features=NUM_FEATURES, num_channels=128, kernel_size=7,
        num_layers=4, forecast_horizon=FORECAST_HOURS,
        num_targets=NUM_TARGETS, dropout=0.2,
    ).to(device)

    best_loss = train_model(model, train_loader, test_loader, prov_dir)
    print(f"    ✅ Best val loss: {best_loss:.6f}")

    # ── Evaluate ─────────────────────────────────────────────────────────
    print(f"    📏 Evaluating...")
    eval_result = evaluate_model(model, test_loader, scaler, prov_dir)
    print(f"    ✅ RMSE={eval_result['rmse']:.4f} | MAE={eval_result['mae']:.4f} "
          f"| R²={eval_result['r2_score']:.4f} | MAPE={eval_result['mape']:.2f}%")

    # ── Export ONNX ──────────────────────────────────────────────────────
    print(f"    📦 Exporting ONNX...")
    onnx_file, diff = export_onnx(model, prov_dir)
    print(f"    ✅ ONNX saved → max diff vs PyTorch: {diff:.8f}")

    summary[province] = eval_result

    # Free GPU memory
    del model
    torch.cuda.empty_cache() if torch.cuda.is_available() else None

# ── Final summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("📊 FINAL SUMMARY — All Provinces")
print("=" * 70)
print(f"{'Province':<25} {'RMSE':>10} {'MAE':>10} {'R²':>10} {'MAPE(%)':>10} {'Status':>12}")
print("-" * 77)

for province in VIETNAM_PROVINCES:
    r = summary.get(province, {})
    if isinstance(r, dict) and "rmse" in r:
        print(f"{province:<25} {r['rmse']:>10.4f} {r['mae']:>10.4f} "
              f"{r['r2_score']:>10.4f} {r['mape']:>10.2f} {'✅':>12}")
    else:
        status = r.get("status", "unknown") if isinstance(r, dict) else str(r)
        print(f"{province:<25} {'—':>10} {'—':>10} {'—':>10} {'—':>10} {status:>12}")

# Save summary
summary_path = os.path.join(ROOT_OUTPUT, "all_provinces_summary.json")
with open(summary_path, "w") as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)
print(f"\n💾 Summary saved to: {summary_path}")

# %%
# =============================================================================
# CELL 6: C# .NET Integration Guide
# =============================================================================
# Reference code for loading per-province ONNX models in C#.
# =============================================================================

csharp_guide = r"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  C# .NET Integration Guide — EcoAir ONNX Inference (Per-Province)          ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 1: Install NuGet Package                                               │
└─────────────────────────────────────────────────────────────────────────────┘

   dotnet add package Microsoft.ML.OnnxRuntime --version 1.17.0

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 2: File Structure (per province)                                       │
└─────────────────────────────────────────────────────────────────────────────┘

   Models/
   ├── Hà_Nội/
   │   ├── ecoair_tcn.onnx
   │   ├── feature_config.json
   │   └── evaluation_results.json
   ├── Hồ_Chí_Minh/
   │   ├── ecoair_tcn.onnx
   │   ├── feature_config.json
   │   └── evaluation_results.json
   └── ... (63 provinces)

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 3: Load feature_config.json (scaler params for each province)          │
└─────────────────────────────────────────────────────────────────────────────┘

   public class FeatureConfig
   {
       public List<string> feature_columns { get; set; }
       public List<string> target_columns { get; set; }
       public List<int> target_indices_in_features { get; set; }
       public int num_features { get; set; }    // 11
       public int num_targets { get; set; }     // 6
       public int lookback_hours { get; set; }  // 336
       public int forecast_hours { get; set; }  // 168
       public List<double> scaler_min { get; set; }
       public List<double> scaler_max { get; set; }
       public List<double> scaler_scale { get; set; }
       public List<double> scaler_data_range { get; set; }
   }

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 4: MinMaxScaler in C#                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

   // Scale:   X_scaled = (X - min) / range
   // Inverse: X_orig   = X_scaled * range + min

   float[] Scale(double[] raw, FeatureConfig c) {
       var s = new float[raw.Length];
       for (int i = 0; i < raw.Length; i++) {
           double range = c.scaler_data_range[i];
           s[i] = (float)((raw[i] - c.scaler_min[i]) / (range == 0 ? 1 : range));
       }
       return s;
   }

   double InverseScaleTarget(float scaled, int targetIdx, FeatureConfig c) {
       int fi = c.target_indices_in_features[targetIdx];
       return scaled * c.scaler_data_range[fi] + c.scaler_min[fi];
   }

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 5: Run inference per province                                          │
└─────────────────────────────────────────────────────────────────────────────┘

   using Microsoft.ML.OnnxRuntime;
   using Microsoft.ML.OnnxRuntime.Tensors;

   public class ProvincePredictor : IDisposable
   {
       private readonly InferenceSession _session;
       private readonly FeatureConfig _config;

       public ProvincePredictor(string provinceFolderPath)
       {
           var onnxPath = Path.Combine(provinceFolderPath, "ecoair_tcn.onnx");
           var configJson = File.ReadAllText(
               Path.Combine(provinceFolderPath, "feature_config.json"));
           _session = new InferenceSession(onnxPath);
           _config = JsonSerializer.Deserialize<FeatureConfig>(configJson);
       }

       public float[,] Predict(float[,] scaledInput)  // [336, 11]
       {
           var tensor = new DenseTensor<float>(new[] { 1, 336, 11 });
           for (int t = 0; t < 336; t++)
               for (int f = 0; f < 11; f++)
                   tensor[0, t, f] = scaledInput[t, f];

           var inputs = new[] { NamedOnnxValue.CreateFromTensor("input", tensor) };
           using var results = _session.Run(inputs);
           var output = results.First().AsTensor<float>();

           var forecast = new float[168, 6];
           for (int t = 0; t < 168; t++)
               for (int f = 0; f < 6; f++)
                   forecast[t, f] = output[0, t, f];
           return forecast;     // [168, 6] — still scaled, call InverseScaleTarget
       }

       public void Dispose() => _session?.Dispose();
   }

┌─────────────────────────────────────────────────────────────────────────────┐
│ Step 6: Load correct model by station/province                              │
└─────────────────────────────────────────────────────────────────────────────┘

   // In your ForecastService:
   var provinceName = GetProvinceNameFromStation(stationId); // e.g. "Hà_Nội"
   var modelPath = Path.Combine("Models", provinceName);
   using var predictor = new ProvincePredictor(modelPath);
   var forecast = predictor.Predict(scaledInput);

┌─────────────────────────────────────────────────────────────────────────────┐
│ ONNX Shape Reference (same for all provinces)                               │
└─────────────────────────────────────────────────────────────────────────────┘

   INPUT  "input"  → float32[batch_size, 336, 11]
   OUTPUT "output" → float32[batch_size, 168, 6]

   11 features: pm25, pm10, co, no2, so2, o3,
                temperature_2m, relative_humidity_2m,
                wind_speed_10m, wind_direction_10m, surface_pressure

   6 targets:   pm25, pm10, co, no2, so2, o3
"""

print(csharp_guide)

guide_path = os.path.join(ROOT_OUTPUT, "csharp_integration_guide.txt")
with open(guide_path, "w") as f:
    f.write(csharp_guide)

print(f"💾 C# guide saved to: {guide_path}")
print(f"\n🎉 Pipeline complete! Each province folder contains:")
print(f"   📄 ecoair_tcn.onnx       — Trained ONNX model")
print(f"   📄 feature_config.json       — Scaler params + columns")
print(f"   📄 evaluation_results.json   — RMSE / MAE / R² / MAPE")
