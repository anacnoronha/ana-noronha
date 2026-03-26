import requests
import sys
import json
from datetime import datetime

class MNCAPITester:
    def __init__(self, base_url="https://commerce-portal-40.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_token = None
        self.brand_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_candidatura_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@mnc.pt", "password": "Admin123!"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin user: {response.get('user', {}).get('role')}")
            return True
        return False

    def test_brand_login(self):
        """Test brand login"""
        success, response = self.run_test(
            "Brand Login",
            "POST",
            "auth/login",
            200,
            data={"email": "marca@test.pt", "password": "Marca123!"}
        )
        if success and 'token' in response:
            self.brand_token = response['token']
            print(f"   Brand user: {response.get('user', {}).get('role')}")
            return True
        return False

    def test_dashboard_stats(self):
        """Test dashboard stats (admin only)"""
        success, response = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Total candidaturas: {response.get('total_candidaturas', 0)}")
            print(f"   Total marcas: {response.get('total_marcas', 0)}")
        return success

    def test_candidaturas_list(self, token, user_type):
        """Test candidaturas list"""
        success, response = self.run_test(
            f"Candidaturas List ({user_type})",
            "GET",
            "candidaturas",
            200,
            token=token
        )
        if success:
            print(f"   Found {len(response)} candidaturas")
        return success, response

    def test_create_candidatura(self):
        """Test creating a candidatura (brand user)"""
        candidatura_data = {
            "nome_marca": "Test Brand API",
            "responsavel": "Test User",
            "email": "test@example.com",
            "telemovel": "+351912345678",
            "categoria": "Artesanato",
            "descricao_marca": "Test brand for API testing",
            "origem_producao": "Portugal",
            "opcao_participacao": "Stand Standard",
            "sustentabilidade_texto": "Eco-friendly practices",
            "sustentabilidade_percentagem": 75
        }
        
        success, response = self.run_test(
            "Create Candidatura",
            "POST",
            "candidaturas",
            200,
            data=candidatura_data,
            token=self.brand_token
        )
        if success and 'id' in response:
            self.test_candidatura_id = response['id']
            print(f"   Created candidatura ID: {self.test_candidatura_id}")
        return success

    def test_candidatura_ai_analysis(self):
        """Test AI analysis of candidatura (admin only)"""
        if not self.test_candidatura_id:
            print("❌ No candidatura ID available for AI analysis")
            return False
            
        success, response = self.run_test(
            "AI Analysis",
            "POST",
            f"candidaturas/{self.test_candidatura_id}/analyze",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   AI Analysis: {response.get('analise_automatica_ia', 'N/A')[:100]}...")
        return success

    def test_approve_candidatura(self):
        """Test approving candidatura (admin only)"""
        if not self.test_candidatura_id:
            print("❌ No candidatura ID available for approval")
            return False
            
        success, response = self.run_test(
            "Approve Candidatura",
            "POST",
            f"candidaturas/{self.test_candidatura_id}/approve",
            200,
            token=self.admin_token
        )
        return success

    def test_marcas_list(self):
        """Test marcas aprovadas list (admin only)"""
        success, response = self.run_test(
            "Marcas Aprovadas List",
            "GET",
            "marcas",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} approved brands")
        return success

    def test_logistica_operations(self):
        """Test logística CRUD operations (admin only)"""
        # Get list
        success, response = self.run_test(
            "Logística List",
            "GET",
            "logistica",
            200,
            token=self.admin_token
        )
        if not success:
            return False

        # Create new logística entry
        logistica_data = {
            "marca": "Test Brand API",
            "mesa": "Mesa 1",
            "cadeiras": "2 cadeiras",
            "notas": "Test logistics entry"
        }
        
        success, response = self.run_test(
            "Create Logística",
            "POST",
            "logistica",
            200,
            data=logistica_data,
            token=self.admin_token
        )
        return success

    def test_comunicacao_operations(self):
        """Test comunicação operations (admin only)"""
        # Get list
        success, response = self.run_test(
            "Comunicação List",
            "GET",
            "comunicacao",
            200,
            token=self.admin_token
        )
        if not success:
            return False

        # Create new comunicação entry
        comunicacao_data = {
            "marca": "Test Brand API",
            "tipo_email": "Confirmação",
            "conteudo": "Email de teste para API"
        }
        
        success, response = self.run_test(
            "Create Comunicação",
            "POST",
            "comunicacao",
            200,
            data=comunicacao_data,
            token=self.admin_token
        )
        return success

    def test_sustentabilidade_operations(self):
        """Test sustentabilidade operations (admin only)"""
        # Get list
        success, response = self.run_test(
            "Sustentabilidade List",
            "GET",
            "sustentabilidade",
            200,
            token=self.admin_token
        )
        if not success:
            return False

        # Create new sustentabilidade entry
        sustentabilidade_data = {
            "marca": "Test Brand API",
            "grau_sustentabilidade": "Alto",
            "texto": "Práticas sustentáveis verificadas",
            "percentagem": 85,
            "verificado": True
        }
        
        success, response = self.run_test(
            "Create Sustentabilidade",
            "POST",
            "sustentabilidade",
            200,
            data=sustentabilidade_data,
            token=self.admin_token
        )
        return success

    def test_socialmedia_operations(self):
        """Test social media operations (admin only)"""
        # Get list
        success, response = self.run_test(
            "Social Media List",
            "GET",
            "socialmedia",
            200,
            token=self.admin_token
        )
        if not success:
            return False

        # Create new social media entry
        socialmedia_data = {
            "marca": "Test Brand API",
            "ig_post": "Instagram post content",
            "fb_post": "Facebook post content",
            "estado": "Pendente"
        }
        
        success, response = self.run_test(
            "Create Social Media",
            "POST",
            "socialmedia",
            200,
            data=socialmedia_data,
            token=self.admin_token
        )
        return success

    def test_patrocinadores_operations(self):
        """Test patrocinadores operations (admin only)"""
        # Get list
        success, response = self.run_test(
            "Patrocinadores List",
            "GET",
            "patrocinadores",
            200,
            token=self.admin_token
        )
        if not success:
            return False

        # Create new patrocinador entry
        patrocinador_data = {
            "empresa": "Test Sponsor API",
            "nif": "123456789",
            "valor": 1000.0,
            "iva": 230.0,
            "total_fatura": 1230.0,
            "categoria": "Ouro"
        }
        
        success, response = self.run_test(
            "Create Patrocinador",
            "POST",
            "patrocinadores",
            200,
            data=patrocinador_data,
            token=self.admin_token
        )
        return success

    def test_categorias(self):
        """Test categorias endpoint"""
        success, response = self.run_test(
            "Categorias",
            "GET",
            "categorias",
            200
        )
        if success:
            print(f"   Categories: {len(response.get('categorias', []))}")
            print(f"   Participation options: {len(response.get('opcoes_participacao', []))}")
        return success

    def test_auth_me(self, token, user_type):
        """Test auth/me endpoint"""
        success, response = self.run_test(
            f"Auth Me ({user_type})",
            "GET",
            "auth/me",
            200,
            token=token
        )
        if success:
            print(f"   User: {response.get('email')} ({response.get('role')})")
        return success

def main():
    print("🏰 MNC 2025 API Testing Suite")
    print("=" * 50)
    
    tester = MNCAPITester()
    
    # Test authentication
    print("\n📋 AUTHENTICATION TESTS")
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    if not tester.test_brand_login():
        print("❌ Brand login failed, stopping tests")
        return 1

    # Test auth/me endpoints
    tester.test_auth_me(tester.admin_token, "Admin")
    tester.test_auth_me(tester.brand_token, "Brand")

    # Test basic endpoints
    print("\n📊 DASHBOARD & BASIC TESTS")
    tester.test_dashboard_stats()
    tester.test_categorias()

    # Test candidaturas flow
    print("\n📝 CANDIDATURAS TESTS")
    tester.test_candidaturas_list(tester.admin_token, "Admin")
    tester.test_candidaturas_list(tester.brand_token, "Brand")
    tester.test_create_candidatura()
    
    # Wait a moment for AI analysis to potentially complete
    import time
    time.sleep(2)
    
    tester.test_candidatura_ai_analysis()
    tester.test_approve_candidatura()

    # Test admin modules
    print("\n🏢 ADMIN MODULES TESTS")
    tester.test_marcas_list()
    tester.test_logistica_operations()
    tester.test_comunicacao_operations()
    tester.test_sustentabilidade_operations()
    tester.test_socialmedia_operations()
    tester.test_patrocinadores_operations()

    # Print results
    print(f"\n📊 FINAL RESULTS")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("✅ Backend API tests mostly successful!")
        return 0
    else:
        print("❌ Backend API has significant issues")
        return 1

if __name__ == "__main__":
    sys.exit(main())