import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { CompressionAlgorithm } from "@opentelemetry/otlp-exporter-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const serviceName = process.env.OTEL_SERVICE_NAME || "auth-service";
const metricsOptions = {
  url:
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
    "http://opentelemetry-collector:4318/v1/metrics",
  compression: CompressionAlgorithm.GZIP,
};

const tracesOptions = {
  url:
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    "http://opentelemetry-collector:4318/v1/traces",
  compression: CompressionAlgorithm.GZIP,
};

const metricExporter = new OTLPMetricExporter(metricsOptions);
const traceExporter = new OTLPTraceExporter(tracesOptions);

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis:
    Number(process.env.OTEL_METRICS_EXPORT_INTERVAL) || 10000,
  exportTimeoutMillis: Number(process.env.OTEL_METRICS_EXPORT_TIMEOUT) || 10000,
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  traceExporter: traceExporter,
  metricReader: metricReader,
  instrumentations: [
    getNodeAutoInstrumentations({}),
    new NestInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();

process.on("beforeExit", () => {
  sdk
    .shutdown()
    .then(() => console.log("OTel Metrics terminated"))
    .catch((error) => console.log("Error terminating OTel Metrics", error))
    .finally(() => process.exit(0));
});

export {};
