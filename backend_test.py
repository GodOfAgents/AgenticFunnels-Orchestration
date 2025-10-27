#!/usr/bin/env python3
"""
AFO Platform Phase 2 Backend API Testing
Tests all Phase 2 endpoints including voice sessions, workflows, calendar, and webhooks
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any

# Backend URL
BASE_URL = "http://localhost:8001"

class AFOBackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
    
    def test_health_check(self):
        """Test basic health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, f"Status: {data}")
                else:
                    self.log_test("Health Check", False, f"Unexpected status: {data}")
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
    
    def test_voice_session_endpoints(self):
        """Test voice session management endpoints"""
        print("\n=== Testing Voice Session Endpoints ===")
        
        # Test create voice session
        session_data = {
            "agent_id": "test-agent-voice-001",
            "agent_config": {
                "name": "Test Voice Agent",
                "personality": "helpful and professional"
            },
            "user_credentials": {
                "deepgram_api_key": "test-deepgram-key",
                "elevenlabs_api_key": "test-elevenlabs-key", 
                "openai_api_key": "test-openai-key"
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/voice/session",
                json=session_data
            )
            if response.status_code in [200, 201]:
                session_result = response.json()
                session_id = session_result.get("session_id")
                self.log_test("Create Voice Session", True, f"Session ID: {session_id}")
                
                # Test get session status
                if session_id:
                    self.test_get_voice_session_status(session_id)
                    self.test_end_voice_session(session_id)
                
            else:
                self.log_test("Create Voice Session", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Voice Session", False, f"Exception: {str(e)}")
        
        # Test list voice sessions
        try:
            response = self.session.get(f"{self.base_url}/api/phase2/voice/sessions")
            if response.status_code == 200:
                sessions = response.json()
                self.log_test("List Voice Sessions", True, f"Found {len(sessions.get('sessions', []))} sessions")
            else:
                self.log_test("List Voice Sessions", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("List Voice Sessions", False, f"Exception: {str(e)}")
    
    def test_get_voice_session_status(self, session_id: str):
        """Test get voice session status"""
        try:
            response = self.session.get(f"{self.base_url}/api/phase2/voice/session/{session_id}")
            if response.status_code == 200:
                status = response.json()
                self.log_test("Get Voice Session Status", True, f"Status: {status}")
            else:
                self.log_test("Get Voice Session Status", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Voice Session Status", False, f"Exception: {str(e)}")
    
    def test_end_voice_session(self, session_id: str):
        """Test end voice session"""
        try:
            response = self.session.delete(f"{self.base_url}/api/phase2/voice/session/{session_id}")
            if response.status_code == 200:
                result = response.json()
                self.log_test("End Voice Session", True, f"Message: {result.get('message')}")
            else:
                self.log_test("End Voice Session", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("End Voice Session", False, f"Exception: {str(e)}")
    
    def test_workflow_endpoints(self):
        """Test workflow management endpoints"""
        print("\n=== Testing Workflow Endpoints ===")
        
        # Test create workflow
        workflow_data = {
            "agent_id": "test-agent-workflow-001",
            "name": "Lead Qualification Workflow",
            "description": "Automated workflow for qualifying sales leads",
            "trigger": "conversation_start",
            "nodes": [
                {
                    "id": "welcome",
                    "type": "message",
                    "config": {
                        "message": "Welcome! I'm here to help you learn about our services."
                    },
                    "next": "collect_info"
                },
                {
                    "id": "collect_info",
                    "type": "collect_info",
                    "config": {
                        "fields": ["name", "email", "company"]
                    },
                    "next": "qualify"
                },
                {
                    "id": "qualify",
                    "type": "decision",
                    "config": {
                        "criteria": "budget > 10000"
                    }
                }
            ]
        }
        
        workflow_id = None
        try:
            response = self.session.post(
                f"{self.base_url}/api/workflows/",
                json=workflow_data
            )
            if response.status_code in [200, 201]:
                workflow_result = response.json()
                workflow_id = workflow_result.get("workflow_id") or workflow_result.get("id")
                self.log_test("Create Workflow", True, f"Workflow ID: {workflow_id}")
            else:
                self.log_test("Create Workflow", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Create Workflow", False, f"Exception: {str(e)}")
        
        # Test list workflows for agent
        try:
            response = self.session.get(f"{self.base_url}/api/workflows/agent/test-agent-workflow-001")
            if response.status_code == 200:
                workflows = response.json()
                self.log_test("List Agent Workflows", True, f"Found {len(workflows.get('workflows', []))} workflows")
            else:
                self.log_test("List Agent Workflows", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("List Agent Workflows", False, f"Exception: {str(e)}")
        
        # Test get workflow details
        if workflow_id:
            try:
                response = self.session.get(f"{self.base_url}/api/workflows/{workflow_id}")
                if response.status_code == 200:
                    workflow = response.json()
                    self.log_test("Get Workflow Details", True, f"Workflow: {workflow.get('name')}")
                else:
                    self.log_test("Get Workflow Details", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Get Workflow Details", False, f"Exception: {str(e)}")
            
            # Test execute workflow
            execution_data = {
                "context": {
                    "user_id": "test-user-123",
                    "conversation_id": "conv-456"
                },
                "user_integrations": {
                    "crm": {"api_key": "test-crm-key"},
                    "calendar": {"api_key": "test-cal-key"}
                }
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/api/workflows/{workflow_id}/execute",
                    json=execution_data
                )
                if response.status_code == 200:
                    execution = response.json()
                    self.log_test("Execute Workflow", True, f"Execution ID: {execution.get('execution_id')}")
                else:
                    self.log_test("Execute Workflow", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Execute Workflow", False, f"Exception: {str(e)}")
            
            # Test delete workflow
            try:
                response = self.session.delete(f"{self.base_url}/api/workflows/{workflow_id}")
                if response.status_code == 200:
                    result = response.json()
                    self.log_test("Delete Workflow", True, f"Message: {result.get('message')}")
                else:
                    self.log_test("Delete Workflow", False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_test("Delete Workflow", False, f"Exception: {str(e)}")
    
    def test_calendar_endpoints(self):
        """Test calendar integration endpoints"""
        print("\n=== Testing Calendar Endpoints ===")
        
        # Test Google Calendar availability check
        google_availability_data = {
            "credentials": {
                "access_token": "test-google-access-token",
                "refresh_token": "test-google-refresh-token"
            },
            "start_time": (datetime.now() + timedelta(days=1)).isoformat(),
            "end_time": (datetime.now() + timedelta(days=2)).isoformat()
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/calendar/google/availability",
                json=google_availability_data
            )
            if response.status_code == 200:
                availability = response.json()
                self.log_test("Google Calendar Availability", True, f"Slots: {len(availability.get('available_slots', []))}")
            else:
                self.log_test("Google Calendar Availability", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Google Calendar Availability", False, f"Exception: {str(e)}")
        
        # Test Google Calendar event creation
        google_event_data = {
            "credentials": {
                "access_token": "test-google-access-token",
                "refresh_token": "test-google-refresh-token"
            },
            "event_details": {
                "summary": "Test Meeting with AFO Platform",
                "description": "Automated test meeting created by AFO Platform",
                "start": {
                    "dateTime": (datetime.now() + timedelta(days=1, hours=2)).isoformat(),
                    "timeZone": "UTC"
                },
                "end": {
                    "dateTime": (datetime.now() + timedelta(days=1, hours=3)).isoformat(),
                    "timeZone": "UTC"
                },
                "attendees": [
                    {"email": "test@example.com"}
                ]
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/calendar/google/event",
                json=google_event_data
            )
            if response.status_code == 200:
                event = response.json()
                self.log_test("Google Calendar Event Creation", True, f"Event ID: {event.get('id')}")
            else:
                self.log_test("Google Calendar Event Creation", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Google Calendar Event Creation", False, f"Exception: {str(e)}")
        
        # Test Calendly availability check
        calendly_availability_data = {
            "api_key": "test-calendly-api-key",
            "user_uri": "https://api.calendly.com/users/test-user"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/calendar/calendly/availability",
                json=calendly_availability_data
            )
            if response.status_code == 200:
                availability = response.json()
                self.log_test("Calendly Availability", True, f"Event types: {len(availability.get('event_types', []))}")
            else:
                self.log_test("Calendly Availability", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Calendly Availability", False, f"Exception: {str(e)}")
        
        # Test Calendly scheduling link creation
        calendly_link_data = {
            "api_key": "test-calendly-api-key",
            "event_type_uri": "https://api.calendly.com/event_types/test-event-type",
            "invitee_data": {
                "name": "John Smith",
                "email": "john.smith@example.com",
                "custom_questions": {
                    "company": "Test Company Inc."
                }
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/calendar/calendly/scheduling-link",
                json=calendly_link_data
            )
            if response.status_code == 200:
                link = response.json()
                self.log_test("Calendly Scheduling Link", True, f"Link: {link.get('scheduling_url')}")
            else:
                self.log_test("Calendly Scheduling Link", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Calendly Scheduling Link", False, f"Exception: {str(e)}")
    
    def test_webhook_endpoints(self):
        """Test webhook and CRM integration endpoints"""
        print("\n=== Testing Webhook Endpoints ===")
        
        # Test generic webhook send
        webhook_data = {
            "webhook_url": "https://httpbin.org/post",
            "data": {
                "lead_id": "lead-12345",
                "name": "Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "company": "Johnson Enterprises",
                "phone": "+1-555-0123",
                "source": "AFO Platform"
            },
            "headers": {
                "Content-Type": "application/json",
                "X-API-Source": "AFO-Platform"
            },
            "method": "POST"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/webhook/send",
                json=webhook_data
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("Generic Webhook Send", True, f"Status: {result.get('status')}")
            else:
                self.log_test("Generic Webhook Send", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Generic Webhook Send", False, f"Exception: {str(e)}")
        
        # Test CRM lead webhook
        crm_lead_data = {
            "webhook_url": "https://httpbin.org/post",
            "lead_data": {
                "first_name": "Michael",
                "last_name": "Chen",
                "email": "michael.chen@techcorp.com",
                "company": "TechCorp Solutions",
                "phone": "+1-555-0456",
                "budget": 50000,
                "timeline": "Q1 2024",
                "source": "AFO Voice Agent"
            },
            "field_mapping": {
                "first_name": "firstName",
                "last_name": "lastName",
                "email": "emailAddress",
                "company": "companyName"
            }
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/webhook/crm/lead",
                json=crm_lead_data
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("CRM Lead Webhook", True, f"Status: {result.get('status')}")
            else:
                self.log_test("CRM Lead Webhook", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("CRM Lead Webhook", False, f"Exception: {str(e)}")
        
        # Test webhook connection test
        webhook_test_data = {
            "webhook_url": "https://httpbin.org/get"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/phase2/webhook/test",
                json=webhook_test_data
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("Webhook Connection Test", True, f"Status: {result.get('status')}")
            else:
                self.log_test("Webhook Connection Test", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Webhook Connection Test", False, f"Exception: {str(e)}")
    
    def test_voice_tts_endpoints(self):
        """Test voice/TTS endpoints"""
        print("\n=== Testing Voice/TTS Endpoints ===")
        
        # Test get voices
        try:
            response = self.session.get(f"{self.base_url}/api/voice/voices?user_id=test-user-voice")
            if response.status_code == 200:
                voices = response.json()
                self.log_test("Get Voices", True, f"Voices: {len(voices.get('voices', []))}")
            elif response.status_code == 400:
                # Expected if ElevenLabs integration not configured
                self.log_test("Get Voices", True, "Expected 400 - ElevenLabs integration not configured")
            else:
                self.log_test("Get Voices", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Voices", False, f"Exception: {str(e)}")
        
        # Test get models
        try:
            response = self.session.get(f"{self.base_url}/api/voice/models?user_id=test-user-voice")
            if response.status_code == 200:
                models = response.json()
                self.log_test("Get TTS Models", True, f"Models: {len(models.get('models', []))}")
            elif response.status_code == 400:
                # Expected if ElevenLabs integration not configured
                self.log_test("Get TTS Models", True, "Expected 400 - ElevenLabs integration not configured")
            else:
                self.log_test("Get TTS Models", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get TTS Models", False, f"Exception: {str(e)}")
        
        # Test integration test with mock API key
        try:
            response = self.session.post(
                f"{self.base_url}/api/voice/test-integration?user_id=test-user-voice&api_key=test-elevenlabs-key"
            )
            if response.status_code == 200:
                result = response.json()
                self.log_test("Test ElevenLabs Integration", True, f"Status: {result.get('status')}")
            elif response.status_code == 400:
                # Expected with invalid API key
                self.log_test("Test ElevenLabs Integration", True, "Expected 400 - Invalid API key")
            else:
                self.log_test("Test ElevenLabs Integration", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Test ElevenLabs Integration", False, f"Exception: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting AFO Platform Phase 2 Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_health_check()
        self.test_voice_session_endpoints()
        self.test_workflow_endpoints()
        self.test_calendar_endpoints()
        self.test_webhook_endpoints()
        self.test_voice_tts_endpoints()
        
        # Summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = AFOBackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)