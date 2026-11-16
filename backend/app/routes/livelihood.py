from flask import Blueprint, request, jsonify
from urllib.parse import quote_plus
from app.models import Job, GovernmentScheme, FinancialAssistance, SkillDevelopment

livelihood_bp = Blueprint('livelihood', __name__, url_prefix='/api/livelihood')

OFFICIAL_JOB_PORTALS = [
    {
        'id': 'naukri',
        'name': 'Naukri.com',
        'tagline': "India's No. 1 Job Portal",
        'base_url': 'https://www.naukri.com/',
        'logo_color': '#1d4ed8',
        'badge': 'Top Corporate & Technical',
        'description': 'Search thousands of verified jobs across engineering, driving, IT, logistics, and management.'
    },
    {
        'id': 'linkedin',
        'name': 'LinkedIn Jobs',
        'tagline': 'Professional Network & Global Careers',
        'base_url': 'https://www.linkedin.com/jobs/',
        'logo_color': '#0284c7',
        'badge': 'Verified Direct Employers',
        'description': 'Connect with recruiters and apply for verified corporate, technical, and executive roles worldwide.'
    },
    {
        'id': 'indeed',
        'name': 'Indeed India',
        'tagline': 'Comprehensive Job Search Engine',
        'base_url': 'https://in.indeed.com/',
        'logo_color': '#2563eb',
        'badge': 'High Volume Jobs',
        'description': 'Aggregates job openings across transport, drivers, farm managers, technicians, and freshers.'
    },
    {
        'id': 'ncs',
        'name': 'National Career Service (NCS)',
        'tagline': 'Ministry of Labour & Employment, Govt. of India',
        'base_url': 'https://www.ncs.gov.in/',
        'logo_color': '#ea580c',
        'badge': 'Official Govt & Public Sector',
        'description': 'Free central portal for government vacancies, apprentice positions, rural livelihoods, and public works.'
    },
    {
        'id': 'apna',
        'name': 'Apna',
        'tagline': "India's Leading Blue & Grey Collar Job Platform",
        'base_url': 'https://apna.co/',
        'logo_color': '#10b981',
        'badge': 'Instant Direct Calling HR',
        'description': 'Fast hiring for heavy vehicle drivers, delivery partners, electricians, mechanics, and farm assistants.'
    },
    {
        'id': 'freshersworld',
        'name': 'Freshersworld',
        'tagline': 'Jobs for Fresh Graduates & Diploma Holders',
        'base_url': 'https://www.freshersworld.com/',
        'logo_color': '#8b5cf6',
        'badge': '100% Fresher Focused',
        'description': 'Entry-level careers, campus placements, apprenticeships, and government exam notifications.'
    }
]

def generate_portal_search_links(title="driver", location="Tamil Nadu", experience="all"):
    clean_title = quote_plus(title.strip()) if title.strip() else "all"
    clean_loc = quote_plus(location.strip()) if location.strip() else "India"

    # Experience string handling
    fresher_slug = "fresher" if experience.lower() == "fresher" else ""

    links = {
        'naukri': f"https://www.naukri.com/{clean_title}-jobs-in-{clean_loc}?experienceType={fresher_slug}",
        'linkedin': f"https://www.linkedin.com/jobs/search/?keywords={clean_title}&location={clean_loc}",
        'indeed': f"https://in.indeed.com/jobs?q={clean_title}&l={clean_loc}",
        'ncs': f"https://www.ncs.gov.in/",
        'apna': f"https://apna.co/jobs?query={clean_title}&location={clean_loc}",
        'freshersworld': f"https://www.freshersworld.com/jobs/jobsearch/{clean_title}-jobs-in-{clean_loc}"
    }
    return links

# Curated genuine opportunities with direct links to official platforms
CURATED_LIVE_OPPORTUNITIES = [
    {
        'id': 1,
        'title': 'Heavy Commercial Vehicle & Tanker Driver',
        'company': 'Logistics & Cargo Transport Network',
        'category': 'Driving',
        'location': 'Salem / Chennai, Tamil Nadu',
        'salary': '₹22,000 - ₹35,000 / month',
        'experience_level': 'Experienced',
        'platform': 'Apna',
        'direct_url': 'https://apna.co/jobs?query=heavy+driver&location=Tamil+Nadu',
        'eligibility': 'Valid HMV / Heavy Commercial License, 2+ years highway experience.'
    },
    {
        'id': 2,
        'title': 'Agricultural Drone Operator & Field Technician',
        'company': 'Kisan Drone Agro Services',
        'category': 'Agriculture',
        'location': 'Coimbatore / Erode, Tamil Nadu',
        'salary': '₹18,000 - ₹28,000 / month',
        'experience_level': 'Fresher & Experienced',
        'platform': 'National Career Service',
        'direct_url': 'https://www.ncs.gov.in/',
        'eligibility': 'DGCA certified drone pilot or 10th/12th with electronics interest.'
    },
    {
        'id': 3,
        'title': 'Deep-Sea Marine Trawler Navigator / Assistant Engineer',
        'company': 'Coastal Marine Fisheries Consortium',
        'category': 'Fishing',
        'location': 'Rameswaram / Thoothukudi, Tamil Nadu',
        'salary': '₹25,000 - ₹45,000 / month + Catch Share',
        'experience_level': 'Experienced',
        'platform': 'Naukri.com',
        'direct_url': 'https://www.naukri.com/marine-jobs-in-tamil-nadu',
        'eligibility': 'Coastal navigation experience, sea safety & life raft survival training.'
    },
    {
        'id': 4,
        'title': 'Junior Web Developer / Data Assistant',
        'company': 'TechBridge Solutions India',
        'category': 'IT',
        'location': 'Chennai / Remote India',
        'salary': '₹20,000 - ₹32,000 / month',
        'experience_level': 'Fresher',
        'platform': 'Freshersworld',
        'direct_url': 'https://www.freshersworld.com/jobs/jobsearch/web-developer-jobs-in-chennai',
        'eligibility': 'Any Graduate / Diploma (B.Sc, BCA, B.E) with HTML/CSS/JavaScript.'
    },
    {
        'id': 5,
        'title': 'Solar Micro-Grid Installation & Solar Pump Technician',
        'company': 'SunPower PM-KUSUM Clean Tech',
        'category': 'Engineering',
        'location': 'Madurai / Trichy, Tamil Nadu',
        'salary': '₹18,000 - ₹26,000 / month',
        'experience_level': 'Fresher & Experienced',
        'platform': 'Indeed India',
        'direct_url': 'https://in.indeed.com/jobs?q=solar+technician&l=Tamil+Nadu',
        'eligibility': 'ITI / Diploma in Electrical or equivalent vocational trade certificate.'
    },
    {
        'id': 6,
        'title': 'Inter-State Express Bus / Logistics Fleet Driver',
        'company': 'State Logistics & Express Fleet',
        'category': 'Driving',
        'location': 'Bangalore / Chennai Highway Corridor',
        'salary': '₹24,000 - ₹36,000 / month',
        'experience_level': 'Experienced',
        'platform': 'LinkedIn Jobs',
        'direct_url': 'https://www.linkedin.com/jobs/search/?keywords=commercial+driver&location=Tamil+Nadu',
        'eligibility': 'Clean driving record, HMV badge, defensive driving knowledge.'
    }
]

@livelihood_bp.route('/portals', methods=['GET'])
def get_portals():
    return jsonify({
        'portals': OFFICIAL_JOB_PORTALS
    }), 200

@livelihood_bp.route('/jobs', methods=['GET'])
def get_jobs():
    search = request.args.get('search', '').strip()
    category = request.args.get('category', '').strip()
    location = request.args.get('location', '').strip()
    experience = request.args.get('experience', 'all').strip()

    title_for_links = search or category or "jobs"
    loc_for_links = location or "Tamil Nadu"

    portal_links = generate_portal_search_links(title_for_links, loc_for_links, experience)

    # Filter curated opportunities
    filtered = CURATED_LIVE_OPPORTUNITIES
    if search:
        s_lower = search.lower()
        filtered = [j for j in filtered if s_lower in j['title'].lower() or s_lower in j['company'].lower() or s_lower in j['category'].lower()]
    if category and category.lower() != 'all':
        filtered = [j for j in filtered if category.lower() in j['category'].lower()]
    if location and location.lower() != 'all':
        filtered = [j for j in filtered if location.lower() in j['location'].lower()]
    if experience and experience.lower() != 'all':
        filtered = [j for j in filtered if experience.lower() in j['experience_level'].lower()]

    return jsonify({
        'count': len(filtered),
        'jobs': filtered,
        'official_portals': OFFICIAL_JOB_PORTALS,
        'portal_search_links': portal_links,
        'query_params': {
            'search': search,
            'category': category,
            'location': location,
            'experience': experience
        }
    }), 200

@livelihood_bp.route('/schemes', methods=['GET'])
def get_schemes():
    category = request.args.get('category', '').strip()
    query = GovernmentScheme.query
    if category and category.lower() != 'all':
        query = query.filter(GovernmentScheme.category.ilike(f'%{category}%'))

    schemes = query.order_by(GovernmentScheme.created_at.desc()).all()
    return jsonify({
        'count': len(schemes),
        'schemes': [s.to_dict() for s in schemes]
    }), 200

@livelihood_bp.route('/financial-assistance', methods=['GET'])
def get_financial_assistance():
    fa = FinancialAssistance.query.order_by(FinancialAssistance.created_at.desc()).all()
    return jsonify({
        'count': len(fa),
        'programs': [item.to_dict() for item in fa]
    }), 200

@livelihood_bp.route('/skill-development', methods=['GET'])
def get_skill_development():
    category = request.args.get('category', '').strip()
    query = SkillDevelopment.query
    if category and category.lower() != 'all':
        query = query.filter(SkillDevelopment.category.ilike(f'%{category}%'))

    skills = query.order_by(SkillDevelopment.created_at.desc()).all()
    return jsonify({
        'count': len(skills),
        'courses': [item.to_dict() for item in skills]
    }), 200
