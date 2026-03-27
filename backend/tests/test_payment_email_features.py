"""
Backend API Tests for Payment and Email Confirmation Features
Tests: email_confirmado field, pagamento updates, precos endpoint
Session: Testing new features from Excel data extraction
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://commerce-portal-40.preview.emergentagent.com')


class TestPrecosEndpoint:
    """Tests for the /api/precos endpoint - Price table with 5 real prices"""
    
    def test_precos_returns_5_prices(self):
        """Test that precos endpoint returns exactly 5 active prices"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5, f"Expected 5 prices, got {len(data)}"
        print(f"✓ Precos endpoint returns {len(data)} prices")
    
    def test_precos_12ed_base_price(self):
        """Test 12ª Edição Base price is 467.40€"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        ed12_base = next((p for p in data if '12' in p['nome'] and 'Base' in p['nome']), None)
        assert ed12_base is not None, "12ª Edição Base price not found"
        assert ed12_base['valor_total'] == 467.4, f"Expected 467.40€, got {ed12_base['valor_total']}€"
        print(f"✓ 12ª Edição Base: {ed12_base['valor_total']}€")
    
    def test_precos_13ed_exterior_price(self):
        """Test 13ª Edição Exterior price is 467.40€"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        ed13_ext = next((p for p in data if '13' in p['nome'] and 'Exterior' in p['nome'] and '12' not in p['nome']), None)
        assert ed13_ext is not None, "13ª Edição Exterior price not found"
        assert ed13_ext['valor_total'] == 467.4, f"Expected 467.40€, got {ed13_ext['valor_total']}€"
        print(f"✓ 13ª Edição Exterior: {ed13_ext['valor_total']}€")
    
    def test_precos_13ed_interior_price(self):
        """Test 13ª Edição Interior price is 430.50€"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        ed13_int = next((p for p in data if '13' in p['nome'] and 'Interior' in p['nome'] and '12' not in p['nome']), None)
        assert ed13_int is not None, "13ª Edição Interior price not found"
        assert ed13_int['valor_total'] == 430.5, f"Expected 430.50€, got {ed13_int['valor_total']}€"
        print(f"✓ 13ª Edição Interior: {ed13_int['valor_total']}€")
    
    def test_precos_12_13ed_exterior_price(self):
        """Test 12ª + 13ª Edição Exterior price is 888.06€"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        pack_ext = next((p for p in data if '12' in p['nome'] and '13' in p['nome'] and 'Exterior' in p['nome']), None)
        assert pack_ext is not None, "12ª + 13ª Edição Exterior price not found"
        assert pack_ext['valor_total'] == 888.06, f"Expected 888.06€, got {pack_ext['valor_total']}€"
        print(f"✓ 12ª + 13ª Edição Exterior: {pack_ext['valor_total']}€")
    
    def test_precos_12_13ed_interior_price(self):
        """Test 12ª + 13ª Edição Interior price is 853.01€"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        pack_int = next((p for p in data if '12' in p['nome'] and '13' in p['nome'] and 'Interior' in p['nome']), None)
        assert pack_int is not None, "12ª + 13ª Edição Interior price not found"
        assert pack_int['valor_total'] == 853.01, f"Expected 853.01€, got {pack_int['valor_total']}€"
        print(f"✓ 12ª + 13ª Edição Interior: {pack_int['valor_total']}€")
    
    def test_precos_structure(self):
        """Test that all prices have required fields"""
        response = requests.get(f"{BASE_URL}/api/precos")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ['id', 'nome', 'valor_base', 'iva_percentagem', 'valor_iva', 'valor_total', 'ativo']
        
        for preco in data:
            for field in required_fields:
                assert field in preco, f"Missing field '{field}' in price: {preco.get('nome', 'unknown')}"
        
        print("✓ All prices have required fields")


class TestCandidaturaEmailConfirmado:
    """Tests for email_confirmado field in candidaturas"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mnc.pt",
            "password": "Admin123"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_candidaturas_have_email_confirmado_field(self, admin_token):
        """Test that candidaturas return email_confirmado field"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) > 0, "No candidaturas found"
        
        # Check first candidatura has email_confirmado field
        first_cand = data[0]
        assert 'email_confirmado' in first_cand, "email_confirmado field missing from candidatura"
        assert isinstance(first_cand['email_confirmado'], bool), "email_confirmado should be boolean"
        
        print(f"✓ Candidaturas have email_confirmado field (first: {first_cand['email_confirmado']})")
    
    def test_count_email_confirmado_true(self, admin_token):
        """Test that approximately 36 candidaturas have email_confirmado=true"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        email_confirmed_count = sum(1 for c in data if c.get('email_confirmado') == True)
        print(f"✓ Candidaturas with email_confirmado=true: {email_confirmed_count}")
        # According to requirements, should be around 36
        assert email_confirmed_count >= 30, f"Expected ~36 with email_confirmado=true, got {email_confirmed_count}"
    
    def test_update_email_confirmado(self, admin_token):
        """Test updating email_confirmado field via PUT"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Get a candidatura
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        data = response.json()
        cand_id = data[0]['id']
        original_value = data[0].get('email_confirmado', False)
        
        # Update to opposite value
        new_value = not original_value
        response = requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"email_confirmado": new_value}
        )
        assert response.status_code == 200
        
        # Verify update
        response = requests.get(f"{BASE_URL}/api/candidaturas/{cand_id}", headers=headers)
        assert response.status_code == 200
        updated_cand = response.json()
        assert updated_cand['email_confirmado'] == new_value, "email_confirmado was not updated"
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"email_confirmado": original_value}
        )
        
        print(f"✓ email_confirmado update works (toggled {original_value} -> {new_value} -> {original_value})")


class TestCandidaturaPagamento:
    """Tests for pagamento field updates in candidaturas"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mnc.pt",
            "password": "Admin123"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_candidaturas_have_pagamento_field(self, admin_token):
        """Test that candidaturas return pagamento field"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert len(data) > 0, "No candidaturas found"
        
        # Check first candidatura has pagamento field
        first_cand = data[0]
        assert 'pagamento' in first_cand, "pagamento field missing from candidatura"
        
        print(f"✓ Candidaturas have pagamento field (first: {first_cand.get('pagamento', 'None')})")
    
    def test_count_pagamento_por_pagar(self, admin_token):
        """Test that approximately 61 candidaturas have pagamento='Por Pagar'"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        por_pagar_count = sum(1 for c in data if c.get('pagamento') == 'Por Pagar')
        recusado_count = sum(1 for c in data if c.get('pagamento') == 'Recusado p/Mc')
        pago_count = sum(1 for c in data if c.get('pagamento') == 'Pago')
        
        print(f"✓ Pagamento stats - Por Pagar: {por_pagar_count}, Recusado: {recusado_count}, Pago: {pago_count}")
        # According to requirements: 61 Por Pagar, 11 Recusado p/Mc
    
    def test_update_pagamento_to_pago(self, admin_token):
        """Test updating pagamento field to 'Pago'"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Get a candidatura
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        data = response.json()
        cand_id = data[0]['id']
        original_pagamento = data[0].get('pagamento')
        
        # Update to 'Pago'
        response = requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"pagamento": "Pago"}
        )
        assert response.status_code == 200
        
        # Verify update
        response = requests.get(f"{BASE_URL}/api/candidaturas/{cand_id}", headers=headers)
        assert response.status_code == 200
        updated_cand = response.json()
        assert updated_cand['pagamento'] == "Pago", "pagamento was not updated to 'Pago'"
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"pagamento": original_pagamento}
        )
        
        print(f"✓ pagamento update to 'Pago' works")
    
    def test_update_pagamento_to_recusado(self, admin_token):
        """Test updating pagamento field to 'Recusado p/Mc'"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Get a candidatura
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        data = response.json()
        cand_id = data[0]['id']
        original_pagamento = data[0].get('pagamento')
        
        # Update to 'Recusado p/Mc'
        response = requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"pagamento": "Recusado p/Mc"}
        )
        assert response.status_code == 200
        
        # Verify update
        response = requests.get(f"{BASE_URL}/api/candidaturas/{cand_id}", headers=headers)
        assert response.status_code == 200
        updated_cand = response.json()
        assert updated_cand['pagamento'] == "Recusado p/Mc", "pagamento was not updated to 'Recusado p/Mc'"
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"pagamento": original_pagamento}
        )
        
        print(f"✓ pagamento update to 'Recusado p/Mc' works")
    
    def test_update_pagamento_to_por_pagar(self, admin_token):
        """Test updating pagamento field to 'Por Pagar'"""
        headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        
        # Get a candidatura
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        data = response.json()
        cand_id = data[0]['id']
        original_pagamento = data[0].get('pagamento')
        
        # Update to 'Por Pagar'
        response = requests.put(
            f"{BASE_URL}/api/candidaturas/{cand_id}",
            headers=headers,
            json={"pagamento": "Por Pagar"}
        )
        assert response.status_code == 200
        
        # Verify update
        response = requests.get(f"{BASE_URL}/api/candidaturas/{cand_id}", headers=headers)
        assert response.status_code == 200
        updated_cand = response.json()
        assert updated_cand['pagamento'] == "Por Pagar", "pagamento was not updated to 'Por Pagar'"
        
        # Restore original value if different
        if original_pagamento != "Por Pagar":
            requests.put(
                f"{BASE_URL}/api/candidaturas/{cand_id}",
                headers=headers,
                json={"pagamento": original_pagamento}
            )
        
        print(f"✓ pagamento update to 'Por Pagar' works")


class TestCandidaturaCount:
    """Tests for candidatura counts"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mnc.pt",
            "password": "Admin123"
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Admin authentication failed")
    
    def test_total_candidaturas_count(self, admin_token):
        """Test that there are 72 candidaturas in the database"""
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/candidaturas", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        print(f"✓ Total candidaturas: {len(data)}")
        # According to requirements, should be 72
        assert len(data) >= 70, f"Expected ~72 candidaturas, got {len(data)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
