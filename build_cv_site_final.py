#!/usr/bin/env python3
"""
build_cv_site_final.py — CV Ana Noronha PT + EN
Coordenadas em pdfplumber.top; conversão: rl_y = H - (top + font_size)
"""

from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('Sans',  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Mono',  '/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf'))
pdfmetrics.registerFont(TTFont('MonoB', '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf'))

W, H = 595.3, 841.9
BG   = colors.HexColor('#F0EDE6')
DARK = colors.HexColor('#1A1814')
RUST = colors.HexColor('#B5451B')
MID  = colors.HexColor('#6B6560')
DISS = colors.HexColor('#686560')
CREAM= colors.HexColor('#F0EDE6')
GRAY = colors.HexColor('#B9B7B4')
LINE = colors.HexColor('#DDDAD3')

SW=164; SX=24; SMW=132; MX=192; MW=387.3; P2X=28; P2W=475.3
TS=7.5; LH=13.0; LH_SB=15.5


def build(lang):
    is_en = (lang == 'en')
    fn = f'CV_Ana_Noronha_2026_{"Eng" if is_en else "PT"}_SITE_FINAL.pdf'
    c = canvas.Canvas(fn, pagesize=(W, H))

    def rl(top, sz): return H - top - sz * 0.793

    def t(s, bold, x, top, col, sz=TS):
        c.setFont('MonoB' if bold else 'Mono', sz)
        c.setFillColor(col); c.drawString(x, rl(top, sz), s)

    def tsans(s, x, top, col, sz):
        c.setFont('Sans', sz); c.setFillColor(col)
        c.drawString(x, rl(top, sz), s)

    def tr(s, xr, top, col, sz=TS):
        c.setFont('Mono', sz); c.setFillColor(col)
        c.drawRightString(xr, rl(top, sz), s)

    def wrap(s, bold, x, top, col, maxw, lh=LH, sz=TS):
        font = 'MonoB' if bold else 'Mono'
        c.setFont(font, sz); c.setFillColor(col)
        words = s.split(); line = ''
        for w in words:
            test = (line + ' ' + w).strip()
            if c.stringWidth(test, font, sz) <= maxw: line = test
            else:
                c.drawString(x, rl(top, sz), line); top += lh; line = w
        if line: c.drawString(x, rl(top, sz), line); top += lh
        return top

    def hline(x, top, w, col=RUST, lw=0.5):
        c.setStrokeColor(col); c.setLineWidth(lw)
        c.line(x, H - top, x + w, H - top)

    def sec(title, x, top, lw, sz_title=9):
        t(title, True, x, top, RUST, sz=sz_title)
        hline(x, top + sz_title + 3, lw)
        return top + 17.5

    def sb_sec(title, top):   return sec(title, SX, top, SMW)
    def main_sec(title, top): return sec(title, MX, top, MW)
    def p2_sec(title, top):   return sec(title, P2X, top, P2W)

    def job(role, date, org, desc, rl_lbl, results, rsp_lbl, resps, top, x=MX, w=MW):
        t(role.upper(), True, x, top, RUST); tr(date, x + w, top, MID); top += LH
        top = wrap(org, True, x, top, DARK, w); top += 2
        if desc: top = wrap(desc, False, x, top, MID, w); top += 4
        if results:
            t(rl_lbl, True, x, top, DARK); top += LH
            for r in results:
                t('·', False, x, top, DARK)
                top = wrap(r, False, x + 9, top, DARK, w - 9)
            top += 2
        if resps:
            t(rsp_lbl, True, x, top, DARK); top += LH
            for r in resps:
                t('·', False, x, top, DARK)
                top = wrap(r, False, x + 9, top, DARK, w - 9)
            top += 2
        return top

    # PÁGINA 1
    c.setFillColor(BG);   c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, 0, SW, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, H - 75, W, 75, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, 0, W, 22, fill=1, stroke=0)

    tsans('ANA NORONHA', 24, 14.6, CREAM, 22)
    if is_en:
        t('PROJECT, PROGRAMME & OPERATIONS MANAGER', True, 24, 41.1, RUST)
        t('Projects, Operations & International Delivery', False, 24, 51.9, GRAY)
    else:
        t('GESTORA DE PROJETOS, PROGRAMAS E OPERAÇÕES', True, 24, 41.1, RUST)
        t('Projetos, Operações e Execução Internacional', False, 24, 51.9, GRAY)
    t('Braga, Portugal',             False, 513.8, 15.9, GRAY)
    t('+351 917 209 881',            False, 509.3, 28.9, GRAY)
    t('anacnoronha@gmail.com',       False, 486.8, 41.9, GRAY)
    t('linkedin.com/in/ana-noronha', False, 459.8, 54.9, GRAY)
    t('© 2026 ANA NORONHA', False, 265.2, 830.0, GRAY, sz=6)
    tr('PT · EN · ES', W - 20, 830.0, GRAY, sz=6)

    # SIDEBAR
    sy = 83.9
    t('IMPACTO' if not is_en else 'KEY IMPACT', True, SX, sy, RUST, sz=9)
    hline(SX, sy + 9 + 3, SMW)
    sy += 12.5

    stats = [
        ('60K+',  'Público Alcançado'  if not is_en else 'Audience Reached'),
        ('350+',  'Marcas Curadas'     if not is_en else 'Brands Curated'),
        ('13',    'Edições Realizadas' if not is_en else 'Editions Delivered'),
        ('132%',  'Execução das Metas' if not is_en else 'Target Achievement'),
    ]
    for num, label in stats:
        t(num, True, SX, sy, CREAM, sz=14); sy += 20.0
        t(label, False, SX, sy, GRAY);      sy += 14.5
    sy += 22.0

    sy = sb_sec('PERFIL' if not is_en else 'PROFILE', sy)
    if is_en:
        sy = wrap('I build the structure, systems and operating rhythm that help organisations deliver complex programmes, improve operations and turn strategy into execution.', False, SX, sy, GRAY, SMW, LH_SB)
    else:
        sy = wrap('Construo a estrutura, os sistemas e o ritmo operacional que permitem às organizações executar programas complexos, melhorar operações e transformar estratégia em execução.', False, SX, sy, GRAY, SMW, LH_SB)
    sy += 14.0

    sy = sb_sec('FOCO' if not is_en else 'FOCUS AREAS', sy)
    for f in (['Programme Management', 'Project Management', 'Operations Management', 'PMO / Project Governance', 'Strategy Execution']
              if is_en else ['Gestão de Programas', 'Gestão de Projetos', 'Gestão de Operações', 'PMO / Governação de Projetos', 'Execução da Estratégia']):
        sy = wrap(f, False, SX, sy, GRAY, SMW, LH_SB)
    sy += 14.0

    sy = sb_sec('IDIOMAS' if not is_en else 'LANGUAGES', sy)
    for l in (['Portuguese (Native)', 'English (Advanced)', 'Spanish (Intermediate)']
              if is_en else ['Português (nativo)', 'Inglês (avançado)', 'Espanhol (intermédio)']):
        sy = wrap(l, False, SX, sy, GRAY, SMW, LH_SB)
    sy += 17.0

    sy += 4.0
    sy = sb_sec('INFORMAÇÃO ADICIONAL' if not is_en else 'ADDITIONAL INFO', sy)
    if is_en:
        wrap('Available for travel. Open to programme, operations and cross-sector roles in national and international contexts.', False, SX, sy, GRAY, SMW, LH_SB)
    else:
        wrap('Disponibilidade para viagens e projetos em contexto nacional e internacional.', False, SX, sy, GRAY, SMW, LH_SB)

    # MAIN
    my = 91.9
    my = main_sec('EXPERIÊNCIA PROFISSIONAL' if not is_en else 'PROFESSIONAL EXPERIENCE', my)

    if is_en:
        my = job('Co-Founder', '2022 – Present',
            'Mercado no Castelo - Curated Design & Independent Brands Platform',
            'Independent platform dedicated to brand curation and event production, connecting creators, partners and audiences across multiple cities.',
            'KEY RESULTS',
            ['60,000+ visitors | 350+ independent brands | 13 curated event editions',
             '11,000+ organic digital followers supporting audience growth'],
            'RESPONSIBILITIES',
            ['End-to-end project management, strategy and platform positioning',
             'Operations management, strategic planning, delivery and process optimisation',
             'Partnerships, stakeholder and exhibitor management',
             'Brand curation and supplier coordination',
             'Event production, logistics and delivery control',
             'Budget planning, financial management and performance review',
             'Digital consultancy and website management for independent clients'], my)
    else:
        my = job('Co-Fundadora', '2022 – Presente',
            'Mercado no Castelo - Plataforma de curadoria e produção de marcas independentes',
            'Plataforma dedicada à curadoria de marcas e produção de eventos, ligando criadores, parceiros e público em diferentes cidades.',
            'PRINCIPAIS RESULTADOS',
            ['60.000+ visitantes · 350+ marcas independentes curadas · 13 edições realizadas',
             'Crescimento orgânico da comunidade digital para 11.000+ seguidores'],
            'RESPONSABILIDADES',
            ['Gestão end-to-end do projeto, estratégia e posicionamento da plataforma',
             'Gestão de operações, planeamento estratégico, execução e optimização de processos',
             'Gestão de parcerias, stakeholders e expositores',
             'Curadoria de marcas e coordenação de fornecedores',
             'Produção, logística e controlo da execução dos eventos',
             'Planeamento financeiro, gestão orçamental e análise de desempenho',
             'Consultoria digital e gestão de websites para clientes independentes'], my)

    hline(MX, my, MW, LINE, 0.4); my += 8

    if is_en:
        my = job('Project Coordinator', '2020 – 2023',
            'CLDS4G Social Development Programme — SCM Póvoa de Lanhoso',
            'Strategic coordination and delivery of a regional social development programme funded under the CLDS4G national framework and the European Social Fund.',
            'KEY RESULTS',
            ['37-month publicly funded programme delivered · €445.5K eligible programme budget',
             '851 participants engaged · 132% target execution',
             '69 labour market integrations · 22 professional training placements',
             'Partnerships coordinated with 19 organisations and public institutions',
             '"Devagar se Vai ao Longe" — 90 children and families · improved socio-emotional skills in 54 children · 150% execution indicator'],
            'RESPONSIBILITIES',
            ['Programme planning, governance and operational coordination',
             'M&E, KPI monitoring, performance tracking and technical and financial reporting',
             'Risk & issue management, compliance and stakeholder coordination',
             'Multidisciplinary team leadership and delivery coordination',
             'Development of the PóvoAtiva digital employability platform',
             'Implementation of "Devagar se Vai ao Longe" across 4 primary school classes'], my)
    else:
        my = job('Coordenadora de Projeto', '2020 – 2023',
            'Programa de Desenvolvimento Social CLDS4G — SCM Póvoa de Lanhoso',
            'Coordenação estratégica e operacional de um programa de desenvolvimento social financiado pelo CLDS4G e pelo Fundo Social Europeu.',
            'PRINCIPAIS RESULTADOS',
            ['Programa executado durante 37 meses · €445,5K de custo total elegível',
             '851 participantes envolvidos · 132% das metas executadas',
             '69 integrações no mercado de trabalho · 22 colocações em formação profissional',
             'Parcerias coordenadas com 19 organizações e instituições públicas',
             'Programa "Devagar se Vai ao Longe" — 90 crianças e famílias · melhoria socio-emocional em 54 crianças · 150%'],
            'RESPONSABILIDADES',
            ['Planeamento, governação e coordenação operacional do programa',
             'M&E, monitorização de KPIs, desempenho e reporting técnico e financeiro',
             'Gestão de risco e issues, compliance e coordenação de stakeholders',
             'Liderança de equipa multidisciplinar de execução',
             'Desenvolvimento da plataforma digital de empregabilidade PóvoAtiva',
             'Implementação do Programa "Devagar se Vai ao Longe" em 4 turmas do 1.º ciclo'], my)

    hline(MX, my, MW, LINE, 0.4); my += 8

    if is_en:
        my = job('Director of Operations', '2016 – 2020', 'Sabert Lda',
            'Operational coordination of international business initiatives integrating digital platforms, commercial operations and partners across Portugal, Spain and China.',
            'KEY RESULTS',
            ['Launch and operational implementation of the Casamat e-commerce platform',
             'Development and coordination of corporate digital platforms',
             "Coordination of the company's digital presence across international markets",
             'Development of commercial initiatives connecting European and Asian partners'],
            'RESPONSIBILITIES',
            ['International operations across Portugal, Spain and China, including B2B and e-commerce',
             'Digital platforms, product catalogues and institutional communication',
             'Commercial partnerships, market entry and coordination of external developers',
             'Process improvement, risk management and digital marketing initiatives',
             'Exploration of sourcing and export opportunities in Asian markets',
             'Support to operational planning and Portugal 2020 funding applications'], my)
    else:
        my = job('Diretora de Operações', '2016 – 2020', 'Sabert Lda',
            'Coordenação operacional de iniciativas empresariais internacionais que integravam plataformas digitais, operações comerciais e parceiros em Portugal, Espanha e China.',
            'PRINCIPAIS RESULTADOS',
            ['Lançamento e operacionalização da plataforma de e-commerce Casamat',
             'Desenvolvimento e coordenação das plataformas digitais corporativas',
             'Coordenação da presença digital da empresa em mercados internacionais',
             'Desenvolvimento de iniciativas comerciais entre parceiros europeus e asiáticos'],
            'RESPONSABILIDADES',
            ['Operações internacionais em Portugal, Espanha e China, incluindo B2B e e-commerce',
             'Plataformas digitais, catálogos de produto e comunicação institucional',
             'Parcerias comerciais, market entry e coordenação de programadores externos',
             'Melhoria de processos, gestão de risco e iniciativas de marketing digital',
             'Exploração de oportunidades de sourcing e exportação para mercados asiáticos',
             'Apoio ao planeamento operacional e candidaturas a financiamento Portugal 2020'], my)

    c.showPage()

    # PÁGINA 2
    c.setFillColor(BG);   c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(515.3, 0, W - 515.3, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, H - 40, W, 40, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, 0, W, 22, fill=1, stroke=0)

    tsans('ANA NORONHA', 24, 14.6, CREAM, 22)
    t('© 2026 ANA NORONHA', False, 265.2, 830.0, GRAY, sz=6)
    tr('PT · EN · ES', W - 20, 830.0, GRAY, sz=6)

    p2y = 58.9
    p2y = p2_sec('EXPERIÊNCIA ADICIONAL' if not is_en else 'ADDITIONAL EXPERIENCE', p2y)

    addl = [
        ('Diretora Técnica' if not is_en else 'Technical Director', ('Fev 2024 – Dez 2024' if not is_en else 'Feb 2024 – Dec 2024'),
         'Associação de Apoio à Saúde Mental - O Salto',
         ('Gestão estratégica e operacional. Liderança de equipa técnica, governance, gestão orçamental e controlo financeiro. Gestão de risco, compliance, stakeholders e partnerships. Sistemas digitais e processos organizacionais. Coordenação de projetos, acompanhamento, supervisão e mediação de casos psicossociais.'
          if not is_en else
          'Strategic Management and Operational Management. Team Leadership, Governance, Budget Management and Financial Control. Risk Management, Compliance, Stakeholder Management and Partnerships. Digital Systems and Organisational Processes. Project coordination, psychosocial case monitoring, supervision and mediation.')),
        ('Co-Fundadora' if not is_en else 'Co-Founder', '2013–2020',
         'Muito+ Inovação, Arte & Criatividade',
         ('Coordenação de produção, parcerias, gestão financeira e estratégia de comunicação em eventos e mercados urbanos.'
          if not is_en else
          'Production coordination, partnerships, financial management and communication strategy across events and urban markets.')),
        ('Professora Assistente' if not is_en else 'Assistant Lecturer', '2007–2013',
         'Universidade Católica Portuguesa',
         ('Docência e tutoria em Serviço Social (1.º e 2.º ciclos). Planeamento pedagógico, acompanhamento de alunos, organização de eventos académicos e ligação entre a universidade e organizações sociais.'
          if not is_en else
          'Teaching and tutoring in Social Work (undergraduate and postgraduate). Pedagogical planning, student support, academic event organisation and liaison between the university and social organisations.')),
    ]
    for role, date, org, desc in addl:
        t(role.upper(), True, P2X, p2y, RUST); tr(date, 503.3, p2y, MID); p2y += LH
        p2y = wrap(org, True, P2X, p2y, DARK, P2W); p2y += 2
        p2y = wrap(desc, False, P2X, p2y, MID, P2W); p2y += 12

    p2y = p2_sec('EDUCAÇÃO' if not is_en else 'EDUCATION', p2y)

    edu = [
        (('Programa de Doutoramento em Economia Social (incompleto)'
          if not is_en else 'Doctoral Programme in Social Economy (incomplete)'),
         ('IUDESCOOP, Universitat de València | 2012–2013'
          if not is_en else 'IUDESCOOP, University of Valencia | 2012–2013'),
         ('Investigação doutoral sobre inovação organizacional, gestão e modelos operacionais em organizações sem fins lucrativos em Portugal, com foco nas Instituições Particulares de Solidariedade Social (IPSS). Investigação: "La Innovación de las Organizaciones Sin Fin de Lucro em Portugal: El Caso de las Instituciones Particulares de Solidaridad Social"'
          if not is_en else
          'Doctoral research on organisational innovation, management and operating models in nonprofit organisations in Portugal, with a focus on Social Solidarity Institutions (IPSS). Research: "La Innovación de las Organizaciones Sin Fin de Lucro em Portugal: El Caso de las Instituciones Particulares de Solidaridad Social"')),
        (('Mestrado em Serviço Social' if not is_en else "Master's Degree in Social Work"),
         'Universidade Católica Portuguesa | 2011',
         ('Dissertação: "Práticas de Gestão no Agir do Assistente Social: uma análise exploratória"'
          if not is_en else
          'Dissertation: "Práticas de Gestão no Agir do Assistente Social: uma análise exploratória"')),
        (('Licenciatura em Serviço Social' if not is_en else "Bachelor's Degree in Social Work"),
         'Universidade Católica Portuguesa | 2006',
         ('Dissertação: "As necessidades sociais da população idosa da Freguesia de S. Vicente – Braga"'
          if not is_en else
          'Dissertation: "As necessidades sociais da população idosa da Freguesia de S. Vicente – Braga"')),
    ]
    for deg, inst, diss in edu:
        p2y = wrap(deg,  True,  P2X, p2y, DARK, P2W)
        p2y = wrap(inst, False, P2X, p2y, MID,  P2W)
        p2y = wrap(diss, False, P2X, p2y, DISS, P2W); p2y += 11

    p2y = p2_sec('COMPETÊNCIAS' if not is_en else 'CORE CAPABILITIES', p2y)
    if is_en:
        p2y = wrap('Programme Management · Project Management · Operations Management · PMO · Project Governance · Strategy Execution · Business Operations · Stakeholder Management · Risk & Issue Management · Process Improvement · Strategic Planning · Digital Transformation · Cross-functional Leadership · Business Transformation · Operational Excellence · Continuous Improvement', False, P2X, p2y, DARK, P2W)
    else:
        p2y = wrap('Gestão de Programas · Gestão de Projetos · Gestão de Operações · PMO · Governação de Projetos · Execução da Estratégia · Business Operations · Gestão de Stakeholders · Gestão de Risco e Issues · Melhoria de Processos · Planeamento Estratégico · Transformação Digital · Liderança Transversal · Business Transformation · Excelência Operacional · Melhoria Contínua', False, P2X, p2y, DARK, P2W)
    p2y += 8

    p2y = p2_sec('FERRAMENTAS E PLATAFORMAS DIGITAIS' if not is_en else 'DIGITAL TOOLS & PLATFORMS', p2y)
    tools_label = 'Sistemas e Ferramentas Operacionais' if not is_en else 'Operational Tools & Systems'
    p2y = wrap(tools_label + ': Airtable · Asana · Excel · Google Workspace · Softr · WordPress · Shopify · Wix · Analytics & Search Console · Meta Business Suite · Canva', False, P2X, p2y, DARK, P2W)
    p2y += 4
    ai_label = 'Ferramentas de IA' if not is_en else 'AI Tools'
    p2y = wrap(ai_label + ': Claude · ChatGPT · Emergent', False, P2X, p2y, DARK, P2W)
    p2y += 8

    p2y = p2_sec('PROJETOS DIGITAIS' if not is_en else 'SELECTED DIGITAL PROJECTS', p2y)
    if is_en:
        p2y = wrap('Development and launch of two client websites, including structure, content and brand positioning:', False, P2X, p2y, DARK, P2W); p2y += 2
        t('· northgamefishing.com — service-based website with international positioning | 2023 – Present', False, P2X, p2y, DARK); p2y += LH
        t('· amabelia.com — brand-led website and visual positioning | 2026 – Present', False, P2X, p2y, DARK)
    else:
        p2y = wrap('Desenvolvimento e lançamento de dois websites para clientes, incluindo estrutura, conteúdos e posicionamento de marca:', False, P2X, p2y, DARK, P2W); p2y += 2
        t('· northgamefishing.com — website de serviços com orientação internacional | 2023 – Presente', False, P2X, p2y, DARK); p2y += LH
        t('· amabelia.com — website de marca e posicionamento visual | 2026 – Presente', False, P2X, p2y, DARK)

    c.save()
    print(f'Gerado: {fn}')


build('pt')
build('en')
