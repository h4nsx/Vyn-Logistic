import json
from pathlib import Path
from typing import Any, Dict, Optional

import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(
    page_title="Trucking Summary Dashboard",
    page_icon="📊",
    layout="wide",
)

DEFAULT_JSON_PATH = Path("outputs/latest_trucking_summary.json")


def safe_get(dct: Dict[str, Any], key: str, default: Any = None) -> Any:
    return dct.get(key, default)


@st.cache_data(show_spinner=False)
def load_summary(json_bytes: bytes) -> Dict[str, Any]:
    return json.loads(json_bytes.decode("utf-8"))


def normalize_summary(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    result = data.get("trucking_result")
    if not isinstance(result, dict):
        return None

    process_specific = result.get("process_specific", {}) or {}

    case_count = safe_get(result, "case_count", 0)
    anomaly_count = safe_get(result, "anomaly_count", 0)
    normal_count = max(case_count - anomaly_count, 0)

    normalized = {
        "process_id": safe_get(result, "process_id"),
        "case_count": case_count,
        "avg_risk_score": safe_get(result, "avg_risk_score", 0.0),
        "avg_anomaly_score": safe_get(result, "avg_anomaly_score", 0.0),
        "anomaly_count": anomaly_count,
        "anomaly_rate": safe_get(result, "anomaly_rate", 0.0),
        "normal_count": normal_count,
        "dominant_step_index": safe_get(result, "dominant_step_index"),
        "dominant_step_case_count": safe_get(result, "dominant_step_case_count", 0),
        "dominant_step_case_rate": safe_get(result, "dominant_step_case_rate", 0.0),
        "avg_dominant_step_duration_min": safe_get(result, "avg_dominant_step_duration_min", 0.0),
        "avg_total_process_time_min": safe_get(result, "avg_total_process_time_min", 0.0),
        "avg_transit_delay_min": safe_get(process_specific, "avg_transit_delay_min", 0.0),
        "avg_hub_touch_count": safe_get(process_specific, "avg_hub_touch_count", 0.0),
        "avg_delivery_attempt_count": safe_get(process_specific, "avg_delivery_attempt_count", 0.0),
    }
    return normalized


def status_from_risk(avg_risk_score: float) -> str:
    if avg_risk_score >= 70:
        return "High Risk"
    if avg_risk_score >= 40:
        return "Moderate Risk"
    return "Low Risk"


st.title("📊 Trucking Summary Dashboard")
st.caption("Dashboard này chỉ đọc file JSON tổng hợp mới nhất do model tạo ra.")

with st.sidebar:
    st.header("Nguồn dữ liệu")
    uploaded_file = st.file_uploader(
        "Chọn file JSON tổng hợp",
        type=["json"],
        help="Nếu không chọn file, app sẽ tự đọc outputs/latest_trucking_summary.json",
    )
    use_default = st.toggle("Dùng đường dẫn mặc định", value=uploaded_file is None)
    custom_path = st.text_input("Hoặc nhập đường dẫn JSON", value=str(DEFAULT_JSON_PATH))
    refresh = st.button("🔄 Tải lại dữ liệu", use_container_width=True)

if refresh:
    st.cache_data.clear()
    st.rerun()

json_bytes: Optional[bytes] = None
source_label = ""

if uploaded_file is not None and not use_default:
    json_bytes = uploaded_file.getvalue()
    source_label = f"Uploaded file: {uploaded_file.name}"
elif Path(custom_path).exists():
    json_bytes = Path(custom_path).read_bytes()
    source_label = f"Local path: {custom_path}"
elif DEFAULT_JSON_PATH.exists():
    json_bytes = DEFAULT_JSON_PATH.read_bytes()
    source_label = f"Default path: {DEFAULT_JSON_PATH}"

if json_bytes is None:
    st.warning("Chưa tìm thấy file JSON tổng hợp. Hãy chạy model trước để tạo file latest_trucking_summary.json hoặc upload file JSON.")
    st.stop()

try:
    data = load_summary(json_bytes)
except json.JSONDecodeError:
    st.error("File JSON không hợp lệ. Hãy kiểm tra lại nội dung file đầu ra của model.")
    st.stop()

summary = normalize_summary(data)
if summary is None:
    st.error("JSON không có khóa 'trucking_result' đúng định dạng mong đợi.")
    st.json(data)
    st.stop()

st.success(f"Đã tải dữ liệu thành công. {source_label}")

col_a, col_b = st.columns([2, 1])
with col_a:
    st.subheader("Tổng quan")
with col_b:
    st.metric("Risk Status", status_from_risk(float(summary["avg_risk_score"])), border=True)

kpi1, kpi2, kpi3, kpi4, kpi5 = st.columns(5)
kpi1.metric("Case Count", f"{summary['case_count']}", border=True)
kpi2.metric("Avg Risk Score", f"{summary['avg_risk_score']:.2f}", border=True)
kpi3.metric("Avg Anomaly Score", f"{summary['avg_anomaly_score']:.4f}", border=True)
kpi4.metric("Anomaly Count", f"{summary['anomaly_count']}", border=True)
kpi5.metric("Anomaly Rate", f"{summary['anomaly_rate'] * 100:.2f}%", border=True)

left, right = st.columns(2)

with left:
    anomaly_df = pd.DataFrame(
        {
            "Category": ["Anomaly", "Normal"],
            "Count": [summary["anomaly_count"], summary["normal_count"]],
        }
    )
    fig_anomaly = px.pie(
        anomaly_df,
        names="Category",
        values="Count",
        hole=0.55,
        title="Anomaly vs Normal",
    )
    st.plotly_chart(fig_anomaly, use_container_width=True)

with right:
    time_df = pd.DataFrame(
        {
            "Metric": ["Dominant Step Duration", "Total Process Time"],
            "Minutes": [
                summary["avg_dominant_step_duration_min"],
                summary["avg_total_process_time_min"],
            ],
        }
    )
    fig_time = px.bar(
        time_df,
        x="Metric",
        y="Minutes",
        title="Average Time Metrics (minutes)",
        text="Minutes",
    )
    fig_time.update_traces(texttemplate="%{text:.2f}", textposition="outside")
    st.plotly_chart(fig_time, use_container_width=True)

st.subheader("Bottleneck Summary")
b1, b2, b3 = st.columns(3)
b1.metric("Dominant Step Index", f"{summary['dominant_step_index']}", border=True)
b2.metric("Dominant Step Case Count", f"{summary['dominant_step_case_count']}", border=True)
b3.metric("Dominant Step Case Rate", f"{summary['dominant_step_case_rate'] * 100:.2f}%", border=True)

process_df = pd.DataFrame(
    {
        "Metric": [
            "Avg Transit Delay (min)",
            "Avg Hub Touch Count",
            "Avg Delivery Attempt Count",
        ],
        "Value": [
            summary["avg_transit_delay_min"],
            summary["avg_hub_touch_count"],
            summary["avg_delivery_attempt_count"],
        ],
    }
)

fig_process = px.bar(
    process_df,
    x="Metric",
    y="Value",
    title="Trucking Process-Specific Metrics",
    text="Value",
)
fig_process.update_traces(texttemplate="%{text:.2f}", textposition="outside")
st.plotly_chart(fig_process, use_container_width=True)

st.subheader("Summary Table")
display_df = pd.DataFrame(
    [
        ("process_id", summary["process_id"]),
        ("case_count", summary["case_count"]),
        ("avg_risk_score", summary["avg_risk_score"]),
        ("avg_anomaly_score", summary["avg_anomaly_score"]),
        ("anomaly_count", summary["anomaly_count"]),
        ("anomaly_rate", summary["anomaly_rate"]),
        ("dominant_step_index", summary["dominant_step_index"]),
        ("dominant_step_case_count", summary["dominant_step_case_count"]),
        ("dominant_step_case_rate", summary["dominant_step_case_rate"]),
        ("avg_dominant_step_duration_min", summary["avg_dominant_step_duration_min"]),
        ("avg_total_process_time_min", summary["avg_total_process_time_min"]),
        ("avg_transit_delay_min", summary["avg_transit_delay_min"]),
        ("avg_hub_touch_count", summary["avg_hub_touch_count"]),
        ("avg_delivery_attempt_count", summary["avg_delivery_attempt_count"]),
    ],
    columns=["Field", "Value"],
)
st.dataframe(display_df, use_container_width=True, hide_index=True)

with st.expander("Xem JSON gốc"):
    st.json(data, expanded=True)
    st.download_button(
        "Tải xuống JSON hiện tại",
        data=json.dumps(data, indent=2, ensure_ascii=False),
        file_name="latest_trucking_summary.json",
        mime="application/json",
        use_container_width=True,
    )