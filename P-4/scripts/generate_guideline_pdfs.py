"""
AapdaSetu - PDF Guideline Manual Compiler
==========================================
Compiles official humanitarian response and disaster guidelines text
into beautifully structured PDF manuals under data/rag_docs/ using ReportLab.
"""

import os
import logging
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

RAG_DOCS_DIR = "data/rag_docs"

# Define document texts
DOCUMENTS = {
    "NDMA_Flood_Guidelines.pdf": [
        ("TITLE", "National Disaster Management Authority (NDMA)"),
        ("SUBTITLE", "Official Guidelines: Flood Preparedness & Evacuation Standard Operating Procedures"),
        ("HEADING", "1. Active Preparedness Actions"),
        ("BODY", "Upon receiving a Heavy Rainfall Alert (Red Alert) from the Meteorological Department, DDMAs must activate emergency control rooms immediately. Community advisories include moving livestock and valuable belongings to elevated locations, storing dry rations, and cleaning drinking water reserves."),
        ("HEADING", "2. Evacuation Protocols"),
        ("BODY", "Evacuation must be initiated immediately if local river discharge exceeds the threshold limit or GloFAS forecast indicates a flood probability greater than 80%. Relocate vulnerable populations (pregnant women, children, and elderly) first. Evacuate along pre-identified safe routes, avoiding low-lying subways, bridges, and riverbanks. Do not drive or walk through moving water. Even 6 inches of moving water can knock you down, and 2 feet can sweep vehicles away."),
        ("HEADING", "3. Post-Flood Safety Checks"),
        ("BODY", "Do not enter damaged buildings until structural safety teams complete visual screenings. Consume boiled or chlorinated water to prevent waterborne outbreaks (cholera, gastroenteritis). Cooperate with municipal spraying of disinfectants to mitigate vector breeding.")
    ],
    "NDMA_Earthquake_Guidelines.pdf": [
        ("TITLE", "National Disaster Management Authority (NDMA)"),
        ("SUBTITLE", "Official Guidelines: Earthquake Survival & Rapid Structural Damage Assessment"),
        ("HEADING", "1. Action During Ground Shaking"),
        ("BODY", "If inside a building: Drop to the floor, take cover under a sturdy desk or table, and hold on (DROP, COVER, HOLD ON). Stay away from glass windows, mirrors, bookcases, and heavy hanging light fixtures. If in bed, cover your head and neck with a pillow. If outside, move to an open area away from buildings, streetlights, overhead power cables, and flyovers. If trapped under debris: do not light matches, cover your mouth, tap on a pipe or wall so rescue teams can locate you. Shout only as a last resort to conserve energy."),
        ("HEADING", "2. Rapid Visual Screening (RVS) Guidelines"),
        ("BODY", "Inspect columns for vertical shear fractures or concrete spalling. Exposed steel rebar indicates extreme structural compromise. Monitor load-bearing beams: horizontal cracks wider than 2mm mean structural failure is imminent. Assess soil stability around foundations: watch for mud boiling or soil liquefaction. Do not permit entry if the building leans by more than 1 degree.")
    ],
    "WHO_Emergency_Response_Framework.pdf": [
        ("TITLE", "World Health Organization (WHO)"),
        ("SUBTITLE", "Emergency Response Protocol: Infectious Disease Control & Nutrition Standards"),
        ("HEADING", "1. Camp Infection Control"),
        ("BODY", "Handwashing stations must be positioned at the entrance of all communal kitchens and sanitation blocks. Provide liquid soap or 0.05% chlorine solution. Latrines must be positioned at least 30 meters away from water wells or water treatment stations to avoid cross-contamination. Solid camp waste must be collected in closed bins daily and incinerated or buried in deep pits (minimum 2 meters deep) at the perimeter."),
        ("HEADING", "2. Nutrition Standards"),
        ("BODY", "Ration targets must ensure a minimum intake of 2,100 kcal per person per day, including essential micronutrients (Vitamin A, Iodine, Iron). Wet feeding centers must follow strict hygiene protocols, ensuring cooking utensils are sterilized in boiling water daily.")
    ],
    "NDRF_SOP.pdf": [
        ("TITLE", "National Disaster Response Force (NDRF)"),
        ("SUBTITLE", "Standard Operating Procedure: Swift Water Rescue & Night Evacuations"),
        ("HEADING", "1. Swift Water Rescue Tactics"),
        ("BODY", "Rescuers must identify hydrological hazards including eddies, strainers, sweepers, and low-head dams. Do not deploy standard boats in currents exceeding 10 knots. Use specialized inflatable rescue boats (IRBs) with outboard motors. All personnel operating within 3 meters of water must wear a Personal Flotation Device (PFD) Type III/V, swift water helmet, and carry a throw bag."),
        ("HEADING", "2. Night Evacuation Operations"),
        ("BODY", "Evacuations at night are discouraged due to hidden debris. If necessary, routes must be illuminated with chemical glow sticks and heavy searchlights. Helipad zones must be established on dry, elevated fields clear of overhead wires, marked with fluorescent cones and flares.")
    ],
    "Sphere_Handbook.pdf": [
        ("TITLE", "The Sphere Project"),
        ("SUBTITLE", "Humanitarian Charter: Minimum Standards in Water, Sanitation, and Shelter"),
        ("HEADING", "1. Temporary Shelter Requirements"),
        ("BODY", "Provide a covered area of a minimum of 3.5 square meters (38 sq ft) of covered space per person in temporary shelters to prevent overcrowding and ensure dignity. Shelter design must allow adequate ventilation during monsoons and thermal insulation during winter/nights. Provide safe, segregated spaces for women and children to ensure protection from harassment."),
        ("HEADING", "2. Water and Hygiene Standards (WASH)"),
        ("BODY", "Ensure a minimum of 15 liters of safe drinking water per person per day for drinking, cooking, and basic hygiene. Sanitation facilities must maintain a maximum ratio of 20 people per toilet. Toilets must be separated by gender and lit adequately at night. Maintain primary emergency medical kits containing ORS packets, bandages, antiseptics, and water purification tablets.")
    ]
}


def build_pdf(filename, content):
    """Compile content list into a ReportLab PDF."""
    path = os.path.join(RAG_DOCS_DIR, filename)
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        alignment=TA_CENTER,
        textColor='#1e1b4b',
        spaceAfter=10
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        textColor='#4f46e5',
        spaceAfter=25
    )
    heading_style = ParagraphStyle(
        'DocHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor='#0f172a',
        spaceBefore=15,
        spaceAfter=8
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        textColor='#334155',
        spaceAfter=10
    )
    
    story = []
    
    for element_type, text in content:
        if element_type == "TITLE":
            story.append(Paragraph(text, title_style))
        elif element_type == "SUBTITLE":
            story.append(Paragraph(text, subtitle_style))
        elif element_type == "HEADING":
            story.append(Paragraph(text, heading_style))
        elif element_type == "BODY":
            story.append(Paragraph(text, body_style))
            story.append(Spacer(1, 6))
            
    doc.build(story)
    logger.info(f"Generated PDF: {path}")


def generate_all():
    """Generates all 5 PDF documents."""
    os.makedirs(RAG_DOCS_DIR, exist_ok=True)
    logger.info(f"Generating PDF files in '{RAG_DOCS_DIR}'...")
    for filename, content in DOCUMENTS.items():
        build_pdf(filename, content)
    logger.info("All PDFs successfully generated!")


if __name__ == "__main__":
    generate_all()
