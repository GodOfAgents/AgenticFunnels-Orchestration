import asyncio
from typing import Dict, List
from datetime import datetime, timedelta
from collections import deque
import statistics
from app.services.websocket_manager import ws_manager

class AnomalyDetector:
    def __init__(self):
        self.running = False
        self.metrics_window = deque(maxlen=100)  # Last 100 data points
        self.thresholds = {
            "error_rate": 0.05,  # 5%
            "response_time": 2.0,  # 2 seconds
            "conversation_spike_multiplier": 3.0,  # 3x normal
            "cost_threshold_per_hour": 10.0  # $10/hour
        }
    
    async def start(self):
        """Start the anomaly detection background task"""
        self.running = True
        asyncio.create_task(self._detection_loop())
        print("✅ Anomaly detector started")
    
    async def stop(self):
        """Stop the anomaly detection"""
        self.running = False
        print("🛑 Anomaly detector stopped")
    
    async def _detection_loop(self):
        """Main detection loop - runs every 5 minutes"""
        while self.running:
            try:
                await self._detect_anomalies()
                await asyncio.sleep(300)  # 5 minutes
            except Exception as e:
                print(f"Error in anomaly detection: {e}")
                await asyncio.sleep(60)  # Retry after 1 minute on error
    
    async def _detect_anomalies(self):
        """Detect various types of anomalies"""
        # Collect current metrics
        metrics = await self._collect_metrics()
        self.metrics_window.append(metrics)
        
        # Need at least 10 data points for meaningful detection
        if len(self.metrics_window) < 10:
            return
        
        # Check for different anomaly types
        anomalies = []
        
        # 1. Error Rate Spike
        if metrics["error_rate"] > self.thresholds["error_rate"]:
            anomalies.append({
                "type": "error_rate",
                "severity": "high" if metrics["error_rate"] > 0.1 else "medium",
                "description": f"High error rate detected: {metrics['error_rate']:.2%}",
                "metrics": {"error_rate": metrics["error_rate"]}
            })
        
        # 2. Response Time Degradation
        if metrics["avg_response_time"] > self.thresholds["response_time"]:
            anomalies.append({
                "type": "response_delay",
                "severity": "high" if metrics["avg_response_time"] > 5.0 else "medium",
                "description": f"Slow response time: {metrics['avg_response_time']:.2f}s",
                "metrics": {"avg_response_time": metrics["avg_response_time"]}
            })
        
        # 3. Traffic Spike Detection
        recent_conversation_rates = [m["conversations_per_minute"] for m in list(self.metrics_window)[-10:]]
        avg_rate = statistics.mean(recent_conversation_rates) if recent_conversation_rates else 0
        
        if avg_rate > 0 and metrics["conversations_per_minute"] > avg_rate * self.thresholds["conversation_spike_multiplier"]:
            anomalies.append({
                "type": "spike",
                "severity": "medium",
                "description": f"Unusual traffic spike: {metrics['conversations_per_minute']:.0f} conversations/min (avg: {avg_rate:.0f})",
                "metrics": {
                    "current_rate": metrics["conversations_per_minute"],
                    "avg_rate": avg_rate
                }
            })
        
        # 4. Cost Spike
        if metrics["llm_cost_per_hour"] > self.thresholds["cost_threshold_per_hour"]:
            anomalies.append({
                "type": "cost_spike",
                "severity": "high",
                "description": f"High LLM costs: ${metrics['llm_cost_per_hour']:.2f}/hour",
                "metrics": {"llm_cost_per_hour": metrics["llm_cost_per_hour"]}
            })
        
        # 5. Integration Failures
        if metrics["failed_integrations"] > 3:
            anomalies.append({
                "type": "integration_failure",
                "severity": "high",
                "description": f"Multiple integration failures: {metrics['failed_integrations']}",
                "metrics": {"failed_integrations": metrics["failed_integrations"]}
            })
        
        # Broadcast anomalies to admin dashboard
        for anomaly in anomalies:
            await self._report_anomaly(anomaly)
    
    async def _collect_metrics(self) -> Dict:
        """Collect current system metrics"""
        # TODO: Collect real metrics from database
        # For now, returning mock data
        return {
            "timestamp": datetime.utcnow(),
            "error_rate": 0.01,  # 1%
            "avg_response_time": 0.5,  # 0.5s
            "conversations_per_minute": 10,
            "llm_cost_per_hour": 2.5,
            "failed_integrations": 0,
            "active_agents": 5,
            "active_conversations": 15
        }
    
    async def _report_anomaly(self, anomaly: dict):
        """Report detected anomaly"""
        # TODO: Save anomaly to database
        
        # Broadcast to admin dashboard
        await ws_manager.broadcast_to_admins(
            "anomaly.detected",
            {
                "id": f"anomaly_{datetime.utcnow().timestamp()}",
                "type": anomaly["type"],
                "severity": anomaly["severity"],
                "description": anomaly["description"],
                "metrics": anomaly["metrics"],
                "detected_at": datetime.utcnow().isoformat()
            }
        )
        
        print(f"🚨 Anomaly detected: {anomaly['description']}")

# Global anomaly detector instance
anomaly_detector = AnomalyDetector()