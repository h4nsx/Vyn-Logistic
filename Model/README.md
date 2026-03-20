# Logistics AI

A unified AI system for anomaly detection, risk scoring, and monitoring across logistics workflows and operational entities.

---

## 1. Project Overview

This project is organized around two main AI branches:

### Process AI
Process-level anomaly detection and bottleneck analysis for three logistics workflows:

- Trucking Delivery Flow
- Warehouse Fulfillment
- Import Customs Clearance

Main goals:

- detect abnormal cases
- identify bottleneck steps
- compute process risk scores
- monitor drift over time
- support retraining decisions

### Entity AI
Entity-level risk modeling for operational units:

- Driver
- Fleet
- Ops

Main goals:

- predict risk for each entity record
- support single and batch inference
- provide exploratory analysis and training notebooks

---

## 2. Architecture Summary

The system follows a shared-core architecture:

- shared logic is placed in reusable modules
- workflow-specific logic is organized by process
- notebook reporting is separated from API runtime
- cross-process monitoring is handled in dedicated shared notebooks

The project is mainly divided into:

- `api/process_ai/core/` for generic shared engines
- `api/process_ai/entity/` for entity-level modeling
- `api/process_ai/process/` for process-level modeling
- `notebooks/process_ai/` for workflow notebooks
- `reports/` for generated reporting artifacts
- `model/` for saved model artifacts

---

## 3. Project Structure

```text
logistics_AI/
├── api/
│   ├── __init__.py
│   ├── app.py
│   ├── streamlit_app.py
│   └── process_ai/
│       ├── __init__.py
│       ├── core/
│       ├── entity/
│       └── process/
├── data/
│   ├── archive/
│   └── synth_optimal_3process_v1/
├── model/
│   ├── entity_models/
│   ├── process_models/
│   └── process_models_experiments/
├── notebooks/
│   ├── entity_ai/
│   └── process_ai/
├── outputs/
├── reports/
├── test_case2/
├── README.md
├── render.yaml
├── requirements.txt
└── requirements-render.txt
4. Main Folders

api/

Runtime layer of the project.
 • app.py: FastAPI entrypoint
 • streamlit_app.py: Streamlit demo app
 • process_ai/: shared AI modules for entity and process workflows

api/process_ai/core/

Generic shared engines.

Typical responsibilities:
 • common inference runtime helpers
 • task definitions
 • reusable training engines

api/process_ai/entity/

Entity AI branch.

Main files:
 • entity_configs.py: entity task configuration
 • inference.py: entity inference functions
 • trainers.py: entity training orchestration
 • builders/: entity-specific feature builders

api/process_ai/process/core/

Core modules for process modeling.

Main files:
 • features.py: build case-level features from event logs
 • inference.py: process inference helpers
 • plotting.py: shared plotting functions
 • registry_loader.py: load process registry files
 • reporting.py: build process reports
 • retrain_utils.py: drift and retraining helpers
 • train.py: process model training logic
 • validate.py: event-log validation

api/process_ai/process/pipeline/

Pipeline orchestration layer.

Main files:
 • notebook_helpers.py: notebook utility functions
 • orchestrator.py: high-level training orchestration
 • process_configs.py: process configuration mapping

data/

Project datasets.
 • archive/: archived or old datasets
 • synth_optimal_3process_v1/: main synthetic process dataset

model/

Saved model artifacts.

model/entity_models/
Entity model artifacts for:
 • driver
 • fleet
 • ops

Typical files inside each entity folder:
 • model.pkl
 • metrics.json
 • feature_columns.json
 • threshold_sweep.csv
 • confusion_matrix.png
 • feature_importance.png
 • *_eda_panel.png

model/process_models/
Final process model artifacts for:
 • TRUCKING_DELIVERY_FLOW
 • WAREHOUSE_FULFILLMENT
 • IMPORT_CUSTOMS_CLEARANCE

model/process_models_experiments/
Experimental process artifacts used during comparison or tuning.

notebooks/entity_ai/

Entity AI notebooks.
 • driver_ai.ipynb
 • fleet_ai.ipynb
 • ops_ai.ipynb

These notebooks are mainly used for exploratory analysis, model development, and artifact generation.

notebooks/process_ai/

Main notebook branch for Process AI.

trucking/
 • 01_data_and_features.ipynb
 • 02_train_and_validate.ipynb
 • 03_retrain_and_monitoring.ipynb

warehouse/
 • 01_data_and_features.ipynb
 • 02_train_and_validate.ipynb
 • 03_retrain_and_monitoring.ipynb

customs/
 • 01_data_and_features.ipynb
 • 02_train_and_validate.ipynb
 • 03_retrain_and_monitoring.ipynb

share/
Cross-process notebooks:
 • 01_cross_process_summary_and_reporting.ipynb
 • 02_cross_process_monitoring_and_retrain.ipynb

outputs/

Lightweight exported runtime outputs.

reports/

Generated process and cross-process reports.
 • reports/trucking/
 • reports/warehouse/
 • reports/customs/
 • reports/cross_process/

test_case2/

Sample batch CSV files for quick testing.
• events_trucking_250cases.csv
 • events_warehouse_250cases.csv
 • events_customs_250cases.csv

⸻

5. Recommended Workflow

Process AI workflow

For each process, run notebooks in this order:
 1. 01_data_and_features.ipynb
 2. 02_train_and_validate.ipynb
 3. 03_retrain_and_monitoring.ipynb

After all three workflows are ready, run:
 4. share/01_cross_process_summary_and_reporting.ipynb
 5. share/02_cross_process_monitoring_and_retrain.ipynb

Entity AI workflow

Run the corresponding notebook depending on the entity:
 • driver_ai.ipynb
 • fleet_ai.ipynb
 • ops_ai.ipynb

⸻

6. API Layer

Main API entrypoint:
 • api/app.py

Available API groups:

General
 • GET /
 • GET /health

Entity
 • GET /entity/info
 • POST /entity/driver/predict
 • POST /entity/fleet/predict
 • POST /entity/ops/predict
 • POST /entity/driver/predict_batch
 • POST /entity/fleet/predict_batch
 • POST /entity/ops/predict_batch

Process
 • GET /process/info
 • POST /process/analyze_case_numeric
 • POST /process/analyze_case_file_numeric
 • POST /process/analyze_batch_file_numeric

⸻

7. Notes
 • __init__.py files may look empty, but they are kept to preserve package structure and stable imports.
 • notebooks/process_ai/ is the main notebook branch for process workflows.
 • model/process_models/ stores final artifacts, while model/process_models_experiments/ stores experiment outputs.
 • Cross-process reporting is generated from the notebooks under notebooks/process_ai/share/.

⸻

8. Current Status

The current architecture is based on:
 • shared AI core
 • separated entity and process branches
 • process-specific notebook surfaces
 • cross-process monitoring and reporting
 • API runtime aligned with the new structure