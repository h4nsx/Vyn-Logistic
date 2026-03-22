from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List


@dataclass(frozen=True)
class StepDef:
    step_code: str
    order_index: int


def load_registry(registry_dir: str | Path, process_code: str) -> Dict[str, Any]:
    """
    Loads registry JSON for a process_code.
    Expected file: <registry_dir>/<process_code>.json
    JSON format:
      { "process_code": "...", "steps": [{"step_code": "...", "order_index": 1}, ...] }
    """
    registry_dir = Path(registry_dir)
    path = registry_dir / f"{process_code}.json"
    if not path.exists():
        raise FileNotFoundError(f"Registry file not found: {path}")

    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("process_code") != process_code:
        raise ValueError(
            f"Registry process_code mismatch. Expected={process_code}, got={data.get('process_code')}"
        )

    steps = data.get("steps", [])
    if not steps:
        raise ValueError(f"Registry has no steps: {path}")

    # Normalize and sort by order_index
    norm_steps: List[StepDef] = []
    for s in steps:
        if "step_code" not in s or "order_index" not in s:
            raise ValueError(f"Invalid step entry in registry: {s}")
        norm_steps.append(StepDef(step_code=str(s["step_code"]), order_index=int(s["order_index"])))

    norm_steps.sort(key=lambda x: x.order_index)

    return {
        "process_code": process_code,
        "steps": [{"step_code": s.step_code, "order_index": s.order_index} for s in norm_steps],
        "path": str(path),
    }


def get_step_codes(registry: Dict[str, Any]) -> List[str]:
    return [s["step_code"] for s in registry["steps"]]
