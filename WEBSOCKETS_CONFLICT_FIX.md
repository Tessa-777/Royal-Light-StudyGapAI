# Dependency Conflict Resolution Strategy

## The Problem Chain:
1. `google-genai 0.2.0` requires `websockets>=13.0`
2. `supabase` → `realtime` requires `websockets<13`
3. These are incompatible!

## Solution Options:

### Option 1: Use older google-genai (0.1.0) - CURRENTLY SET
- `google-genai==0.1.0` might not require websockets>=13
- Combined with `supabase==2.9.0` (newer version)

### Option 2: If Option 1 fails, try using REST API directly
Instead of google-genai SDK, use `requests` library to call Gemini API directly.
This avoids the dependency conflict entirely.

### Option 3: Pin websockets to compatible version
If we can find a version that both accept, we could pin it.

Let's try Option 1 first. If it fails, we'll implement Option 2 (REST API).

