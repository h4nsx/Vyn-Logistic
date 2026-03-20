from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List

from ..core.train import train_process_model
from .process_configs import PROCESS_CONFIGS, ProcessConfig, get_process_config

from pathlib import Path

def _find_project_root(start: Path | None = None) -> Path:
    start = (start or Path.cwd()).resolve()
    for p in [start, *start.parents]:
        if (p / "api").exists() and (p / "model").exists():
            return p
    raise FileNotFoundError("Could not find project root")

def _to_abs_path(path_like: str | Path, project_root: Path) -> str:
    p = Path(path_like)
    return str(p if p.is_absolute() else (project_root / p).resolve())

@dataclass(frozen=True)
class TrainParams:
    events_filename: str = "events.csv"
    context_filename: str = "cases_context.csv"
    include_context_numeric: bool = False
    n_estimators: int = 200
    contamination: float = 0.06
    random_state: int = 42
    allow_unknown_steps: bool = False


PROCESS_CODE_TO_KEY = {
    cfg.process_code: key
    for key, cfg in PROCESS_CONFIGS.items()
}


def list_available_processes() -> List[str]:
    return list(PROCESS_CONFIGS.keys())


def get_process_config_by_code(process_code: str) -> ProcessConfig:
    process_code = str(process_code).strip().upper()
    if process_code not in PROCESS_CODE_TO_KEY:
        raise ValueError(f"Unknown process_code: {process_code}")
    process_key = PROCESS_CODE_TO_KEY[process_code]
    return get_process_config(process_key)


def build_train_kwargs(
    cfg: ProcessConfig,
    params: TrainParams | None = None,
    **overrides: Any,
) -> Dict[str, Any]:
    if params is None:
        params = TrainParams()

    project_root = _find_project_root()

    train_kwargs: Dict[str, Any] = {
        "data_dir": _to_abs_path(cfg.data_dir, project_root),
        "registry_dir": _to_abs_path(cfg.registry_dir, project_root),
        "model_root_dir": _to_abs_path(cfg.model_dir, project_root),
        "process_code": cfg.process_code,
        **asdict(params),
    }

    if "data_dir" in overrides:
        overrides["data_dir"] = _to_abs_path(overrides["data_dir"], project_root)
    if "registry_dir" in overrides:
        overrides["registry_dir"] = _to_abs_path(overrides["registry_dir"], project_root)
    if "model_root_dir" in overrides:
        overrides["model_root_dir"] = _to_abs_path(overrides["model_root_dir"], project_root)

    train_kwargs.update(overrides)
    return train_kwargs


def train_process_from_key(
    process_key: str,
    params: TrainParams | None = None,
    **overrides: Any,
) -> Dict[str, Any]:
    """
    Train 1 process theo process_key, ví dụ:
    - trucking
    - warehouse
    - customs
    """
    cfg = get_process_config(process_key)
    train_kwargs = build_train_kwargs(cfg, params=params, **overrides)
    result = train_process_model(**train_kwargs)

    return {
        "process_key": cfg.process_key,
        "process_code": cfg.process_code,
        "process_label": cfg.process_label,
        "config": {
            "data_dir": cfg.data_dir,
            "registry_dir": cfg.registry_dir,
            "model_dir": cfg.model_dir,
            "report_dir": cfg.report_dir,
        },
        "train_kwargs": train_kwargs,
        "train_summary": result,
    }


def train_process_from_code(
    process_code: str,
    params: TrainParams | None = None,
    **overrides: Any,
) -> Dict[str, Any]:
    """
    Train 1 process theo process_code, ví dụ:
    - TRUCKING_DELIVERY_FLOW
    - WAREHOUSE_FULFILLMENT
    - IMPORT_CUSTOMS_CLEARANCE
    """
    cfg = get_process_config_by_code(process_code)
    return train_process_from_key(cfg.process_key, params=params, **overrides)


def train_all_processes(
    process_keys: Iterable[str] | None = None,
    params: TrainParams | None = None,
stop_on_error: bool = False,
    **overrides: Any,
) -> List[Dict[str, Any]]:
    """
    Train nhiều process một lượt.
    """
    if process_keys is None:
        process_keys = list_available_processes()

    results: List[Dict[str, Any]] = []

    for process_key in process_keys:
        try:
            res = train_process_from_key(
                process_key=process_key,
                params=params,
                **overrides,
            )
            res["status"] = "ok"
            results.append(res)
        except Exception as e:
            err = {
                "process_key": process_key,
                "status": "error",
                "error": str(e),
            }
            results.append(err)
            if stop_on_error:
                raise

    return results


def resolve_artifact_dir(process_key: str) -> Path:
    cfg = get_process_config(process_key)
    return Path(cfg.model_dir) / cfg.process_code


def get_default_train_params() -> TrainParams:
    return TrainParams()