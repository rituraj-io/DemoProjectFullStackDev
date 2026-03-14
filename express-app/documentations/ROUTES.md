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
