import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, Optional

from api.process_ai.process.process_configs import ProcessConfig, get_process_config, ensure_report_dir


def find_project_root(start: Optional[Path] = None) -> Path:
    cur = (start or Path.cwd()).resolve()
    for p in [cur, *cur.parents]:
        if (p / "requirements.txt").exists() and (p / "api").exists():
            return p
    return cur


def setup_notebook_env(start: Optional[Path] = None) -> Path:
    project_root = find_project_root(start)
    os.chdir(project_root)

    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    return project_root


def load_json_file(path: str | Path) -> Dict[str, Any]:
    path = Path(path)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_train_summary(model_dir: str | Path, process_code: str) -> Dict[str, Any]:
    model_dir = Path(model_dir)
    summary_path = model_dir / process_code / "train_summary.json"
    return load_json_file(summary_path)


def get_include_context_numeric(model_dir: str | Path, process_code: str) -> bool:
    train_summary = load_train_summary(model_dir, process_code)
    return bool(train_summary.get("include_context_numeric", False))


def get_notebook_context(process_key: str) -> Dict[str, Any]:
    project_root = setup_notebook_env()
    cfg: ProcessConfig = get_process_config(process_key)
    report_dir = ensure_report_dir(cfg)

    return {
        "project_root": project_root,
        "cfg": cfg,
        "report_dir": report_dir,
        "events_path": Path(cfg.data_dir) / "events.csv",
        "cases_context_path": Path(cfg.data_dir) / "cases_context.csv",
        "model_dir": Path(cfg.model_dir),
        "registry_dir": Path(cfg.registry_dir),
        "include_context_numeric": get_include_context_numeric(cfg.model_dir, cfg.process_code),
    }