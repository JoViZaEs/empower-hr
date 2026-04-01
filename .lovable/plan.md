

## What's Missing in the Evaluations Module

### Currently Implemented
- Template creation (sections, criteria, response types, correct answers)
- Templates list with activate/deactivate
- Evaluation creation (assign template to employee)
- Evaluation listing with stats and filters
- Employee evaluation history

### What's Missing

#### 1. Evaluation Execution Form (Critical)
The core flow: when an evaluator clicks "Ver Detalle" on an evaluation, there's no form to actually **answer** the questions. Need a full-page or dialog that:
- Loads the template's sections and criteria
- Renders the correct input per `response_type` (scale slider, radio buttons, checkboxes, yes/no toggle, text area)
- Saves responses to `evaluation_responses` table
- Auto-calculates `overall_score` based on section weights and correct answers
- Allows saving as draft (`en_proceso`) or completing (`completada`)
- Shows strengths, areas for improvement, and action plan fields

#### 2. Automatic Scoring Engine
- Compare responses against `correct_answer` for single_choice, multiple_choice, yes_no
- Calculate weighted score per section and overall score
- Store in `evaluations.overall_score`

#### 3. Evaluation Detail View
- Read-only view of a completed evaluation showing all responses, scores per section, and overall result
- Visual score breakdown (bar/radar chart per section)

#### 4. Signature Integration
- Connect to the existing Signatures module (`signatures` table with `module = 'evaluaciones'`)
- Require evaluator and employee signatures upon completion

#### 5. Bulk/Mass Evaluation Assignment
- Assign the same template to multiple employees at once (e.g., "Apply annual review to all active employees")

#### 6. Reporting & Analytics
- Gap analysis: compare scores across employees, departments, periods
- Trend charts over time per employee
- Export results to CSV/PDF
- Aggregated results for climate surveys (anonymous)

#### 7. Edit/Delete for Templates and Evaluations
- Edit existing templates (currently only create + toggle active)
- Delete templates (with confirmation)
- Edit/cancel evaluations

#### 8. Alert Integration
- Automated notifications based on template periodicity (e.g., "Annual evaluation due for 15 employees")
- Integrate with `generate-notifications` edge function

### Recommended Priority

| Priority | Feature | Effort |
|----------|---------|--------|
| 1 | Evaluation Execution Form | High |
| 2 | Automatic Scoring | Medium |
| 3 | Evaluation Detail View | Medium |
| 4 | Signature Integration | Low |
| 5 | Edit/Delete Templates | Low |
| 6 | Bulk Assignment | Medium |
| 7 | Reporting & Analytics | High |
| 8 | Alert Integration | Medium |

### Technical Details

**Execution Form** - New component `EvaluacionExecForm.tsx`:
- Fetches template structure via `evaluation_templates` → `sections` → `criteria`
- Renders dynamic form based on `response_type`
- Upserts to `evaluation_responses` (one row per criterion)
- Updates `evaluations` status and `overall_score` on submit

**Scoring** - DB function `calculate_evaluation_score(evaluation_id)`:
- Joins responses with criteria and sections
- Applies weights per section
- Returns normalized score on the template's scale

**Signatures** - Reuse existing `SignatureDialog` component with `module='evaluaciones'` and `record_id=evaluation.id`

