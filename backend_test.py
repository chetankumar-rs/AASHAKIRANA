#!/usr/bin/env python3
"""
AASHAKIRANA PWA Backend API Testing Suite
Tests all backend endpoints including authentication, healthcare forms, and database connectivity
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ashakirana-pwa.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "name": "Priya Sharma",
            "phone_number": f"9876543{str(uuid.uuid4())[:3]}",
            "place": "Bangalore Rural",
            "aadhaar_number": f"1234{str(uuid.uuid4())[:8]}",
            "password": "SecurePass123"
        }
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_database_connectivity(self):
        """Test if backend server is running and database is accessible"""
        try:
            response = self.session.get(f"{API_BASE}/dashboard", timeout=10)
            if response.status_code == 401:  # Expected without auth
                self.log_result("Database Connectivity", True, "Backend server is running and responding")
                return True
            else:
                self.log_result("Database Connectivity", False, f"Unexpected response: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.log_result("Database Connectivity", False, f"Connection failed: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration with auto-generated username"""
        try:
            response = self.session.post(
                f"{API_BASE}/register",
                json=self.test_user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'username' in data and 'id' in data:
                    self.test_user_data['username'] = data['username']
                    self.test_user_data['user_id'] = data['id']
                    self.log_result("User Registration", True, 
                                  f"User registered successfully with username: {data['username']}")
                    return True
                else:
                    self.log_result("User Registration", False, 
                                  "Registration response missing required fields", data)
                    return False
            else:
                self.log_result("User Registration", False, 
                              f"Registration failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("User Registration", False, f"Request failed: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test user login and JWT token validation"""
        try:
            login_data = {
                "username": self.test_user_data['username'],
                "password": self.test_user_data['password']
            }
            
            response = self.session.post(
                f"{API_BASE}/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data and 'user' in data:
                    self.auth_token = data['access_token']
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.auth_token}'
                    })
                    self.log_result("User Login", True, 
                                  f"Login successful, token received")
                    return True
                else:
                    self.log_result("User Login", False, 
                                  "Login response missing required fields", data)
                    return False
            else:
                self.log_result("User Login", False, 
                              f"Login failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("User Login", False, f"Request failed: {str(e)}")
            return False
    
    def test_family_survey_creation(self):
        """Test creating family survey with authenticated user"""
        try:
            survey_data = {
                "household_id": f"HH_{uuid.uuid4().hex[:8]}",
                "members_list": json.dumps([
                    {"name": "Rajesh Kumar", "age": 35, "relation": "Head"},
                    {"name": "Sunita Kumar", "age": 32, "relation": "Wife"},
                    {"name": "Arjun Kumar", "age": 8, "relation": "Son"}
                ]),
                "sanitation": "Improved toilet facility",
                "chronic_illnesses": "Diabetes in head of family"
            }
            
            response = self.session.post(
                f"{API_BASE}/family-surveys",
                json=survey_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'household_id' in data:
                    self.log_result("Family Survey Creation", True, 
                                  f"Family survey created successfully with ID: {data['id']}")
                    return True
                else:
                    self.log_result("Family Survey Creation", False, 
                                  "Response missing required fields", data)
                    return False
            else:
                self.log_result("Family Survey Creation", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Family Survey Creation", False, f"Request failed: {str(e)}")
            return False
    
    def test_family_survey_retrieval(self):
        """Test retrieving family surveys"""
        try:
            response = self.session.get(f"{API_BASE}/family-surveys", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Family Survey Retrieval", True, 
                                  f"Retrieved {len(data)} family surveys")
                    return True
                else:
                    self.log_result("Family Survey Retrieval", False, 
                                  "Response is not a list", data)
                    return False
            else:
                self.log_result("Family Survey Retrieval", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Family Survey Retrieval", False, f"Request failed: {str(e)}")
            return False
    
    def test_pregnancy_report_creation(self):
        """Test creating pregnancy report with medical data"""
        try:
            lmp_date = datetime.now() - timedelta(days=60)
            edd_date = lmp_date + timedelta(days=280)
            
            pregnancy_data = {
                "lmp": lmp_date.isoformat(),
                "edd": edd_date.isoformat(),
                "gravida": 2,
                "para": 1,
                "anc_checkups": json.dumps([
                    {"date": "2024-01-15", "weight": "65kg", "bp": "120/80"},
                    {"date": "2024-02-15", "weight": "67kg", "bp": "118/78"}
                ]),
                "risk_factors": "Previous C-section",
                "patient_name": "Meera Devi",
                "patient_phone": "9876543210"
            }
            
            response = self.session.post(
                f"{API_BASE}/pregnancy-reports",
                json=pregnancy_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'patient_name' in data:
                    self.log_result("Pregnancy Report Creation", True, 
                                  f"Pregnancy report created for {data['patient_name']}")
                    return True
                else:
                    self.log_result("Pregnancy Report Creation", False, 
                                  "Response missing required fields", data)
                    return False
            else:
                self.log_result("Pregnancy Report Creation", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Pregnancy Report Creation", False, f"Request failed: {str(e)}")
            return False
    
    def test_pregnancy_report_retrieval(self):
        """Test retrieving pregnancy reports"""
        try:
            response = self.session.get(f"{API_BASE}/pregnancy-reports", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Pregnancy Report Retrieval", True, 
                                  f"Retrieved {len(data)} pregnancy reports")
                    return True
                else:
                    self.log_result("Pregnancy Report Retrieval", False, 
                                  "Response is not a list", data)
                    return False
            else:
                self.log_result("Pregnancy Report Retrieval", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Pregnancy Report Retrieval", False, f"Request failed: {str(e)}")
            return False
    
    def test_child_vaccination_creation(self):
        """Test creating child vaccination record"""
        try:
            child_dob = datetime.now() - timedelta(days=365)  # 1 year old
            next_due = datetime.now() + timedelta(days=30)
            
            vaccination_data = {
                "child_name": "Baby Arjun",
                "child_dob": child_dob.isoformat(),
                "vaccine_schedule": json.dumps([
                    {"vaccine": "BCG", "date": "2023-01-15", "status": "completed"},
                    {"vaccine": "DPT-1", "date": "2023-03-15", "status": "completed"},
                    {"vaccine": "DPT-2", "date": "2023-05-15", "status": "pending"}
                ]),
                "missed_doses": "None",
                "next_due": next_due.isoformat(),
                "parent_name": "Rajesh Kumar",
                "parent_phone": "9876543211"
            }
            
            response = self.session.post(
                f"{API_BASE}/child-vaccinations",
                json=vaccination_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result("Child Vaccination Creation", True, 
                                  "Child vaccination record created successfully")
                    return True
                else:
                    self.log_result("Child Vaccination Creation", False, 
                                  "Unexpected response format", data)
                    return False
            else:
                self.log_result("Child Vaccination Creation", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Child Vaccination Creation", False, f"Request failed: {str(e)}")
            return False
    
    def test_postnatal_care_creation(self):
        """Test creating postnatal care record"""
        try:
            delivery_date = datetime.now() - timedelta(days=15)
            
            pnc_data = {
                "pnc_visits": json.dumps([
                    {"date": "2024-01-20", "findings": "Normal recovery"},
                    {"date": "2024-01-27", "findings": "Breastfeeding established"}
                ]),
                "mother_health": "Good recovery, no complications",
                "baby_health": "Healthy, gaining weight properly",
                "counselling": "Breastfeeding guidance provided",
                "mother_name": "Sunita Devi",
                "delivery_date": delivery_date.isoformat()
            }
            
            response = self.session.post(
                f"{API_BASE}/postnatal-care",
                json=pnc_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result("Postnatal Care Creation", True, 
                                  "Postnatal care record created successfully")
                    return True
                else:
                    self.log_result("Postnatal Care Creation", False, 
                                  "Unexpected response format", data)
                    return False
            else:
                self.log_result("Postnatal Care Creation", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Postnatal Care Creation", False, f"Request failed: {str(e)}")
            return False
    
    def test_leprosy_report_creation(self):
        """Test creating leprosy report"""
        try:
            leprosy_data = {
                "patient_name": "Ramesh Gowda",
                "leprosy_type": "Multibacillary",
                "treatment": "MDT-MB regimen started",
                "follow_ups": json.dumps([
                    {"date": "2024-01-15", "status": "Treatment started"},
                    {"date": "2024-02-15", "status": "Good response to treatment"}
                ]),
                "household_contacts": "3 family members screened, all negative"
            }
            
            response = self.session.post(
                f"{API_BASE}/leprosy-reports",
                json=leprosy_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result("Leprosy Report Creation", True, 
                                  "Leprosy report created successfully")
                    return True
                else:
                    self.log_result("Leprosy Report Creation", False, 
                                  "Unexpected response format", data)
                    return False
            else:
                self.log_result("Leprosy Report Creation", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Leprosy Report Creation", False, f"Request failed: {str(e)}")
            return False
    
    def test_dashboard_stats(self):
        """Test dashboard statistics retrieval"""
        try:
            response = self.session.get(f"{API_BASE}/dashboard", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['total_surveys', 'total_pregnancies', 'total_vaccinations', 
                                 'total_pnc', 'unread_alerts', 'incentives_earned']
                
                if all(field in data for field in required_fields):
                    self.log_result("Dashboard Stats", True, 
                                  f"Dashboard stats retrieved: {data}")
                    return True
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_result("Dashboard Stats", False, 
                                  f"Missing fields: {missing_fields}", data)
                    return False
            else:
                self.log_result("Dashboard Stats", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Dashboard Stats", False, f"Request failed: {str(e)}")
            return False
    
    def test_alerts_retrieval(self):
        """Test alerts retrieval"""
        try:
            response = self.session.get(f"{API_BASE}/alerts", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Alerts Retrieval", True, 
                                  f"Retrieved {len(data)} alerts")
                    return True
                else:
                    self.log_result("Alerts Retrieval", False, 
                                  "Response is not a list", data)
                    return False
            else:
                self.log_result("Alerts Retrieval", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Alerts Retrieval", False, f"Request failed: {str(e)}")
            return False
    
    def test_sync_endpoint(self):
        """Test offline data sync endpoint"""
        try:
            sync_data = {
                "family_surveys": [
                    {
                        "household_id": f"OFFLINE_HH_{uuid.uuid4().hex[:8]}",
                        "members_list": json.dumps([{"name": "Test Family", "age": 30}]),
                        "sanitation": "Basic facility",
                        "chronic_illnesses": "None"
                    }
                ]
            }
            
            response = self.session.post(
                f"{API_BASE}/sync",
                json=sync_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data and 'Synced' in data['message']:
                    self.log_result("Sync Endpoint", True, 
                                  f"Sync successful: {data['message']}")
                    return True
                else:
                    self.log_result("Sync Endpoint", False, 
                                  "Unexpected response format", data)
                    return False
            else:
                self.log_result("Sync Endpoint", False, 
                              f"Failed with status {response.status_code}", 
                              response.text)
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result("Sync Endpoint", False, f"Request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 60)
        print("AASHAKIRANA PWA Backend API Testing Suite")
        print("=" * 60)
        print(f"Testing against: {API_BASE}")
        print()
        
        # Test sequence
        tests = [
            self.test_database_connectivity,
            self.test_user_registration,
            self.test_user_login,
            self.test_family_survey_creation,
            self.test_family_survey_retrieval,
            self.test_pregnancy_report_creation,
            self.test_pregnancy_report_retrieval,
            self.test_child_vaccination_creation,
            self.test_postnatal_care_creation,
            self.test_leprosy_report_creation,
            self.test_dashboard_stats,
            self.test_alerts_retrieval,
            self.test_sync_endpoint
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
            print()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"❌ {result['test']}: {result['message']}")
        
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = BackendTester()
    passed, failed, results = tester.run_all_tests()