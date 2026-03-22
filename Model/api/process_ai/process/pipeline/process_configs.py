from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ProcessConfig:
    process_key: str
    process_code: str
    process_label: str
    data_dir: str
    registry_dir: str
    model_dir: str
    report_dir: str


PROCESS_CONFIGS = {
    "trucking": ProcessConfig(
        process_key="trucking",
        process_code="TRUCKING_DELIVERY_FLOW",
        process_label="TRUCKING",
        data_dir="data/synth_optimal_3process_v1",
        registry_dir="data/synth_optimal_3process_v1/registry",
        model_dir="model/process_models",
        report_dir="reports/trucking",
    ),
    "warehouse": ProcessConfig(
        process_key="warehouse",
        process_code="WAREHOUSE_FULFILLMENT",
        process_label="WAREHOUSE",
        data_dir="data/synth_optimal_3process_v1",
        registry_dir="data/synth_optimal_3process_v1/registry",
        model_dir="model/process_models",
        report_dir="reports/warehouse",
    ),
    "customs": ProcessConfig(
        process_key="customs",
        process_code="IMPORT_CUSTOMS_CLEARANCE",
        process_label="CUSTOMS",
        data_dir="data/synth_optimal_3process_v1",
        registry_dir="data/synth_optimal_3process_v1/registry",
        model_dir="model/process_models",
        report_dir="reports/customs",
    ),
}


def get_process_config(process_key: str) -> ProcessConfig:
    process_key = str(process_key).strip().lower()
    if process_key not in PROCESS_CONFIGS:
        raise ValueError(f"Unknown process_key: {process_key}")
    return PROCESS_CONFIGS[process_key]


def ensure_report_dir(cfg: ProcessConfig) -> Path:
    out_dir = Path(cfg.report_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir