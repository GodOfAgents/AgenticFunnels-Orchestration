# Workflow Builder Integration Awareness - Implementation Guide

## Overview
Enhanced the Visual Workflow Builder with **integration awareness** and **validation**, ensuring users can only add nodes for which they have configured the required integrations.

## Features Implemented ✅

### 1. Integration Status API
**Endpoint**: `GET /api/workflows/agent/{agent_id}/integration-status?user_id={user_id}`

**Purpose**: Returns which integrations are configured for a user, enabling the UI to show/hide nodes accordingly.

**Response Example**:
```json
{
  "agent_id": "agent-123",
  "integrations": {
    "calendar": {
      "configured": true,
      "provider": "google",
      "required_for_nodes": ["schedule_meeting"]
    },
    "crm": {
      "configured": false,
      "provider": null,
      "required_for_nodes": ["crm_update"]
    },
    "email": {
      "configured": false,
      "provider": null,
      "required_for_nodes": ["email"]
    },
    "twilio": {
      "configured": false,
      "provider": null,
      "required_for_nodes": []
    }
  },
  "total_configured": 1
}
```

### 2. Workflow Validation API
**Endpoint**: `POST /api/workflows/validate?user_id={user_id}`

**Purpose**: Validates workflow before saving, checking for:
- Missing required integrations
- Empty URLs in webhook/API call nodes
- Unreachable nodes (orphaned from trigger)
- Missing trigger node

**Request Body**:
```json
{
  "agent_id": "agent-123",
  "name": "My Workflow",
  "description": "Test workflow",
  "trigger": "conversation_start",
  "nodes": [
    {
      "id": "trigger_1",
      "type": "trigger",
      "config": {"event": "conversation_start"},
      "next": "schedule_1"
    },
    {
      "id": "schedule_1",
      "type": "schedule_meeting",
      "config": {"calendar_type": "google"},
      "next": null
    }
  ]
}
```

**Response Example**:
```json
{
  "valid": false,
  "errors": [
    {
      "node_id": "schedule_1",
      "node_type": "schedule_meeting",
      "message": "Calendar integration required but not configured",
      "required_integration": "calendar"
    }
  ],
  "warnings": [],
  "can_save": false,
  "can_execute": false
}
```

### 3. Enhanced Frontend UI

#### Integration Status Display
- **Location**: Workflow Canvas header
- **Visual Indicators**:
  - ✓ Green badge: Integration configured
  - ○ Gray badge: Integration not configured
  - Hover tooltip shows provider name

#### Node Palette Enhancements
- **Disabled Nodes**: Nodes requiring unconfigured integrations are grayed out
- **Visual Badges**:
  - ✓ Green: Integration available
  - ! Red: Required integration missing (node disabled)
  - ? Yellow: Optional integration missing
- **Tooltips**: Show integration requirement message

#### Validation UI
- **Validate Button**: In header next to Save button
- **Error Panel**: Red box showing blocking errors
- **Warning Panel**: Yellow box showing non-blocking warnings
- **Save Behavior**:
  - Errors: Cannot save, shows error list
  - Warnings: Can save with confirmation

## Integration → Node Mapping

| Integration Type | Required For Nodes | Optional For Nodes |
|-----------------|-------------------|-------------------|
| `calendar` | `schedule_meeting` | - |
| `crm` | `crm_update` | - |
| `email` | - | `email` |
| `twilio` | - | SMS nodes (future) |

## Validation Rules

### Errors (Block Saving)
1. **Missing Required Integration**: Node requires integration that's not configured
2. **Empty URL**: Webhook or API call node has no URL
3. **Invalid Configuration**: Node config doesn't match schema

### Warnings (Allow Saving)
1. **Orphaned Node**: Node not reachable from trigger
2. **No Trigger**: Workflow has no trigger node
3. **Optional Integration Missing**: Email node without email integration

## User Flow

### Creating Workflow with Calendar Integration

1. **User has Calendar configured**:
   ```
   ✓ Calendar: Google (green badge in header)
   → schedule_meeting node is enabled in palette
   → User can add and configure node
   → Validation passes
   → Workflow saves successfully
   ```

2. **User does NOT have Calendar**:
   ```
   ○ Calendar (gray badge in header)
   → schedule_meeting node is disabled (grayed out)
   → Hover shows "Calendar integration required"
   → If added manually (via template), validation fails
   → Error: "Calendar integration required but not configured"
   → Cannot save workflow
   ```

### Validation Flow

```
User clicks "Validate" button
  ↓
Frontend calls /api/workflows/validate
  ↓
Backend checks:
  - Node integration requirements
  - URL presence for webhook/API nodes
  - Workflow graph connectivity
  ↓
Returns validation result
  ↓
Frontend displays errors/warnings
  ↓
User fixes issues or proceeds
```

## API Client Methods

```typescript
// Get integration status
async getAgentIntegrationStatus(agentId: string, userId: string)

// Validate workflow
async validateWorkflow(workflowData: any, userId: string)
```

## Frontend Helper Functions

```typescript
// Check if node type requires integration
getNodeIntegrationRequirement(nodeType: string): {
  required: boolean;
  type: string;
  configured: boolean;
  message: string;
} | null

// Check if node can be added
canAddNode(nodeType: string): boolean
```

## Backend Implementation

### Integration Service Integration
The workflow API now integrates with `IntegrationService` to:
- Fetch user integrations
- Check active status
- Determine available features

### Validation Logic
Located in `/app/backend/app/api/workflows.py`:
- Node-by-node validation
- Graph traversal for reachability
- Integration requirement checking

## Testing

### Test Cases Covered

1. **Integration Status**:
   ```bash
   curl "http://localhost:8001/api/workflows/agent/test-agent/integration-status?user_id=user-123"
   # Returns integration map with configured status
   ```

2. **Valid Workflow** (no integrations needed):
   ```bash
   # Workflow with only message and webhook nodes
   # Result: valid=true, errors=[], warnings=[]
   ```

3. **Invalid Workflow** (missing integration):
   ```bash
   # Workflow with schedule_meeting but no calendar
   # Result: valid=false, errors=[calendar required], can_save=false
   ```

4. **Workflow with Warnings** (orphaned node):
   ```bash
   # Workflow with unreachable nodes
   # Result: valid=true, warnings=[node unreachable], can_save=true
   ```

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Link to integration setup page from error messages
- [ ] Show integration setup wizard in-app
- [ ] Cache integration status to reduce API calls

### Phase 2 (Soon)
- [ ] Real-time integration status updates (WebSocket)
- [ ] "Configure Integration" button directly in node palette
- [ ] Workflow templates filtered by available integrations
- [ ] Visual workflow health score

### Phase 3 (Later)
- [ ] Integration health monitoring
- [ ] Test integration before workflow execution
- [ ] Integration usage analytics
- [ ] Suggested nodes based on available integrations

## Known Limitations

1. **User ID Hardcoded**: Frontend uses `'user-123'` placeholder
   - **Fix**: Get from auth context when available
   
2. **No Real-time Updates**: Integration status loaded once on page load
   - **Fix**: Poll or use WebSocket for live updates
   
3. **Template Validation**: Templates can include nodes with unavailable integrations
   - **Fix**: Filter template nodes based on integrations or show warning
   
4. **Email Integration**: Marked as optional but not fully implemented
   - **Fix**: Integrate with actual email service (SendGrid, AWS SES)

## Configuration

### Node Integration Requirements
To add new integration requirements, update:

**Backend** (`/app/backend/app/api/workflows.py`):
```python
# In get_agent_integration_status
status["new_integration"] = {
    "configured": False,
    "provider": None,
    "required_for_nodes": ["new_node_type"]
}

# In validate_workflow
if node_type == "new_node_type":
    if "new_integration" not in active_integrations:
        errors.append({...})
```

**Frontend** (`/app/template/app/src/afo/workflows/WorkflowCanvas.tsx`):
```typescript
// In getNodeIntegrationRequirement
if (nodeType === 'new_node_type') {
  return {
    required: true,
    type: 'new_integration',
    configured: integrations.new_integration?.configured,
    message: '...'
  };
}
```

## Security Considerations

1. **User ID Verification**: Always verify user owns the agent
2. **Integration Credentials**: Never return credentials in status endpoint
3. **Validation**: Server-side validation is authoritative (client-side is UX only)
4. **Rate Limiting**: Add rate limits to validation endpoint to prevent abuse

## Performance

- **Integration Status**: Cached per agent (1 query per page load)
- **Validation**: Runs on-demand (only when user clicks Validate or Save)
- **Graph Traversal**: O(n) complexity for reachability check (n = number of nodes)

---

**Implementation Date**: January 2025  
**Status**: Complete - Backend and Frontend Integrated  
**Next**: End-to-end testing with real user integrations
