#!/usr/bin/env python3
"""
build_cv_site_final.py — CV Ana Noronha PT + EN
Coordenadas em pdfplumber.top; conversão: rl_y = H - (top + font_size)
"""

from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from pathlib import Path
import fitz
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DictionaryObject, NameObject, NumberObject, IndirectObject, DecodedStreamObject, BooleanObject, TextStringObject, NullObject

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

SW=194; SX=22; SMW=160; MX=208; MW=363.3; P2X=22; P2W=551.3
TS=7.7; LH=11.1; 

def build(lang):
    is_en = (lang == 'en')
    fn = f'/mnt/data/CV_Ana_Noronha_2026_{"Eng" if is_en else "PT"}_FINAL_AUDITED.pdf'
    c = canvas.Canvas(fn, pagesize=(W, H))
    # Semantic PDF tagging records. Each marked text span receives a unique
    # MCID per page and is mapped to a real StructElem in post-processing.
    tag_records = [[], []]
    current_page = 0
    next_mcid = [0, 0]

    def rl(top, sz): return H - top - sz * 0.793

    def mark_text(text, role, x, top, font, sz, width=None):
        mcid = next_mcid[current_page]
        next_mcid[current_page] += 1
        c._code.append(f'/{role} <</MCID {mcid}>> BDC')
        c.drawString(x, rl(top, sz), text)
        c._code.append('EMC')
        tag_records[current_page].append({
            'mcid': mcid, 'role': role, 'text': text, 'x': x, 'top': top,
            'font': font, 'size': sz,
            'width': width if width is not None else c.stringWidth(text, font, sz)
        })

    def t(s, bold, x, top, col, sz=TS, role=None):
        font = 'MonoB' if bold else 'Mono'
        c.setFont(font, sz); c.setFillColor(col)
        mark_text(s, role or ('H2' if bold and sz >= 9 else 'P'), x, top, font, sz)

    def tsans(s, x, top, col, sz, role='H1'):
        c.setFont('Sans', sz); c.setFillColor(col)
        mark_text(s, role, x, top, 'Sans', sz)

    def tr(s, xr, top, col, sz=TS, role='P'):
        c.setFont('Mono', sz); c.setFillColor(col)
        width = c.stringWidth(s, 'Mono', sz)
        mark_text(s, role, xr - width, top, 'Mono', sz, width=width)

    def wrap(s, bold, x, top, col, maxw, lh=LH, sz=TS, role=None):
        font = 'MonoB' if bold else 'Mono'
        c.setFont(font, sz); c.setFillColor(col)
        words = s.split(); line = ''
        item_role = role or ('H3' if bold else 'P')
        for w in words:
            test = (line + ' ' + w).strip()
            if c.stringWidth(test, font, sz) <= maxw: line = test
            else:
                if line:
                    mark_text(line, item_role, x, top, font, sz)
                    top += lh
                line = w
        if line:
            mark_text(line, item_role, x, top, font, sz)
            top += lh
        return top

    def hline(x, top, w, col=RUST, lw=0.5):
        c.setStrokeColor(col); c.setLineWidth(lw)
        c.line(x, H - top, x + w, H - top)

    def sec(title, x, top, lw, sz_title=9.5):
        # Only increases the visual separation of section titles from their content.
        # All typography, line spacing, content, positions and page structure remain unchanged.
        t(title, True, x, top, RUST, sz=sz_title, role='H2')
        hline(x, top + sz_title + 3, lw)
        return top + 19.5

    def sb_sec(title, top):   return sec(title, SX, top, SMW)
    def main_sec(title, top): return sec(title, MX, top, MW)
    def p2_sec(title, top):   return sec(title, P2X, top, P2W)

    def job(role, date, org, desc, rl_lbl, results, rsp_lbl, resps, top, x=MX, w=MW):
        t(role.upper(), True, x, top, RUST, role='H3'); tr(date, x + w, top, MID); top += LH
        top = wrap(org, True, x, top, DARK, w); top += 2
        if desc: top = wrap(desc, False, x, top, MID, w); top += 3
        if results:
            t(rl_lbl, True, x, top, DARK, role='H4'); top += LH
            for r in results:
                t('·', False, x, top, DARK, role='P')
                top = wrap(r, False, x + 9, top, DARK, w - 9)
            top += 1.5
        if resps:
            t(rsp_lbl, True, x, top, DARK, role='H4'); top += LH
            for r in resps:
                t('·', False, x, top, DARK, role='P')
                top = wrap(r, False, x + 9, top, DARK, w - 9)
            top += (0.0 if not is_en else 1.5)
        return top

    # PÁGINA 1
    c.setFillColor(BG);   c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, 0, SW, H, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, H - 75, W, 75, fill=1, stroke=0)
    c.setFillColor(DARK); c.rect(0, 0, W, 22, fill=1, stroke=0)

    tsans('ANA NORONHA', 24, 17.0, CREAM, 20)
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
    sy = 88.0
    t('IMPACTO' if not is_en else 'KEY IMPACT', True, SX, sy, RUST, sz=9.5)
    hline(SX, sy + 9 + 3, SMW)
    sy += 23.5

    stats = [
        ('60K+',  'Visitantes em eventos' if not is_en else 'Event Visitors'),
        ('350+',  'Marcas curadas' if not is_en else 'Brands Curated'),
        ('13',    'Edições entregues' if not is_en else 'Editions Delivered'),
        ('132%',  'Metas CLDS4G atingidas' if not is_en else 'CLDS4G Targets Met'),
    ]
    for num, label in stats:
        t(num, True, SX, sy, CREAM, sz=14); sy += 20.0
        t(label, False, SX, sy, GRAY);      sy += 14.5
    sy += 28.0

    sy = sb_sec('PERFIL' if not is_en else 'PROFILE', sy)
    if is_en:
        sy = wrap('Project, Programme & Operations Manager with 12+ years of experience coordinating programmes, projects and operational initiatives across international, public, nonprofit and entrepreneurial environments. Experienced in programme governance, strategic planning, operations management, stakeholder management, risk, budgeting, performance monitoring and digital delivery. Combines structured programme management with hands-on execution, process improvement and cross-functional coordination.', False, SX, sy, GRAY, SMW, 13.8)
    else:
        sy = wrap('Gestora de Projetos, Programas e Operações com mais de 12 anos de experiência na coordenação de programas, projetos e iniciativas operacionais em contextos internacionais, públicos, sociais e empresariais. Experiência em governação de programas, planeamento estratégico, gestão operacional, gestão de stakeholders, risco, orçamento, monitorização de desempenho e execução digital. Combina gestão estruturada com execução operacional, melhoria de processos e coordenação de equipas, parceiros e fornecedores.', False, SX, sy, GRAY, SMW, 13.8)
    sy += 20.0

    # FOCUS AREAS removed: keywords are retained in CORE CAPABILITIES on page 2.

    # LANGUAGES moved to the end of page 2.

    # AVAILABILITY removed from Master CV.


    # MAIN
    my = 89.0
    my = main_sec('EXPERIÊNCIA PROFISSIONAL' if not is_en else 'PROFESSIONAL EXPERIENCE', my)

    if is_en:
        my = job('Co-Founder | Project & Operations Manager', '2022 – Present',
            'Mercado no Castelo - Curated Design & Independent Brands Platform',
            'Independent platform dedicated to brand curation and event production, connecting independent brands, partners and audiences across multiple cities.',
            'KEY RESULTS',
            ['60,000+ visitors | 350+ independent brands | 13 editions delivered',
             '11,000+ organic followers across social media.'],
            'RESPONSIBILITIES',
            ['End-to-end project management, from conception to delivery, strategy and platform positioning',
             'Operations management, strategic planning, delivery and process optimisation',
             'Partnerships, stakeholder and exhibitor management',
             'Brand curation and supplier coordination',
             'Event production, logistics and delivery control',
             'Budget planning, financial management and performance review',
             'Website and digital channel management, including content structure, updates, communication strategy and social media management'], my)
    else:
        my = job('Co-Fundadora | Gestora de Projetos e Operações', '2022 – Presente',
            'Mercado no Castelo - Plataforma de Design Curado e Marcas Independentes',
            'Plataforma independente dedicada à curadoria de marcas e à produção de eventos, que liga marcas independentes, parceiros e visitantes em múltiplas cidades.',
            'RESULTADOS',
            ['60.000+ visitantes · 350+ marcas independentes · 13 edições entregues',
             '11.000+ seguidores orgânicos nas redes sociais.'],
            'RESPONSABILIDADES',
            ['Gestão integral de projeto, da conceção à entrega, estratégia e posicionamento da plataforma',
             'Gestão de operações, planeamento estratégico, entrega e otimização de processos',
             'Parcerias, gestão de stakeholders e expositores',
             'Curadoria de marcas e coordenação de fornecedores',
             'Produção de eventos, logística e controlo de entrega',
             'Planeamento orçamental, gestão financeira e revisão de desempenho',
             'Gestão do website e canais digitais, incluindo estrutura de conteúdos, atualização, estratégia de comunicação e gestão das redes sociais'], my)

    hline(MX, my, MW, LINE, 0.4); my += (7 if not is_en else 13)

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
             'Programa "Devagar se Vai ao Longe" — 90 crianças e famílias · melhoria socio-emocional em 54 crianças · indicador de execução de 150%'],
            'RESPONSABILIDADES',
            ['Planeamento, governação e coordenação operacional do programa',
             'M&E, monitorização de KPIs, performance tracking e reporting técnico e financeiro',
             'Risk Management, issue management, Compliance e Stakeholder Management',
             'Liderança de equipa multidisciplinar de execução',
             'Desenvolvimento da plataforma digital de empregabilidade PóvoAtiva',
             'Implementação do Programa "Devagar se Vai ao Longe" em 4 turmas do 1.º ciclo'], my)

    hline(MX, my, MW, LINE, 0.4); my += (7 if not is_en else 13)

    if is_en:
        my = job('Director of Operations', '2016 – 2020', 'Sabert Lda',
            'Operational coordination of international business initiatives integrating digital platforms, commercial operations and partners across Portugal, Spain and China.',
            'KEY RESULTS',
            ['Built and launched Casamat e-commerce (casamat.eu): 542 active products, 885 SKU variants across 58 categories on Shopify',
             'Corporate digital platforms launched across Portugal, Spain and China',
             'Commercial partnerships and market entry established across European and Asian markets'],
            'RESPONSIBILITIES',
            ['International operations across Portugal, Spain and China, including B2B, e-commerce and cross-border fulfilment',
             'Coordination of corporate digital platforms and websites, including Sabert and Shanghai Sabert',
             'Management of product catalogues and institutional communication',
             'Coordination of external developers and digital partners',
             'Process improvement, risk management and digital marketing initiatives (Google Ads and social media)',
             'Portugal 2020 funding applications and operational planning support'], my)
    else:
        my = job('Diretora de Operações', '2016 – 2020', 'Sabert Lda',
            'Coordenação operacional de iniciativas empresariais internacionais integrando plataformas digitais, operações comerciais e parceiros em Portugal, Espanha e China.',
            'PRINCIPAIS RESULTADOS',
            ['Construção e lançamento da plataforma e-commerce Casamat (casamat.eu): 542 produtos ativos, 885 variantes SKU em 58 categorias no Shopify',
             'Plataformas digitais corporativas lançadas em Portugal, Espanha e China',
             'Parcerias comerciais e entrada em novos mercados estabelecidas com parceiros europeus e asiáticos'],
            'RESPONSABILIDADES',
            ['Operações internacionais em Portugal, Espanha e China, incluindo B2B, e-commerce e expedição transfronteiriça',
             'Coordenação de plataformas digitais e websites corporativos e de marca, incluindo Sabert e Shanghai Sabert',
             'Gestão de catálogos de produto e comunicação institucional',
             'Coordenação de programadores externos e parceiros digitais',
             'Melhoria de processos, gestão de risco e iniciativas de marketing digital (Google Ads e redes sociais)',
             'Apoio ao planeamento operacional e candidaturas a financiamento Portugal 2020'], my)

    c.showPage()
    current_page = 1

    # PÁGINA 2
    # Two-column continuation for visual balance: dark utility sidebar + cream main content.
    c.setFillColor(CREAM); c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(DARK);  c.rect(0, 0, SW, H, fill=1, stroke=0)
    c.setFillColor(DARK);  c.rect(0, H - 58, W, 58, fill=1, stroke=0)
    c.setFillColor(DARK);  c.rect(0, 0, W, 22, fill=1, stroke=0)

    tsans('ANA NORONHA', 22, 14.5, CREAM, 16)
    if is_en:
        t('PROJECT, PROGRAMME & OPERATIONS MANAGER', True, 22, 34.0, RUST, sz=7.7)
        t('CONTINUED', False, 22, 44.5, GRAY, sz=7.2)
    else:
        t('GESTORA DE PROJETOS, PROGRAMAS E OPERAÇÕES', True, 22, 34.0, RUST, sz=7.7)
        t('CONTINUAÇÃO', False, 22, 44.5, GRAY, sz=7.2)
    t('© 2026 ANA NORONHA', False, 265.2, 830.0, GRAY, sz=6)
    tr('PT · EN · ES', W - 20, 830.0, GRAY, sz=6)

    # MAIN CONTENT, page 2
    main_x = 208
    main_w = W - main_x - 24
    p2y = 70.0
    p2y = main_sec('EXPERIÊNCIA ADICIONAL' if not is_en else 'ADDITIONAL EXPERIENCE', p2y)

    addl = [
        ('Diretora Técnica' if not is_en else 'Technical Director', '2024',
         'Associação de Apoio à Saúde Mental - O Salto',
         ('Gestão estratégica e operacional. Liderança de equipa técnica, governance, gestão orçamental e controlo financeiro. Risk Management, Compliance, Stakeholder Management e Partnerships. Sistemas digitais e processos organizacionais. Coordenação de projetos, acompanhamento, supervisão e mediação de casos psicossociais.'
          if not is_en else
          'Strategic Management and Operational Management. Team Leadership, Governance, Budget Management and Financial Control. Risk Management, Compliance, Stakeholder Management and Partnerships. Digital Systems and Organisational Processes. Project coordination, psychosocial case monitoring, supervision and mediation.')),
        ('Co-Fundadora' if not is_en else 'Co-Founder', ('2013 – 2020 (simultâneo com Sabert, 2016–2020)' if not is_en else '2013 – 2020 (concurrent with Sabert, 2016–2020)'),
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
        t(role.upper(), True, main_x, p2y, RUST, role='H3'); tr(date, main_x + main_w, p2y, MID); p2y += LH
        p2y = wrap(org, True, main_x, p2y, DARK, main_w); p2y += 2
        if role.lower() in ('technical director', 'diretora técnica'):
            parts = [x.strip() for x in desc.split('. ') if x.strip()]
            for part in parts:
                t('·', False, main_x, p2y, MID)
                p2y = wrap(part + ('.' if not part.endswith('.') else ''), False, main_x + 9, p2y, MID, main_w - 9)
        else:
            p2y = wrap(desc, False, main_x, p2y, MID, main_w)
        p2y += 10

    p2y = main_sec('EDUCAÇÃO' if not is_en else 'EDUCATION', p2y)

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
        p2y = wrap(deg, True, main_x, p2y, DARK, main_w)
        p2y = wrap(inst, False, main_x, p2y, MID, main_w)
        p2y = wrap(diss, False, main_x, p2y, DISS, main_w); p2y += 9

    # DIGITAL PROJECTS moved from sidebar to main content, after EDUCATION.
    p2y += 2
    p2y = main_sec('PROJETOS DIGITAIS' if not is_en else 'DIGITAL PROJECTS', p2y)
    if is_en:
        p2y = wrap('Design, build and ongoing management of two client websites in Wix, including structure, content strategy and brand positioning:', False, main_x, p2y, MID, main_w, 13.5)
        p2y = wrap('· northgamefishing.com — service website with international positioning | 2023 – Present', False, main_x, p2y, MID, main_w, 13.5)
        p2y = wrap('· amabelia.com — brand website and visual positioning | 2025 – Present', False, main_x, p2y, MID, main_w, 13.5)
    else:
        p2y = wrap('Conceção, construção e gestão contínua de dois websites de clientes em Wix, incluindo estrutura, estratégia de conteúdo e posicionamento de marca:', False, main_x, p2y, MID, main_w, 13.5)
        p2y = wrap('· northgamefishing.com — website de serviços com posicionamento internacional | 2023 – Presente', False, main_x, p2y, MID, main_w, 13.5)
        p2y = wrap('· amabelia.com — website de marca e posicionamento visual | 2025 – Presente', False, main_x, p2y, MID, main_w, 13.5)


    # SIDEBAR CONTENT, page 2
    sy = 84.0
    sy = sb_sec('COMPETÊNCIAS' if not is_en else 'CORE CAPABILITIES', sy)
    if is_en:
        sy = wrap('Programme Management · Project Management · Operations Management · PMO · Project Governance · Strategy Execution ·', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Business Operations · Stakeholder Management · Risk Management · Process Improvement · Strategic Planning · Digital Project Delivery ·', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Cross-functional Leadership · Organisational Transformation · Operational Excellence · Continuous Improvement', False, SX, sy, GRAY, SMW, 13.5)
    else:
        sy = wrap('Gestão de Programas · Gestão de Projetos · Gestão de Operações · PMO · Project Governance · Strategy Execution ·', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Business Operations · Stakeholder Management · Risk Management · Melhoria de Processos · Strategic Planning · Digital Project Delivery ·', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Cross-functional Leadership · Organisational Transformation · Operational Excellence · Continuous Improvement', False, SX, sy, GRAY, SMW, 13.5)
    sy += 19

    sy = sb_sec('FERRAMENTAS DIGITAIS' if not is_en else 'DIGITAL TOOLS', sy)
    if is_en:
        sy = wrap('Operational & Project Tools: GitHub · Asana · Excel · Google Workspace · Softr', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Digital & Analytics: WordPress · Shopify · Wix · Google Analytics · Google Search Console · Meta Business Suite · Canva', False, SX, sy, GRAY, SMW, 13.5)
        sy += 8
        sy = wrap('AI Tools: Claude · ChatGPT · Emergent', False, SX, sy, GRAY, SMW, 13.5)
    else:
        sy = wrap('Ferramentas Operacionais e de Projeto: GitHub · Asana · Excel · Google Workspace · Softr', False, SX, sy, GRAY, SMW, 13.5)
        sy = wrap('Digital & Analytics: WordPress · Shopify · Wix · Google Analytics · Google Search Console · Meta Business Suite · Canva', False, SX, sy, GRAY, SMW, 13.5)
        sy += 8
        sy = wrap('Ferramentas de IA: Claude · ChatGPT · Emergent', False, SX, sy, GRAY, SMW, 13.5)
    sy += 19

    sy = sb_sec('IDIOMAS' if not is_en else 'LANGUAGES', sy)
    if is_en:
        sy = wrap('Portuguese (Native) · English (Advanced) · Spanish (Intermediate)', False, SX, sy, GRAY, SMW, 13.5)
    else:
        sy = wrap('Português (nativo) · Inglês (avançado) · Espanhol (intermédio)', False, SX, sy, GRAY, SMW, 13.5)

    c.save()
    postprocess_pdf(fn, is_en)
    print(f'Gerado: {fn}')


def postprocess_pdf(fn, is_en):
    """Add metadata, bookmarks, real hyperlinks and semantic tagged-PDF structure."""
    doc = fitz.open(fn)
    lang = 'en-GB' if is_en else 'pt-PT'
    title = 'Ana Noronha | Project, Programme & Operations Manager'
    subject = 'Curriculum Vitae | Project, Programme & Operations Manager'
    keywords = 'Project Manager, Programme Manager, Operations Manager, PMO, Project Governance, Strategy Execution, Business Operations, Stakeholder Management, Risk Management, Compliance, Digital Project Delivery'
    doc.set_metadata({
        'format': 'PDF 1.7',
        'title': title,
        'author': 'Ana Noronha',
        'subject': subject,
        'keywords': keywords,
        'creator': 'Ana Noronha | CV generation script',
        'producer': 'ReportLab + PyMuPDF',
        'creationDate': 'D:20260915000000+01\'00\'',
        'modDate': 'D:20260915000000+01\'00\'',
    })
    if is_en:
        toc = [
            [1, 'Professional Experience', 1],
            [1, 'Additional Experience', 2],
            [1, 'Education', 2],
            [1, 'Digital Projects', 2],
            [1, 'Core Capabilities', 2],
            [1, 'Digital Tools', 2],
            [1, 'Languages', 2],
        ]
    else:
        toc = [
            [1, 'Experiência Profissional', 1],
            [1, 'Experiência Adicional', 2],
            [1, 'Educação', 2],
            [1, 'Projetos Digitais', 2],
            [1, 'Competências', 2],
            [1, 'Ferramentas Digitais', 2],
            [1, 'Idiomas', 2],
        ]
    doc.set_toc(toc, collapse=0)
    links = {
        0: [
            ('linkedin.com/in/ana-noronha', 'https://www.linkedin.com/in/ana-noronha/'),
            ('anacnoronha@gmail.com', 'mailto:anacnoronha@gmail.com'),
            ('casamat.eu', 'https://casamat.eu/'),
        ],
        1: [
            ('northgamefishing.com', 'https://northgamefishing.com/'),
            ('amabelia.com', 'https://amabelia.com/'),
        ],
    }
    for pno, targets in links.items():
        page = doc[pno]
        for text, uri in targets:
            for rect in page.search_for(text):
                page.insert_link({'kind': fitz.LINK_URI, 'from': rect, 'uri': uri})
    tmp = fn + '.links.pdf'
    doc.save(tmp, garbage=4, deflate=True)
    doc.close()

    reader = PdfReader(tmp)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    writer.add_metadata({
        '/Title': title,
        '/Author': 'Ana Noronha',
        '/Subject': subject,
        '/Keywords': keywords,
        '/Creator': 'Ana Noronha | CV generation script',
        '/Producer': 'ReportLab + PyMuPDF + pypdf',
    })
    root = writer._root_object
    root[NameObject('/Lang')] = TextStringObject(lang)
    root[NameObject('/MarkInfo')] = DictionaryObject({NameObject('/Marked'): BooleanObject(True)})

    # Build a genuine semantic structure tree from the marked text spans emitted
    # by ReportLab. Each page gets its own StructParents index and ParentTree
    # array mapping MCIDs to StructElems. The visual content is not repositioned.
    struct_root = DictionaryObject({NameObject('/Type'): NameObject('/StructTreeRoot')})
    document = DictionaryObject({
        NameObject('/Type'): NameObject('/StructElem'),
        NameObject('/S'): NameObject('/Document'),
    })
    document_ref = writer._add_object(document)
    struct_root[NameObject('/K')] = ArrayObject([document_ref])
    parent_nums = ArrayObject()
    page_struct_arrays = []

    # The page-level records are regenerated in the same order as the build.
    # We infer their roles from the actual text objects and use one StructElem
    # per marked span. This keeps headings, paragraphs and labels distinguishable.
    for page_index, page in enumerate(writer.pages):
        page[NameObject('/StructParents')] = NumberObject(page_index)
        page[NameObject('/Tabs')] = NameObject('/S')
        # Retrieve the marked content already present in the page stream and
        # create one structure element for every MCID found there.
        contents = page.get(NameObject('/Contents'))
        streams = []
        if contents is not None:
            obj = contents.get_object() if isinstance(contents, IndirectObject) else contents
            if isinstance(obj, ArrayObject):
                streams = [item.get_object() if isinstance(item, IndirectObject) else item for item in obj]
            else:
                streams = [obj]
        mcids = []
        for stream in streams:
            data = stream.get_data() if hasattr(stream, 'get_data') else b''
            text = data.decode('latin-1', errors='ignore')
            import re
            for m in re.finditer(r'/([A-Za-z0-9]+)\s*<</MCID\s+(\d+)>>\s*BDC', text):
                mcids.append((int(m.group(2)), m.group(1)))
        max_mcid = max((m for m, _ in mcids), default=-1)
        mapping = [None] * (max_mcid + 1)
        kids = ArrayObject()
        for mcid, role in mcids:
            role_name = role if role in {'H1','H2','H3','H4','P','Link'} else 'P'
            elem = DictionaryObject({
                NameObject('/Type'): NameObject('/StructElem'),
                NameObject('/S'): NameObject('/' + role_name),
                NameObject('/P'): document_ref,
                NameObject('/Pg'): page.indirect_reference,
                NameObject('/K'): NumberObject(mcid),
            })
            elem_ref = writer._add_object(elem)
            mapping[mcid] = elem_ref
            kids.append(elem_ref)
        parent_array = ArrayObject([item if item is not None else NullObject() for item in mapping])
        parent_array_ref = writer._add_object(parent_array)
        parent_nums.extend([NumberObject(page_index), parent_array_ref])
        page_struct_arrays.append((page_index, kids))

    # Make page structures children of Document.
    doc_kids = ArrayObject()
    for _, kids in page_struct_arrays:
        for ref in kids:
            doc_kids.append(ref)
    document[NameObject('/K')] = doc_kids
    if parent_nums:
        struct_root[NameObject('/ParentTree')] = writer._add_object(DictionaryObject({NameObject('/Nums'): parent_nums}))
    struct_ref = writer._add_object(struct_root)
    root[NameObject('/StructTreeRoot')] = struct_ref

    try:
        writer.set_page_layout('/SinglePage')
    except Exception:
        pass

    final_tmp = fn + '.final.pdf'
    with open(final_tmp, 'wb') as fh:
        writer.write(fh)
    Path(tmp).unlink(missing_ok=True)
    Path(fn).unlink(missing_ok=True)
    Path(final_tmp).replace(fn)

    check = PdfReader(fn)
    assert len(check.pages) == 2, f'Unexpected page count: {len(check.pages)}'
    catalog = check.trailer['/Root']
    assert catalog.get('/MarkInfo') is not None
    assert catalog.get('/StructTreeRoot') is not None
    assert catalog.get('/Lang') is not None
    print(f'Post-processed: {fn}')


# Build first, then apply metadata/navigation/annotations and semantic tagging.
build('pt')
build('en')
