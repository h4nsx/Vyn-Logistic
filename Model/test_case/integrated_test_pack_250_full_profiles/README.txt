Full-profile integrated test pack.

For EACH process branch, each profile has its own full 250-scenario CSV.

Profiles:
- normal
- subtle_bottleneck
- bottleneck

This means:
- trucking has 3 files, each with 250 scenarios
- warehouse has 3 files, each with 250 scenarios
- customs has 3 files, each with 250 scenarios

Each CSV contains:
- 250 driver rows
- 250 fleet rows
- 250 ops rows
- process-event rows for exactly one process branch only
- scenario_profile column fixed to one profile in the whole file

Purpose:
- compare one branch across clean / subtle / severe congestion
- keep one consistent 250-scenario size per file
- compatible with patched app.py integrated CSV flow
