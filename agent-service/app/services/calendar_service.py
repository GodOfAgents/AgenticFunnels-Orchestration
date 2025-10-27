from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import httpx

class CalendarService:
    """
    Calendar Integration Service
    Supports Google Calendar and Calendly
    """
    
    async def check_availability_google(
        self,
        credentials: dict,
        start_time: datetime,
        end_time: datetime
    ) -> List[Dict]:
        """
        Check availability on Google Calendar
        
        Args:
            credentials: User's Google Calendar credentials
            start_time: Start of time range
            end_time: End of time range
        
        Returns:
            List of available time slots
        """
        try:
            creds = Credentials(
                token=credentials.get('access_token'),
                refresh_token=credentials.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=credentials.get('client_id'),
                client_secret=credentials.get('client_secret')
            )
            
            service = build('calendar', 'v3', credentials=creds)
            
            # Get free/busy information
            body = {
                "timeMin": start_time.isoformat() + 'Z',
                "timeMax": end_time.isoformat() + 'Z',
                "items": [{"id": "primary"}]
            }
            
            freebusy = service.freebusy().query(body=body).execute()
            busy_times = freebusy['calendars']['primary']['busy']
            
            # Calculate available slots
            available_slots = self._calculate_available_slots(
                start_time,
                end_time,
                busy_times
            )
            
            return available_slots
            
        except Exception as e:
            print(f"Google Calendar availability check error: {e}")
            return []
    
    async def create_event_google(
        self,
        credentials: dict,
        event_details: dict
    ) -> dict:
        """
        Create event on Google Calendar
        
        Args:
            credentials: User's Google Calendar credentials
            event_details: Event information
            {
                "summary": "Meeting with John",
                "description": "Discuss project requirements",
                "start": "2025-01-15T10:00:00",
                "end": "2025-01-15T11:00:00",
                "attendees": ["john@example.com"],
                "location": "Zoom" or "Meet link"
            }
        
        Returns:
            Created event details
        """
        try:
            creds = Credentials(
                token=credentials.get('access_token'),
                refresh_token=credentials.get('refresh_token'),
                token_uri='https://oauth2.googleapis.com/token',
                client_id=credentials.get('client_id'),
                client_secret=credentials.get('client_secret')
            )
            
            service = build('calendar', 'v3', credentials=creds)
            
            event = {
                'summary': event_details.get('summary'),
                'description': event_details.get('description'),
                'start': {
                    'dateTime': event_details.get('start'),
                    'timeZone': event_details.get('timezone', 'UTC'),
                },
                'end': {
                    'dateTime': event_details.get('end'),
                    'timeZone': event_details.get('timezone', 'UTC'),
                },
                'attendees': [
                    {'email': email} for email in event_details.get('attendees', [])
                ],
                'conferenceData': {
                    'createRequest': {
                        'requestId': f"meet-{datetime.utcnow().timestamp()}",
                        'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                    }
                } if event_details.get('add_meet_link') else None
            }
            
            created_event = service.events().insert(
                calendarId='primary',
                body=event,
                conferenceDataVersion=1 if event_details.get('add_meet_link') else 0
            ).execute()
            
            return {
                "event_id": created_event['id'],
                "status": "confirmed",
                "html_link": created_event.get('htmlLink'),
                "meet_link": created_event.get('hangoutLink'),
                "start": created_event['start']['dateTime'],
                "end": created_event['end']['dateTime']
            }
            
        except Exception as e:
            print(f"Google Calendar event creation error: {e}")
            raise
    
    async def check_availability_calendly(
        self,
        api_key: str,
        user_uri: str
    ) -> List[Dict]:
        """
        Check availability on Calendly
        
        Args:
            api_key: Calendly API key
            user_uri: Calendly user URI
        
        Returns:
            List of available event types
        """
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                # Get user's event types
                response = await client.get(
                    f"https://api.calendly.com/event_types",
                    params={"user": user_uri},
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('collection', [])
                else:
                    print(f"Calendly API error: {response.status_code}")
                    return []
                    
        except Exception as e:
            print(f"Calendly availability check error: {e}")
            return []
    
    async def create_scheduling_link_calendly(
        self,
        api_key: str,
        event_type_uri: str,
        invitee_data: dict
    ) -> dict:
        """
        Create Calendly scheduling link
        
        Args:
            api_key: Calendly API key
            event_type_uri: Calendly event type URI
            invitee_data: Invitee information
        
        Returns:
            Scheduling link
        """
        try:
            # Calendly uses public scheduling pages
            # Return the booking link for the event type
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                # Get event type details
                response = await client.get(
                    f"https://api.calendly.com{event_type_uri}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    event_type = response.json()
                    return {
                        "scheduling_url": event_type['resource'].get('scheduling_url'),
                        "event_type": event_type['resource'].get('name'),
                        "duration": event_type['resource'].get('duration')
                    }
                else:
                    raise Exception(f"Failed to get Calendly event type: {response.status_code}")
                    
        except Exception as e:
            print(f"Calendly scheduling link error: {e}")
            raise
    
    def _calculate_available_slots(
        self,
        start_time: datetime,
        end_time: datetime,
        busy_times: List[Dict],
        slot_duration: int = 30  # minutes
    ) -> List[Dict]:
        """
        Calculate available time slots from busy times
        """
        available = []
        current = start_time
        
        # Sort busy times
        busy_sorted = sorted(
            busy_times,
            key=lambda x: x['start']
        )
        
        for busy in busy_sorted:
            busy_start = datetime.fromisoformat(busy['start'].replace('Z', '+00:00'))
            busy_end = datetime.fromisoformat(busy['end'].replace('Z', '+00:00'))
            
            # Add slots before busy time
            while current + timedelta(minutes=slot_duration) <= busy_start:
                available.append({
                    "start": current.isoformat(),
                    "end": (current + timedelta(minutes=slot_duration)).isoformat()
                })
                current += timedelta(minutes=slot_duration)
            
            # Skip past busy time
            current = max(current, busy_end)
        
        # Add remaining slots
        while current + timedelta(minutes=slot_duration) <= end_time:
            available.append({
                "start": current.isoformat(),
                "end": (current + timedelta(minutes=slot_duration)).isoformat()
            })
            current += timedelta(minutes=slot_duration)
        
        return available

# Global instance
calendar_service = CalendarService()