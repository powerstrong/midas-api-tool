# AGENTS.md

## Core References
When implementing features for this project, always treat the following as the primary reference materials.

1. MIDAS API manual
- https://support.midasuser.com/hc/ko/p/gate_api_manual

2. MIDAS online manual reference
- https://support.midasuser.com/hc/ko/articles/49909210848537-MIDAS-GEN-NX-Online-Manual

## Terminology Rule
- Even when the second reference is used for interface behavior or workflow details, refer to it as `MIDAS API` in product copy, help text, UX wording, and implementation notes.
- Do not explicitly call it `MIDAS GEN` in user-facing text unless the user specifically asks for that distinction.
- The reason is that MIDAS GEN and MIDAS Civil are separate products, but their interface patterns are very similar, and this tool must remain natural for MIDAS Civil users as well.

## Product Writing Rule
- Endpoint ids, API field names, and official feature names may remain in their original wording.
- For general guidance, labels, onboarding copy, and help text, use `MIDAS API` as the umbrella term.
- Prefer the API manual first, and use the second reference only as a supporting source for workflow and interface behavior.