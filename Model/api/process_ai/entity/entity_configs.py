# api/process_ai/entity/entity_configs.py
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from ..core.task_spec import TaskSpec


PROJECT_ROOT = Path(__file__).resolve().parents[3]

ENTITY_TASK_CONFIGS: Dict[str, Dict[str, Any]] = {
    "driver_ai": {
        "task_key": "driver_ai",
        "task_kind": "entity",
        "artifact_dir": PROJECT_ROOT / "model" / "entity_models" / "driver",
        "label_column": "target_next_3m_incident",
        "model_candidates": ["logreg", "rf", "hgb"],
        "threshold_policy": "fixed_0_45",
        "validation_months": 3,
        "test_months": 6,
        "random_state": 42,
        "legacy_model_path": None,
        "metadata": {
            "entity_name": "driver",
            "builder_name": "driver",
        },
    },
    "fleet_ai": {
        "task_key": "fleet_ai",
        "task_kind": "entity",
        "artifact_dir": PROJECT_ROOT / "model" / "entity_models" / "fleet",
        "label_column": "target_next_3m_emergency_maintenance",
        "model_candidates": ["logreg", "rf", "hgb"],
        "threshold_policy": "fixed_0_5",
        "validation_months": 3,
        "test_months": 6,
        "random_state": 42,
        "legacy_model_path": None,
        "metadata": {
            "entity_name": "fleet",
            "builder_name": "fleet",
        },
    },
    "ops_ai": {
        "task_key": "ops_ai",
        "task_kind": "entity",
        "artifact_dir": PROJECT_ROOT / "model" / "entity_models" / "ops",
        "label_column": "target_next_3m_severe_ops_disruption",
        "model_candidates": ["logreg", "rf", "hgb"],
        "threshold_policy": "fixed_0_5",
        "validation_months": 3,
        "test_months": 6,
        "random_state": 42,
        "legacy_model_path": None,
        "metadata": {
            "entity_name": "ops",
            "builder_name": "ops",
        },
    },
}


def get_entity_task_spec(task_key: str) -> TaskSpec:
    if task_key not in ENTITY_TASK_CONFIGS:
        raise ValueError(f"Không tìm thấy entity config cho task_key={task_key}")

    cfg = ENTITY_TASK_CONFIGS[task_key].copy()
    return TaskSpec(**cfg)


def list_entity_task_keys():
    return list(ENTITY_TASK_CONFIGS.keys())