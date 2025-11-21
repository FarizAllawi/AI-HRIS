from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
from prometheus_client.openmetrics.exposition import CONTENT_TYPE_LATEST
from fastapi import Request, Response
import time

# Metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP Requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'http_requests_active',
    'Active HTTP requests'
)

SCREENING_REQUESTS = Counter(
    'screening_requests_total',
    'Total screening requests',
    ['status']
)

SCREENING_DURATION = Histogram(
