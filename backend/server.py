from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
import asyncio
import resend
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET_KEY', 'mnc2025_secret')
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Initialize Resend
resend.api_key = RESEND_API_KEY

app = FastAPI(title="Mercado no Castelo API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============== ENUMS ==============
class UserRole(str, Enum):
    ADMIN = "admin"
    BRAND = "brand"

class CandidaturaStatus(str, Enum):
    PENDING = "Pendente"
    APPROVED = "Aprovada"
    REJECTED = "Rejeitada"
    WAITLIST = "Lista de Espera"

class PaymentStatus(str, Enum):
    PENDING = "Pendente"
    PAID = "Pago"
    OVERDUE = "Em Atraso"

# ============== MODELS ==============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole = UserRole.BRAND

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    role: UserRole
    picture: Optional[str] = None
    created_at: datetime

class Candidatura(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"cand_{uuid.uuid4().hex[:12]}")
    data_entrada: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    nome_marca: str
    responsavel: str
    email: EmailStr
    telemovel: str
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    categoria: str
    descricao_marca: str
    origem_producao: str
    sustentabilidade_texto: Optional[str] = None
    sustentabilidade_percentagem: Optional[float] = None
    paises_producao: Optional[str] = None
    participacoes_anteriores: Optional[str] = None
    alojamento: Optional[str] = None
    opcao_participacao: str
    valor_final: float = 0
    fotos_enviadas: bool = False
    logotipo_enviado: bool = False
    texto_marca_enviado: bool = False
    materiais_falta: Optional[str] = None
    decisao_curadoria: CandidaturaStatus = CandidaturaStatus.PENDING
    estado_geral: str = "Em Análise"
    notas_curadoria: Optional[str] = None
    analise_automatica_ia: Optional[str] = None
    panorama_geral_impacto: Optional[str] = None
    recomendacao_ia: Optional[str] = None
    contrato_pdf: Optional[str] = None
    comprovativo_pagamento: Optional[str] = None
    user_id: Optional[str] = None
    edicao: Optional[str] = None
    edicao_id: Optional[str] = None
    fonte: Optional[str] = None
    comentarios: Optional[str] = None
    pagamento: Optional[str] = None
    email_confirmado: bool = False

class CandidaturaCreate(BaseModel):
    nome_marca: str
    responsavel: str
    email: EmailStr
    telemovel: str
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    categoria: str
    descricao_marca: str
    origem_producao: str
    sustentabilidade_texto: Optional[str] = None
    sustentabilidade_percentagem: Optional[float] = None
    paises_producao: Optional[str] = None
    participacoes_anteriores: Optional[str] = None
    alojamento: Optional[str] = None
    opcao_participacao: str

class MarcaAprovada(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"marca_{uuid.uuid4().hex[:12]}")
    marca: str
    responsavel: str
    email: EmailStr
    categoria: str
    valor_final: float
    estado_pagamento: PaymentStatus = PaymentStatus.PENDING
    contrato_gerado: bool = False
    contrato_assinado: bool = False
    pasta_drive: Optional[str] = None
    materiais_completos: bool = False
    notas_internas: Optional[str] = None
    candidatura_id: Optional[str] = None

class Logistica(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"log_{uuid.uuid4().hex[:12]}")
    marca: str
    mesa: Optional[str] = None
    cadeiras: Optional[str] = None
    alojamento: Optional[str] = None
    montagem: Optional[str] = None
    desmontagem: Optional[str] = None
    notas: Optional[str] = None

class Comunicacao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"com_{uuid.uuid4().hex[:12]}")
    marca: str
    tipo_email: str
    data: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    conteudo: str
    enviado: bool = False

class Sustentabilidade(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"sust_{uuid.uuid4().hex[:12]}")
    marca: str
    grau_sustentabilidade: str
    texto: Optional[str] = None
    percentagem: Optional[float] = None
    verificado: bool = False
    notas: Optional[str] = None

class SocialMedia(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"social_{uuid.uuid4().hex[:12]}")
    marca: str
    ig_post: Optional[str] = None
    fb_post: Optional[str] = None
    google_business: Optional[str] = None
    story: Optional[str] = None
    reel: Optional[str] = None
    imagem_sugerida: Optional[str] = None
    estado: str = "Pendente"

class Patrocinador(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"pat_{uuid.uuid4().hex[:12]}")
    empresa: str
    morada: Optional[str] = None
    nif: str
    valor: float = 0
    iva: float = 0
    total_fatura: float = 0
    data_pagamento: Optional[str] = None
    notas: Optional[str] = None
    categoria: Optional[str] = None

class TabelaPrecos(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"preco_{uuid.uuid4().hex[:12]}")
    nome: str  # e.g., "Stand Individual", "Stand Partilhado"
    descricao: Optional[str] = None
    valor_base: float  # Valor sem IVA
    iva_percentagem: float = 23.0  # IVA em Portugal
    valor_iva: float = 0
    valor_total: float = 0
    inclui: Optional[str] = None  # O que está incluído
    edicao: Optional[str] = None  # Edição específica ou "Todas"
    ativo: bool = True

# ============== AUTH HELPERS ==============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ============== EMAIL HELPERS ==============
async def send_email(to_email: str, subject: str, html_content: str, marca: str = None):
    """Send email using Resend API"""
    try:
        params = {
            "from": f"Mercado no Castelo <{SENDER_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        response = resend.Emails.send(params)
        logger.info(f"Email sent to {to_email}: {response}")
        
        # Log communication
        if marca:
            com_doc = {
                "id": f"com_{uuid.uuid4().hex[:12]}",
                "marca": marca,
                "tipo_email": subject,
                "data": datetime.now(timezone.utc).isoformat(),
                "conteudo": f"Email enviado para {to_email}",
                "enviado": True
            }
            await db.comunicacao.insert_one(com_doc)
        
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

def get_candidatura_confirmation_email(nome_marca: str, responsavel: str):
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png" alt="Mercado no Castelo" style="height: 50px; margin-bottom: 20px;">
        <h2 style="color: #8C3B20;">Candidatura Recebida!</h2>
        <p>Olá {responsavel},</p>
        <p>Recebemos a candidatura da marca <strong>{nome_marca}</strong> para o Mercado no Castelo.</p>
        <p>A sua candidatura está agora em análise pela nossa equipa de curadoria. Iremos avaliar o seu projeto com base nos nossos critérios de qualidade, sustentabilidade e adequação ao evento.</p>
        <p>Receberá uma resposta no prazo de 7 dias úteis.</p>
        <br>
        <p>Com os melhores cumprimentos,</p>
        <p><strong>Equipa Mercado no Castelo</strong></p>
        <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 20px 0;">
        <p style="font-size: 12px; color: #66665E;">
            <a href="https://www.instagram.com/mercado_no_castelo/" style="color: #8C3B20;">Instagram</a> | 
            <a href="https://www.mercadonocastelo.pt" style="color: #8C3B20;">Website</a>
        </p>
    </div>
    """

def get_approval_email(nome_marca: str, responsavel: str, valor: float, opcao_participacao: str = ""):
    """Generate approval email with payment details"""
    # Extract price info from opcao_participacao if available
    preco_info = ""
    if opcao_participacao:
        if "467,40" in opcao_participacao or "467.40" in opcao_participacao:
            preco_info = "467,40€ (380,00€ + IVA)"
        elif "888,06" in opcao_participacao or "888.06" in opcao_participacao:
            preco_info = "888,06€ (722,00€ + IVA)"
        elif "853,01" in opcao_participacao or "853.01" in opcao_participacao:
            preco_info = "853,01€ (693,50€ + IVA)"
        elif "430,50" in opcao_participacao or "430.50" in opcao_participacao:
            preco_info = "430,50€ (350,00€ + IVA)"
    
    if not preco_info:
        preco_info = f"{valor:.2f}€"
    
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAFAF8;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png" alt="Mercado no Castelo" style="height: 60px; margin-bottom: 20px;">
            
            <h2 style="color: #43523D; margin-bottom: 20px;">Parabéns! A sua candidatura foi aprovada!</h2>
            
            <p style="color: #1A1A1A;">Olá <strong>{responsavel}</strong>,</p>
            
            <p style="color: #1A1A1A;">Temos o prazer de informar que a marca <strong style="color: #8C3B20;">{nome_marca}</strong> foi <strong style="color: #43523D;">APROVADA</strong> para participar no Mercado no Castelo!</p>
            
            <div style="background-color: #F2F2ED; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #8C3B20; margin-top: 0;">Detalhes da Participação</h3>
                <p style="margin: 5px 0;"><strong>Opção:</strong> {opcao_participacao or 'Espaço Base'}</p>
                <p style="margin: 5px 0;"><strong>Valor Total:</strong> {preco_info}</p>
            </div>
            
            <div style="background-color: #E8F5E9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #43523D;">
                <h3 style="color: #43523D; margin-top: 0;">Dados para Pagamento</h3>
                <p style="margin: 5px 0;"><strong>IBAN:</strong> PT50 0023 0000 4562 4816 3089 4</p>
                <p style="margin: 5px 0;"><strong>Titular:</strong> Ana Noronha</p>
                <p style="margin: 5px 0;"><strong>Referência:</strong> {nome_marca[:20]}</p>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #66665E;">Por favor envie o comprovativo de pagamento para <a href="mailto:geral@mercadonocastelo.pt" style="color: #8C3B20;">geral@mercadonocastelo.pt</a></p>
            </div>
            
            <h3 style="color: #8C3B20;">Próximos Passos:</h3>
            <ol style="color: #1A1A1A; line-height: 1.8;">
                <li>Efetue o pagamento através dos dados acima</li>
                <li>Envie o comprovativo de pagamento por email</li>
                <li>Envie os materiais de comunicação (fotos HD, logótipo, texto descritivo)</li>
                <li>Aguarde confirmação e informações logísticas</li>
            </ol>
            
            <p style="color: #1A1A1A;">Bem-vindo à família Mercado no Castelo!</p>
            
            <p style="color: #1A1A1A; margin-top: 30px;">Com os melhores cumprimentos,<br><strong>Equipa Mercado no Castelo</strong></p>
            
            <hr style="border: none; border-top: 1px solid #E5E5DF; margin: 30px 0 20px 0;">
            
            <p style="font-size: 12px; color: #66665E; text-align: center;">
                <a href="https://www.instagram.com/mercado_no_castelo/" style="color: #8C3B20; text-decoration: none;">Instagram</a> | 
                <a href="https://www.mercadonocastelo.pt" style="color: #8C3B20; text-decoration: none;">Website</a> |
                <a href="mailto:geral@mercadonocastelo.pt" style="color: #8C3B20; text-decoration: none;">geral@mercadonocastelo.pt</a>
            </p>
        </div>
    </div>
    """

def get_rejection_email(nome_marca: str, responsavel: str):
    return f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="https://static.wixstatic.com/media/a5b410_2db3a7b04bac4e4e9584ac58bbe4acc3~mv2.png" alt="Mercado no Castelo" style="height: 50px; margin-bottom: 20px;">
        <h2 style="color: #8C3B20;">Resultado da Candidatura</h2>
        <p>Olá {responsavel},</p>
        <p>Agradecemos o interesse da marca <strong>{nome_marca}</strong> em participar no Mercado no Castelo.</p>
        <p>Após uma análise cuidadosa, lamentamos informar que nesta edição não nos foi possível incluir a vossa marca no evento.</p>
        <p>Esta decisão não reflete a qualidade do vosso trabalho, mas sim as limitações de espaço e a necessidade de manter um equilíbrio entre as diferentes categorias.</p>
        <p>Encorajamos vivamente a candidatura em futuras edições!</p>
        <br>
        <p>Com os melhores cumprimentos,</p>
        <p><strong>Equipa Mercado no Castelo</strong></p>
    </div>
    """

async def get_current_user(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Optional[User]:
    token = None
    if credentials:
        token = credentials.credentials
    if not token:
        token = request.cookies.get("session_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_doc = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
        if not user_doc:
            session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
            if session_doc:
                user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
        if user_doc:
            if isinstance(user_doc.get('created_at'), str):
                user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
            return User(**user_doc)
    except jwt.ExpiredSignatureError:
        pass
    except jwt.InvalidTokenError:
        session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session_doc:
            expires_at = session_doc.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
                if user_doc:
                    if isinstance(user_doc.get('created_at'), str):
                        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
                    return User(**user_doc)
    return None

async def require_auth(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    user = await get_current_user(request, credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    return user

async def require_admin(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    user = await require_auth(request, credentials)
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
    return user

# ============== AI ANALYSIS ==============
async def analyze_candidatura_with_ai(candidatura: dict) -> dict:
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analysis_{candidatura.get('id', 'new')}",
            system_message="""Você é um curador especialista do Mercado no Castelo, um mercado português de marcas artesanais e sustentáveis. 
            Analise candidaturas de marcas avaliando: qualidade da descrição, foco em sustentabilidade, adequação ao evento, e potencial de impacto.
            Responda sempre em português de Portugal."""
        )
        chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        prompt = f"""Analise esta candidatura para o Mercado no Castelo 2025:

Marca: {candidatura.get('nome_marca', 'N/A')}
Categoria: {candidatura.get('categoria', 'N/A')}
Descrição: {candidatura.get('descricao_marca', 'N/A')}
Origem da Produção: {candidatura.get('origem_producao', 'N/A')}
Sustentabilidade: {candidatura.get('sustentabilidade_texto', 'Não especificado')}
Percentagem Sustentabilidade: {candidatura.get('sustentabilidade_percentagem', 'N/A')}%
Países de Produção: {candidatura.get('paises_producao', 'N/A')}
Participações Anteriores: {candidatura.get('participacoes_anteriores', 'Primeira vez')}

Por favor forneça:
1. ANÁLISE GERAL (2-3 frases sobre a candidatura)
2. PANORAMA DE IMPACTO (potencial da marca no evento)
3. RECOMENDAÇÃO (Aprovar / Lista de Espera / Rejeitar) com justificação breve"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        lines = response.split('\n')
        analise = ""
        panorama = ""
        recomendacao = ""
        current_section = ""
        
        for line in lines:
            line_lower = line.lower()
            if 'análise' in line_lower or 'analise' in line_lower:
                current_section = "analise"
            elif 'panorama' in line_lower or 'impacto' in line_lower:
                current_section = "panorama"
            elif 'recomendação' in line_lower or 'recomendacao' in line_lower:
                current_section = "recomendacao"
            elif current_section == "analise":
                analise += line + " "
            elif current_section == "panorama":
                panorama += line + " "
            elif current_section == "recomendacao":
                recomendacao += line + " "
        
        return {
            "analise_automatica_ia": analise.strip() or response[:500],
            "panorama_geral_impacto": panorama.strip() or "Análise pendente",
            "recomendacao_ia": recomendacao.strip() or "Revisão manual necessária"
        }
    except Exception as e:
        logger.error(f"AI Analysis error: {e}")
        return {
            "analise_automatica_ia": "Análise automática indisponível",
            "panorama_geral_impacto": "Pendente revisão manual",
            "recomendacao_ia": "Requer avaliação humana"
        }

# ============== AUTH ROUTES ==============
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email já registado")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "role": user_data.role.value,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.role.value)
    return {"token": token, "user": {"user_id": user_id, "email": user_data.email, "name": user_data.name, "role": user_data.role.value}}

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    token = create_token(user_doc["user_id"], user_doc["role"])
    response.set_cookie(key="session_token", value=token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
    return {"token": token, "user": {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"], "role": user_doc["role"]}}

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id obrigatório")
    
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Sessão inválida")
        data = resp.json()
    
    user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": data["email"],
            "name": data.get("name", ""),
            "picture": data.get("picture"),
            "role": UserRole.BRAND.value,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    else:
        user_id = user_doc["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": data.get("name", user_doc.get("name")), "picture": data.get("picture")}})
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    session_token = data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60)
    return {"user": {"user_id": user_doc["user_id"], "email": user_doc["email"], "name": user_doc["name"], "role": user_doc.get("role", "brand"), "picture": user_doc.get("picture")}, "token": session_token}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    return {"user_id": user.user_id, "email": user.email, "name": user.name, "role": user.role.value, "picture": user.picture}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logout efectuado"}

# ============== CANDIDATURAS ROUTES ==============
@api_router.get("/candidaturas", response_model=List[Candidatura])
async def get_candidaturas(user: User = Depends(require_auth)):
    query = {} if user.role == UserRole.ADMIN else {"user_id": user.user_id}
    docs = await db.candidaturas.find(query, {"_id": 0}).to_list(1000)
    for doc in docs:
        if isinstance(doc.get('data_entrada'), str):
            doc['data_entrada'] = datetime.fromisoformat(doc['data_entrada'])
    return docs

@api_router.get("/candidaturas/{id}")
async def get_candidatura(id: str, user: User = Depends(require_auth)):
    doc = await db.candidaturas.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    if user.role != UserRole.ADMIN and doc.get("user_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")
    if isinstance(doc.get('data_entrada'), str):
        doc['data_entrada'] = datetime.fromisoformat(doc['data_entrada'])
    return doc

@api_router.post("/candidaturas", response_model=Candidatura)
async def create_candidatura(data: CandidaturaCreate, user: User = Depends(require_auth)):
    candidatura = Candidatura(**data.model_dump(), user_id=user.user_id)
    doc = candidatura.model_dump()
    doc['data_entrada'] = doc['data_entrada'].isoformat()
    
    ai_analysis = await analyze_candidatura_with_ai(doc)
    doc.update(ai_analysis)
    
    await db.candidaturas.insert_one(doc)
    
    # Send confirmation email
    asyncio.create_task(send_email(
        to_email=data.email,
        subject="Candidatura Recebida - Mercado no Castelo",
        html_content=get_candidatura_confirmation_email(data.nome_marca, data.responsavel),
        marca=data.nome_marca
    ))
    
    return candidatura

@api_router.put("/candidaturas/{id}")
async def update_candidatura(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.candidaturas.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    return {"message": "Candidatura atualizada"}

@api_router.post("/candidaturas/{id}/analyze")
async def analyze_candidatura(id: str, user: User = Depends(require_admin)):
    doc = await db.candidaturas.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    
    ai_analysis = await analyze_candidatura_with_ai(doc)
    await db.candidaturas.update_one({"id": id}, {"$set": ai_analysis})
    return ai_analysis

@api_router.post("/candidaturas/{id}/approve")
async def approve_candidatura(id: str, user: User = Depends(require_admin)):
    doc = await db.candidaturas.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    
    valor_final = doc.get("valor_final", 250)  # Default value
    await db.candidaturas.update_one({"id": id}, {"$set": {"decisao_curadoria": CandidaturaStatus.APPROVED.value, "estado_geral": "Aprovada", "valor_final": valor_final}})
    
    marca_aprovada = MarcaAprovada(
        marca=doc["nome_marca"],
        responsavel=doc["responsavel"],
        email=doc["email"],
        categoria=doc["categoria"],
        valor_final=valor_final,
        candidatura_id=id
    )
    await db.marcas_aprovadas.insert_one(marca_aprovada.model_dump())
    
    # Send approval email
    asyncio.create_task(send_email(
        to_email=doc["email"],
        subject="Candidatura Aprovada! - Mercado no Castelo",
        html_content=get_approval_email(doc["nome_marca"], doc["responsavel"], valor_final, doc.get("opcao_participacao", "")),
        marca=doc["nome_marca"]
    ))
    
    # Mark email as sent
    await db.candidaturas.update_one({"id": id}, {"$set": {"email_confirmado": True}})
    
    return {"message": "Candidatura aprovada e marca adicionada"}

@api_router.post("/candidaturas/{id}/reject")
async def reject_candidatura(id: str, user: User = Depends(require_admin)):
    doc = await db.candidaturas.find_one({"id": id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    
    await db.candidaturas.update_one({"id": id}, {"$set": {"decisao_curadoria": CandidaturaStatus.REJECTED.value, "estado_geral": "Rejeitada"}})
    
    # Send rejection email
    asyncio.create_task(send_email(
        to_email=doc["email"],
        subject="Resultado da Candidatura - Mercado no Castelo",
        html_content=get_rejection_email(doc["nome_marca"], doc["responsavel"]),
        marca=doc["nome_marca"]
    ))
    
    return {"message": "Candidatura rejeitada"}

@api_router.delete("/candidaturas/{id}")
async def delete_candidatura(id: str, user: User = Depends(require_admin)):
    result = await db.candidaturas.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    return {"message": "Candidatura eliminada"}

# ============== MARCAS APROVADAS ROUTES ==============
@api_router.get("/marcas", response_model=List[MarcaAprovada])
async def get_marcas(user: User = Depends(require_admin)):
    docs = await db.marcas_aprovadas.find({}, {"_id": 0}).to_list(1000)
    return docs

@api_router.put("/marcas/{id}")
async def update_marca(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.marcas_aprovadas.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Marca não encontrada")
    return {"message": "Marca atualizada"}

# ============== LOGISTICA ROUTES ==============
@api_router.get("/logistica", response_model=List[Logistica])
async def get_logistica(user: User = Depends(require_admin)):
    docs = await db.logistica.find({}, {"_id": 0}).to_list(1000)
    return docs

@api_router.post("/logistica", response_model=Logistica)
async def create_logistica(data: Logistica, user: User = Depends(require_admin)):
    await db.logistica.insert_one(data.model_dump())
    return data

@api_router.put("/logistica/{id}")
async def update_logistica(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.logistica.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado")
    return {"message": "Logística atualizada"}

# ============== COMUNICACAO ROUTES ==============
@api_router.get("/comunicacao", response_model=List[Comunicacao])
async def get_comunicacao(user: User = Depends(require_admin)):
    docs = await db.comunicacao.find({}, {"_id": 0}).to_list(1000)
    for doc in docs:
        if isinstance(doc.get('data'), str):
            doc['data'] = datetime.fromisoformat(doc['data'])
    return docs

@api_router.post("/comunicacao", response_model=Comunicacao)
async def create_comunicacao(data: dict, user: User = Depends(require_admin)):
    com = Comunicacao(**data)
    doc = com.model_dump()
    doc['data'] = doc['data'].isoformat()
    await db.comunicacao.insert_one(doc)
    return com

# ============== SUSTENTABILIDADE ROUTES ==============
@api_router.get("/sustentabilidade", response_model=List[Sustentabilidade])
async def get_sustentabilidade(user: User = Depends(require_admin)):
    docs = await db.sustentabilidade.find({}, {"_id": 0}).to_list(1000)
    return docs

@api_router.post("/sustentabilidade", response_model=Sustentabilidade)
async def create_sustentabilidade(data: Sustentabilidade, user: User = Depends(require_admin)):
    await db.sustentabilidade.insert_one(data.model_dump())
    return data

@api_router.put("/sustentabilidade/{id}")
async def update_sustentabilidade(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.sustentabilidade.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado")
    return {"message": "Sustentabilidade atualizada"}

# ============== SOCIAL MEDIA ROUTES ==============
@api_router.get("/socialmedia", response_model=List[SocialMedia])
async def get_socialmedia(user: User = Depends(require_admin)):
    docs = await db.socialmedia.find({}, {"_id": 0}).to_list(1000)
    return docs

@api_router.post("/socialmedia", response_model=SocialMedia)
async def create_socialmedia(data: SocialMedia, user: User = Depends(require_admin)):
    await db.socialmedia.insert_one(data.model_dump())
    return data

@api_router.put("/socialmedia/{id}")
async def update_socialmedia(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.socialmedia.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registo não encontrado")
    return {"message": "Social Media atualizado"}

# ============== PATROCINADORES ROUTES ==============
@api_router.get("/patrocinadores", response_model=List[Patrocinador])
async def get_patrocinadores(user: User = Depends(require_admin)):
    docs = await db.patrocinadores.find({}, {"_id": 0}).to_list(1000)
    return docs

@api_router.post("/patrocinadores", response_model=Patrocinador)
async def create_patrocinador(data: Patrocinador, user: User = Depends(require_admin)):
    await db.patrocinadores.insert_one(data.model_dump())
    return data

@api_router.put("/patrocinadores/{id}")
async def update_patrocinador(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.patrocinadores.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patrocinador não encontrado")
    return {"message": "Patrocinador atualizado"}

# ============== DASHBOARD STATS ==============
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: User = Depends(require_admin)):
    total_candidaturas = await db.candidaturas.count_documents({})
    candidaturas_pendentes = await db.candidaturas.count_documents({"decisao_curadoria": CandidaturaStatus.PENDING.value})
    candidaturas_aprovadas = await db.candidaturas.count_documents({"decisao_curadoria": CandidaturaStatus.APPROVED.value})
    total_marcas = await db.marcas_aprovadas.count_documents({})
    pagamentos_pendentes = await db.marcas_aprovadas.count_documents({"estado_pagamento": PaymentStatus.PENDING.value})
    total_patrocinadores = await db.patrocinadores.count_documents({})
    
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$valor_final"}}}]
    result = await db.marcas_aprovadas.aggregate(pipeline).to_list(1)
    receita_marcas = result[0]["total"] if result else 0
    
    result = await db.patrocinadores.aggregate(pipeline).to_list(1)
    receita_patrocinadores = result[0]["total"] if result else 0
    
    return {
        "total_candidaturas": total_candidaturas,
        "candidaturas_pendentes": candidaturas_pendentes,
        "candidaturas_aprovadas": candidaturas_aprovadas,
        "total_marcas": total_marcas,
        "pagamentos_pendentes": pagamentos_pendentes,
        "total_patrocinadores": total_patrocinadores,
        "receita_marcas": receita_marcas,
        "receita_patrocinadores": receita_patrocinadores,
        "receita_total": receita_marcas + receita_patrocinadores
    }

# ============== CATEGORIAS ==============
@api_router.get("/categorias")
async def get_categorias():
    return {
        "categorias": [
            "Moda", "Decoração", "Alimentação", "Lifestyle", 
            "Joalharia", "Cerâmica", "Têxtil", "Cosmética Natural",
            "Artesanato", "Design", "Plantas", "Outros"
        ],
        "opcoes_participacao": [
            "Stand Individual", "Stand Partilhado", "Food Court", "Expositor"
        ]
    }

# ============== EDICOES (Editions) ==============
class Edicao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: f"ed_{uuid.uuid4().hex[:12]}")
    nome: str
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None
    local: str
    estado: str = "Planeada"  # Planeada, Ativa, Concluída
    google_form_url: Optional[str] = None
    notas: Optional[str] = None

@api_router.get("/edicoes")
async def get_edicoes(user: User = Depends(require_auth)):
    docs = await db.edicoes.find({}, {"_id": 0}).to_list(100)
    return docs

@api_router.post("/edicoes")
async def create_edicao(data: Edicao, user: User = Depends(require_admin)):
    await db.edicoes.insert_one(data.model_dump())
    return data

@api_router.put("/edicoes/{id}")
async def update_edicao(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    result = await db.edicoes.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Edição não encontrada")
    return {"message": "Edição atualizada"}

# ============== SEND EMAIL ENDPOINT ==============
class EmailRequest(BaseModel):
    to_email: str
    subject: str
    template: str  # confirmation, approval, rejection, custom
    marca: str
    responsavel: str
    valor: Optional[float] = 0
    custom_content: Optional[str] = None

@api_router.post("/email/send")
async def send_email_endpoint(data: EmailRequest, user: User = Depends(require_admin)):
    if data.template == "confirmation":
        html = get_candidatura_confirmation_email(data.marca, data.responsavel)
    elif data.template == "approval":
        html = get_approval_email(data.marca, data.responsavel, data.valor)
    elif data.template == "rejection":
        html = get_rejection_email(data.marca, data.responsavel)
    else:
        html = data.custom_content or f"<p>{data.marca}</p>"
    
    success = await send_email(data.to_email, data.subject, html, data.marca)
    return {"success": success, "message": "Email enviado" if success else "Falha no envio"}

# ============== BULK EMAIL ==============
class BulkEmailRequest(BaseModel):
    template: str  # approval, rejection
    candidatura_ids: Optional[List[str]] = None  # If None, send to all pending

@api_router.get("/email/pending-approval")
async def get_pending_approval_emails(user: User = Depends(require_admin)):
    """Get list of approved candidaturas that haven't received confirmation email"""
    docs = await db.candidaturas.find(
        {"decisao_curadoria": "Aprovada", "email_confirmado": {"$ne": True}},
        {"_id": 0, "id": 1, "nome_marca": 1, "responsavel": 1, "email": 1, "opcao_participacao": 1, "valor_final": 1}
    ).to_list(500)
    return {"count": len(docs), "candidaturas": docs}

@api_router.post("/email/bulk-send")
async def send_bulk_emails(data: BulkEmailRequest, user: User = Depends(require_admin)):
    """Send emails in bulk to approved candidaturas"""
    # Get candidaturas to email
    query = {"decisao_curadoria": "Aprovada", "email_confirmado": {"$ne": True}}
    if data.candidatura_ids:
        query["id"] = {"$in": data.candidatura_ids}
    
    docs = await db.candidaturas.find(query, {"_id": 0}).to_list(500)
    
    if not docs:
        return {"success": False, "message": "Nenhuma candidatura pendente de email", "sent": 0, "failed": 0}
    
    sent = 0
    failed = 0
    results = []
    
    for doc in docs:
        try:
            if data.template == "approval":
                html = get_approval_email(
                    doc["nome_marca"], 
                    doc["responsavel"], 
                    doc.get("valor_final", 0),
                    doc.get("opcao_participacao", "")
                )
                subject = "Candidatura Aprovada! - Mercado no Castelo"
            elif data.template == "rejection":
                html = get_rejection_email(doc["nome_marca"], doc["responsavel"])
                subject = "Resultado da Candidatura - Mercado no Castelo"
            else:
                continue
            
            success = await send_email(doc["email"], subject, html, doc["nome_marca"])
            
            if success:
                # Mark as email sent
                await db.candidaturas.update_one(
                    {"id": doc["id"]},
                    {"$set": {"email_confirmado": True}}
                )
                sent += 1
                results.append({"id": doc["id"], "marca": doc["nome_marca"], "status": "sent"})
            else:
                failed += 1
                results.append({"id": doc["id"], "marca": doc["nome_marca"], "status": "failed"})
                
        except Exception as e:
            logger.error(f"Error sending email to {doc['email']}: {e}")
            failed += 1
            results.append({"id": doc["id"], "marca": doc["nome_marca"], "status": "error", "error": str(e)})
    
    return {
        "success": sent > 0,
        "message": f"Enviados {sent} emails, {failed} falharam",
        "sent": sent,
        "failed": failed,
        "results": results
    }

# ============== TABELA DE PREÇOS ==============
@api_router.get("/precos")
async def get_precos():
    """Get all active price options - public endpoint for brand portal"""
    docs = await db.tabela_precos.find({"ativo": True}, {"_id": 0}).to_list(100)
    return docs

@api_router.get("/precos/all")
async def get_all_precos(user: User = Depends(require_admin)):
    """Get all price options including inactive - admin only"""
    docs = await db.tabela_precos.find({}, {"_id": 0}).to_list(100)
    return docs

@api_router.post("/precos")
async def create_preco(data: TabelaPrecos, user: User = Depends(require_admin)):
    # Calculate IVA and total
    data.valor_iva = round(data.valor_base * (data.iva_percentagem / 100), 2)
    data.valor_total = round(data.valor_base + data.valor_iva, 2)
    await db.tabela_precos.insert_one(data.model_dump())
    return data

@api_router.put("/precos/{id}")
async def update_preco(id: str, data: dict, user: User = Depends(require_admin)):
    data.pop('_id', None)
    data.pop('id', None)
    # Recalculate if valor_base changes
    if 'valor_base' in data:
        iva_perc = data.get('iva_percentagem', 23.0)
        data['valor_iva'] = round(data['valor_base'] * (iva_perc / 100), 2)
        data['valor_total'] = round(data['valor_base'] + data['valor_iva'], 2)
    result = await db.tabela_precos.update_one({"id": id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Preço não encontrado")
    return {"message": "Preço atualizado"}

@api_router.delete("/precos/{id}")
async def delete_preco(id: str, user: User = Depends(require_admin)):
    result = await db.tabela_precos.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Preço não encontrado")
    return {"message": "Preço eliminado"}

@api_router.post("/precos/seed")
async def seed_precos(user: User = Depends(require_admin)):
    """Seed initial pricing data based on the provided price table"""
    # Check if already seeded
    existing = await db.tabela_precos.count_documents({})
    if existing > 0:
        return {"message": "Tabela de preços já existe", "count": existing}
    
    # Price options based on the Excel file data
    precos = [
        {
            "id": "preco_stand_individual",
            "nome": "Stand Individual",
            "descricao": "Espaço individual para exposição de produtos",
            "valor_base": 300.00,
            "iva_percentagem": 23.0,
            "valor_iva": 69.00,
            "valor_total": 369.00,
            "inclui": "Mesa, 2 cadeiras, acesso a eletricidade",
            "edicao": "Todas",
            "ativo": True
        },
        {
            "id": "preco_stand_partilhado",
            "nome": "Stand Partilhado",
            "descricao": "Espaço partilhado com outra marca",
            "valor_base": 310.00,
            "iva_percentagem": 23.0,
            "valor_iva": 71.30,
            "valor_total": 381.30,
            "inclui": "Mesa partilhada, 1 cadeira, acesso a eletricidade",
            "edicao": "Todas",
            "ativo": True
        },
        {
            "id": "preco_stand_premium",
            "nome": "Stand Premium",
            "descricao": "Espaço premium com localização privilegiada",
            "valor_base": 495.00,
            "iva_percentagem": 23.0,
            "valor_iva": 113.85,
            "valor_total": 608.85,
            "inclui": "Mesa grande, 3 cadeiras, localização premium, eletricidade",
            "edicao": "Todas",
            "ativo": True
        },
        {
            "id": "preco_food_court",
            "nome": "Food Court",
            "descricao": "Espaço na área de alimentação",
            "valor_base": 500.00,
            "iva_percentagem": 23.0,
            "valor_iva": 115.00,
            "valor_total": 615.00,
            "inclui": "Espaço food court, mesa, cadeiras, eletricidade, água",
            "edicao": "Todas",
            "ativo": True
        },
        {
            "id": "preco_expositor_grande",
            "nome": "Expositor Grande",
            "descricao": "Espaço grande para exposição",
            "valor_base": 600.00,
            "iva_percentagem": 23.0,
            "valor_iva": 138.00,
            "valor_total": 738.00,
            "inclui": "2 mesas, 4 cadeiras, espaço grande, eletricidade",
            "edicao": "Todas",
            "ativo": True
        }
    ]
    
    await db.tabela_precos.insert_many(precos)
    return {"message": "Tabela de preços criada", "count": len(precos)}

@api_router.get("/")
async def root():
    return {"message": "Mercado no Castelo API", "version": "1.0.0"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
