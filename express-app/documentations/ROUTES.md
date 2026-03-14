# API Routes

## Get Server Metrics

```
Payload: { "api_key": "string" }
Route: /api/status
Request Type: POST
Response: {
    "success": true,
    "message": "Server metrics retrieved successfully",
    "data": {
        "num_requests": 0,
        "num_token_used": 0,
        "num_active_connections": 0
    }
}
Notes: Requires valid `api_key` in the JSON body matching the server's API_SECRET_TOKEN. Returns 401 if missing or invalid. Returns 500 with error message on server failure.
```

## Get Changelog

```
Payload: { "api_key": "string" }
Route: /api/changelog
Request Type: POST
Response: {
    "success": true,
    "message": "Changelog retrieved successfully",
    "data": [
        {
            "id": 1,
            "field_name": "num_requests",
            "old_value": 0,
            "new_value": 1,
            "action": "API request made",
            "created_at": "2026-03-14T00:00:00.000Z"
        }
    ]
}
Notes: Requires valid `api_key` in the JSON body matching the server's API_SECRET_TOKEN. Returns the latest 50 changelog entries sorted newest first. Returns 401 if unauthorized. Returns 500 on server failure.
```

## Start Session

```
Payload: { "api_key": "string" }
Route: /api/session/start
Request Type: POST
Response: {
    "success": true,
    "message": "Session started successfully",
    "data": {
        "id": 1,
        "started_at": "2026-03-14T00:00:00.000Z",
        "status": "active"
    }
}
Notes: Creates a new billing session. Returns the session ID for use with /api/session/status and /api/session/end. Requires valid `api_key`. Returns 401 if unauthorized.
```

## End Session

```
Payload: { "api_key": "string", "session_id": 1 }
Route: /api/session/end
Request Type: POST
Response: {
    "success": true,
    "message": "Session ended successfully",
    "data": {
        "id": 1,
        "duration_seconds": 120,
        "cost_cents": 240,
        "status": "completed",
        "stripe_payment_intent_id": "pi_xxx",
        "client_secret": "pi_xxx_secret_xxx"
    }
}
Notes: Ends an active session, calculates final cost at $0.02/sec, and creates a Stripe payment intent. Returns the `client_secret` for frontend payment confirmation via Stripe.js. Stripe minimum charge is 50 cents. Returns 400 if `session_id` is missing. Returns 401 if unauthorized. Returns 500 if session not found or already completed.
```

## Get Session Status

```
Payload: { "api_key": "string", "session_id": 1 }
Route: /api/session/status
Request Type: POST
Response: {
    "success": true,
    "message": "Session status retrieved successfully",
    "data": {
        "id": 1,
        "started_at": "2026-03-14T00:00:00.000Z",
        "ended_at": null,
        "duration_seconds": 45,
        "cost_cents": 90,
        "status": "active",
        "stripe_payment_intent_id": null
    }
}
Notes: Returns current session info. For active sessions, `duration_seconds` and `cost_cents` are calculated live from the start time. Requires valid `api_key`. Returns 400 if `session_id` is missing. Returns 401 if unauthorized. Returns 500 if session not found.
```

## List Active Sessions

```
Payload: { "api_key": "string" }
Route: /api/session/active
Request Type: POST
Response: {
    "success": true,
    "message": "Active sessions retrieved successfully",
    "data": [
        {
            "id": 1,
            "started_at": "2026-03-14T00:00:00.000Z",
            "duration_seconds": 45,
            "cost_cents": 90,
            "status": "active"
        }
    ]
}
Notes: Returns all currently active sessions with live-calculated duration and running cost. Sorted newest first. Requires valid `api_key`. Returns 401 if unauthorized.
```

## Update Active Connections

```
Payload: { "api_key": "string", "amount": 1 }
Route: /api/connections/update
Request Type: POST
Response: {
    "success": true,
    "message": "Active connections updated by 1",
    "data": {
        "num_requests": 0,
        "num_token_used": 0,
        "num_active_connections": 1
    }
}
Notes: Increments or decrements num_active_connections. Use positive `amount` to increment, negative to decrement. Defaults to +1 if `amount` is omitted. Requires valid `api_key`. Returns 401 if unauthorized.
```

## Set Active Connections

```
Payload: { "api_key": "string", "value": 5 }
Route: /api/connections/set
Request Type: POST
Response: {
    "success": true,
    "message": "Active connections set to 5",
    "data": {
        "num_requests": 0,
        "num_token_used": 0,
        "num_active_connections": 5
    }
}
Notes: Sets num_active_connections to an exact value. Requires `value` to be a number. Automatically reset to 0 on server start. Requires valid `api_key`. Returns 400 if `value` is missing or not a number. Returns 401 if unauthorized.
```
