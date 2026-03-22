import MockAdapter from 'axios-mock-adapter';
import { apiClient, mlClient } from './axios';
import dayjs from 'dayjs';

// === MOCK DATA GENERATORS ===

const generateMockAnomalies = () => {
  return [
    { id: '1', type: 'Late Delivery', risk_level: 'high', risk: 'high', description: 'Driver stranded at Border Control', location: 'EU-Nordics Hub', timestamp: dayjs().subtract(2, 'hours').toISOString() },
    { id: '2', type: 'Cost Spike', risk_level: 'medium', risk: 'medium', description: 'Unexpected fuel surcharge applied', location: 'US-East Transit', timestamp: dayjs().subtract(1, 'day').toISOString() },
    { id: '3', type: 'Route Deviation', risk_level: 'high', risk: 'high', description: 'Truck off expected GPS corridor', location: 'UK-M25', timestamp: dayjs().subtract(3, 'days').toISOString() },
    { id: '4', type: 'Missing Scan', risk_level: 'low', risk: 'low', description: 'Package skipped Sortation scan', location: 'APAC-Sing Hub', timestamp: dayjs().subtract(5, 'hours').toISOString() },
  ];
};

const generateMockResults = () => {
  return Array.from({ length: 45 }).map((_, i) => ({
    id: `R-${i}`,
    timestamp: dayjs().subtract(15 - (i % 15), 'days').toISOString(),
    risk_score: Math.floor(Math.random() * 40) + (i % 5 === 0 ? 50 : 10), // Some spikes
    efficiency: 100 - (Math.floor(Math.random() * 20)),
    process_id: `PROC-${1000 + i}`,
    status: i % 10 === 0 ? 'critical' : 'stable'
  }));
};

const generateMockUploads = () => {
  return [
    { id: 'DS-001', filename: 'Q3_Global_Logistics_Export.csv', status: 'analyzed', rows: 8400, timestamp: dayjs().subtract(2, 'days').toISOString() },
    { id: 'DS-002', filename: 'EU_Trucking_Routes_Nov.csv', status: 'analyzed', rows: 15200, timestamp: dayjs().subtract(5, 'days').toISOString() },
  ];
};

// === APPLY MOCKS ===

export const enableMockApi = () => {
  console.log('🧪 Mock API Enabled: Intercepting requests for /app pages.');

  // Setup Mock Adapters securely inside the wrapper scope only when evaluated
  const apiMock = new MockAdapter(apiClient, { delayResponse: 800 });
  const mlMock = new MockAdapter(mlClient, { delayResponse: 1200 });

  // 1. Analytics Service
  apiMock.onGet('/anomalies').reply(200, generateMockAnomalies());
  apiMock.onGet('/results').reply(200, generateMockResults());

  // 2. Upload / Datasets Service
  apiMock.onPost('/upload').reply(200, {
    id: `DS-MOCK-${Math.floor(Math.random() * 1000)}`,
    status: 'uploaded',
    message: 'File processed successfully'
  });

  apiMock.onGet('/uploads').reply(200, generateMockUploads());

  apiMock.onDelete(/\/uploads\/.+/).reply(200, { success: true });

  apiMock.onGet(/\/process\/.+/).reply((config) => {
    const id = config.url?.split('/').pop() || 'UNKNOWN';
    return [200, {
      id,
      timestamp: dayjs().toISOString(),
      steps: [
        { name: 'Order Received', duration: '2h', status: 'success' },
        { name: 'Customs Clear', duration: '14h', status: 'warning' },
        { name: 'Last Mile', duration: '4h', status: 'success' }
      ],
      overall_risk: 42
    }];
  });

  apiMock.onPost(/\/entity\/.+\/predict_batch/).reply(200, {
    predictions: [
      { id: 'DRV-1', risk_score: 85, recommendation: 'Driver requires rest period immediately.' },
      { id: 'DRV-2', risk_score: 22, recommendation: 'Clear to proceed.' }
    ]
  });

  // 3. ML Models / Validate
  mlMock.onPost('/api/validate/integrated_csv').reply(200, {
    valid: true,
    errors: [],
    warnings: [],
    summary: {
      total_rows: 5890,
      entity_rows: 60,
      process_event_rows: 5830,
      scenario_count: 30,
      entity_type_counts: { ops: 30, driver: 18, fleet: 12 }
    },
    process_row_counts: {
      "TRUCKING_DELIVERY_FLOW": 2755,
      "WAREHOUSE_FULFILLMENT": 1955,
      "IMPORT_CUSTOMS_CLEARANCE": 1120
    },
    process_case_counts: {
      "IMPORT_CUSTOMS_CLEARANCE": 70,
      "TRUCKING_DELIVERY_FLOW": 95,
      "WAREHOUSE_FULFILLMENT": 85
    }
  });

  mlMock.onPost('/api/analyze/integrated_csv').reply(200, {
    overall_result: {
      total_case_count: 250,
      avg_risk_score: 50.128,
      avg_anomaly_score: 0.411679,
      anomaly_count: 19,
      anomaly_rate: 0.076,
      avg_total_process_time_min: 1201.606
    },
    process_results: {
      customs_result: {
        case_count: 70,
        avg_risk_score: 53.457,
        anomaly_rate: 0.1429,
        avg_inspection_delay_min: 912.875,
        document_recheck_rate: 1,
        avg_clearance_cycle_time_min: 2596.869
      },
      trucking_result: {
        case_count: 95,
        avg_risk_score: 48.011,
        anomaly_rate: 0.0632,
        avg_transit_delay_min: 407.63,
        avg_hub_touch_count: 5,
        avg_delivery_attempt_count: 1
      },
      warehouse_result: {
        case_count: 85,
        avg_risk_score: 49.753,
        anomaly_rate: 0.0353,
        avg_pick_pack_time_min: 52.498,
        qc_rework_rate: 0,
        avg_staging_wait_min: 16.596
      }
    }
  });

  // Auth / Login fallback (just in case)
  apiMock.onPost('/auth/login').reply(200, {
    token: 'mock-jwt-token-7629348',
    user: { id: 1, name: 'Demo User', email: 'demo@vyn.ai' }
  });
  
  // Passthrough for anything else
  apiMock.onAny().passThrough();
  mlMock.onAny().passThrough();
};
