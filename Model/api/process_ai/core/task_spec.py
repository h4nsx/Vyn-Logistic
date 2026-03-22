from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional


TaskKind = Literal["process", "entity"]


@dataclass
class TaskSpec:
    """
    Mô tả một task train/inference cụ thể.
    """

    task_key: str
    task_kind: TaskKind
    artifact_dir: Path
    label_column: str

    model_candidates: List[str] = field(default_factory=list)
    threshold_policy: str = "balanced_guardrails"
    validation_months: int = 3
    test_months: int = 6
    random_state: int = 42

    # Tùy chọn tương thích với cấu trúc cũ
    legacy_model_path: Optional[Path] = None

    # Metadata tự do cho từng bài toán
    metadata: Dict[str, Any] = field(default_factory=dict)

    def ensure_dirs(self) -> None:
        self.artifact_dir.mkdir(parents=True, exist_ok=True)
        if self.legacy_model_path is not None:
            self.legacy_model_path.parent.mkdir(parents=True, exist_ok=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_key": self.task_key,
            "task_kind": self.task_kind,
            "artifact_dir": str(self.artifact_dir),
            "label_column": self.label_column,
            "model_candidates": list(self.model_candidates),
            "threshold_policy": self.threshold_policy,
            "validation_months": self.validation_months,
            "test_months": self.test_months,
            "random_state": self.random_state,
            "legacy_model_path": str(self.legacy_model_path) if self.legacy_model_path else None,
            "metadata": dict(self.metadata),
        }


@dataclass
class TrainingBundle:
    """
    Gói dữ liệu đầu vào cho một task train.
    """

    full_df: Any
    feature_columns: List[str]
    target_column: str

    subtrain_df: Any
    validation_df: Any
    train_df: Any
    test_df: Any

    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TrainingResult:
    """
    Kết quả chạy 2 train chung.
    """

    spec: TaskSpec
    bundle: TrainingBundle
    fitted: Any
    metrics: Dict[str, Any]
    artifact_paths: Dict[str, str] = field(default_factory=dict)