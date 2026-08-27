# Problem Statement

When production incidents occur, engineers manually check multiple sources of information:
logs, metrics, traces, deployment history, database events, and API failures.

This process is slow, stressful, and error-prone, especially during critical outages.

The goal of this project is to build an AI Incident Response and Root Cause Analysis system
that automatically investigates incidents by correlating telemetry data and ranking probable
root causes.

Example user question:

"Why did the payment service fail between 2:00 PM and 2:30 PM?"

The system investigates the incident by analyzing logs, metrics, traces, deployments,
database events, and API failures. It then returns anomalies, correlated events, ranked
root causes, and a natural language explanation.

The LLM is not used to guess the root cause directly. Instead, deterministic analysis
tools produce structured evidence, and the LLM is used only for orchestration and
explanation.