# Pie Chart Bug Analysis - Primary Weakness Mismatch

## Issue Description

The pie chart on the diagnostic results page shows "Procedural Error" as the largest slice, but the "Primary Weakness" displayed below the chart shows "Knowledge Gap". This is a mismatch between what the chart displays and what the backend reports as the primary weakness.

## Analysis

### Frontend Implementation

The frontend (`src/pages/DiagnosticResultsPage.tsx`) displays the pie chart using the `error_distribution` data from the diagnostic response:

```typescript
const errorDistribution = diagnostic.root_cause_analysis?.error_distribution
  ? [
      {
        name: 'Conceptual Gap',
        value: diagnostic.root_cause_analysis.error_distribution.conceptual_gap || 0,
        color: '#ef4444',
      },
      {
        name: 'Procedural Error',
        value: diagnostic.root_cause_analysis.error_distribution.procedural_error || 0,
        color: '#f59e0b',
      },
      // ... other error types
    ].filter((item) => item.value > 0)
  : [];
```

The "Primary Weakness" is displayed using `diagnostic.root_cause_analysis?.primary_weakness`:

```typescript
{diagnostic.root_cause_analysis?.primary_weakness
  ? diagnostic.root_cause_analysis.primary_weakness
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  : 'N/A'}
```

### Root Cause

**This is a BACKEND issue**, not a frontend issue. The frontend is correctly displaying:
1. The error distribution from `error_distribution` object
2. The primary weakness from `primary_weakness` field

The problem is that the backend is:
1. Calculating the error distribution correctly (showing Procedural Error has the highest count)
2. But setting `primary_weakness` to "Knowledge Gap" instead of "Procedural Error"

This indicates a logic error in the backend's AI analysis or post-processing where the `primary_weakness` field is not being set based on the highest value in `error_distribution`.

## Backend Fix Required

The backend needs to ensure that `primary_weakness` matches the error type with the highest value in `error_distribution`. The logic should be:

```python
# Pseudo-code for backend fix
error_distribution = {
    "conceptual_gap": count1,
    "procedural_error": count2,
    "careless_mistake": count3,
    "knowledge_gap": count4,
    "misinterpretation": count5
}

# Find the error type with the highest value
primary_weakness = max(error_distribution.items(), key=lambda x: x[1])[0]
```

## Frontend Workaround (Temporary)

A temporary frontend fix has been implemented that will fall back to finding the error type with the highest value from `error_distribution` if `primary_weakness` doesn't match:

```typescript
{diagnostic.root_cause_analysis?.primary_weakness
  ? diagnostic.root_cause_analysis.primary_weakness
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  : errorDistribution.length > 0
  ? // Fallback: find the error type with highest value
    errorDistribution.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    ).name
  : 'N/A'}
```

However, this is a workaround. The proper fix should be done in the backend to ensure `primary_weakness` always matches the highest value in `error_distribution`.

## Debug Information

In development mode, the frontend now displays the backend's `primary_weakness` value for debugging:

```typescript
{process.env.NODE_ENV === 'development' && diagnostic.root_cause_analysis && (
  <div className="text-xs text-gray-400 mt-2">
    Backend primary_weakness: {diagnostic.root_cause_analysis.primary_weakness}
  </div>
)}
```

This will help identify when the backend is sending incorrect data.

## Recommendation

**Backend team should:**
1. Review the AI diagnostic analysis logic that sets `primary_weakness`
2. Ensure `primary_weakness` is calculated as the error type with the highest count in `error_distribution`
3. Add validation to ensure consistency between `error_distribution` and `primary_weakness`
4. Test with various quiz responses to ensure the logic works correctly

**Frontend team:**
1. The workaround is in place and will display the correct primary weakness based on the chart data
2. Monitor the debug output in development to track when backend sends incorrect data
3. Remove the workaround once the backend fix is deployed

