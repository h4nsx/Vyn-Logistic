from __future__ import annotations

from typing import Any, Dict, Protocol

from .task_spec import TaskSpec, TrainingBundle, TrainingResult


class TrainerAdapter(Protocol):
    """
    Giao diện tối thiểu để mọi trainer adapter phải tuân theo.
    """

    def build_bundle(self, spec: TaskSpec) -> TrainingBundle:
        ...

    def fit(self, bundle: TrainingBundle, spec: TaskSpec) -> Any:
        ...

    def evaluate(self, fitted: Any, bundle: TrainingBundle, spec: TaskSpec) -> Dict[str, Any]:
        ...

    def save_artifacts(
        self,
        fitted: Any,
        bundle: TrainingBundle,
        metrics: Dict[str, Any],
        spec: TaskSpec,
    ) -> Dict[str, str]:
        ...


def run_training_pipeline(
    spec: TaskSpec,
    trainer: TrainerAdapter,
    save_artifacts: bool = True,
    verbose: bool = True,
) -> TrainingResult:
    """
    Engine train dùng chung.
    Không cần biết task là process hay entity.
    Chỉ cần adapter đúng chuẩn.
    """
    spec.ensure_dirs()

    if verbose:
        print(f"=== RUN TRAINING PIPELINE: {spec.task_key} ({spec.task_kind}) ===")

    bundle = trainer.build_bundle(spec)

    if verbose:
        print("=== FIT MODEL ===")

    fitted = trainer.fit(bundle, spec)

    if verbose:
        print("=== EVALUATE MODEL ===")

    metrics = trainer.evaluate(fitted, bundle, spec)

    artifact_paths: Dict[str, str] = {}
    if save_artifacts:
        if verbose:
            print("=== SAVE ARTIFACTS ===")
        artifact_paths = trainer.save_artifacts(fitted, bundle, metrics, spec)

    return TrainingResult(
        spec=spec,
        bundle=bundle,
        fitted=fitted,
        metrics=metrics,
        artifact_paths=artifact_paths,
    )