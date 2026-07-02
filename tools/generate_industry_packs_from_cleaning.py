from __future__ import annotations

import argparse
import csv
import json
import math
import re
import shutil
from dataclasses import dataclass
from datetime import date
from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageFont


SOURCE_DIR = Path(r"C:\Business\TEMPLATES.ZIP\NOT_READY\DokKit_Cleaning_Service_Complete_Pack_v1")
DEFAULT_OUTPUT_PARENT = Path(r"C:\Business\TEMPLATES.ZIP\NOT_READY")
DEFAULT_BATCH_NAME = f"Generated_Industry_Packs_From_Cleaning_Blueprint_{date.today():%Y%m%d}"


SOURCE_ACCENT_COLORS = {
    "4F81BD": "primary",
    "1D4ED8": "primary",
    "0369A1": "primary",
    "365F91": "primary",
    "1F497D": "primary",
    "29639D": "primary",
    "243F60": "primary_dark",
    "0B2545": "primary_dark",
    "1F2A44": "primary_dark",
    "243746": "primary_dark",
    "2C4C74": "primary_dark",
    "7BA0CD": "primary_tint",
    "A7BFDE": "primary_tint",
    "B8CCE4": "primary_tint",
    "D3DFEE": "primary_soft",
    "DBE5F1": "primary_soft",
    "EDF2F8": "primary_soft",
    "C0504D": "secondary",
    "943634": "secondary",
    "AA1D8D": "secondary",
    "772C2A": "secondary_dark",
    "9E3A38": "secondary_dark",
    "CF7B79": "secondary_tint",
    "DFA7A6": "secondary_tint",
    "E5B8B7": "secondary_tint",
    "EFD3D2": "secondary_soft",
    "F2DBDB": "secondary_soft",
    "F8EDED": "secondary_soft",
    "9BBB59": "tertiary",
    "76923C": "tertiary",
    "5E7530": "tertiary_dark",
    "B3CC82": "tertiary_tint",
    "CDDDAC": "tertiary_tint",
    "E6EED5": "tertiary_soft",
    "EAF1DD": "tertiary_soft",
    "F5F8EE": "tertiary_soft",
    "8064A2": "accent",
    "5F497A": "accent_dark",
    "4C3B62": "accent_dark",
    "9F8AB9": "accent_tint",
    "BFB1D0": "accent_tint",
    "DFD8E8": "accent_soft",
    "E5DFEC": "accent_soft",
    "F2EFF6": "accent_soft",
    "4BACC6": "secondary_alt",
    "31849B": "secondary_alt",
    "326F90": "secondary_alt",
    "276A7C": "secondary_alt_dark",
    "78C0D4": "secondary_alt_tint",
    "A5D5E2": "secondary_alt_tint",
    "D2EAF1": "secondary_alt_soft",
    "DAEEF3": "secondary_alt_soft",
    "EDF6F9": "secondary_alt_soft",
    "F79646": "warm",
    "E36C0A": "warm",
    "B65608": "warm_dark",
    "F9B074": "warm_tint",
    "FBCAA2": "warm_tint",
    "FDE4D0": "warm_soft",
    "FDE9D9": "warm_soft",
    "FEF4EC": "warm_soft",
    "D5D8DC": "neutral_soft",
    "D5DADF": "neutral_soft",
    "D6DADF": "neutral_soft",
    "C9D3DF": "neutral_soft",
    "9FB3C8": "neutral_tint",
    "CB0664": "secondary",
    "FC693F": "warm",
}


@dataclass(frozen=True)
class Industry:
    slug: str
    folder: str
    file_stem: str
    name: str
    short: str
    descriptor_plural: str
    descriptor_singular: str
    overview: str
    audience: tuple[str, str, str, str, str]
    role: str
    roles: str
    object_title: str
    object_lower: str
    area_title: str
    area_lower: str
    material_title: str
    material_lower: str
    materials_lower: str
    equipment_title: str
    category_1: str
    category_2: str
    category_3: str
    service_group_1: str
    service_group_2: str
    service_group_3: str
    service_1: str
    service_2: str
    service_3: str
    service_4: str
    service_5: str
    service_6: str
    service_7: str
    service_8: str
    service_9: str
    service_10: str
    service_11: str
    service_12: str
    service_13: str
    service_14: str
    business_profile_tagline: str
    setup_file: str
    core_process_file: str
    specialist_process_file: str
    material_log_file: str
    agreement_file: str
    proposal_file: str
    palette: dict[str, str]
    icon: str

    @property
    def short_lower(self) -> str:
        return self.short.lower()

    @property
    def role_lower(self) -> str:
        return self.role.lower()

    @property
    def roles_lower(self) -> str:
        return self.roles.lower()

    @property
    def material_file(self) -> str:
        return underscore(self.material_title)

    @property
    def object_file(self) -> str:
        return underscore(self.object_title)


def underscore(value: str) -> str:
    value = value.replace("/", " ").replace("&", " and ")
    value = re.sub(r"[^A-Za-z0-9]+", "_", value)
    return value.strip("_")


def rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.strip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def hex_from_rgb(color: tuple[int, int, int]) -> str:
    return "".join(f"{max(0, min(255, c)):02X}" for c in color)


def mix(a: str, b: str, amount: float) -> str:
    ar, ag, ab = rgb(a)
    br, bg, bb = rgb(b)
    return hex_from_rgb(
        (
            round(ar + (br - ar) * amount),
            round(ag + (bg - ag) * amount),
            round(ab + (bb - ab) * amount),
        )
    )


def complete_palette(primary: str, secondary: str, tertiary: str, accent: str, warm: str) -> dict[str, str]:
    primary = primary.strip("#").upper()
    secondary = secondary.strip("#").upper()
    tertiary = tertiary.strip("#").upper()
    accent = accent.strip("#").upper()
    warm = warm.strip("#").upper()
    return {
        "primary": primary,
        "primary_dark": mix(primary, "000000", 0.28),
        "primary_tint": mix(primary, "FFFFFF", 0.35),
        "primary_soft": mix(primary, "FFFFFF", 0.82),
        "secondary": secondary,
        "secondary_dark": mix(secondary, "000000", 0.28),
        "secondary_tint": mix(secondary, "FFFFFF", 0.35),
        "secondary_soft": mix(secondary, "FFFFFF", 0.84),
        "tertiary": tertiary,
        "tertiary_dark": mix(tertiary, "000000", 0.30),
        "tertiary_tint": mix(tertiary, "FFFFFF", 0.38),
        "tertiary_soft": mix(tertiary, "FFFFFF", 0.86),
        "accent": accent,
        "accent_dark": mix(accent, "000000", 0.30),
        "accent_tint": mix(accent, "FFFFFF", 0.38),
        "accent_soft": mix(accent, "FFFFFF", 0.86),
        "secondary_alt": mix(secondary, primary, 0.35),
        "secondary_alt_dark": mix(mix(secondary, primary, 0.35), "000000", 0.28),
        "secondary_alt_tint": mix(mix(secondary, primary, 0.35), "FFFFFF", 0.42),
        "secondary_alt_soft": mix(mix(secondary, primary, 0.35), "FFFFFF", 0.87),
        "warm": warm,
        "warm_dark": mix(warm, "000000", 0.28),
        "warm_tint": mix(warm, "FFFFFF", 0.38),
        "warm_soft": mix(warm, "FFFFFF", 0.87),
        "neutral_soft": mix(primary, "F8FAFC", 0.10),
        "neutral_tint": mix(primary, "E2E8F0", 0.18),
    }


def industry(
    slug: str,
    folder: str,
    file_stem: str,
    name: str,
    short: str,
    descriptor_plural: str,
    descriptor_singular: str,
    overview: str,
    audience: tuple[str, str, str, str, str],
    role: str,
    roles: str,
    object_title: str,
    area_title: str,
    material_title: str,
    equipment_title: str,
    categories: tuple[str, str, str],
    groups: tuple[str, str, str],
    services: tuple[str, str, str, str, str, str, str, str, str, str, str, str, str, str],
    business_profile_tagline: str,
    setup_file: str,
    core_process_file: str,
    specialist_process_file: str,
    material_log_file: str,
    agreement_file: str,
    proposal_file: str,
    palette_args: tuple[str, str, str, str, str],
    icon: str,
) -> Industry:
    return Industry(
        slug=slug,
        folder=folder,
        file_stem=file_stem,
        name=name,
        short=short,
        descriptor_plural=descriptor_plural,
        descriptor_singular=descriptor_singular,
        overview=overview,
        audience=audience,
        role=role,
        roles=roles,
        object_title=object_title,
        object_lower=object_title.lower(),
        area_title=area_title,
        area_lower=area_title.lower(),
        material_title=material_title,
        material_lower=material_title.lower(),
        materials_lower=f"{material_title.lower()}s" if not material_title.lower().endswith("s") else material_title.lower(),
        equipment_title=equipment_title,
        category_1=categories[0],
        category_2=categories[1],
        category_3=categories[2],
        service_group_1=groups[0],
        service_group_2=groups[1],
        service_group_3=groups[2],
        service_1=services[0],
        service_2=services[1],
        service_3=services[2],
        service_4=services[3],
        service_5=services[4],
        service_6=services[5],
        service_7=services[6],
        service_8=services[7],
        service_9=services[8],
        service_10=services[9],
        service_11=services[10],
        service_12=services[11],
        service_13=services[12],
        service_14=services[13],
        business_profile_tagline=business_profile_tagline,
        setup_file=setup_file,
        core_process_file=core_process_file,
        specialist_process_file=specialist_process_file,
        material_log_file=material_log_file,
        agreement_file=agreement_file,
        proposal_file=proposal_file,
        palette=complete_palette(*palette_args),
        icon=icon,
    )


INDUSTRIES = [
    industry(
        "construction-subcontractors",
        "DokKit_Construction_Subcontractors_Complete_Pack_v1",
        "Construction_Subcontractors",
        "Construction Subcontractors",
        "Construction",
        "construction subcontractor services",
        "construction subcontractor service",
        "A complete editable business document pack for subcontractors, trade teams, site crews, finishing contractors and small construction service providers in South Africa.",
        (
            "Small construction subcontractors and trade teams.",
            "Finishing, repair, renovation and installation contractors.",
            "Site crews that quote, complete and sign off work.",
            "Owner-managed building service providers.",
            "Subcontractors with recurring main-contractor or client work.",
        ),
        "Site Technician",
        "Site Crew",
        "Site",
        "Project",
        "Material",
        "Tools and Equipment",
        ("Trade and Site Work", "Finishing and Specialist Work", "Main Contractor Support"),
        ("Site Work Services", "Commercial and Contractor Services", "Specialist and Add-On Construction Services"),
        (
            "Routine Site Support",
            "Full-Day Trade Crew Support",
            "Once-Off Standard Work",
            "Detailed Finishing / Remedial Work",
            "Handover / Snag-List Work",
            "Business Client Site Work",
            "Construction Service Team",
            "Retail / Client-Facing Fit-Out Work",
            "Hospitality / Operational Area Work",
            "Recurring Maintenance Package",
            "Surface Repair Service",
            "Fixture / Fitting Service",
            "Minor Works Package",
            "Special Access Work",
        ),
        "Professional Trade and Site Services",
        "Site_Setup_and_Pack_Down",
        "General_Construction_Work_Process",
        "Finishing_Quality_and_Handover_Process",
        "Material_and_Tool_Use_Log",
        "Subcontractor_Service_Agreement",
        "Main_Contractor_Project_Proposal",
        ("B45309", "1F2937", "475569", "2563EB", "F59E0B"),
        "construction",
    ),
    industry(
        "beauty-salons-and-spas",
        "DokKit_Beauty_Salons_and_Spas_Complete_Pack_v1",
        "Beauty_Salons_and_Spas",
        "Beauty Salons and Spas",
        "Beauty",
        "beauty and spa services",
        "beauty and spa service",
        "A complete editable business document pack for salons, spas, beauty therapists, nail technicians, lash artists and wellness service providers in South Africa.",
        (
            "Beauty salons, spas and treatment rooms.",
            "Independent therapists, nail technicians and lash artists.",
            "Mobile beauty and wellness providers.",
            "Small teams managing appointments and client records.",
            "Beauty businesses with repeat clients, packages or staff.",
        ),
        "Beauty Therapist",
        "Beauty Team",
        "Client Treatment",
        "Appointment",
        "Product",
        "Salon Equipment",
        ("Salon and Spa Treatments", "Beauty Packages", "Retail and Aftercare"),
        ("Treatment Services", "Salon and Spa Packages", "Specialist and Add-On Beauty Services"),
        (
            "Routine Treatment Service",
            "Full-Day Therapist Support",
            "Once-Off Standard Treatment",
            "Detailed / Advanced Treatment",
            "Event / Bridal Preparation",
            "Business Client Wellness Service",
            "Beauty Service Team",
            "Retail / Client-Facing Treatment",
            "Hospitality / Wellness Area Service",
            "Recurring Treatment Package",
            "Skin / Surface Care Service",
            "Item-Based Beauty Service",
            "Large Treatment Package",
            "Specialist Access Treatment",
        ),
        "Professional Beauty and Spa Services",
        "Treatment_Room_Setup_and_Pack_Down",
        "Client_Treatment_Process",
        "Advanced_Treatment_and_Aftercare_Process",
        "Product_and_Stock_Use_Log",
        "Beauty_Service_Agreement",
        "Salon_and_Spa_Service_Proposal",
        ("BE185D", "7E22CE", "DB2777", "0F766E", "F59E0B"),
        "beauty",
    ),
    industry(
        "mobile-car-wash-detailing",
        "DokKit_Mobile_Car_Wash_and_Detailing_Complete_Pack_v1",
        "Mobile_Car_Wash_and_Detailing",
        "Mobile Car Wash and Detailing",
        "Detailing",
        "mobile car wash and detailing services",
        "mobile car wash and detailing service",
        "A complete editable business document pack for mobile car wash teams, vehicle detailers, fleet cleaners and vehicle care service providers in South Africa.",
        (
            "Mobile car wash and detailing businesses.",
            "Vehicle valets, fleet cleaners and detailers.",
            "Operators that inspect vehicle condition before service.",
            "Small teams offering packages or recurring clients.",
            "Vehicle care businesses that need proof of completion.",
        ),
        "Detailing Technician",
        "Detailing Team",
        "Vehicle",
        "Booking",
        "Product",
        "Detailing Equipment",
        ("Wash and Valet Services", "Detailing Packages", "Fleet and Add-On Services"),
        ("Vehicle Wash Services", "Fleet and Business Client Services", "Specialist and Add-On Detailing Services"),
        (
            "Routine Vehicle Wash",
            "Full-Day Detailing Support",
            "Once-Off Standard Valet",
            "Detailed Interior / Exterior Detail",
            "Pre-Sale / Handover Detail",
            "Business Fleet Service",
            "Detailing Service Team",
            "Showroom / Customer-Facing Vehicle Care",
            "Hospitality / Venue Vehicle Care",
            "Recurring Fleet Care Package",
            "Carpet and Upholstery Detail",
            "Seat and Trim Service",
            "Large Vehicle Service",
            "Special Access Vehicle Detail",
        ),
        "Professional Mobile Vehicle Care Services",
        "Mobile_Unit_Setup_and_Pack_Down",
        "Vehicle_Wash_and_Detailing_Process",
        "Deep_Detailing_and_Handover_Process",
        "Product_and_Consumables_Use_Log",
        "Recurring_Vehicle_Care_Service_Agreement",
        "Fleet_and_Corporate_Service_Proposal",
        ("0284C7", "0891B2", "0F766E", "1D4ED8", "F59E0B"),
        "carwash",
    ),
    industry(
        "catering-and-baking",
        "DokKit_Catering_and_Baking_Complete_Pack_v1",
        "Catering_and_Baking",
        "Catering and Baking",
        "Catering",
        "catering and baking services",
        "catering and baking service",
        "A complete editable business document pack for caterers, bakers, cake makers, meal prep businesses and event food service providers in South Africa.",
        (
            "Small catering businesses and private chefs.",
            "Bakers, cake makers and custom dessert suppliers.",
            "Meal prep, platters and event food providers.",
            "Food businesses tracking deposits, menus and orders.",
            "Owner-managed food teams with recurring clients or events.",
        ),
        "Food Handler",
        "Food Service Team",
        "Order",
        "Event",
        "Ingredient",
        "Kitchen Equipment",
        ("Catering Services", "Baking and Custom Orders", "Event Food Packages"),
        ("Catering and Order Services", "Event and Business Client Services", "Specialist and Add-On Food Services"),
        (
            "Routine Food Order",
            "Full-Day Catering Support",
            "Once-Off Standard Order",
            "Detailed Custom Menu",
            "Event / Delivery Handover",
            "Business Client Food Service",
            "Catering Service Team",
            "Retail / Customer-Facing Food Service",
            "Restaurant / Kitchen Support Service",
            "Recurring Meal or Catering Package",
            "Platter Service",
            "Item-Based Baked Goods",
            "Large Event Food Service",
            "Special Access Catering Service",
        ),
        "Professional Catering and Baking Services",
        "Kitchen_Setup_and_Pack_Down",
        "Food_Order_and_Catering_Process",
        "Event_Catering_Quality_and_Handover_Process",
        "Ingredient_and_Stock_Use_Log",
        "Catering_Service_Agreement",
        "Corporate_and_Event_Catering_Proposal",
        ("C2410C", "B45309", "A16207", "BE123C", "F59E0B"),
        "catering",
    ),
    industry(
        "freelancers-consultants",
        "DokKit_Freelancers_and_Consultants_Complete_Pack_v1",
        "Freelancers_and_Consultants",
        "Freelancers and Consultants",
        "Consulting",
        "freelance and consulting services",
        "freelance and consulting service",
        "A complete editable business document pack for consultants, freelancers, coaches, specialists and independent professional service providers in South Africa.",
        (
            "Independent consultants and professional freelancers.",
            "Coaches, specialists and knowledge-service providers.",
            "Solo businesses that quote projects or retainers.",
            "Operators managing proposals, scope and deliverables.",
            "Service providers with recurring clients or project work.",
        ),
        "Consultant",
        "Consulting Team",
        "Project",
        "Engagement",
        "Deliverable",
        "Work Tools",
        ("Consulting Services", "Project and Retainer Work", "Advisory Deliverables"),
        ("Consulting Services", "Business Client and Retainer Services", "Specialist and Add-On Consulting Services"),
        (
            "Routine Advisory Support",
            "Full-Day Consulting Support",
            "Once-Off Standard Project",
            "Detailed Strategy / Delivery Sprint",
            "Project Handover Support",
            "Business Client Consulting",
            "Consulting Service Team",
            "Client-Facing Workshop",
            "Operational Advisory Support",
            "Recurring Retainer Package",
            "Document Review Service",
            "Item-Based Deliverable",
            "Large Project Package",
            "Specialist Advisory Session",
        ),
        "Professional Freelance and Consulting Services",
        "Client_Work_Setup_and_Close_Out",
        "Client_Project_Delivery_Process",
        "Review_and_Handover_Process",
        "Deliverable_and_Tool_Use_Log",
        "Retainer_Service_Agreement",
        "Consulting_Service_Proposal",
        ("4338CA", "6D28D9", "0F172A", "0E7490", "F59E0B"),
        "consulting",
    ),
    industry(
        "tutors-training-providers",
        "DokKit_Tutors_and_Training_Providers_Complete_Pack_v1",
        "Tutors_and_Training_Providers",
        "Tutors and Training Providers",
        "Training",
        "tutoring and training services",
        "tutoring and training service",
        "A complete editable business document pack for tutors, facilitators, short-course providers, trainers and small education service providers in South Africa.",
        (
            "Private tutors and learning support providers.",
            "Facilitators, trainers and short-course providers.",
            "Education businesses tracking attendance and sessions.",
            "Providers that need learner, parent or client records.",
            "Training teams with recurring classes or workshops.",
        ),
        "Tutor",
        "Training Team",
        "Learner",
        "Session",
        "Learning Material",
        "Training Equipment",
        ("Tutoring Services", "Training Programmes", "Learner Support"),
        ("Tutoring and Lesson Services", "Business and Group Training Services", "Specialist and Add-On Learning Services"),
        (
            "Routine Tutoring Session",
            "Full-Day Training Support",
            "Once-Off Standard Lesson",
            "Detailed Programme / Workshop",
            "Assessment / Handover Session",
            "Business Client Training",
            "Training Service Team",
            "Retail / Client-Facing Workshop",
            "Education Venue Support",
            "Recurring Lesson Package",
            "Resource Review Service",
            "Item-Based Learning Support",
            "Large Group Training",
            "Specialist Learning Session",
        ),
        "Professional Tutoring and Training Services",
        "Classroom_Setup_and_Pack_Down",
        "Lesson_and_Session_Delivery_Process",
        "Assessment_and_Learner_Handover_Process",
        "Learning_Material_Use_Log",
        "Tutoring_and_Training_Service_Agreement",
        "Training_Service_Proposal",
        ("2563EB", "7C3AED", "0F766E", "DB2777", "F59E0B"),
        "training",
    ),
    industry(
        "event-planners",
        "DokKit_Event_Planners_Complete_Pack_v1",
        "Event_Planners",
        "Event Planners",
        "Events",
        "event planning services",
        "event planning service",
        "A complete editable business document pack for event planners, coordinators, decorators, small event teams and private or corporate event service providers in South Africa.",
        (
            "Event planners, coordinators and decorators.",
            "Private, corporate and community event service providers.",
            "Small teams managing suppliers, bookings and run sheets.",
            "Operators who quote packages and take deposits.",
            "Event businesses that need client sign-off and checklists.",
        ),
        "Event Coordinator",
        "Event Team",
        "Venue",
        "Event",
        "Decor Item",
        "Event Equipment",
        ("Event Planning", "Decor and Coordination", "Corporate and Private Events"),
        ("Event Planning Services", "Corporate and Private Event Services", "Specialist and Add-On Event Services"),
        (
            "Routine Event Planning",
            "Full-Day Event Support",
            "Once-Off Standard Event",
            "Detailed Event Coordination",
            "Venue Handover Support",
            "Business Client Event Service",
            "Event Service Team",
            "Retail / Customer-Facing Activation",
            "Hospitality / Venue Event Support",
            "Recurring Event Support Package",
            "Decor Setup Service",
            "Item-Based Event Hire",
            "Large Event Package",
            "Special Access Event Setup",
        ),
        "Professional Event Planning and Coordination Services",
        "Event_Setup_and_Breakdown",
        "Event_Coordination_Process",
        "Event_Quality_Check_and_Handover_Process",
        "Decor_Supplier_and_Item_Use_Log",
        "Event_Planning_Service_Agreement",
        "Corporate_Event_Planning_Proposal",
        ("7C3AED", "DB2777", "0EA5E9", "F97316", "F59E0B"),
        "event",
    ),
    industry(
        "landscaping-garden-services",
        "DokKit_Landscaping_and_Garden_Services_Complete_Pack_v1",
        "Landscaping_and_Garden_Services",
        "Landscaping and Garden Services",
        "Garden Services",
        "landscaping and garden services",
        "landscaping and garden service",
        "A complete editable business document pack for landscapers, garden maintenance teams, lawn care providers and outdoor service businesses in South Africa.",
        (
            "Garden maintenance and landscaping businesses.",
            "Lawn care, planting and outdoor cleanup teams.",
            "Small teams with recurring garden clients.",
            "Operators tracking materials, tools and site visits.",
            "Outdoor service providers needing inspection and sign-off forms.",
        ),
        "Garden Technician",
        "Garden Team",
        "Garden Site",
        "Visit",
        "Plant and Material",
        "Garden Equipment",
        ("Garden Maintenance", "Landscaping Projects", "Outdoor Add-On Services"),
        ("Garden Maintenance Services", "Commercial and Estate Garden Services", "Specialist and Add-On Landscaping Services"),
        (
            "Routine Garden Maintenance",
            "Full-Day Garden Team Support",
            "Once-Off Standard Garden Service",
            "Detailed Landscaping / Cleanup Service",
            "Move-In / Handover Garden Service",
            "Business Client Garden Service",
            "Garden Service Team",
            "Retail / Customer-Facing Garden Care",
            "Hospitality / Outdoor Area Service",
            "Recurring Garden Care Package",
            "Lawn / Surface Service",
            "Planting Item Service",
            "Large Garden Service",
            "Special Access Landscaping Service",
        ),
        "Professional Landscaping and Garden Services",
        "Mobile_Garden_Service_Setup_and_Pack_Down",
        "Garden_Maintenance_Process",
        "Landscaping_Quality_and_Handover_Process",
        "Plant_Material_and_Consumables_Use_Log",
        "Recurring_Garden_Service_Agreement",
        "Commercial_Garden_Service_Proposal",
        ("15803D", "4D7C0F", "0F766E", "A16207", "F59E0B"),
        "landscaping",
    ),
    industry(
        "handyman-home-repair",
        "DokKit_Handyman_and_Home_Repair_Complete_Pack_v1",
        "Handyman_and_Home_Repair",
        "Handyman and Home Repair",
        "Home Repair",
        "handyman and home repair services",
        "handyman and home repair service",
        "A complete editable business document pack for handymen, repair technicians, maintenance teams and small home repair businesses in South Africa.",
        (
            "Handyman and small home repair businesses.",
            "Maintenance technicians and repair teams.",
            "Operators quoting repairs, materials and labour.",
            "Small teams needing job cards and warranty notes.",
            "Service providers with recurring landlord or client work.",
        ),
        "Repair Technician",
        "Repair Team",
        "Work Area",
        "Repair Job",
        "Material",
        "Tools and Equipment",
        ("Repair Services", "Maintenance Work", "Installation and Add-On Services"),
        ("Home Repair Services", "Commercial and Landlord Maintenance Services", "Specialist and Add-On Repair Services"),
        (
            "Routine Maintenance Visit",
            "Full-Day Repair Support",
            "Once-Off Standard Repair",
            "Detailed Repair / Remedial Work",
            "Move-In / Handover Repair",
            "Business Client Maintenance",
            "Repair Service Team",
            "Retail / Customer-Facing Repair",
            "Hospitality / Operational Area Repair",
            "Recurring Maintenance Package",
            "Surface Repair Service",
            "Fixture / Fitting Service",
            "Large Repair Package",
            "Special Access Repair",
        ),
        "Professional Handyman and Home Repair Services",
        "Mobile_Repair_Setup_and_Pack_Down",
        "General_Repair_Work_Process",
        "Quality_Check_and_Handover_Process",
        "Material_and_Tool_Use_Log",
        "Home_Repair_Service_Agreement",
        "Maintenance_Service_Proposal",
        ("B45309", "475569", "0F766E", "2563EB", "F97316"),
        "handyman",
    ),
    industry(
        "photography-videography",
        "DokKit_Photography_and_Videography_Complete_Pack_v1",
        "Photography_and_Videography",
        "Photography and Videography",
        "Media Production",
        "photography and videography services",
        "photography and videography service",
        "A complete editable business document pack for photographers, videographers, content creators, studios and small creative production providers in South Africa.",
        (
            "Photographers, videographers and content creators.",
            "Studios and small creative production teams.",
            "Operators selling shoot packages and deliverables.",
            "Service providers tracking bookings, usage rights and delivery.",
            "Creative businesses needing polished client sign-off documents.",
        ),
        "Creative Producer",
        "Creative Team",
        "Shoot Location",
        "Shoot",
        "Media Asset",
        "Camera Equipment",
        ("Photo and Video Shoots", "Creative Packages", "Editing and Delivery"),
        ("Photo and Video Services", "Commercial and Corporate Creative Services", "Specialist and Add-On Media Services"),
        (
            "Routine Content Session",
            "Full-Day Shoot Support",
            "Once-Off Standard Shoot",
            "Detailed Creative Production",
            "Event / Delivery Handover",
            "Business Client Media Service",
            "Creative Service Team",
            "Retail / Customer-Facing Shoot",
            "Hospitality / Venue Media Support",
            "Recurring Content Package",
            "Photo Editing Service",
            "Item-Based Media Deliverable",
            "Large Production Package",
            "Special Access Shoot",
        ),
        "Professional Photography and Videography Services",
        "Shoot_Setup_and_Pack_Down",
        "Photo_and_Video_Shoot_Process",
        "Editing_Quality_and_Delivery_Process",
        "Media_Asset_and_Equipment_Use_Log",
        "Creative_Service_Agreement",
        "Commercial_Creative_Service_Proposal",
        ("0F172A", "9333EA", "0369A1", "DB2777", "F59E0B"),
        "photography",
    ),
    industry(
        "property-rental-admin",
        "DokKit_Property_Rental_Admin_Complete_Pack_v1",
        "Property_Rental_Admin",
        "Property Rental Admin",
        "Rental Admin",
        "property rental administration services",
        "property rental administration service",
        "A complete editable business document pack for landlords, rental administrators, letting assistants and small property portfolio managers in South Africa.",
        (
            "Small landlords and rental administrators.",
            "Letting assistants and property portfolio managers.",
            "Operators tracking inspections, maintenance and tenant details.",
            "Businesses managing recurring rental records.",
            "Property administrators needing consistent client communication.",
        ),
        "Rental Administrator",
        "Rental Admin Team",
        "Property",
        "Tenancy",
        "Record",
        "Property Admin Tools",
        ("Tenant Administration", "Property Inspections", "Maintenance and Rental Records"),
        ("Tenant and Property Admin Services", "Landlord and Portfolio Support Services", "Specialist and Add-On Rental Admin Services"),
        (
            "Routine Rental Admin",
            "Full-Day Property Admin Support",
            "Once-Off Standard Inspection",
            "Detailed Property Review",
            "Move-In / Move-Out Admin",
            "Business Client Property Admin",
            "Rental Admin Service Team",
            "Retail / Client-Facing Letting Support",
            "Hospitality / Short-Stay Property Support",
            "Recurring Property Admin Package",
            "Inspection Record Service",
            "Item-Based Admin Support",
            "Large Portfolio Support",
            "Special Access Property Visit",
        ),
        "Professional Property Rental Administration Services",
        "Property_Visit_Setup_and_Close_Out",
        "Rental_Property_Inspection_Process",
        "Move_In_Move_Out_Handover_Process",
        "Record_and_Key_Use_Log",
        "Property_Admin_Service_Agreement",
        "Landlord_and_Portfolio_Admin_Proposal",
        ("0F766E", "0369A1", "4D7C0F", "4338CA", "B45309"),
        "property",
    ),
    industry(
        "transport-delivery-services",
        "DokKit_Transport_and_Delivery_Services_Complete_Pack_v1",
        "Transport_and_Delivery_Services",
        "Transport and Delivery Services",
        "Delivery",
        "transport and delivery services",
        "transport and delivery service",
        "A complete editable business document pack for couriers, delivery operators, small transport teams, shuttle services and logistics support providers in South Africa.",
        (
            "Courier, delivery and small transport businesses.",
            "Drivers and owner-managed logistics teams.",
            "Operators tracking trips, vehicles and proof of delivery.",
            "Businesses invoicing recurring delivery clients.",
            "Transport providers needing checklists and incident records.",
        ),
        "Driver",
        "Delivery Team",
        "Delivery Location",
        "Trip",
        "Item",
        "Vehicle and Equipment",
        ("Delivery Services", "Transport Trips", "Fleet and Route Support"),
        ("Delivery Services", "Business and Fleet Client Services", "Specialist and Add-On Transport Services"),
        (
            "Routine Delivery Run",
            "Full-Day Driver Support",
            "Once-Off Standard Delivery",
            "Detailed Route / Multi-Stop Delivery",
            "Collection / Handover Delivery",
            "Business Client Delivery Service",
            "Delivery Service Team",
            "Retail / Customer-Facing Delivery",
            "Hospitality / Venue Delivery Support",
            "Recurring Delivery Package",
            "Parcel Handling Service",
            "Item-Based Delivery",
            "Large Load Delivery",
            "Special Access Delivery",
        ),
        "Professional Transport and Delivery Services",
        "Vehicle_Setup_and_Return_Check",
        "Delivery_Run_Process",
        "Proof_of_Delivery_and_Handover_Process",
        "Fuel_Item_and_Vehicle_Use_Log",
        "Recurring_Delivery_Service_Agreement",
        "Business_Delivery_Service_Proposal",
        ("0369A1", "1D4ED8", "0F766E", "4338CA", "F59E0B"),
        "transport",
    ),
    industry(
        "food-trucks-small-food-vendors",
        "DokKit_Food_Trucks_and_Small_Food_Vendors_Complete_Pack_v1",
        "Food_Trucks_and_Small_Food_Vendors",
        "Food Trucks and Small Food Vendors",
        "Food Vending",
        "food truck and small food vendor services",
        "food truck and small food vendor service",
        "A complete editable business document pack for food trucks, market vendors, mobile food stalls, pop-up sellers and small prepared-food businesses in South Africa.",
        (
            "Food trucks and mobile food vendors.",
            "Market stalls, pop-up sellers and small prepared-food teams.",
            "Operators tracking stock, suppliers, prep and sales.",
            "Food businesses that need daily admin and cash-up records.",
            "Vendors managing events, permits, menus and recurring locations.",
        ),
        "Vendor",
        "Food Vending Team",
        "Trading Site",
        "Trading Day",
        "Stock Item",
        "Food Truck Equipment",
        ("Menu and Food Sales", "Stock and Prep", "Events and Trading Sites"),
        ("Food Vending Services", "Event and Business Client Food Services", "Specialist and Add-On Vendor Services"),
        (
            "Routine Trading Day",
            "Full-Day Vendor Support",
            "Once-Off Standard Food Stall",
            "Detailed Event Menu",
            "Event / Site Handover",
            "Business Client Food Vendor Service",
            "Food Vending Service Team",
            "Retail / Customer-Facing Food Service",
            "Hospitality / Venue Food Service",
            "Recurring Trading Package",
            "Menu Item Prep Service",
            "Item-Based Food Order",
            "Large Event Food Stall",
            "Special Access Trading Site",
        ),
        "Professional Food Truck and Vendor Services",
        "Trading_Site_Setup_and_Pack_Down",
        "Food_Vending_Service_Process",
        "Event_Trading_Quality_and_Close_Out_Process",
        "Stock_and_Ingredient_Use_Log",
        "Food_Vending_Service_Agreement",
        "Event_and_Market_Food_Service_Proposal",
        ("EA580C", "BE123C", "A16207", "0891B2", "F59E0B"),
        "foodtruck",
    ),
    industry(
        "online-resellers-ecommerce",
        "DokKit_Online_Resellers_and_Ecommerce_Complete_Pack_v1",
        "Online_Resellers_and_Ecommerce",
        "Online Resellers and E-commerce",
        "E-commerce",
        "online reseller and e-commerce services",
        "online reseller and e-commerce service",
        "A complete editable business document pack for online resellers, e-commerce sellers, marketplace operators, small product brands and home-based stock businesses in South Africa.",
        (
            "Online resellers and marketplace sellers.",
            "Small e-commerce stores and product brands.",
            "Home-based operators tracking stock and orders.",
            "Businesses managing returns, suppliers and customer messages.",
            "Sellers who need simple documents before adopting complex software.",
        ),
        "Store Operator",
        "E-commerce Team",
        "Order",
        "Sale",
        "Stock Item",
        "Packing Equipment",
        ("Online Sales", "Stock and Fulfilment", "Returns and Customer Care"),
        ("Online Sales Services", "Marketplace and Business Client Services", "Specialist and Add-On E-commerce Services"),
        (
            "Routine Order Fulfilment",
            "Full-Day Store Admin Support",
            "Once-Off Standard Order",
            "Detailed Product Launch",
            "Dispatch / Handover Order",
            "Business Client Online Sales Support",
            "E-commerce Service Team",
            "Retail / Customer-Facing Online Sale",
            "Marketplace Operations Support",
            "Recurring Store Admin Package",
            "Stock Review Service",
            "Item-Based Order Support",
            "Large Campaign Package",
            "Special Access Fulfilment",
        ),
        "Professional Online Reseller and E-commerce Services",
        "Order_Fulfilment_Setup_and_Close_Out",
        "Order_and_Stock_Process",
        "Returns_Quality_and_Customer_Care_Process",
        "Stock_and_Packing_Material_Use_Log",
        "Online_Sales_Service_Agreement",
        "Ecommerce_Service_Proposal",
        ("0F766E", "2563EB", "7C3AED", "DB2777", "F59E0B"),
        "ecommerce",
    ),
]


def filename_for(source_name: str, ind: Industry) -> str:
    special_names = INDUSTRY_FILE_NAMES.get(ind.slug, {})
    exact = {
        "01_DokKit_Cleaning_Services_Cover_Page.docx": f"01_DokKit_{ind.file_stem}_Cover_Page.docx",
        "04_Service_Menu_Price_List_Template.docx": f"04_{underscore(ind.service_group_1)}_Price_List_Template.docx",
        "07_Client_Booking_and_Property_Intake_Form.docx": special_names.get("07", f"07_Client_Booking_and_{ind.object_file}_Intake_Form.docx"),
        "08_Booking_Cancellation_Refund_Policy.docx": special_names.get("08", f"08_{underscore(ind.area_title)}_Cancellation_Refund_Policy.docx"),
        "10_Service_Completion_Client_Sign_Off_Form.docx": f"10_{underscore(ind.short)}_Completion_Client_Sign_Off_Form.docx",
        "12_Pre_Service_Property_Inspection_Form.docx": special_names.get("12", f"12_Pre_Service_{ind.object_file}_Inspection_Form.docx"),
        "13_Property_Damage_Declaration_and_Disclaimer.docx": special_names.get("13", f"13_{ind.object_file}_Damage_Declaration_and_Disclaimer.docx"),
        "14_Recurring_Cleaning_Service_Agreement.docx": f"14_{ind.agreement_file}.docx",
        "15_Commercial_Corporate_Service_Proposal.docx": f"15_{ind.proposal_file}.docx",
        "17_Product_Chemical_Use_Log.docx": f"17_{ind.material_log_file}.docx",
        "23_SOP_Mobile_Service_Setup_and_Pack_Down.docx": f"23_SOP_{ind.setup_file}.docx",
        "24_SOP_Residential_Cleaning_Process.docx": f"24_SOP_{ind.core_process_file}.docx",
        "25_SOP_Deep_Cleaning_Process.docx": f"25_SOP_{ind.specialist_process_file}.docx",
        "25_SOP_Deep_Cleaning_Process_Detailed.docx": f"25_SOP_{ind.specialist_process_file}_Detailed.docx",
        "26_Equipment_Maintenance_Log_Template.docx": f"26_{underscore(ind.equipment_title)}_Maintenance_Log_Template.docx",
        "DokKit_Cleaning_Services_Complete_Workbook_v1.xlsx": f"DokKit_{ind.file_stem}_Complete_Workbook_v1.xlsx",
        "Read_Me_Cleaning_Services_Workbook.docx": f"Read_Me_{ind.file_stem}_Workbook.docx",
    }
    return exact.get(source_name, source_name)


def content_replacements(ind: Industry) -> list[tuple[str, str]]:
    repl = [
        (
            "A complete editable business document pack for residential, commercial, office, domestic, deep cleaning and recurring cleaning service providers in South Africa.",
            ind.overview,
        ),
        (
            "This pack helps a cleaning services business organise client communication, quotations, service delivery, staff records, operating procedures and monthly administration in a professional format.",
            f"This pack helps a {ind.descriptor_singular} organise client communication, quotations, service delivery, team records, operating procedures and monthly administration in a professional format.",
        ),
        ("Residential and domestic cleaning businesses.", ind.audience[0]),
        ("Office and commercial cleaning providers.", ind.audience[1]),
        ("Deep cleaning and once-off cleaning teams.", ind.audience[2]),
        ("Move-in, move-out and post-renovation cleaning providers.", ind.audience[3]),
        ("Small cleaning businesses with recurring clients or staff teams.", ind.audience[4]),
        ("Professional Cleaning &amp; Hygiene Services", ind.business_profile_tagline),
        ("Professional Cleaning & Hygiene Services", ind.business_profile_tagline),
        ("premier cleaning and hygiene solutions", f"premier {ind.descriptor_plural}"),
        ("superior, reliable, and sustainable cleaning services", f"superior, reliable, and practical {ind.descriptor_plural}"),
        ("facility management and cleaning service provider", ind.descriptor_singular),
        ("Core Cleaning Services", f"Core {ind.short} Services"),
        ("Commercial &amp; Office Cleaning", ind.category_1),
        ("Industrial &amp; Specialized Cleaning", ind.category_2),
        ("Hygiene &amp; Pest Control", ind.category_3),
        ("Commercial & Office Cleaning", ind.category_1),
        ("Industrial & Specialized Cleaning", ind.category_2),
        ("Hygiene & Pest Control", ind.category_3),
        ("Residential Cleaning Services", ind.service_group_1),
        ("Commercial &amp; Office Cleaning Services", ind.service_group_2),
        ("Specialist &amp; Add-On Cleaning Services", ind.service_group_3),
        ("Commercial & Office Cleaning Services", ind.service_group_2),
        ("Specialist & Add-On Cleaning Services", ind.service_group_3),
        (
            "General cleaning for homes, flats, and apartments; dusting, sweeping, mopping, bathrooms, kitchen surfaces, and bins.",
            f"Routine {ind.short_lower} support for agreed clients, bookings or work areas; scope confirmation, preparation, service delivery and basic completion notes.",
        ),
        (
            "One cleaner for a full day, usually 7–8 hours, for routine household cleaning duties.",
            f"One {ind.role_lower} for a full day, usually 7-8 hours, for agreed routine {ind.short_lower} support duties.",
        ),
        (
            "One cleaner for a full day, usually 7-8 hours, for routine household cleaning duties.",
            f"One {ind.role_lower} for a full day, usually 7-8 hours, for agreed routine {ind.short_lower} support duties.",
        ),
        (
            "General clean for a home or apartment where no deep cleaning is required.",
            f"Standard once-off {ind.short_lower} service where no detailed or specialist scope is required.",
        ),
        (
            "Detailed clean including kitchens, bathrooms, skirting, cupboards exterior, high-touch areas, and heavier build-up.",
            f"Detailed {ind.short_lower} service for complex, higher-effort or package-based work with clear quality checks.",
        ),
        (
            "Pre-occupation or end-of-lease cleaning for rental or sale properties.",
            f"Handover, event, project or booking support before or after an agreed milestone.",
        ),
        (
            "Routine cleaning of workstations, floors, kitchens, bathrooms, reception areas, and waste removal.",
            f"Routine {ind.short_lower} support for client-facing areas, work areas, records, schedules and service follow-up.",
        ),
        (
            "Cleaning team for offices, shops, schools, clinics, complexes, or business premises.",
            f"{ind.roles} for homes, sites, venues, offices, shops, complexes or business premises as applicable.",
        ),
        (
            "Floor care, dusting, glass touch-ups, fitting rooms, counters, and customer-facing areas.",
            f"Client-facing service tasks, presentation checks, finishing details and customer-facing areas.",
        ),
        (
            "Front-of-house, back-of-house, degreasing, surfaces, floors, and hygiene-focused cleaning.",
            f"Operational support, preparation areas, service areas, documentation and quality-focused completion work.",
        ),
        (
            "Weekly or monthly cleaning contract with agreed service schedule and scope.",
            f"Weekly or monthly {ind.short_lower} arrangement with agreed service schedule and scope.",
        ),
        (
            "General clean plus extra bathroom and kitchen focus",
            f"Standard {ind.short_lower} service plus extra focus on agreed priority areas",
        ),
        (
            "Detailed deep clean, high-touch areas, cupboards exterior, skirting",
            f"Detailed {ind.short_lower} service, priority areas, finish checks and handover notes",
        ),
        (
            "Scheduled weekly cleaning and hygiene maintenance",
            f"Scheduled weekly {ind.short_lower} support and admin follow-up",
        ),
        (
            "Tenants, landlords, estate agents",
            "Clients, account contacts and service representatives",
        ),
        ("dusting, sweeping, mopping", "preparation, checking and service delivery"),
        ("bathrooms, kitchen surfaces, and bins", "priority areas, client notes and close-out records"),
        ("kitchens, bathrooms, skirting, cupboards exterior, high-touch areas, and heavier build-up", "priority areas, detailed tasks, handover points and quality records"),
        ("bathroom and kitchen focus", "priority-area focus"),
        ("kitchen and bathroom focus", "priority-area focus"),
        ("Bathroom", "Service Area"),
        ("bathroom", "service area"),
        ("Kitchen", "Preparation Area"),
        ("kitchen", "preparation area"),
        ("Mould", "Issue"),
        ("mould", "issue"),
        ("Grease", "Issue"),
        ("grease", "issue"),
        ("Heavy dirt", "Heavy issue"),
        ("heavy dirt", "heavy issue"),
        ("Home / Office / Shop / Other", "Client / Site / Booking / Other"),
        ("Number of Rooms / Areas", f"Number of {ind.object_title}s / Areas"),
        ("Floor Type", f"{ind.object_title} / Surface Type"),
        ("Tiles / Carpet / Wood / Other", "Standard / Fragile / High-priority / Other"),
        ("Pets on Property", "Special Conditions"),
        ("Pets on property", "Special conditions"),
        ("Alarm / Access Instructions", "Access / Service Instructions"),
        ("Floors / carpets", "Primary service areas / items"),
        ("Kitchen / food areas", "Priority service requirements"),
        ("Windows / glass", "Visible finish / presentation"),
        ("Furniture / fixtures", "Fixtures / equipment / records"),
        ("Personal items secured", "Client items or records secured"),
        ("pre-existing damage, stains, wear and tear or building defects", "pre-existing issues, stains, wear and tear, record gaps or site defects"),
        ("Regular Domestic Cleaning", ind.service_1),
        ("Daily Char / Domestic Helper Service", ind.service_2),
        ("Once-Off Standard Clean", ind.service_3),
        ("Deep / Spring Cleaning", ind.service_4),
        ("Move-In / Move-Out Cleaning", ind.service_5),
        ("Regular Office Cleaning", ind.service_6),
        ("Commercial Cleaning Team", ind.service_7),
        ("Retail / Showroom Cleaning", ind.service_8),
        ("Restaurant / Kitchen Cleaning", ind.service_9),
        ("Contract Cleaning Package", ind.service_10),
        ("Carpet Cleaning", ind.service_11),
        ("Upholstery Cleaning", ind.service_12),
        ("Mattress Cleaning", ind.service_13),
        ("Window Cleaning", ind.service_14),
        ("High-Reach Window Cleaning", f"Special Access {ind.short} Service"),
        ("Cleaning quotation template", f"{ind.short} quotation template"),
        ("Cleaning task schedule", f"{ind.short} task schedule"),
        ("Cleaning service description", f"{ind.short_lower} service description"),
        ("cleaning service description", f"{ind.short_lower} service description"),
        ("Cleaning Location Address", f"{ind.object_title} Address"),
        ("Client Booking and Property Intake Form", f"Client Booking and {ind.object_title} Intake Form"),
        ("Pre-Service Property Inspection Form", f"Pre-Service {ind.object_title} Inspection Form"),
        ("Property Damage Declaration and Disclaimer", f"{ind.object_title} Damage Declaration and Disclaimer"),
        ("Recurring Cleaning Service Agreement", ind.agreement_file.replace("_", " ")),
        ("Product Chemical Use Log", ind.material_log_file.replace("_", " ")),
        ("SOP Residential Cleaning Process", f"SOP {ind.core_process_file.replace('_', ' ')}"),
        ("SOP Deep Cleaning Process", f"SOP {ind.specialist_process_file.replace('_', ' ')}"),
        ("Residential Cleaning Process", ind.core_process_file.replace("_", " ")),
        ("Deep Cleaning Process", ind.specialist_process_file.replace("_", " ")),
        ("deep cleaning process", ind.specialist_process_file.replace("_", " ").lower()),
        ("Deep Cleaning", ind.service_4),
        ("deep cleaning", ind.service_4.lower()),
        ("Residential Cleaning", ind.service_group_1),
        ("residential cleaning", ind.service_group_1.lower()),
        ("Mobile cleaning service", ind.descriptor_singular),
        ("mobile cleaning service", ind.descriptor_singular),
        ("cleaning-service", ind.short_lower.replace(" ", "-")),
        ("cleaning service", ind.descriptor_singular),
        ("cleaning services", ind.descriptor_plural),
        ("Cleaning Service", ind.descriptor_singular.title()),
        ("Cleaning Services", ind.name),
        ("CLEANING SERVICES", ind.name.upper()),
        ("Cleaning business", f"{ind.short_lower} business"),
        ("cleaning business", f"{ind.short_lower} business"),
        ("Cleaning businesses", f"{ind.short} businesses"),
        ("cleaning businesses", f"{ind.short_lower} businesses"),
        ("Cleaning providers", f"{ind.short} providers"),
        ("cleaning providers", f"{ind.short_lower} providers"),
        ("Cleaning teams", ind.roles),
        ("cleaning teams", ind.roles_lower),
        ("Cleaning team", ind.roles),
        ("cleaning team", ind.roles_lower),
        ("Cleaning staff", ind.roles),
        ("cleaning staff", ind.roles_lower),
        ("Cleaning Technician", ind.role),
        ("Cleaning technicians", ind.roles),
        ("cleaning technicians", ind.roles_lower),
        ("Cleaner", ind.role),
        ("cleaner", ind.role_lower),
        ("Cleaners", ind.roles),
        ("cleaners", ind.roles_lower),
        ("Chemical Use Log", f"{ind.material_title} Use Log"),
        ("chemical use log", f"{ind.material_lower} use log"),
        ("Chemical list", f"{ind.material_title} list"),
        ("chemical list", f"{ind.material_lower} list"),
        ("Chemical", ind.material_title),
        ("chemical", ind.material_lower),
        ("Chemicals", ind.material_title + "s"),
        ("chemicals", ind.materials_lower),
        ("Consumables", "Supplies"),
        ("consumables", "supplies"),
        ("Property Details", f"{ind.object_title} Details"),
        ("Property Condition", f"{ind.object_title} Condition"),
        ("Property / Business Address", f"{ind.object_title} / Business Address"),
        ("property condition", f"{ind.object_lower} condition"),
        ("client property", f"client {ind.object_lower}"),
        ("Client property", f"Client {ind.object_lower}"),
        ("Property", ind.object_title),
        ("property", ind.object_lower),
        ("Residential", ind.area_title),
        ("residential", ind.area_lower),
        ("Domestic", ind.area_title),
        ("domestic", ind.area_lower),
        ("Document Pack", "Document Pack"),
        ("DokKit Cleaning Services Complete Workbook", f"DokKit {ind.name} Complete Workbook"),
        ("Cleaning Services Complete Workbook", f"{ind.name} Complete Workbook"),
        ("Cleaning Services Workbook", f"{ind.name} Workbook"),
        ("Cleaning", ind.short),
        ("cleaning", ind.short_lower),
        ("CLEANING", ind.short.upper()),
        ("Contract Construction Sector rates", "applicable sector wage rates"),
        ("Contract Cleaning Sector rates", "applicable sector wage rates"),
        ("Sectoral Determination 1 for Contract Cleaning", "the latest applicable wage, labour and sector rules for the business"),
        ("contract cleaning providers and clients", "service providers and clients"),
        ("contract cleaning", "contract service"),
        ("Contract cleaning", "Contract service"),
        ("Regulations for Hazardous Material Agents, 2021", "Applicable OHS regulations and sector guidance"),
        ("Regulations for Hazardous Chemical Agents, 2021", "Applicable OHS regulations and sector guidance"),
        (
            "https://www.labour.gov.za/DocumentCenter/Publications/Occupational%20Health%20and%20Safety/Regulations%20for%20Hazardous%20Chemical%20Agents%202021",
            "https://www.gov.za/documents/occupational-health-and-safety-act",
        ),
    ]
    repl.extend(industry_specific_replacements(ind))
    repl.sort(key=lambda item: len(item[0]), reverse=True)
    return repl


INDUSTRY_FILE_NAMES = {
    "construction-subcontractors": {
        "07": "07_Client_Project_and_Site_Intake_Form.docx",
        "08": "08_Project_Cancellation_and_Variation_Policy.docx",
        "12": "12_Pre_Work_Site_Inspection_Form.docx",
        "13": "13_Site_Damage_Declaration_and_Disclaimer.docx",
    },
    "beauty-salons-and-spas": {
        "07": "07_Client_Treatment_Intake_and_Consent_Form.docx",
        "08": "08_Appointment_Cancellation_and_Refund_Policy.docx",
        "12": "12_Pre_Treatment_Client_Checklist.docx",
        "13": "13_Treatment_Risk_and_Client_Declaration.docx",
    },
    "mobile-car-wash-detailing": {
        "07": "07_Vehicle_Booking_and_Condition_Intake_Form.docx",
        "08": "08_Booking_Cancellation_and_Reschedule_Policy.docx",
        "12": "12_Pre_Service_Vehicle_Condition_Checklist.docx",
        "13": "13_Vehicle_Damage_Declaration_and_Disclaimer.docx",
    },
    "catering-and-baking": {
        "07": "07_Client_Order_and_Event_Intake_Form.docx",
        "08": "08_Order_Cancellation_and_Deposit_Policy.docx",
        "12": "12_Pre_Event_Order_Checklist.docx",
        "13": "13_Food_Order_Allergen_and_Client_Declaration.docx",
    },
    "freelancers-consultants": {
        "07": "07_Client_Project_Brief_and_Onboarding_Form.docx",
        "08": "08_Project_Cancellation_and_Scope_Change_Policy.docx",
        "12": "12_Pre_Project_Scope_Checklist.docx",
        "13": "13_Client_Scope_and_Deliverable_Declaration.docx",
    },
    "tutors-training-providers": {
        "07": "07_Learner_Enrolment_and_Session_Intake_Form.docx",
        "08": "08_Session_Cancellation_and_Make_Up_Policy.docx",
        "12": "12_Pre_Session_Readiness_Checklist.docx",
        "13": "13_Learner_Support_and_Client_Declaration.docx",
    },
    "event-planners": {
        "07": "07_Client_Event_Brief_and_Intake_Form.docx",
        "08": "08_Event_Booking_Cancellation_and_Refund_Policy.docx",
        "12": "12_Pre_Event_Planning_Checklist.docx",
        "13": "13_Event_Risk_and_Client_Responsibility_Disclaimer.docx",
    },
    "landscaping-garden-services": {
        "07": "07_Client_Garden_Site_and_Service_Intake_Form.docx",
        "08": "08_Garden_Service_Cancellation_and_Weather_Policy.docx",
        "12": "12_Pre_Service_Garden_Site_Assessment.docx",
        "13": "13_Garden_Site_Damage_and_Client_Declaration.docx",
    },
    "handyman-home-repair": {
        "07": "07_Client_Repair_Request_and_Site_Intake_Form.docx",
        "08": "08_Repair_Booking_Cancellation_and_Variation_Policy.docx",
        "12": "12_Pre_Work_Inspection_Checklist.docx",
        "13": "13_Work_Area_Damage_Declaration_and_Disclaimer.docx",
    },
    "photography-videography": {
        "07": "07_Client_Shoot_Brief_and_Booking_Form.docx",
        "08": "08_Shoot_Cancellation_and_Reschedule_Policy.docx",
        "12": "12_Pre_Shoot_Planning_Checklist.docx",
        "13": "13_Location_Risk_and_Client_Responsibility_Form.docx",
    },
    "property-rental-admin": {
        "07": "07_Tenant_and_Property_Admin_Intake_Form.docx",
        "08": "08_Tenancy_Admin_Cancellation_and_Service_Policy.docx",
        "12": "12_Property_Inspection_Checklist.docx",
        "13": "13_Property_Condition_and_Tenant_Declaration.docx",
    },
    "transport-delivery-services": {
        "07": "07_Delivery_Booking_and_Consignment_Form.docx",
        "08": "08_Delivery_Cancellation_and_Waiting_Time_Policy.docx",
        "12": "12_Pre_Trip_Load_and_Vehicle_Checklist.docx",
        "13": "13_Goods_Condition_and_Delivery_Disclaimer.docx",
    },
    "food-trucks-small-food-vendors": {
        "07": "07_Event_Trading_and_Menu_Intake_Form.docx",
        "08": "08_Trading_Booking_Cancellation_and_Deposit_Policy.docx",
        "12": "12_Pre_Trading_Site_Checklist.docx",
        "13": "13_Food_Safety_Allergen_and_Client_Declaration.docx",
    },
    "online-resellers-ecommerce": {
        "07": "07_Customer_Order_and_Fulfilment_Intake_Form.docx",
        "08": "08_Order_Cancellation_Returns_and_Refund_Policy.docx",
        "12": "12_Pre_Dispatch_Order_Checklist.docx",
        "13": "13_Order_Condition_and_Returns_Disclaimer.docx",
    },
}


INDUSTRY_LANGUAGE = {
    "construction-subcontractors": {
        "review": "site visit, drawings, BOQ or work-scope review",
        "price_note": "Prices are indicative trade-service ranges and must be adjusted for drawings, site access, labour, materials, plant, supervision, programme constraints, safety requirements, travel, after-hours work and VAT.",
        "profile": "Established in [Year], we combine trade skill, site discipline, practical supervision and reliable documentation to deliver subcontracted work that is safe, traceable and ready for handover.",
        "core_intro": "We provide structured trade and site-work packages that can be adapted for once-off jobs, subcontract packages, maintenance call-outs and main-contractor support.",
        "bullets": [
            "Trade work, repair, installation and finishing support",
            "Labour, material, variation and job-card control",
            "Site setup, safety checks, quality inspections and handover records",
        ],
        "descs": [
            "Small site tasks, repairs or trade support with clear scope, labour notes and completion records.",
            "A trade technician or crew allocated for a full working day for agreed construction or maintenance tasks.",
            "Once-off work with defined scope, materials, exclusions and client approval before start.",
            "Higher-detail finishing, snag repair or remedial work requiring careful quality checks and handover notes.",
            "Close-out support for snag lists, inspections, practical completion or client handover.",
            "Scheduled trade or maintenance support for property managers, main contractors or business clients.",
            "A supervised crew for sites, renovations, fit-outs, maintenance work or subcontract packages.",
            "Fit-out, repair or finishing work in customer-facing premises where presentation and access control matter.",
            "Operational-area repairs or maintenance where the client must keep trading or working safely.",
            "Weekly or monthly maintenance arrangement with agreed call-outs, response times and reporting.",
        ],
        "units": ["Per item / m2 / linear metre", "Per task or fitting", "Per room, area or work package"],
        "intake_title": "Client Project and Site Intake Form",
        "address": "Site Address",
        "date": "Requested Work Date",
        "time": "Access / Work Window",
        "package": "Trade / Work Package",
        "addons": "Variations / Additional Work",
        "access": "Power / Water / Site Access",
        "parking": "Site Access, Induction and Parking Notes",
        "type": "Work Type",
        "count": "Areas / Work Items",
        "secondary": "Materials / Client-Supplied Items",
        "surface": "Site / Surface Condition",
        "condition": "Known Site Conditions",
        "instruction": "Scope / Access / Safety Instructions",
        "check_rows": ["Work area / access", "Existing finishes", "Client-supplied material", "Services / utilities", "Tools, plant and safety controls"],
        "photo": "I authorise reasonable site photos to record existing conditions, progress, snags and completion.",
    },
    "beauty-salons-and-spas": {
        "review": "client consultation, treatment type and appointment duration",
        "price_note": "Prices are indicative beauty-service ranges and must be adjusted for treatment type, duration, product use, therapist time, mobile travel, client history, after-hours work and VAT.",
        "profile": "Established in [Year], we use professional treatment protocols, client consultation, hygiene controls and aftercare guidance to deliver polished beauty and wellness experiences.",
        "core_intro": "We offer salon, spa and mobile treatment packages for once-off appointments, recurring clients, events and retail aftercare.",
        "bullets": [
            "Facial, nail, lash, brow, waxing, massage or wellness treatments",
            "Treatment consultation, consent, contraindication and aftercare records",
            "Product use, appointment management, client feedback and rebooking support",
        ],
        "descs": [
            "Routine appointment for an agreed treatment with consultation, preparation, service notes and aftercare.",
            "Therapist time reserved for multiple appointments, mobile work, event preparation or package services.",
            "Single treatment or beauty service with clear price, duration and client consent.",
            "Advanced or higher-effort treatment requiring consultation, product selection and aftercare guidance.",
            "Bridal, event or special-occasion preparation with timing, trial notes and client preferences.",
            "Wellness or grooming support for teams, guests, clients or corporate wellness days.",
            "A beauty team allocated for salon, spa, event or mobile appointments.",
            "Customer-facing treatment, retail consultation or package support with presentation standards.",
            "Spa, hotel or wellness venue support with treatment-room readiness and client care records.",
            "Recurring treatment package with agreed appointment schedule, reminders and aftercare notes.",
        ],
        "units": ["Per treatment area / session", "Per treatment or product item", "Per client / package"],
        "intake_title": "Client Treatment Intake and Consent Form",
        "address": "Appointment Location",
        "date": "Appointment Date",
        "time": "Appointment Time",
        "package": "Selected Treatment / Package",
        "addons": "Add-On Treatments / Products",
        "access": "Treatment Room / Mobile Setup Ready",
        "parking": "Mobile Visit / Venue Access Notes",
        "type": "Treatment Type",
        "count": "Treatment Areas / Services",
        "secondary": "Contraindications / Allergies",
        "surface": "Skin / Nail / Hair / Treatment Notes",
        "condition": "Client Health / Sensitivity Notes",
        "instruction": "Preferences, Consent and Aftercare Instructions",
        "check_rows": ["Treatment area", "Client consultation", "Contraindications / allergies", "Product preference", "Aftercare explained"],
        "photo": "I consent to treatment records or photos only where specifically agreed for service, progress or portfolio purposes.",
    },
    "mobile-car-wash-detailing": {
        "review": "vehicle condition check and service package review",
        "price_note": "Prices are indicative vehicle-care ranges and must be adjusted for vehicle size, condition, service package, product use, travel, water/power availability, after-hours work and VAT.",
        "profile": "Established in [Year], we use careful vehicle inspection, product control, detail checklists and client sign-off to protect vehicles and deliver reliable mobile service.",
        "core_intro": "We offer mobile wash, valet, detailing and fleet-care packages for private clients, dealerships and business fleets.",
        "bullets": ["Exterior wash, interior valet and detailing packages", "Vehicle condition checks, photos and client sign-off", "Fleet scheduling, product use and recurring service records"],
        "descs": ["Routine exterior or interior wash with condition notes and completion check.", "Detailing technician reserved for full-day mobile or fleet work.", "Once-off wash or valet for an agreed vehicle and package.", "Interior/exterior detail for heavier soil, pet hair, stains or presentation work.", "Pre-sale, post-trip or handover vehicle detail with before/after evidence.", "Fleet wash or valet service for company vehicles.", "Mobile vehicle-care team for multiple vehicles or sites.", "Showroom or dealership presentation detail.", "Venue, hotel or event vehicle-care support.", "Recurring fleet or private vehicle-care package."],
        "units": ["Per vehicle / panel / m2", "Per item or add-on", "Per vehicle size"],
        "intake_title": "Vehicle Booking and Condition Intake Form",
        "address": "Vehicle Service Location",
        "date": "Service Date",
        "time": "Arrival Time Window",
        "package": "Wash / Valet / Detail Package",
        "addons": "Add-On Detailing Services",
        "access": "Water / Power Access",
        "parking": "Parking, Shade and Access Notes",
        "type": "Vehicle Type",
        "count": "Number of Vehicles",
        "secondary": "Interior / Exterior Priority Areas",
        "surface": "Paint / Upholstery / Trim Condition",
        "condition": "Known Vehicle Conditions",
        "instruction": "Keys, Access and Service Instructions",
        "check_rows": ["Exterior paint / panels", "Wheels / tyres", "Interior / upholstery", "Glass / mirrors", "Personal items removed"],
        "photo": "I authorise reasonable before-and-after vehicle photos for condition, service and sign-off records.",
    },
    "catering-and-baking": {
        "review": "menu, quantity, delivery and dietary requirement review",
        "price_note": "Prices are indicative food-service ranges and must be adjusted for guest count, menu complexity, ingredients, packaging, delivery, staffing, setup time, equipment hire, dietary requirements and VAT.",
        "profile": "Established in [Year], we combine menu planning, careful costing, supplier control and reliable delivery records to serve clients professionally from order to event close-out.",
        "core_intro": "We offer catering, baking, platters, custom orders and event food packages for private and business clients.",
        "bullets": ["Menus, custom cakes, platters, meals and event catering", "Dietary, allergen, deposit, delivery and setup records", "Ingredient costing, stock control, supplier and client sign-off"],
        "descs": ["Food order with agreed menu, quantity, collection/delivery and dietary notes.", "Food-service team reserved for prep, setup, service or delivery support.", "Once-off cake, platter, meal or catering order with agreed specifications.", "Custom menu or bespoke baked order requiring design, tasting, costing or extra prep.", "Event delivery or setup support with timing, venue and handover notes.", "Corporate or business food order with invoice and delivery records.", "Catering team allocated for preparation, setup, service or close-out.", "Customer-facing food service, stall support or display setup.", "Kitchen, venue or event support where timing and food safety controls matter.", "Recurring meal, office catering or standing order package."],
        "units": ["Per guest / platter / tray", "Per menu item", "Per cake / order size"],
        "intake_title": "Client Order and Event Intake Form",
        "address": "Delivery / Event Address",
        "date": "Event or Collection Date",
        "time": "Delivery / Collection Time",
        "package": "Menu / Order Package",
        "addons": "Add-On Items / Services",
        "access": "Venue Kitchen / Setup Access",
        "parking": "Delivery, Loading and Venue Notes",
        "type": "Order Type",
        "count": "Guest Count / Quantity",
        "secondary": "Dietary / Allergen Notes",
        "surface": "Packaging / Presentation Requirement",
        "condition": "Delivery / Setup Conditions",
        "instruction": "Menu, Timing and Delivery Instructions",
        "check_rows": ["Menu / item list", "Quantity / guest count", "Dietary / allergens", "Delivery / collection", "Deposit / balance"],
        "photo": "I authorise reasonable food, setup or delivery photos for order proof and quality records.",
    },
    "freelancers-consultants": {
        "review": "client brief, scope and deliverables review",
        "price_note": "Prices are indicative professional-service ranges and must be adjusted for scope, complexity, deadlines, meetings, research, revisions, seniority, travel, after-hours work and VAT.",
        "profile": "Established in [Year], we combine specialist knowledge, structured scoping, clear communication and disciplined delivery records to help clients move work forward.",
        "core_intro": "We offer project, retainer, advisory, workshop and deliverable-based packages for organisations and independent clients.",
        "bullets": ["Consulting, advisory, project delivery and retainer support", "Briefs, proposals, scopes, milestones and approval records", "Deliverables, review cycles, handover notes and client communication"],
        "descs": ["Advisory support for an agreed question, scope or workstream.", "Consultant time reserved for workshops, delivery, analysis or implementation support.", "Defined project with clear scope, deliverables, exclusions and acceptance criteria.", "Strategy sprint or complex delivery package with milestones and review points.", "Project close-out with handover notes, final files and approval records.", "Consulting support for business clients, teams or departments.", "Small consulting team for larger projects, workshops or implementation work.", "Facilitated workshop or client-facing session with agenda and outputs.", "Operational advisory support for systems, processes, documents or decisions.", "Monthly retainer with agreed hours, response times and reporting."],
        "units": ["Per hour / workstream", "Per deliverable", "Per project phase"],
        "intake_title": "Client Project Brief and Onboarding Form",
        "address": "Client / Project Location",
        "date": "Project Start Date",
        "time": "Meeting / Delivery Window",
        "package": "Service Package / Scope",
        "addons": "Additional Deliverables",
        "access": "Client Files / System Access",
        "parking": "Meeting, Platform and Access Notes",
        "type": "Project Type",
        "count": "Deliverables / Workstreams",
        "secondary": "Key Stakeholders",
        "surface": "Current Status / Maturity",
        "condition": "Known Risks / Constraints",
        "instruction": "Brief, Deadline and Approval Instructions",
        "check_rows": ["Brief and objectives", "Scope and exclusions", "Required files / access", "Stakeholders / approvers", "Deadline and milestones"],
        "photo": "I authorise reasonable screenshots, notes or evidence records only where needed for the agreed project.",
    },
    "tutors-training-providers": {
        "review": "learner needs, lesson level and session-plan review",
        "price_note": "Prices are indicative education-service ranges and must be adjusted for subject, level, session length, preparation, materials, group size, travel, online delivery, assessments and VAT.",
        "profile": "Established in [Year], we combine lesson planning, learner records, attendance tracking and clear communication to support measurable learning progress.",
        "core_intro": "We offer tutoring, training, workshops, learner support and short-course packages for individuals, parents and organisations.",
        "bullets": ["Tutoring, lessons, workshops and short-course delivery", "Learner enrolment, attendance, progress and payment records", "Lesson plans, materials, assessments and parent/client communication"],
        "descs": ["Routine lesson or learner support session with objectives and progress notes.", "Tutor or facilitator time reserved for full-day training, workshops or learner support.", "Once-off lesson, revision session or training block.", "Structured programme, workshop or course with materials and outcomes.", "Assessment, feedback or learner handover session.", "Training for business teams, groups or organisations.", "Training team for group sessions, workshops or courses.", "Client-facing workshop with agenda, materials and attendance records.", "Venue or classroom support with setup and learner records.", "Recurring lesson or training package with schedule and progress tracking."],
        "units": ["Per learner / session", "Per material or assessment", "Per class / group"],
        "intake_title": "Learner Enrolment and Session Intake Form",
        "address": "Learning Location",
        "date": "First Session Date",
        "time": "Session Time",
        "package": "Subject / Programme",
        "addons": "Extra Lessons / Materials",
        "access": "Online / Venue Access",
        "parking": "Parent, Venue or Platform Notes",
        "type": "Learner / Programme Type",
        "count": "Learners / Sessions",
        "secondary": "Learning Goals / Support Needs",
        "surface": "Current Level / Grade",
        "condition": "Known Learning Barriers",
        "instruction": "Parent, Learner and Session Instructions",
        "check_rows": ["Learner details", "Subject / level", "Goals / support needs", "Materials / platform", "Attendance / payment"],
        "photo": "I authorise learning records or screenshots only where needed for attendance, progress or assessment evidence.",
    },
    "event-planners": {
        "review": "event brief, venue and supplier requirement review",
        "price_note": "Prices are indicative event-service ranges and must be adjusted for guest count, venue, suppliers, decor, staffing, setup time, travel, equipment hire, after-hours work and VAT.",
        "profile": "Established in [Year], we combine structured event briefs, supplier coordination, run sheets and client sign-off to deliver organised events with clear records.",
        "core_intro": "We offer private, corporate, decor, coordination and event-management packages from brief to close-out.",
        "bullets": ["Event concepts, supplier coordination, run sheets and setup plans", "Quotes, deposits, venue notes, responsibilities and sign-off records", "Decor, equipment, staffing, risk and post-event feedback"],
        "descs": ["Planning support for an agreed event brief, budget and timeline.", "Coordinator or event team time reserved for setup, coordination or close-out.", "Once-off event planning or coordination package.", "Detailed coordination for multi-supplier, timed or higher-complexity events.", "Venue handover, setup check or post-event close-out support.", "Corporate or business event planning with stakeholder and supplier records.", "Event team for setup, coordination, supplier control or breakdown.", "Activation, launch or customer-facing event support.", "Venue or hospitality event support with timing and access controls.", "Recurring event support package for regular functions or campaigns."],
        "units": ["Per guest / area / supplier", "Per decor item or add-on", "Per event size"],
        "intake_title": "Client Event Brief and Intake Form",
        "address": "Venue / Event Address",
        "date": "Event Date",
        "time": "Setup / Event Time",
        "package": "Event Package",
        "addons": "Add-On Decor / Supplier Services",
        "access": "Venue Access / Power / Loading",
        "parking": "Supplier, Loading and Venue Notes",
        "type": "Event Type",
        "count": "Guests / Event Areas",
        "secondary": "Suppliers / Decor Requirements",
        "surface": "Venue Condition / Restrictions",
        "condition": "Known Event Risks",
        "instruction": "Theme, Timing and Client Instructions",
        "check_rows": ["Venue access", "Guest count", "Supplier list", "Decor / equipment", "Run sheet / timing"],
        "photo": "I authorise reasonable setup, decor and handover photos for event records and quality control.",
    },
    "landscaping-garden-services": {
        "review": "garden site walk-through, scope and material review",
        "price_note": "Prices are indicative garden-service ranges and must be adjusted for garden size, growth condition, access, green waste, plants, materials, equipment, labour, weather risk, travel and VAT.",
        "profile": "Established in [Year], we combine practical horticultural care, site planning, tool control and visit records to keep gardens, grounds and outdoor areas presentable and well maintained.",
        "core_intro": "We offer garden maintenance, once-off clean-ups, planting, landscaping and commercial grounds-care packages.",
        "bullets": ["Lawn, pruning, planting, clean-up and landscaping work", "Garden assessments, recurring schedules, material and tool records", "Green-waste handling, client approvals, quality checks and visit reports"],
        "descs": ["Routine garden visit with agreed mowing, pruning, weeding or bed-care tasks.", "Garden team allocated for a full working day for maintenance, clean-up or planting work.", "Once-off garden clean-up or outdoor task with agreed scope and exclusions.", "Higher-detail landscaping, planting or restoration work requiring planning and material control.", "Garden handover, seasonal preparation or post-work quality check.", "Grounds-care support for business parks, complexes, schools or managed properties.", "Garden crew for larger sites, recurring visits or landscaping work.", "Outdoor area preparation for customer-facing premises or events.", "Grounds support for venues, estates or facilities where access and presentation matter.", "Recurring garden maintenance package with agreed visit schedule and reporting."],
        "units": ["Per m2 / bed / visit", "Per plant or material item", "Per garden size / package"],
        "intake_title": "Garden Site Assessment and Service Intake Form",
        "address": "Garden / Site Address",
        "date": "Visit Date",
        "time": "Arrival / Work Window",
        "package": "Garden Service Package",
        "addons": "Add-On Garden Work",
        "access": "Water / Site Access / Green-Waste Plan",
        "parking": "Access, Parking and Loading Notes",
        "type": "Garden / Site Type",
        "count": "Garden Areas / Beds",
        "secondary": "Plants / Materials Required",
        "surface": "Lawn / Bed / Tree Condition",
        "condition": "Known Site Hazards",
        "instruction": "Garden Priorities and Access Instructions",
        "check_rows": ["Lawn / beds", "Trees / hedges", "Plants / materials", "Green waste", "Water / access"],
        "photo": "I authorise reasonable garden and site photos for assessment, progress and completion records.",
    },
    "handyman-home-repair": {
        "review": "repair request, site access and materials review",
        "price_note": "Prices are indicative repair-service ranges and must be adjusted for fault type, labour time, materials, access, tools, call-out distance, urgency, after-hours work and VAT.",
        "profile": "Established in [Year], we combine practical repair skill, clear job cards, material control and client sign-off to complete home and small-business maintenance work reliably.",
        "core_intro": "We offer handyman repairs, installations, maintenance call-outs, minor renovations and recurring property support.",
        "bullets": ["Repairs, installations, mounting, sealing, patching and minor maintenance", "Job cards, material lists, quotes, approvals and completion records", "Access notes, safety checks, quality review and client sign-off"],
        "descs": ["Small repair or installation with fault notes, labour time and completion record.", "Handyman time reserved for a full working day of agreed maintenance tasks.", "Once-off repair or installation with clear materials, exclusions and approval.", "Higher-effort repair, patching, mounting or remedial work requiring careful finish checks.", "Handover support for snag lists, landlord checks or post-repair sign-off.", "Maintenance support for offices, rentals, shops or managed properties.", "Small repair team for multiple tasks, units or work areas.", "Customer-facing premises repair where presentation and access control matter.", "Operational-area repair where the client must continue trading or working safely.", "Recurring maintenance package with agreed response times and reporting."],
        "units": ["Per task / hour / area", "Per fitting or material item", "Per room / work package"],
        "intake_title": "Repair Request and Job Intake Form",
        "address": "Job Address",
        "date": "Requested Repair Date",
        "time": "Access / Call-Out Window",
        "package": "Repair / Maintenance Package",
        "addons": "Additional Repair Tasks",
        "access": "Power / Water / Access Ready",
        "parking": "Access, Parking and Key Notes",
        "type": "Repair Type",
        "count": "Tasks / Work Areas",
        "secondary": "Materials / Client-Supplied Items",
        "surface": "Wall / Fixture / Surface Condition",
        "condition": "Known Faults / Risks",
        "instruction": "Repair, Access and Safety Instructions",
        "check_rows": ["Fault / repair area", "Photos / measurements", "Materials / fittings", "Access / keys", "Safety / shut-off points"],
        "photo": "I authorise reasonable repair photos for fault assessment, progress and completion records.",
    },
    "photography-videography": {
        "review": "shoot brief, location, usage rights and deliverable review",
        "price_note": "Prices are indicative creative-service ranges and must be adjusted for shoot duration, location, crew, equipment, editing, usage rights, turnaround time, travel, after-hours work and VAT.",
        "profile": "Established in [Year], we combine clear creative briefs, organised production planning, careful file handling and professional delivery records for photo and video projects.",
        "core_intro": "We offer portrait, event, product, property, brand, social-content and video production packages.",
        "bullets": ["Photography, videography, editing and content delivery", "Briefs, shot lists, location notes, usage rights and approval records", "File backup, edit rounds, gallery delivery and client sign-off"],
        "descs": ["Shoot session with agreed brief, location, coverage and delivery notes.", "Photographer or videographer time reserved for a full-day shoot or production block.", "Once-off shoot with agreed package, deliverables and usage terms.", "Higher-detail shoot or edit requiring planning, lighting, retouching or multiple revisions.", "Gallery, final edit or content handover with delivery and approval records.", "Business or brand content package with stakeholder and usage records.", "Creative crew for events, campaigns, productions or multi-camera work.", "Customer-facing content capture for launches, activations or marketing campaigns.", "Venue, property or operational shoot where timing and access control matter.", "Recurring content package with agreed shoot days, edit cycles and delivery schedule."],
        "units": ["Per hour / image / clip", "Per deliverable or add-on", "Per shoot / package"],
        "intake_title": "Client Shoot Brief and Booking Form",
        "address": "Shoot Location",
        "date": "Shoot Date",
        "time": "Call Time / Coverage Window",
        "package": "Photo / Video Package",
        "addons": "Add-On Editing / Deliverables",
        "access": "Location / Permit / Power Access",
        "parking": "Crew, Parking and Load-In Notes",
        "type": "Shoot Type",
        "count": "Scenes / Deliverables",
        "secondary": "Shot List / Key People",
        "surface": "Location / Lighting Notes",
        "condition": "Known Production Constraints",
        "instruction": "Creative Direction, Usage and Delivery Instructions",
        "check_rows": ["Brief / moodboard", "Shot list", "Location / access", "Release / usage", "Delivery deadline"],
        "photo": "I authorise capture and use of project media strictly according to the agreed brief, releases and usage terms.",
    },
    "property-rental-admin": {
        "review": "property, tenant and administration-scope review",
        "price_note": "Prices are indicative property-admin ranges and must be adjusted for number of units, tenant volume, inspection frequency, lease support, maintenance coordination, reporting, travel and VAT.",
        "profile": "Established in [Year], we combine organised property records, tenant communication, inspection routines and admin follow-through to support landlords and rental portfolios.",
        "core_intro": "We offer rental administration, tenant onboarding, inspection, maintenance coordination and landlord reporting packages.",
        "bullets": ["Tenant records, lease admin, rent follow-up and inspection support", "Property files, maintenance requests, key records and communication logs", "Landlord reporting, arrears notes, contractor coordination and sign-off"],
        "descs": ["Property admin task with agreed tenant, lease or maintenance records.", "Administrator time reserved for inspections, tenant support or portfolio admin.", "Once-off rental admin, onboarding or inspection package.", "Detailed portfolio or lease-support work requiring records, follow-up and reporting.", "Move-in, move-out or inspection handover with photos and sign-off.", "Rental admin support for landlords, agencies or property businesses.", "Admin team for portfolios, inspections, arrears follow-up or maintenance coordination.", "Tenant-facing onboarding, viewing or communication support.", "Building or unit admin where access, keys and records must be controlled.", "Recurring property administration package with agreed reporting cycle."],
        "units": ["Per unit / tenant / inspection", "Per document or admin item", "Per property / portfolio"],
        "intake_title": "Property and Tenant Admin Intake Form",
        "address": "Property Address",
        "date": "Admin / Inspection Date",
        "time": "Access / Appointment Window",
        "package": "Property Admin Package",
        "addons": "Additional Admin / Maintenance Tasks",
        "access": "Keys / Gate / Tenant Access",
        "parking": "Access, Parking and Tenant Notes",
        "type": "Property / Tenancy Type",
        "count": "Units / Tenants",
        "secondary": "Lease / Tenant Details",
        "surface": "Property Condition Notes",
        "condition": "Known Rental Issues",
        "instruction": "Landlord, Tenant and Reporting Instructions",
        "check_rows": ["Tenant details", "Lease / payment records", "Inspection photos", "Maintenance request", "Keys / access"],
        "photo": "I authorise reasonable property photos for inspection, maintenance and landlord reporting records.",
    },
    "transport-delivery-services": {
        "review": "route, consignment, vehicle and delivery requirement review",
        "price_note": "Prices are indicative transport-service ranges and must be adjusted for distance, route, vehicle type, load size, weight, waiting time, loading help, insurance, urgency, tolls and VAT.",
        "profile": "Established in [Year], we combine route planning, vehicle checks, consignment records and proof-of-delivery controls to move goods reliably.",
        "core_intro": "We offer courier, delivery, collection, small-load transport, scheduled routes and business logistics support.",
        "bullets": ["Collections, deliveries, route runs and small-load transport", "Consignment details, vehicle checks, delivery notes and proof of delivery", "Driver scheduling, load handling, client updates and exception records"],
        "descs": ["Delivery or collection run with agreed route, consignment and proof-of-delivery notes.", "Driver or vehicle time reserved for a full-day route, delivery block or shuttle service.", "Once-off delivery, collection or transport task with agreed addresses and handling notes.", "Higher-effort delivery requiring special handling, multiple stops or tight timing.", "Handover, return trip or proof-of-delivery close-out support.", "Business delivery support for shops, suppliers, warehouses or offices.", "Driver and vehicle team for routes, bulk deliveries or multi-stop work.", "Customer-facing delivery support where timing and communication matter.", "Operational logistics support where dispatch, loading and POD controls matter.", "Recurring transport package with agreed routes, delivery windows and reporting."],
        "units": ["Per km / stop / parcel", "Per item or handling add-on", "Per vehicle / route"],
        "intake_title": "Delivery Booking and Consignment Form",
        "address": "Pickup and Delivery Addresses",
        "date": "Collection Date",
        "time": "Collection / Delivery Window",
        "package": "Delivery / Transport Package",
        "addons": "Extra Stops / Handling Services",
        "access": "Loading / Offloading Access",
        "parking": "Driver, Loading and Contact Notes",
        "type": "Delivery Type",
        "count": "Parcels / Loads / Stops",
        "secondary": "Consignment Details",
        "surface": "Packaging / Goods Condition",
        "condition": "Known Delivery Risks",
        "instruction": "Route, Handling and POD Instructions",
        "check_rows": ["Pickup details", "Goods count / condition", "Delivery contact", "Proof of delivery", "Payment / account status"],
        "photo": "I authorise reasonable consignment, loading and delivery photos for proof-of-service records.",
    },
    "food-trucks-small-food-vendors": {
        "review": "menu, trading site, permit and service-window review",
        "price_note": "Prices are indicative mobile-food-service ranges and must be adjusted for menu, stock, prep time, guest volume, pitch fees, permits, staffing, equipment, travel, power needs and VAT.",
        "profile": "Established in [Year], we combine menu planning, stock control, food-safety records and event-site coordination to serve customers efficiently from mobile or stall setups.",
        "core_intro": "We offer food-truck trading, market vending, pop-up food service, event catering and recurring vendor packages.",
        "bullets": ["Menu planning, prep, trading setup and customer service", "Stock sheets, allergen notes, permits, site rules and cash-up records", "Event coordination, equipment checks, waste control and sales reporting"],
        "descs": ["Trading session with agreed menu, location, stock and service window.", "Vendor team reserved for a full-day event, market or pop-up service.", "Once-off food-truck booking or vendor setup with agreed requirements.", "Higher-effort menu, prep or event service requiring extra stock, staff or equipment.", "Event close-out, cash-up, waste check or client handover.", "Food vendor support for markets, businesses, schools or private venues.", "Vendor crew for high-volume trading, events or multiple service points.", "Customer-facing stall, activation or pop-up food service.", "Venue or event trading where timing, permits and access controls matter.", "Recurring vendor package with agreed trading dates, menu and reporting."],
        "units": ["Per guest / item / trading hour", "Per menu item or add-on", "Per event / service window"],
        "intake_title": "Vendor Event and Menu Intake Form",
        "address": "Trading / Event Location",
        "date": "Trading / Event Date",
        "time": "Setup / Trading Hours",
        "package": "Menu / Vendor Package",
        "addons": "Add-On Menu Items / Services",
        "access": "Power / Water / Waste Access",
        "parking": "Vendor Access, Loading and Pitch Notes",
        "type": "Event / Trading Type",
        "count": "Expected Guests / Portions",
        "secondary": "Menu / Allergen Notes",
        "surface": "Setup / Display Requirement",
        "condition": "Known Site or Permit Conditions",
        "instruction": "Menu, Trading and Site Instructions",
        "check_rows": ["Menu / stock", "Allergens", "Permit / site rules", "Power / water", "Cash-up / payment"],
        "photo": "I authorise reasonable menu, stall, setup and service photos for vendor records and quality control.",
    },
    "online-resellers-ecommerce": {
        "review": "product, order, platform and fulfilment requirement review",
        "price_note": "Prices are indicative ecommerce-service ranges and must be adjusted for SKU count, stock handling, product prep, packaging, platform admin, courier costs, returns, support time and VAT.",
        "profile": "Established in [Year], we combine product records, order control, packing checks and courier tracking to support reliable online selling and fulfilment.",
        "core_intro": "We offer product listing, order fulfilment, online store admin, packing, dispatch and customer support packages.",
        "bullets": ["Product listings, stock records, packing, dispatch and returns", "SKU sheets, order notes, courier tracking and customer communication", "Platform updates, payment checks, packaging control and monthly reports"],
        "descs": ["Order or store-admin task with agreed product, stock and dispatch details.", "Ecommerce assistant time reserved for fulfilment, listings or store admin.", "Once-off order fulfilment, product upload or store-support task.", "Higher-detail listing, product prep or fulfilment work requiring images, copy or checks.", "Dispatch, return, exchange or order handover with tracking records.", "Online sales support for retailers, resellers, makers or small brands.", "Fulfilment team for stock counts, packing runs or product uploads.", "Customer-facing online order support with clear communication and tracking.", "Warehouse, stockroom or platform admin where accuracy and records matter.", "Recurring ecommerce support package with agreed order, listing and reporting cycle."],
        "units": ["Per SKU / order / parcel", "Per product or add-on", "Per store / batch"],
        "intake_title": "Customer Order and Fulfilment Intake Form",
        "address": "Customer / Delivery Details",
        "date": "Order Date",
        "time": "Dispatch / Delivery Window",
        "package": "Order / Store Support Package",
        "addons": "Add-On Packing / Listing Services",
        "access": "Stock / Platform / Courier Access",
        "parking": "Courier, Delivery and Contact Notes",
        "type": "Order / Product Type",
        "count": "Items / SKUs / Orders",
        "secondary": "SKU / Product Details",
        "surface": "Packaging / Product Condition",
        "condition": "Known Order Issues",
        "instruction": "Packing, Dispatch and Customer Instructions",
        "check_rows": ["Order / SKU number", "Item quantity", "Packaging", "Delivery address", "Payment / return status"],
        "photo": "I authorise reasonable product, packing and dispatch photos for order proof and quality records.",
    },
}


def _pack(ind: Industry) -> dict[str, object]:
    fallback = {
        "review": "scope and client requirement review",
        "price_note": f"Prices are indicative {ind.short_lower} ranges and must be adjusted for scope, timing, complexity, resources, travel, access, after-hours work and VAT.",
        "profile": f"Established in [Year], we use structured processes, clear records and practical quality checks to deliver reliable {ind.descriptor_plural}.",
        "core_intro": f"We offer structured {ind.short_lower} packages for once-off work, recurring clients, business clients and specialist add-on services.",
        "bullets": [f"{ind.short} service packages and client communication", "Quoting, scheduling, delivery and sign-off records", "Supplier, staff, quality and monthly admin controls"],
        "descs": [
            f"Routine {ind.short_lower} service with clear scope, schedule and completion notes.",
            f"{ind.role} time reserved for full-day support or package delivery.",
            f"Once-off {ind.short_lower} service with agreed scope, exclusions and approval.",
            f"Detailed {ind.short_lower} service for higher-complexity work with quality checks.",
            "Handover or close-out support with records and client confirmation.",
            f"Business client {ind.short_lower} support with recurring records and reporting.",
            f"{ind.roles} allocated for larger or recurring work.",
            "Customer-facing support where presentation, timing and communication matter.",
            "Operational support with setup, delivery, documentation and close-out.",
            f"Recurring {ind.short_lower} package with agreed schedule, scope and reporting.",
        ],
        "units": ["Per item / session", "Per add-on", "Per package"],
        "intake_title": f"Client {ind.object_title} Intake Form",
        "address": "Service Location / Address",
        "date": "Service Date",
        "time": "Service Time Window",
        "package": "Selected Service / Package",
        "addons": "Add-On Services",
        "access": "Access / Readiness",
        "parking": "Access Notes",
        "type": f"{ind.object_title} Type",
        "count": f"Number of {ind.object_title}s / Items",
        "secondary": "Priority Requirements",
        "surface": "Current Status / Condition",
        "condition": "Known Risks / Constraints",
        "instruction": "Client Instructions",
        "check_rows": ["Scope", "Access", "Priority items", "Risks / constraints", "Handover requirements"],
        "photo": "I authorise reasonable records or photos where required for service proof and quality control.",
    }
    merged = dict(fallback)
    merged.update(INDUSTRY_LANGUAGE.get(ind.slug, {}))
    return merged


def industry_specific_replacements(ind: Industry) -> list[tuple[str, str]]:
    p = _pack(ind)
    descs = p["descs"]
    units = p["units"]
    check_rows = p["check_rows"]
    profile_bullets = p["bullets"]

    repl = [
        (
            f"Established in [Year], we leverage industry-leading practices and eco-friendly products to maintain immaculate environments that promote health, productivity, and peace of mind for our clients.",
            p["profile"],
        ),
        (
            f"We offer comprehensive {ind.short_lower} packages tailored to your operational requirements and scalable to facilities of any size:",
            p["core_intro"],
        ),
        ("Daily, weekly, or customized office " + ind.short_lower + " schedules", profile_bullets[0]),
        ("Carpet and upholstery " + ind.service_4.lower(), profile_bullets[1]),
        ("Restroom sanitation and consumable supply management", profile_bullets[2]),
        ("Post-construction site clearance and debris removal", profile_bullets[0]),
        ("Warehouse and factory floor degreasing", profile_bullets[1]),
        ("High-pressure washing and exterior window " + ind.short_lower, profile_bullets[2]),
        ("Deep " + ind.short_lower + " of ablution facilities", profile_bullets[0]),
        ("Installation, servicing, and maintenance of hygiene dispensers", profile_bullets[1]),
        (f"We utilize SABS-approved, eco-friendly, and non-toxic {ind.short_lower} agents wherever possible.", "We use approved tools, products, templates and service controls appropriate to the work performed."),
        ("Partner with us to experience a higher standard of operational hygiene.", "Partner with us for organised service delivery, clear records and professional client communication."),
        (
            f"Important: This template is editable and should be adjusted after a site assessment. Prices are indicative market-aligned ranges for South African {ind.short_lower} businesses and may vary by location, {ind.object_lower} condition, travel distance, staffing requirements, equipment, supplies, after-hours work, and whether VAT applies.",
            f"Important: This template is editable and should be adjusted after {p['review']}. {p['price_note']}",
        ),
        ("site assessment", p["review"]),
        (
            f"may vary by location, {ind.object_lower} condition, travel distance, staffing requirements, equipment, supplies, after-hours work, and whether VAT applies.",
            "must be adjusted for scope, timing, resources, access, travel, after-hours work and VAT.",
        ),
        (
            "travel distance, staffing requirements, equipment, supplies, after-hours work, and whether VAT applies.",
            "resources, access, travel, after-hours work and VAT.",
        ),
        (f"Routine {ind.short_lower} support for agreed clients, bookings or work areas; scope confirmation, preparation, service delivery and basic completion notes.", descs[0]),
        (f"One {ind.role_lower} for a full day, usually 7-8 hours, for agreed routine {ind.short_lower} support duties.", descs[1]),
        (f"Standard once-off {ind.short_lower} service where no detailed or specialist scope is required.", descs[2]),
        (f"Detailed {ind.short_lower} service for complex, higher-effort or package-based work with clear quality checks.", descs[3]),
        ("Handover, event, project or booking support before or after an agreed milestone.", descs[4]),
        (f"Routine {ind.short_lower} support for client-facing areas, work areas, records, schedules and service follow-up.", descs[5]),
        (f"{ind.roles} for homes, sites, venues, offices, shops, complexes or business premises as applicable.", descs[6]),
        ("Client-facing service tasks, presentation checks, finishing details and customer-facing areas.", descs[7]),
        ("Operational support, preparation areas, service areas, documentation and quality-focused completion work.", descs[8]),
        (f"Weekly or monthly {ind.short_lower} arrangement with agreed service schedule and scope.", descs[9]),
        ("Per square metre", units[0]),
        ("Per item", units[1]),
        ("Single / Double / Queen / King", units[2]),
        ("Standard accessible windows", "Standard add-on scope"),
        ("Special equipment required", "Special requirements apply"),
        (f"Client Booking &amp; {ind.object_title} Intake Form", p["intake_title"]),
        (f"Client Booking & {ind.object_title} Intake Form", p["intake_title"]),
        ("Client Booking & " + ind.object_title + " Intake Form", p["intake_title"]),
        ("SERVICE ADDRESS", str(p["address"]).upper()),
        ("Service Address", p["address"]),
        ("Service address / site", f"{p['address']} / site"),
        ("Service address", p["address"]),
        ("service address", str(p["address"]).lower()),
        ("Service Address [Address where service will be performed]", f"{p['address']} [Address / Location / Online Link]"),
        ("Address where service will be performed", "Address, location, delivery details or online link"),
        ("Booking Details", "Service / Order Details"),
        ("Booking Date", p["date"]),
        ("Booking Date [Date]", f"{p['date']} [Date]"),
        ("Arrival Time Window", p["time"]),
        ("Arrival Time Window [Time Window]", f"{p['time']} [Time Window]"),
        ("Selected Service Package", p["package"]),
        ("Selected Service Package [Service Package]", f"{p['package']} [Package / Scope]"),
        ("Add-On Services", p["addons"]),
        ("Add-On Services [Add-Ons]", f"{p['addons']} [Add-Ons / Variations]"),
        ("Water / Electricity Access", p["access"]),
        ("Water / Electricity Access [Available / Not Available / Not Required]", f"{p['access']} [Available / Not Available / Not Required]"),
        ("Parking / Access Notes", p["parking"]),
        ("Parking / Access Notes [Parking, gate code, security, access notes]", f"{p['parking']} [Notes]"),
        (f"{ind.object_title} Type", p["type"]),
        (f"{ind.object_title} Type [Client / Site / Booking / Other]", f"{p['type']} [Type / Category]"),
        (f"Number of {ind.object_title}s / Areas", p["count"]),
        (f"Number of {ind.object_title}s / Areas [Number]", f"{p['count']} [Number / Quantity]"),
        ("Service Areas", p["secondary"]),
        ("Service Areas [Number]", f"{p['secondary']} [Notes]"),
        ("Preparation Area / Break Area", p["secondary"]),
        ("Preparation Area / Break Area [Yes / No]", f"{p['secondary']} [Yes / No / Details]"),
        (f"{ind.object_title} / Surface Type", p["surface"]),
        (f"{ind.object_title} / Surface Type [Standard / Fragile / High-priority / Other]", f"{p['surface']} [Standard / Priority / Special / Other]"),
        ("Special Conditions", p["condition"]),
        ("Special Conditions [Yes / No]", f"{p['condition']} [Yes / No / Details]"),
        ("Access / Service Instructions", p["instruction"]),
        ("Access / Service Instructions [Instructions]", f"{p['instruction']} [Instructions]"),
        ("Starter Home Clean", f"Starter {ind.short} Package"),
        ("Family Home Refresh", f"Standard {ind.short} Package"),
        ("Deep Clean Plus", f"Detailed {ind.short} Package"),
        ("Move-In / Move-Out Clean", f"Handover {ind.short} Package"),
        ("Small homes and apartments", "Entry-level or small-scope clients"),
        ("2-4 bedroom homes", "Standard bookings or mid-size scope"),
        ("2\u2013 4 bedroom homes", "Standard bookings or mid-size scope"),
        ("2\u20134 bedroom homes", "Standard bookings or mid-size scope"),
        ("Preparation Area, service areas, floors, dusting, bins", "Preparation, service delivery, priority checks and records"),
        ("Standard " + ind.short_lower + " service plus extra focus on agreed priority areas", descs[0]),
        ("Spring " + ind.short_lower + " or neglected areas", "Detailed or higher-effort scope"),
        ("Detailed " + ind.short_lower + " service, inside cupboards, appliances, fixtures", descs[3]),
        ("Disinfection / Sanitising Service", "Specialist Add-On Service"),
        ("High-touch areas and surface sanitising", "Priority add-on scope and quality checks"),
        ("PRESSURE WASHING", ("Specialist " + ind.short + " Add-On").upper()),
        ("Pressure Washing", "Specialist " + ind.short + " Add-On"),
        ("pressure washing", "specialist " + ind.short_lower + " add-on"),
        ("Paving, driveways, walls, bins, and external areas", "Special equipment, setup, travel or location-specific requirements"),
        ("Primary service areas / items", check_rows[0]),
        ("Priority service requirements", check_rows[1]),
        ("Visible finish / presentation", check_rows[3]),
        ("Fixtures / equipment / records", check_rows[4]),
        ("Client items or records secured", "Client approvals / required information confirmed"),
        ("□ Good □ Stained □ Damaged □ Other", "□ Complete □ Pending □ Issue □ N/A"),
        ("□ Good □ Issue □ Heavy issue □ Other", "□ Complete □ Pending □ Issue □ N/A"),
        ("□ Good □ Cracked □ Dirty □ Other", "□ Complete □ Pending □ Issue □ N/A"),
        ("□ Good □ Damaged □ Fragile □ Other", "□ Complete □ Pending □ Issue □ N/A"),
        ("I confirm that valuable personal items, cash and fragile items have been removed or disclosed before service starts.", "I confirm that relevant information, access requirements, approvals and client-owned items have been disclosed before service starts."),
        ("I understand that pre-existing issues, stains, wear and tear, record gaps or site defects are not caused by the service provider.", "I understand that pre-existing issues, missing information, prior damage, delays or conditions outside the agreed scope are not caused by the service provider."),
        ("I consent to reasonable before-and-after photos being taken for service records and quality control.", p["photo"]),
        ("I understand that my personal information will be used only for booking, service, payment and record-keeping purposes.", "I understand that my personal information will be used only for quotation, booking, delivery, payment, support and record-keeping purposes."),
        ("houses, flats, apartments, townhouses", "clients, sites, records or deliverables"),
        (f"regular home {ind.short_lower}, once-off {ind.descriptor_plural}", f"routine {ind.short_lower} work, once-off {ind.descriptor_plural}"),
        ("move-in and move-out preparation", "setup, close-out and handover preparation"),
        ("short-term rental " + ind.short_lower, f"short-term or once-off {ind.short_lower}"),
        ("bedrooms, living areas, passages, service areas, preparation areas, floors, visible surfaces, accessible fixtures and agreed high-touch points", "agreed scope items, priority areas, client instructions, deliverables, records, checkpoints and handover items"),
        ("hazardous waste, pest-contaminated areas, bodily fluids, issue removal beyond surface wiping, biohazards, roof spaces, blocked drains, specialist carpet extraction, exterior windows, high ladder work, heavy lifting", "regulated work, unsafe access, specialist work, unapproved variations, missing client information, third-party delays, restricted areas, heavy lifting and tasks outside the quoted scope"),
        ("product preferences, pet notes, alarm codes and special care items", "preferences, access notes, approvals, deadlines and special care items"),
        ("Frequently touched areas such as door handles, light switches, taps, appliance handles, remote controls, bannisters, cupboard handles and counter edges.", "Priority touchpoints such as agreed deliverables, approval steps, deadlines, handover records, client-facing details and critical service requirements."),
        ("glass " + ind.role_lower, "support staff"),
        ("floor " + ind.role_lower, "support staff"),
        ("disinfectant/sanitiser", "approved materials, tools or records"),
        (
            f"Microfibre cloths, colour-coded cloths where used, mop, bucket, broom, dustpan, vacuum {ind.role_lower} where applicable, duster, scrub pads, toilet brush and waste bags.",
            "Approved tools, templates, devices, records, safety items and materials required for the agreed work.",
        ),
        (
            f"mop, bucket, broom, dustpan, vacuum {ind.role_lower} where applicable, duster, scrub pads, toilet brush and support materials",
            "approved tools, templates, devices, records, safety items and support materials",
        ),
        ("toilet brush", "specialist tool"),
        ("toilet " + ind.role_lower, "specialist support material"),
        ("deissuer", "issue-resolution material"),
        ("clean according to the agreed sequence", "work according to the agreed sequence"),
        (
            "Check that cloths, mop heads and equipment are clean, usable and not carrying dirt from a previous job.",
            "Check that tools, templates, files and equipment are ready, current and not carrying issues from previous work.",
        ),
        ("Clean tools are available before the service starts.", "Required tools and records are available before the service starts."),
        ("waste bags", "support materials"),
        (f"Room-by-Room {ind.short} Standards", f"{ind.short} Delivery Standards"),
        ("Entrance / Passage", "Intake / Access"),
        (
            "Dust accessible ledges, wipe door handles and switches, remove visible loose waste, clean visible floor area and leave walkways clear.",
            "Confirm access, required information, scope items, risks and handover requirements before work starts.",
        ),
        ("Entrance and walkways are neat, safe and free from obvious dirt.", "Access and scope are clear, safe and ready."),
        ("Living Room / Lounge", "Main Scope Area"),
        (
            "Dust accessible furniture, wipe high-touch points, straighten cushions, clean visible surfaces, remove loose waste and sweep/vacuum/mop according to floor type.",
            "Complete agreed scope items, update records, resolve approved issues and prepare work for review according to the agreed method.",
        ),
        ("Room is tidy, surfaces are visibly clean and items are returned neatly.", "Work is organised, records are updated and deliverables are ready for review."),
        ("Bedrooms", "Priority Scope Items"),
        (
            "Dust accessible surfaces, wipe high-touch points, clean mirrors where included, empty bins where agreed and clean work areas.",
            "Complete agreed priority items, update records, check deliverables, resolve approved snags and prepare handover.",
        ),
        (
            "Dust accessible surfaces, wipe priority checkpoints, clean mirrors where included, close out agreed support items where agreed and clean work areas.",
            "Complete agreed priority items, update records, check deliverables, resolve approved snags and prepare handover.",
        ),
        ("Dust accessible surfaces", "Complete agreed priority items"),
        ("clean mirrors where included", "check required deliverables where included"),
        ("close out agreed support items where agreed", "close out agreed support items"),
        ("Beds are made only if included in the booking.", "Extra items are completed only if included in the agreed scope."),
        ("Room is neat without disturbing personal items unnecessarily.", "Scope is complete without disturbing unrelated client items."),
        ("Preparation Area", "Preparation / Setup Area"),
        (
            "Clean counters, sink, taps, exterior appliance surfaces, splashbacks, cupboard handles and accessible floor area.",
            "Complete setup, update records, check requirements and close out approved items.",
        ),
        ("Dishes are handled only if included.", "Extra items are handled only if included."),
        ("Food preparation areas are hygienic, tidy and ready for use.", "Preparation areas are organised, documented and ready for use."),
        (
            "Service Areas Toilets, basins, mirrors, bath/shower area and work areas are visibly clean and safe.",
            "Service Areas Agreed service areas, records, deliverables and handover items are complete and safe.",
        ),
        ("Living areas / Bedrooms", "Priority areas / Scope items"),
        ("Floors Floors are swept, vacuumed or mopped according to scope and not left unsafe.", "Work Areas Work areas are completed according to scope and not left unsafe."),
        ("High-touch points", "Priority checkpoints"),
        ("high-touch points", "priority checkpoints"),
        (
            "Dust from high to low. Start with accessible high surfaces, shelves, ledges and fixtures, then continue to furniture and lower surfaces. Dust is removed in a logical sequence.",
            "Work through the agreed sequence from setup to delivery, then review records, outputs and handover items in a logical order.",
        ),
        (
            "Clean high-touch points including door handles, switches, cupboard handles, taps, appliance handles, bannisters and counter edges. Frequently used points are wiped and hygienic.",
            "Check priority checkpoints including approvals, access notes, deadlines, client-facing details and handover records. Critical points are complete and recorded.",
        ),
        ("High-touch areas cleaned.", "Priority checkpoints recorded."),
        ("HIGH-TOUCH", "PRIORITY"),
        ("High-Touch", "Priority"),
        ("High-touch", "Priority"),
        ("high-touch", "priority"),
        ("built-up dirt", "complex requirements"),
        ("soap residue", "prior issues"),
        ("dust accumulation", "incomplete information"),
        ("Any surface frequently touched by people, including handles, switches, taps, appliance handles, railings, desks, counters and door frames.", "Any priority checkpoint, client-facing detail, approval step, handover record or service requirement that affects quality."),
        ("RESTROOM", "SERVICE AREA"),
        ("Restroom", "Service area"),
        ("restroom", "service area"),
        (
            "Clean floor last after counters and surfaces are complete. Floor finish is not contaminated by later " + ind.short_lower + ".",
            "Complete final checks after setup, records and outputs are complete. The final output is not disrupted by later work.",
        ),
        (
            "Sweep, vacuum or mop work areas as applicable. Use the correct method for tiles, laminate, vinyl, wood or other sensitive flooring. Floors are finished safely and neatly.",
            "Complete work areas as applicable. Use the agreed method for sensitive client items, records, locations or deliverables. Outputs are finished safely and neatly.",
        ),
        (
            "Check for missed bins, product residue, visible dust, wet work areas, streaky mirrors, unflushed toilets and items left out of place.",
            "Check for missed tasks, incomplete records, unresolved issues, unclear handover notes, quality concerns and items outside agreed position.",
        ),
        ("Common quality failures are corrected.", "Common quality failures are corrected or escalated."),
        ("missed bins", "missed tasks"),
        ("product residue", "incomplete records"),
        ("visible dust", "unresolved issues"),
        ("wet work areas", "unclear work areas"),
        ("streaky mirrors", "quality concerns"),
        ("unflushed toilets", "unresolved handover items"),
        ("items left out of place", "items outside agreed position"),
        ("visible loose waste", "visible loose items"),
        ("remove loose waste", "clear agreed loose items"),
        ("empty bins", "close out agreed support items"),
        ("clean work areas", "complete work areas"),
        ("visibly clean", "complete and presentable"),
        ("clean visible", "complete visible"),
        ("clean and safe", "complete and safe"),
        ("clean and items", "complete and items"),
        ("sweep/vacuum/mop", "complete"),
        ("mop heads", "work materials"),
        ("Clean cloths for delicate surfaces", "Approved tools, templates or materials for sensitive client items"),
        ("caution signage where practical", "clear warnings or access notes where practical"),
        ("service address", "agreed location or access point"),
        ("alarm instructions, pets, occupants, restricted rooms", "access instructions, stakeholders, platform details and restrictions"),
        ("agreed high-touch points", "agreed priority checkpoints"),
        ("bedrooms", "scope items"),
        ("living areas", "priority areas"),
        ("passages", "handover points"),
        ("floors", "work areas"),
        (f"Visible surface {ind.short_lower}", "Standard visible-scope work"),
        ("surfaces that can be safely accessed without moving heavy furniture or dismantling fixtures", "work that can be completed within the agreed scope without extra approval, specialist equipment or additional risk"),
        ("Capture client details, address, access arrangements, service date, service type, priority rooms, exclusions, pets, parking, product preferences and any special notes before the job is issued.", "Capture client details, scope, access arrangements, dates, priorities, exclusions, approvals, required information and any special notes before the work is issued."),
        ("use correct products", "use approved tools, templates and records"),
        ("Use correct products", "Use approved tools, templates and records"),
        ("high-use, neglected, move-in, move-out and once-off " + ind.short_lower + " jobs", f"complex, high-priority, once-off and specialist {ind.short_lower} work"),
        (f"every deep {ind.short_lower} and spa service", f"every specialist {ind.short_lower} service"),
        ("homes, offices, rental units, preparation areas, service areas, staff facilities, communal areas", "client sites, online workspaces, venues, records, work areas and agreed service locations"),
        ("detailed dust removal, issue removal, service area descaling, preparation area " + ind.short_lower, "detailed preparation, issue resolution, priority checks, service delivery"),
        ("appliance exterior " + ind.short_lower + ", reachable fixtures, cupboards, skirtings, doors, handles, internal windows, floors", "agreed deliverables, client-facing items, records, handover points and quality checks"),
        ("pest control, issue remediation, hazardous waste handling, biohazard " + ind.short_lower + ", high-access work, upholstery extraction, carpet extraction, external windows, repainting, repairs and removal of permanent stains or damage", "regulated work, professional advice outside scope, third-party work, unsafe access, specialist equipment, unapproved variations and correction of pre-existing defects"),
        ("built-up dirt, issue, soap residue, dust accumulation and detailed touchpoints", "complex requirements, prior issues, incomplete information, detailed touchpoints and higher-risk service steps"),
        ("Pre-Treatment Application", "Preparation Activity"),
        ("loosen issue, stains, limescale or heavy soil before scrubbing or wiping", "prepare the work properly before delivery, review or handover"),
        ("Dwell Time", "Review Time"),
        ("must remain on a surface to work effectively, according to the product label or supplier instructions", "must be allowed for review, approval, setup or completion according to the agreed process"),
        ("Snag Any incomplete, unacceptable or missed " + ind.short_lower + " item identified during inspection before client handover.", "Snag Any incomplete, unacceptable or missed item identified during review before client handover."),
        ("Wear appropriate PPE before handling products or heavily soiled areas.", "Use appropriate tools, permissions and safety controls before starting work."),
        ("Never mix products.", "Do not use unapproved methods, materials, tools or advice outside the agreed scope."),
        ("Do not mix bleach with ammonia, acids, toilet cleaner, descalers or unknown products.", "Escalate conflicting instructions, missing information, unsafe conditions or unapproved variations before work continues."),
    ]
    return [(old, str(new)) for old, new in repl]


def apply_replacements(text: str, replacements: list[tuple[str, str]]) -> str:
    for old, new in replacements:
        text = text.replace(old, new)
    return text


def apply_color_replacements(text: str, palette: dict[str, str]) -> str:
    for source, key in SOURCE_ACCENT_COLORS.items():
        target = palette[key]
        variants = {
            source: target,
            source.lower(): target.lower(),
            "00" + source: "00" + target,
            "FF" + source: "FF" + target,
            ("00" + source).lower(): ("00" + target).lower(),
            ("FF" + source).lower(): ("FF" + target).lower(),
        }
        for old, new in variants.items():
            text = text.replace(old, new)
    return text


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\calibrib.ttf" if bold else r"C:\Windows\Fonts\calibri.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def draw_drop(draw: ImageDraw.ImageDraw, center: tuple[float, float], size: float, fill: str, outline: str | None = None) -> None:
    x, y = center
    pts = [(x, y - size), (x + size * 0.58, y - size * 0.05), (x, y + size * 0.82), (x - size * 0.58, y - size * 0.05)]
    draw.polygon(pts, fill=fill, outline=outline)
    draw.ellipse((x - size * 0.52, y - size * 0.13, x + size * 0.52, y + size * 0.9), fill=fill, outline=outline)


def draw_filled_circle(draw: ImageDraw.ImageDraw, center: tuple[float, float], radius: float, fill: str) -> None:
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill)


def draw_icon(draw: ImageDraw.ImageDraw, icon: str, box: tuple[int, int, int, int], colors: dict[str, str]) -> None:
    x0, y0, x1, y1 = box
    w = x1 - x0
    h = y1 - y0
    p = lambda x, y: (x0 + x * w, y0 + y * h)
    white = "#FFFFFF"
    pale = "#" + colors["primary_soft"]
    accent = "#" + colors["warm_tint"]
    primary = "#" + colors["primary"]
    secondary = "#" + colors["secondary"]
    lw = max(4, int(min(w, h) * 0.028))

    if icon == "construction":
        draw.rectangle((*p(0.25, 0.52), *p(0.75, 0.67)), outline=white, width=lw)
        draw.pieslice((*p(0.22, 0.22), *p(0.78, 0.72)), 180, 360, fill=accent, outline=white, width=lw)
        draw.line([p(0.39, 0.26), p(0.39, 0.56)], fill=white, width=lw)
        draw.line([p(0.61, 0.26), p(0.61, 0.56)], fill=white, width=lw)
        draw.line([p(0.18, 0.74), p(0.82, 0.74)], fill=white, width=lw)
        draw.line([p(0.25, 0.87), p(0.55, 0.57), p(0.86, 0.87)], fill=pale, width=lw)
    elif icon == "beauty":
        for angle in range(0, 360, 45):
            cx, cy = p(0.5 + math.cos(math.radians(angle)) * 0.15, 0.48 + math.sin(math.radians(angle)) * 0.13)
            draw.ellipse((cx - w * 0.09, cy - h * 0.16, cx + w * 0.09, cy + h * 0.16), fill=accent, outline=white, width=lw)
        draw.ellipse((*p(0.38, 0.36), *p(0.62, 0.60)), fill=white, outline=white, width=lw)
        draw.arc((*p(0.2, 0.68), *p(0.8, 0.92)), 200, 340, fill=white, width=lw)
        draw.line([p(0.62, 0.66), p(0.78, 0.82)], fill=pale, width=lw)
    elif icon == "carwash":
        draw.rounded_rectangle((*p(0.18, 0.45), *p(0.82, 0.68)), radius=int(w * 0.05), fill=white)
        draw.polygon([p(0.31, 0.45), p(0.42, 0.28), p(0.63, 0.28), p(0.73, 0.45)], fill=white)
        draw.ellipse((*p(0.26, 0.62), *p(0.40, 0.78)), fill=primary, outline=white, width=lw)
        draw.ellipse((*p(0.60, 0.62), *p(0.74, 0.78)), fill=primary, outline=white, width=lw)
        for cx, cy in [(0.27, 0.22), (0.5, 0.18), (0.73, 0.24)]:
            draw_drop(draw, p(cx, cy), min(w, h) * 0.045, "#FFFFFF")
    elif icon == "catering":
        draw.ellipse((*p(0.25, 0.28), *p(0.45, 0.48)), fill=white)
        draw.ellipse((*p(0.4, 0.18), *p(0.6, 0.42)), fill=white)
        draw.ellipse((*p(0.55, 0.28), *p(0.75, 0.48)), fill=white)
        draw.rounded_rectangle((*p(0.28, 0.42), *p(0.72, 0.62)), radius=int(w * 0.05), fill=white)
        draw.rounded_rectangle((*p(0.24, 0.70), *p(0.76, 0.86)), radius=int(w * 0.04), outline=white, width=lw)
        draw.line([p(0.24, 0.72), p(0.76, 0.72)], fill=accent, width=lw)
    elif icon == "consulting":
        draw.rounded_rectangle((*p(0.2, 0.26), *p(0.8, 0.68)), radius=int(w * 0.04), outline=white, width=lw)
        draw.rectangle((*p(0.32, 0.72), *p(0.68, 0.8)), fill=white)
        draw.line([p(0.38, 0.38), p(0.62, 0.38)], fill=accent, width=lw)
        draw.line([p(0.38, 0.50), p(0.66, 0.50)], fill=pale, width=lw)
        draw.line([p(0.38, 0.60), p(0.56, 0.60)], fill=pale, width=lw)
    elif icon == "training":
        draw.polygon([p(0.18, 0.38), p(0.48, 0.26), p(0.78, 0.38), p(0.48, 0.50)], fill=white)
        draw.line([p(0.73, 0.41), p(0.73, 0.62)], fill=white, width=lw)
        draw.ellipse((*p(0.70, 0.62), *p(0.76, 0.69)), fill=accent)
        draw.line([p(0.22, 0.62), p(0.48, 0.74), p(0.78, 0.62)], fill=white, width=lw)
        draw.line([p(0.48, 0.50), p(0.48, 0.74)], fill=pale, width=lw)
    elif icon == "event":
        draw.rounded_rectangle((*p(0.2, 0.24), *p(0.8, 0.78)), radius=int(w * 0.05), fill=white)
        draw.rectangle((*p(0.2, 0.24), *p(0.8, 0.38)), fill=accent)
        for i in [0.36, 0.5, 0.64]:
            draw.line([p(i, 0.48), p(i + 0.08, 0.48)], fill=primary, width=lw)
            draw.line([p(i, 0.6), p(i + 0.08, 0.6)], fill=primary, width=lw)
        draw.ellipse((*p(0.12, 0.12), *p(0.25, 0.27)), fill=pale)
        draw.ellipse((*p(0.76, 0.12), *p(0.9, 0.28)), fill=pale)
    elif icon == "landscaping":
        draw.line([p(0.5, 0.78), p(0.5, 0.35)], fill=white, width=lw)
        for cx, cy, side in [(0.37, 0.48, -1), (0.62, 0.42, 1), (0.35, 0.65, -1), (0.66, 0.62, 1)]:
            draw.ellipse((*p(cx - 0.15, cy - 0.08), *p(cx + 0.15, cy + 0.08)), fill=accent if side < 0 else pale, outline=white, width=lw)
        draw.arc((*p(0.18, 0.68), *p(0.82, 1.0)), 200, 340, fill=white, width=lw)
    elif icon == "handyman":
        draw.polygon([p(0.2, 0.48), p(0.5, 0.22), p(0.8, 0.48)], outline=white, fill=None)
        draw.rectangle((*p(0.28, 0.48), *p(0.72, 0.82)), outline=white, width=lw)
        draw.line([p(0.62, 0.28), p(0.78, 0.12)], fill=accent, width=lw + 4)
        draw.line([p(0.25, 0.84), p(0.72, 0.37)], fill=white, width=lw)
        draw.ellipse((*p(0.68, 0.31), *p(0.79, 0.42)), outline=white, width=lw)
    elif icon == "photography":
        draw.rounded_rectangle((*p(0.2, 0.34), *p(0.82, 0.74)), radius=int(w * 0.055), fill=white)
        draw.rectangle((*p(0.32, 0.25), *p(0.52, 0.34)), fill=white)
        draw.ellipse((*p(0.41, 0.40), *p(0.66, 0.66)), fill=primary, outline=accent, width=lw)
        draw.ellipse((*p(0.49, 0.48), *p(0.58, 0.57)), fill=white)
        draw_filled_circle(draw, p(0.73, 0.43), int(w * 0.025), accent)
    elif icon == "property":
        draw.polygon([p(0.22, 0.50), p(0.50, 0.25), p(0.78, 0.50)], fill=white)
        draw.rectangle((*p(0.30, 0.50), *p(0.70, 0.80)), fill=white)
        draw.rectangle((*p(0.46, 0.62), *p(0.56, 0.80)), fill=primary)
        draw.ellipse((*p(0.66, 0.24), *p(0.82, 0.40)), outline=accent, width=lw)
        draw.line([p(0.75, 0.40), p(0.88, 0.53)], fill=accent, width=lw)
    elif icon == "transport":
        draw.rounded_rectangle((*p(0.16, 0.42), *p(0.62, 0.68)), radius=int(w * 0.03), fill=white)
        draw.polygon([p(0.62, 0.48), p(0.76, 0.48), p(0.84, 0.60), p(0.84, 0.68), p(0.62, 0.68)], fill=white)
        draw.line([p(0.22, 0.35), p(0.52, 0.35)], fill=accent, width=lw)
        for cx in [0.30, 0.70]:
            draw.ellipse((*p(cx - 0.07, 0.63), *p(cx + 0.07, 0.79)), fill=primary, outline=white, width=lw)
    elif icon == "foodtruck":
        draw.rounded_rectangle((*p(0.14, 0.38), *p(0.84, 0.70)), radius=int(w * 0.03), fill=white)
        draw.rectangle((*p(0.30, 0.44), *p(0.62, 0.58)), fill=primary)
        draw.polygon([p(0.62, 0.38), p(0.78, 0.38), p(0.86, 0.52), p(0.84, 0.70), p(0.62, 0.70)], fill=white)
        draw.line([p(0.18, 0.34), p(0.80, 0.34)], fill=accent, width=lw)
        for cx in [0.30, 0.70]:
            draw.ellipse((*p(cx - 0.06, 0.64), *p(cx + 0.06, 0.78)), fill=primary, outline=white, width=lw)
    elif icon == "ecommerce":
        draw.polygon([p(0.27, 0.42), p(0.48, 0.30), p(0.70, 0.42), p(0.48, 0.54)], fill=white)
        draw.polygon([p(0.27, 0.42), p(0.48, 0.54), p(0.48, 0.80), p(0.27, 0.66)], fill=pale, outline=white)
        draw.polygon([p(0.70, 0.42), p(0.48, 0.54), p(0.48, 0.80), p(0.70, 0.66)], fill=accent, outline=white)
        draw.line([p(0.18, 0.82), p(0.82, 0.82)], fill=white, width=lw)
        draw_filled_circle(draw, p(0.33, 0.88), int(w * 0.035), white)
        draw_filled_circle(draw, p(0.68, 0.88), int(w * 0.035), white)


def make_media(ind: Industry, width: int, height: int, ext: str) -> bytes:
    palette = ind.palette
    primary = rgb(palette["primary"])
    secondary = rgb(palette["secondary"])
    soft = rgb(palette["primary_soft"])
    img = Image.new("RGB", (width, height), "#FFFFFF")
    px = img.load()
    for y in range(height):
        for x in range(width):
            t = (x / max(1, width - 1)) * 0.62 + (y / max(1, height - 1)) * 0.38
            base = tuple(round(soft[i] + (primary[i] - soft[i]) * t) for i in range(3))
            px[x, y] = base
    overlay = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)
    sec = tuple(rgb(palette["secondary"]) + (150,))
    warm = tuple(rgb(palette["warm"]) + (120,))
    draw.ellipse((int(-0.16 * width), int(0.05 * height), int(0.34 * width), int(0.58 * height)), fill=sec)
    draw.ellipse((int(0.64 * width), int(-0.08 * height), int(1.12 * width), int(0.40 * height)), fill=warm)
    draw.polygon(
        [
            (int(0.58 * width), height),
            (width, int(0.58 * height)),
            (width, height),
        ],
        fill=tuple(rgb(palette["primary_dark"]) + (120,)),
    )
    for i in range(9):
        x = int(width * (0.08 + i * 0.115))
        draw.line((x, int(0.06 * height), x - int(0.22 * width), int(0.98 * height)), fill=(255, 255, 255, 28), width=max(1, width // 170))
    card_w = int(min(width, height) * 0.64)
    card_h = int(min(width, height) * 0.64)
    cx = int(width * (0.50 if width <= height * 1.2 else 0.34))
    cy = int(height * 0.51)
    card = (cx - card_w // 2, cy - card_h // 2, cx + card_w // 2, cy + card_h // 2)
    draw.rounded_rectangle(card, radius=max(24, int(card_w * 0.09)), fill=(255, 255, 255, 52), outline=(255, 255, 255, 165), width=max(3, width // 160))
    pad = int(card_w * 0.16)
    draw_icon(draw, ind.icon, (card[0] + pad, card[1] + pad, card[2] - pad, card[3] - pad), palette)
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    out = BytesIO()
    if ext.lower() in {".jpg", ".jpeg"}:
        img.save(out, format="JPEG", quality=92, optimize=True)
    else:
        img.save(out, format="PNG", optimize=True)
    return out.getvalue()


def transform_package_file(
    src: Path,
    dst: Path,
    ind: Industry,
    replacements: list[tuple[str, str]],
    media_cache: dict[tuple[int, int, str], bytes],
) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.suffix.lower() not in {".docx", ".xlsx"}:
        shutil.copy2(src, dst)
        return
    with ZipFile(src, "r") as zin, ZipFile(dst, "w", ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            name = info.filename
            if src.suffix.lower() == ".docx" and name.startswith("word/media/"):
                ext = Path(name).suffix
                try:
                    with Image.open(BytesIO(data)) as source_image:
                        width, height = source_image.size
                    key = (width, height, ext.lower())
                    if key not in media_cache:
                        media_cache[key] = make_media(ind, width, height, ext)
                    data = media_cache[key]
                except Exception:
                    pass
            elif name.endswith((".xml", ".rels", ".vml")) or name == "[Content_Types].xml":
                try:
                    text = data.decode("utf-8")
                except UnicodeDecodeError:
                    text = data.decode("utf-8", errors="ignore")
                text = apply_replacements(text, replacements)
                text = apply_color_replacements(text, ind.palette)
                data = text.encode("utf-8")
            zout.writestr(info, data)


def unique_output_root(parent: Path, requested_name: str) -> Path:
    root = parent / requested_name
    if not root.exists():
        return root
    for i in range(2, 100):
        candidate = parent / f"{requested_name}_{i:02d}"
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"Could not find an unused output folder under {parent}")


def validate_zip(path: Path) -> str | None:
    try:
        with ZipFile(path) as z:
            return z.testzip()
    except Exception as exc:
        return str(exc)


def scan_remaining_source_terms(path: Path) -> int:
    pattern = re.compile(r"Cleaning|cleaning|Cleaner|cleaner")
    count = 0
    with ZipFile(path) as z:
        for name in z.namelist():
            if name.endswith((".xml", ".rels", ".vml")):
                try:
                    text = z.read(name).decode("utf-8")
                except Exception:
                    continue
                count += len(pattern.findall(text))
    return count


def generate(output_root: Path) -> dict[str, object]:
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(f"Source pack not found: {SOURCE_DIR}")
    output_root.mkdir(parents=True, exist_ok=False)
    source_files = sorted([p for p in SOURCE_DIR.iterdir() if p.is_file()])
    manifest_rows: list[dict[str, str]] = []
    validation_rows: list[dict[str, str]] = []
    for ind in INDUSTRIES:
        pack_dir = output_root / ind.folder
        pack_dir.mkdir(parents=True, exist_ok=False)
        replacements = content_replacements(ind)
        media_cache: dict[tuple[int, int, str], bytes] = {}
        for src in source_files:
            dest_name = filename_for(src.name, ind)
            dst = pack_dir / dest_name
            transform_package_file(src, dst, ind, replacements, media_cache)
            manifest_rows.append(
                {
                    "industry_slug": ind.slug,
                    "industry_name": ind.name,
                    "palette_primary": "#" + ind.palette["primary"],
                    "palette_secondary": "#" + ind.palette["secondary"],
                    "source_file": src.name,
                    "output_file": str(dst),
                }
            )
            if dst.suffix.lower() in {".docx", ".xlsx"}:
                bad = validate_zip(dst)
                remaining = scan_remaining_source_terms(dst) if dst.suffix.lower() in {".docx", ".xlsx"} else 0
                validation_rows.append(
                    {
                        "industry_slug": ind.slug,
                        "file": str(dst),
                        "zip_status": "ok" if bad is None else f"bad: {bad}",
                        "remaining_cleaning_terms": str(remaining),
                    }
                )
    write_reports(output_root, manifest_rows, validation_rows)
    return {
        "output_root": str(output_root),
        "industries": len(INDUSTRIES),
        "source_files_per_industry": len(source_files),
        "generated_files": len(manifest_rows),
    }


def write_reports(output_root: Path, manifest_rows: list[dict[str, str]], validation_rows: list[dict[str, str]]) -> None:
    manifest_path = output_root / "generation_manifest.csv"
    with manifest_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["industry_slug", "industry_name", "palette_primary", "palette_secondary", "source_file", "output_file"],
        )
        writer.writeheader()
        writer.writerows(manifest_rows)
    validation_path = output_root / "validation_summary.csv"
    with validation_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["industry_slug", "file", "zip_status", "remaining_cleaning_terms"])
        writer.writeheader()
        writer.writerows(validation_rows)
    palette_path = output_root / "palette_reference.md"
    with palette_path.open("w", encoding="utf-8") as f:
        f.write("# DokKit Generated Industry Pack Palette Reference\n\n")
        f.write("Generated from the polished Cleaning Services Complete Pack blueprint.\n\n")
        for ind in INDUSTRIES:
            f.write(f"## {ind.name}\n")
            f.write(f"- Primary: #{ind.palette['primary']}\n")
            f.write(f"- Secondary: #{ind.palette['secondary']}\n")
            f.write(f"- Tertiary: #{ind.palette['tertiary']}\n")
            f.write(f"- Warm accent: #{ind.palette['warm']}\n")
            f.write(f"- Pack folder: `{ind.folder}`\n\n")
    summary_path = output_root / "generation_summary.json"
    with summary_path.open("w", encoding="utf-8") as f:
        json.dump(
            {
                "source_dir": str(SOURCE_DIR),
                "output_root": str(output_root),
                "industries": [ind.slug for ind in INDUSTRIES],
                "files_per_industry": len({row["source_file"] for row in manifest_rows}),
                "generated_file_count": len(manifest_rows),
            },
            f,
            indent=2,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate DokKit industry packs from the Cleaning Services blueprint.")
    parser.add_argument("--output-parent", type=Path, default=DEFAULT_OUTPUT_PARENT)
    parser.add_argument("--batch-name", default=DEFAULT_BATCH_NAME)
    args = parser.parse_args()
    root = unique_output_root(args.output_parent, args.batch_name)
    summary = generate(root)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
