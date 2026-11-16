from app.models import (
    db, User, Job, GovernmentScheme, FinancialAssistance,
    SkillDevelopment, FishingAlert, RoadAlert, Hospital, WeatherRecord
)
from datetime import datetime

def seed_database():
    """Seed initial records if database is empty."""
    
    # 1. Users
    if User.query.count() == 0:
        admin = User(
            username='admin',
            email='admin@livelihood.gov.in',
            full_name='System Administrator',
            role='admin'
        )
        admin.set_password('admin123')

        sanjai = User(
            username='sanjai',
            email='sanjai@example.com',
            full_name='Sanjai Kumar',
            role='user'
        )
        sanjai.set_password('password123')

        db.session.add_all([admin, sanjai])
        db.session.commit()

    # 2. Jobs
    if Job.query.count() == 0:
        jobs = [
            Job(
                title='Heavy Commercial Vehicle (HCV) Driver',
                category='Driving',
                company='Tamil Nadu Logistics & Freight Corp',
                location='Chennai - Coimbatore Corridor',
                salary='₹28,000 - ₹38,000 / month',
                eligibility='Valid Heavy Transport License with 3+ years highway driving experience.',
                description='Responsible for safe long-haul transport across national highways. GPS monitoring, toll allowance and health insurance provided.',
                contact='logistics-jobs@tnfreight.in'
            ),
            Job(
                title='Agricultural Drone Operator & Field Technician',
                category='Agriculture',
                company='AgriTech Green Farms Ltd',
                location='Thanjavur & Trichy',
                salary='₹22,000 - ₹30,000 / month',
                eligibility='DGCA Remote Pilot Certificate or Diploma in Agriculture / ITI Electrical.',
                description='Operate precision spray drones over paddy fields, analyze soil moisture sensors, and assist local farmer cooperatives.',
                contact='careers@agritechgreen.org'
            ),
            Job(
                title='Marine Diesel Engine Mechanic',
                category='Fishery',
                company='Coastal Harbors Service Guild',
                location='Rameswaram & Tuticorin Harbor',
                salary='₹25,000 - ₹35,000 / month',
                eligibility='ITI Diesel Mechanic / Marine Fitter certification. Minimum 2 years experience with fishing boat inboard motors.',
                description='Maintain and overhaul diesel engines, cooling pumps, and gearboxes for deep-sea mechanized trawlers.',
                contact='marinehelp@coastalharbor.org'
            ),
            Job(
                title='Solar Irrigation Pump Technician',
                category='Skill & Energy',
                company='SunPower Rural Energy Ltd',
                location='Salem & Madurai Rural',
                salary='₹20,000 - ₹26,000 / month',
                eligibility='10th / 12th pass with basic electrical certification. On-site training provided.',
                description='Install, service, and maintain PM-KUSUM solar agricultural pump sets across rural farmland.',
                contact='support@sunpowerrural.in'
            ),
            Job(
                title='Highway Ambulance Emergency Driver',
                category='Driving',
                company='State Emergency Response 108 Services',
                location='Madurai Highway Hub',
                salary='₹24,000 - ₹32,000 / month',
                eligibility='Valid Light Motor Vehicle (Commercial) license + First Aid certification.',
                description='Respond to road accident calls on NH-44. Rapid navigation and vehicle maintenance coordination.',
                contact='dispatch108@highwayemergencies.in'
            ),
            Job(
                title='Fishery Cold Storage & Logistics Supervisor',
                category='Fishery',
                company='Southern Sea Products Export Federation',
                location='Nagapattinam Port',
                salary='₹26,000 - ₹34,000 / month',
                eligibility='Any graduation or diploma with basic computer knowledge and cold chain logistics experience.',
                description='Manage temperature-controlled catch storage, sorting, quality testing, and shipment dispatch.',
                contact='hr@southernseaproducts.org'
            )
        ]
        db.session.add_all(jobs)

    # 3. Government Schemes
    if GovernmentScheme.query.count() == 0:
        schemes = [
            GovernmentScheme(
                title='PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
                category='Agriculture',
                eligibility='Small and marginal landholder farmer families owning cultivable land up to 2 hectares.',
                benefits='Direct income support of ₹6,000 per year in 3 equal four-monthly installments of ₹2,000 directly into Aadhaar-linked bank accounts.',
                application_procedure='1. Visit pmkisan.gov.in -> Farmer Corner -> New Farmer Registration. 2. Enter Aadhaar number, land record details, and bank account. 3. Verification done by local Patwari/State Nodal Officer.',
                official_link='https://pmkisan.gov.in'
            ),
            GovernmentScheme(
                title='PMMSY (Pradhan Mantri Matsya Sampada Yojana)',
                category='Fisheries',
                eligibility='Individual fishers, fish farmers, Self Help Groups (SHGs), Joint Liability Groups (JLGs), and Fisheries Cooperatives.',
                benefits='Up to 40% (General) and 60% (SC/ST/Women) subsidy for purchasing fishing boats, deep-sea fishing vessels, biofloc tanks, safety beacons, and cold storage.',
                application_procedure='Apply through the State Fisheries Department portal or national pmmsy.dof.gov.in portal. Submit project proposal with bank linkage approval.',
                official_link='https://pmmsy.dof.gov.in'
            ),
            GovernmentScheme(
                title='PM SVANidhi (Street Vendor Special Micro-Credit)',
                category='Livelihood',
                eligibility='Urban and peri-urban street vendors and small traders possessing a Certificate of Vending or Identity Card issued by ULBs.',
                benefits='Collateral-free working capital loan starting at ₹10,000, stepping up to ₹20,000 and ₹50,000 upon timely repayment. 7% interest subsidy credited directly.',
                application_procedure='Register at pmsvanidhi.mohua.gov.in with Aadhaar, mobile number, and vending certificate, then select lending bank.',
                official_link='https://pmsvanidhi.mohua.gov.in'
            ),
            GovernmentScheme(
                title='Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
                category='Road & Driver Safety',
                eligibility='All citizens and commercial drivers aged 18 to 70 years with an active savings bank account.',
                benefits='₹2 Lakh accidental death / full permanent disability cover, ₹1 Lakh partial permanent disability cover for an annual premium of just ₹20.',
                application_procedure='Fill out the auto-debit consent form at your bank branch or via mobile banking app under social security schemes.',
                official_link='https://jansuraksha.gov.in'
            ),
            GovernmentScheme(
                title='MGNREGA (Mahatma Gandhi National Rural Employment Guarantee)',
                category='Rural Livelihood',
                eligibility='Adult members of rural households willing to do unskilled manual work.',
                benefits='Legal guarantee for at least 100 days of wage employment in a financial year at notified state wage rates with unemployment allowance if work is not given within 15 days.',
                application_procedure='Submit written application to the local Gram Panchayat or Gram Sevak to obtain Job Card.',
                official_link='https://nrega.nic.in'
            )
        ]
        db.session.add_all(schemes)

    # 4. Financial Assistance
    if FinancialAssistance.query.count() == 0:
        fa = [
            FinancialAssistance(
                program_name='Kisan Credit Card (KCC) for Fisheries & Farming',
                provider='National Bank for Agriculture and Rural Development (NABARD)',
                assistance_amount='Up to ₹3,00,000 at concessional 4% interest rate (with 3% prompt repayment incentive)',
                eligibility='Farmers, tenant farmers, sharecroppers, and inland/marine fishermen owning or leasing a boat.',
                application_info='Submit standard 1-page KCC application form along with land patta or fishing boat registration at nearest public sector or cooperative bank.'
            ),
            FinancialAssistance(
                program_name='Commercial Transport Driver Vehicle Loan Subsidy',
                provider='State Small Industries Development Corporation',
                assistance_amount='Up to ₹5,00,000 with 25% capital subsidy for buying eco-friendly electric or CNG transport goods vehicles.',
                eligibility='Commercial badge holders with no defaults on prior loans and valid resident certificate.',
                application_info='Apply via District Industries Centre (DIC) portal with driver badge, quote from authorized vehicle dealer, and residential proof.'
            ),
            FinancialAssistance(
                program_name='Fisherfolk Monsoon Ban Relief Financial Grant',
                provider='Department of Fisheries & Animal Husbandry',
                assistance_amount='₹5,000 to ₹8,000 monthly subsistence grant during annual 61-day fishing ban period',
                eligibility='Active marine fishing labor card holders registered with the State Fishermen Welfare Board.',
                application_info='Grant is disbursed automatically to linked bank accounts of verified Fishermen Cooperative Society members.'
            )
        ]
        db.session.add_all(fa)

    # 5. Skill Development
    if SkillDevelopment.query.count() == 0:
        skills = [
            SkillDevelopment(
                course_title='Precision Agriculture & Drone Technology',
                category='Agriculture',
                duration='6 Weeks (Full Time / Hybrid)',
                provider='Agricultural University & National Skill Development Corporation (NSDC)',
                mode='Classroom + Field Practicals',
                learning_resources='Drone flight mechanics, multispectral soil mapping, automated fertilizer dispersion, and DGCA exam preparation manuals.'
            ),
            SkillDevelopment(
                course_title='Marine Safety, Navigational Equipment & Engine Overhaul',
                category='Fishery',
                duration='4 Weeks',
                provider='Central Institute of Fisheries Nautical and Engineering Training (CIFNET)',
                mode='On-harbor Workshop & Simulator Training',
                learning_resources='GPS navigation charts, VHF radio protocols, marine radar reading, life raft deployment, and diesel engine troubleshooting.'
            ),
            SkillDevelopment(
                course_title='Defensive Driving & Highway Emergency Response for Heavy Vehicles',
                category='Driver Safety',
                duration='2 Weeks',
                provider='Institute of Road Transport (IRT)',
                mode='Simulator and Highway Track Driving',
                learning_resources='Fatigue management protocols, brake dynamics under wet roads, emergency maneuvering, highway hazard identification, and first-aid response.'
            ),
            SkillDevelopment(
                course_title='Solar Rooftop & Agricultural Pump Installation Specialist',
                category='Renewable Energy',
                duration='8 Weeks',
                provider='Skill Council for Green Jobs (SCGJ)',
                mode='Hands-on Lab and Installation Sites',
                learning_resources='Photovoltaic array wiring, inverter synchronization, DC pump controllers, and electrical safety standards.'
            )
        ]
        db.session.add_all(skills)

    # 6. Fishing Alerts
    if FishingAlert.query.count() == 0:
        f_alerts = [
            FishingAlert(
                alert_title='Moderate Wind Alert - Palk Bay & Gulf of Mannar',
                severity='advisory',
                sea_condition='Moderate to Rough with sea spray',
                wind_speed='35 - 45 km/h (19 - 24 Knots)',
                wave_height='1.8 - 2.4 meters',
                advisory='Fishermen operating small non-motorized crafts are advised to exercise caution and avoid deep waters beyond 15 nautical miles.',
                valid_until='Next 36 Hours'
            ),
            FishingAlert(
                alert_title='Safe Sailing Window - Coromandel Coastal Strip',
                severity='safe',
                sea_condition='Calm to Slight, favorable visibility',
                wind_speed='12 - 18 km/h (6 - 10 Knots)',
                wave_height='0.6 - 1.1 meters',
                advisory='Favorable weather conditions for coastal fishing. Keep standard life jackets, distress flairs, and VHF marine radios powered on.',
                valid_until='Active Today'
            ),
            FishingAlert(
                alert_title='Squall Weather Warning - Southwest Bay of Bengal',
                severity='danger',
                sea_condition='Very Rough to High swell',
                wind_speed='55 - 65 km/h gusting to 75 km/h',
                wave_height='3.2 - 4.5 meters',
                advisory='CRITICAL: Fishermen are strictly advised NOT to venture into deep sea. Boats at sea must immediately return to the nearest harbor or sheltered bay.',
                valid_until='Emergency Advisory - Until Further Notice'
            )
        ]
        db.session.add_all(f_alerts)

    # 7. Road Alerts
    if RoadAlert.query.count() == 0:
        r_alerts = [
            RoadAlert(
                alert_type='Traffic Congestion',
                road_name='NH-44 Expressway (Salem to Namakkal Section)',
                severity='moderate',
                description='Moderate freight vehicle bottleneck due to flyover bridge maintenance. Speed restricted to 40 km/h. Expect 20-minute delay.',
                latitude=11.6643,
                longitude=78.1460,
                is_active=True
            ),
            RoadAlert(
                alert_type='Road Conditions',
                road_name='Chennai - Bengaluru Highway (NH-48 Ranipet Bypass)',
                severity='low',
                description='Pavement resurfacing on left lane. Clear signage installed. Pass with caution.',
                latitude=12.9246,
                longitude=79.3330,
                is_active=True
            ),
            RoadAlert(
                alert_type='Accident Alert',
                road_name='East Coast Road (ECR - Mahabalipuram Stretch)',
                severity='critical',
                description='Heavy multi-vehicle collision near km 54 marker. Emergency response team and recovery crane deployed. Northbound traffic diverted.',
                latitude=12.6208,
                longitude=80.1944,
                is_active=True
            ),
            RoadAlert(
                alert_type='Hazardous Weather',
                road_name='Yercaud - Salem Ghat Road (Hairpin Bends 11-18)',
                severity='critical',
                description='Dense fog advisory with zero visibility below 25 meters. Wet, slippery tarmac. Turn on fog lights and sound horn on bends.',
                latitude=11.7753,
                longitude=78.2093,
                is_active=True
            )
        ]
        db.session.add_all(r_alerts)

    # 8. Hospitals (Nearby Emergency Centers)
    if Hospital.query.count() == 0:
        hospitals = [
            Hospital(
                name='Tamil Nadu Govt Multi Super Speciality Hospital',
                address='Omandurar Estate, Anna Salai, Chennai, TN 600002',
                latitude=13.0694,
                longitude=80.2742,
                phone='044-25305000',
                emergency_services='24/7 Level-1 Trauma Care, Cardiac ICU, Burn Ward, Blood Bank',
                distance=4.2
            ),
            Hospital(
                name='Government Rajaji Hospital & Trauma Care',
                address='Panagal Rd, Shenoy Nagar, Madurai, TN 625020',
                latitude=9.9252,
                longitude=78.1198,
                phone='0452-2532535',
                emergency_services='24/7 National Highway Accident Trauma Centre, Neuro ICU',
                distance=8.5
            ),
            Hospital(
                name='Coimbatore Medical College Hospital (CMCH)',
                address='Trichy Rd, Gopalapuram, Coimbatore, TN 641018',
                latitude=11.0016,
                longitude=76.9674,
                phone='0422-2301393',
                emergency_services='24/7 Emergency Medicine, Mobile Ambulance Dispatch, Orthopedic Emergency',
                distance=12.0
            ),
            Hospital(
                name='Mahatma Gandhi Memorial Govt Hospital',
                address='Collector Office Road, Tiruchirappalli, TN 620017',
                latitude=10.8055,
                longitude=78.6856,
                phone='0431-2412530',
                emergency_services='24/7 Emergency Casualty, Poison Care Centre, Advanced Life Support',
                distance=15.4
            ),
            Hospital(
                name='Government Headquarters Hospital Rameswaram',
                address='Rameswaram Coastal Highway, Ramanathapuram, TN 623526',
                latitude=9.2876,
                longitude=79.3129,
                phone='04573-221233',
                emergency_services='24/7 Fisherfolk Coastal Trauma, Marine Stings, Hyperbaric Decompression Assistance',
                distance=22.3
            )
        ]
        db.session.add_all(hospitals)

    # 9. Baseline Weather record
    if WeatherRecord.query.count() == 0:
        weather = WeatherRecord(
            location_name='Tamil Nadu, India',
            latitude=11.1271,
            longitude=78.6569,
            temperature=28.0,
            humidity=72.0,
            wind_speed=14.0,
            visibility=10.0,
            weather_condition='Partly Cloudy',
            weather_code=2,
            is_cached=True,
            recorded_at=datetime.utcnow()
        )
        db.session.add(weather)

    db.session.commit()
