#!/usr/bin/env python3
"""Generate OutYah Special Projects deliverables through July 31, 2026."""

from pathlib import Path
from fpdf import FPDF

DOCS = Path(__file__).resolve().parent.parent / "docs"
DOCS.mkdir(parents=True, exist_ok=True)

STUDENT = "Khrisean Stewart"
COURSE = "Special Projects"
PRODUCT = "OutYah"
TAGLINE = "Jamaica Outing Discovery Platform"
REPO = "https://github.com/KhriseanStewart/VTDI_Platform"
LIVE = "https://vtdi-platform.vercel.app"
DATE = "31 July 2026"


class Doc(FPDF):
    def __init__(self, title_short="OutYah"):
        super().__init__(format="A4", unit="mm")
        self.title_short = title_short
        self.set_auto_page_break(auto=True, margin=18)

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(self.epw - 20, 8, self.title_short, align="L")
        self.cell(20, 8, str(self.page_no()), align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 10, f"{COURSE} - {STUDENT} - {DATE}", align="C")

    def cover(self, title, subtitle, week_line):
        self.add_page()
        self.ln(28)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(31, 107, 79)
        self.multi_cell(0, 10, title, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(3)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(26, 36, 28)
        self.multi_cell(0, 8, PRODUCT, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 12)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 7, TAGLINE, align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(10)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(40, 40, 40)
        for line in [
            week_line,
            f"Student: {STUDENT}",
            f"Course: {COURSE}",
            f"Date: {DATE}",
            f"Repository: {REPO}",
            f"Live app: {LIVE}",
        ]:
            self.set_x(self.l_margin)
            self.multi_cell(0, 7, line, align="C", new_x="LMARGIN", new_y="NEXT")

    def h1(self, t):
        self.ln(3)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 15)
        self.set_text_color(26, 36, 28)
        self.multi_cell(0, 8, t, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def h2(self, t):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(31, 107, 79)
        self.multi_cell(0, 7, t, new_x="LMARGIN", new_y="NEXT")

    def body(self, t):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.4, t, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def bullet(self, t, indent=8):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5.4, f"- {t}", new_x="LMARGIN", new_y="NEXT")

    def numbered(self, n, t, indent=8):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5.4, f"{n}. {t}", new_x="LMARGIN", new_y="NEXT")

    def mono(self, t):
        self.set_x(self.l_margin)
        self.set_font("Courier", "", 8)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 4.2, t, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)


def write_proposal():
    pdf = Doc("OutYah - Project Proposal")
    pdf.cover(
        "Project Proposal",
        TAGLINE,
        "Week 1 Deliverable (June 29 - July 3, 2026) - Project Planning",
    )
    pdf.add_page()
    pdf.h1("1. Introduction")
    pdf.body(
        "OutYah is a web application that helps locals and visitors discover bars, restaurants, "
        "nightlife, beaches, attractions, and events across Jamaica. The product combines an "
        "image-forward social feed with map discovery, favorites, multi-stop outing planning, "
        "and an admin portal for content management."
    )
    pdf.h1("2. Problem Statement")
    pdf.body(
        "Travel and outing discovery for Jamaica is fragmented. Users bounce between social "
        "media, generic maps, and outdated directories. There is no focused, trustworthy, "
        "image-first platform that connects discovery to planning and directions."
    )
    pdf.h1("3. Objectives")
    for t in [
        "Deliver a responsive discovery experience (feed + map toggle).",
        "Support venue detail, favorites, and ordered outing plans with directions.",
        "Persist content and user data in Supabase with role-based admin management.",
        "Deploy a working beta to the web (Vercel) with version control on GitHub.",
    ]:
        pdf.bullet(t)
    pdf.h1("4. Scope")
    pdf.h2("In scope")
    for t in [
        "Public pages: Feed/Map, Venue Detail, Events, Favorites, Planner, Profile, Auth",
        "Admin portal: Places, Events, Posts CRUD",
        "Google Maps pins and multi-stop directions",
        "Supabase Auth, Postgres schema, RLS, seed/migrations",
    ]:
        pdf.bullet(t)
    pdf.h2("Out of scope (this course window)")
    for t in [
        "Native mobile apps",
        "Live Instagram Graph sync (posts managed in-app/admin)",
        "Payments / ticket checkout",
    ]:
        pdf.bullet(t)
    pdf.h1("5. Stakeholders")
    pdf.bullet("End users seeking outings in Jamaica")
    pdf.bullet("Administrators managing venues, events, and posts")
    pdf.bullet("Course instructor / assessor")
    pdf.bullet(f"Developer: {STUDENT}")
    pdf.h1("6. SDLC Approach")
    pdf.body(
        "The project follows a phased SDLC aligned to the Special Projects schedule: "
        "planning, requirements, design, development (prototype then beta), testing, "
        "and deployment/presentation."
    )
    pdf.h1("7. Success Criteria")
    for t in [
        "Users can browse feed/map, open venues, favorite, and build a plan.",
        "Admins can authenticate and manage places/events/posts.",
        "Application is deployed and accessible online.",
        "Documentation covers proposal through design and progress reporting.",
    ]:
        pdf.bullet(t)
    out = DOCS / "01_OutYah_Project_Proposal.pdf"
    pdf.output(out)
    return out


def write_srs():
    pdf = Doc("OutYah - Software Requirements Specification")
    pdf.cover(
        "Software Requirements Specification (SRS)",
        TAGLINE,
        "Week 2 Deliverable (July 6 - July 10, 2026) - Requirements Analysis",
    )
    pdf.add_page()
    pdf.h1("1. Purpose")
    pdf.body(
        "This SRS defines functional and non-functional requirements, user stories, and "
        "wireframe inventory for OutYah. It guides development and evaluation through beta."
    )
    pdf.h1("2. Product Overview")
    pdf.body(
        "OutYah is a React SPA backed by Supabase. Users discover places via an Instagram-style "
        "feed or Google Map, save favorites, plan routes, and browse events. Admins manage "
        "content through a gated /admin portal."
    )
    pdf.h1("3. User Stories")
    stories = [
        "US-01 As a visitor, I want a visual feed so I can discover places quickly.",
        "US-02 As a visitor, I want feed/map toggle so I can switch discovery modes.",
        "US-03 As a visitor, I want venue details with hours, reviews, and directions.",
        "US-04 As a user, I want favorites synced when signed in.",
        "US-05 As a planner, I want ordered stops and Get Directions.",
        "US-06 As a visitor, I want to browse events happening this week.",
        "US-07 As an admin, I want CRUD for places, events, and posts.",
        "US-08 As a mobile user, I want bottom navigation for primary sections.",
    ]
    for s in stories:
        pdf.bullet(s)
    pdf.h1("4. Functional Requirements")
    frs = [
        "FR-01 Navigation to Feed, Plan, Events, Profile, Favorites; Admin when authorized.",
        "FR-02 Feed/Map toggle on home with search and category chips.",
        "FR-03 Google Map markers colored by category.",
        "FR-04 Venue detail: gallery, actions (favorite, plan, directions), tabs.",
        "FR-05 Events list and detail pages.",
        "FR-06 Auth sign-up/sign-in; profile shows session user.",
        "FR-07 Favorites and plan persist for authenticated users in Supabase.",
        "FR-08 Admin portal gated by profiles.role = admin.",
        "FR-09 Empty states when Supabase has no content.",
        "FR-10 SPA routes work on Vercel via rewrite to index.html.",
    ]
    for f in frs:
        pdf.bullet(f)
    pdf.h1("5. Non-Functional Requirements")
    for t in [
        "NFR-01 Responsive from ~360px width upward.",
        "NFR-02 API keys in environment variables; service role never shipped to client.",
        "NFR-03 RLS on Supabase tables; public read for catalog content.",
        "NFR-04 Graceful empty/error UI when data is unavailable.",
        "NFR-05 Maintainable module structure (pages, context, lib, admin).",
    ]:
        pdf.bullet(t)
    pdf.h1("6. Wireframes / UI Inventory")
    pdf.body(
        "High-fidelity UI is implemented in the React prototype/beta. Screen inventory:"
    )
    for t in [
        "W1 Home Feed + Map toggle",
        "W2 Venue Detail",
        "W3 Events / Event Detail",
        "W4 Favorites",
        "W5 Outing Planner + route map",
        "W6 Auth",
        "W7 Profile",
        "W8 Admin Dashboard / Places / Events / Posts",
    ]:
        pdf.bullet(t)
    pdf.body(
        "Figma URL (if published separately): attach share link before final turn-in."
    )
    pdf.h1("7. Acceptance Criteria (Beta)")
    for t in [
        "Core routes render without runtime errors.",
        "Supabase-backed content displays when seeded; empty states when not.",
        "Admin can create/update/delete places, events, posts when role=admin.",
        "Deployed build reachable on Vercel.",
    ]:
        pdf.bullet(t)
    out = DOCS / "02_OutYah_Software_Requirements_Specification.pdf"
    pdf.output(out)
    return out


def write_design():
    pdf = Doc("OutYah - System Design Document")
    pdf.cover(
        "System Design Document",
        TAGLINE,
        "Week 3 Deliverable (July 13 - July 17, 2026) - System Design",
    )
    pdf.add_page()
    pdf.h1("1. Architecture Overview")
    pdf.body(
        "OutYah uses a client-server architecture: a React SPA on Vercel communicates with "
        "Supabase (Auth, Postgres, Storage) and Google Maps Platform APIs."
    )
    pdf.mono(
        "Browser (React/Vite)\n"
        "  |- AuthContext / DataContext / AppContext\n"
        "  |- Public pages + Admin portal\n"
        "  +-> Supabase Auth + REST (PostgREST) + Storage\n"
        "  +-> Google Maps JS + Directions\n"
    )
    pdf.h1("2. Technology Selection")
    for t in [
        "Frontend: React 19, Vite, React Router, Lucide icons",
        "Backend-as-a-Service: Supabase (Postgres, Auth, RLS, Storage)",
        "Maps: Google Maps JavaScript API + Directions API",
        "Hosting: Vercel (SPA rewrites in vercel.json)",
        "Version control: GitHub",
    ]:
        pdf.bullet(t)
    pdf.h1("3. Database Design (ERD description)")
    pdf.body("Core entities and relationships:")
    for t in [
        "profiles (1:1 auth.users) - role user|admin",
        "places - venues with lat/lng, images, hours JSON, reviews JSON",
        "events - optional FK to places",
        "posts - Instagram-style media; optional FK to places",
        "post_comments - FK to posts",
        "favorites - composite PK (user_id, place_id)",
        "plan_stops - composite PK (user_id, place_id) + position",
    ]:
        pdf.bullet(t)
    pdf.mono(
        "auth.users --1:1-- profiles\n"
        "places --1:N-- events\n"
        "places --1:N-- posts --1:N-- post_comments\n"
        "users --N:M-- places (via favorites)\n"
        "users --N:M-- places (via plan_stops ordered)\n"
    )
    pdf.h1("4. Security Design (RLS)")
    for t in [
        "Public SELECT on places, events, posts, comments",
        "Admin ALL on catalog tables via is_admin()",
        "Users manage only their favorites and plan_stops",
        "Storage bucket media: public read, admin write",
    ]:
        pdf.bullet(t)
    pdf.h1("5. Interface Design")
    pdf.body(
        "Public shell: desktop sidebar + mobile bottom nav. Home uses a Feed/Map segmented "
        "control. Admin uses a separate layout without public bottom navigation. Empty states "
        "provide clear CTAs when catalogs are empty."
    )
    pdf.h1("6. Key UML-style Flows")
    pdf.h2("6.1 Discovery to Plan")
    pdf.numbered(1, "User opens Feed, filters/search posts")
    pdf.numbered(2, "Opens Venue Detail")
    pdf.numbered(3, "Favorites and/or Add to outing")
    pdf.numbered(4, "Planner shows ordered stops + route map")
    pdf.numbered(5, "Get Directions opens Google Maps URL")
    pdf.h2("6.2 Admin content publish")
    pdf.numbered(1, "Admin signs in")
    pdf.numbered(2, "profiles.role verified as admin")
    pdf.numbered(3, "CRUD place/event/post in /admin")
    pdf.numbered(4, "Public DataContext refresh shows content")
    pdf.h1("7. Deployment Design")
    for t in [
        "Build: bun/vite -> dist/",
        "Vercel env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_MAPS_API_KEY",
        "DB script: supabase/full_setup.sql (schema + optional seed)",
        "Client never receives service_role key",
    ]:
        pdf.bullet(t)
    out = DOCS / "03_OutYah_System_Design_Document.pdf"
    pdf.output(out)
    return out


def write_progress_reports():
    pdf = Doc("OutYah - Weekly Progress Reports")
    pdf.cover(
        "Weekly Progress Reports (Weeks 1-5)",
        TAGLINE,
        "Professional Practices - Progress through July 31, 2026",
    )
    weeks = [
        (
            "Week 1 (June 29 - July 3) - Project Planning",
            [
                "Selected OutYah as the Special Project (Jamaica outing discovery).",
                "Defined problem, objectives, and scope.",
                "Prepared Project Proposal deliverable.",
                "Initialized GitHub repository and Vite React baseline.",
            ],
            [
                "Finalize branding and confirm tech stack (React + Supabase + Maps).",
            ],
        ),
        (
            "Week 2 (July 6 - July 10) - Requirements Analysis",
            [
                "Gathered requirements from product brief and mockup reference.",
                "Authored user stories and FR/NFR list.",
                "Produced SRS document and screen inventory.",
            ],
            [
                "Begin database/ERD and UI structure for design week.",
            ],
        ),
        (
            "Week 3 (July 13 - July 17) - System Design",
            [
                "Designed Supabase schema (places, events, posts, favorites, plan).",
                "Documented architecture, RLS, and interface approach.",
                "Selected hosting (Vercel) and Maps integration approach.",
            ],
            [
                "Start implementing routing, layout, and core pages.",
            ],
        ),
        (
            "Week 4 (July 20 - July 24) - Development I / Prototype v1",
            [
                "Implemented Feed/Map toggle, venue cards, events, planner, favorites.",
                "Integrated Google Maps with category-colored pins and directions.",
                "Fixed Vercel SPA 404s with vercel.json rewrites.",
                "Shipped Prototype Version 1 to GitHub + Vercel.",
            ],
            [
                "Wire Supabase auth/admin and remove local-only data dependency.",
            ],
        ),
        (
            "Week 5 (July 27 - July 31) - Development II / Beta",
            [
                "Added Supabase client, Auth, DataContext, and admin portal CRUD.",
                "Applied remote schema/RLS/storage; removed local DB fallbacks.",
                "Added polished empty states across public and admin views.",
                "Prepared Beta package documentation for submission.",
            ],
            [
                "Week 6: testing report, user manual, bug fixes.",
                "Week 7: final polish, presentation, reflection.",
            ],
        ),
    ]
    for title, done, next_items in weeks:
        pdf.add_page()
        pdf.h1(title)
        pdf.h2("Completed")
        for t in done:
            pdf.bullet(t)
        pdf.h2("Next / blockers")
        for t in next_items:
            pdf.bullet(t)
        pdf.h2("Repo / demo")
        pdf.bullet(f"GitHub: {REPO}")
        pdf.bullet(f"Live: {LIVE}")
    out = DOCS / "04_OutYah_Weekly_Progress_Reports_Weeks_1-5.pdf"
    pdf.output(out)
    return out


def write_beta_notes():
    pdf = Doc("OutYah - Beta Version Notes")
    pdf.cover(
        "Beta Version (Development II)",
        TAGLINE,
        "Week 5 Deliverable (July 27 - July 31, 2026)",
    )
    pdf.add_page()
    pdf.h1("1. Prototype v1 -> Beta summary")
    pdf.body(
        "Prototype v1 established routing, discovery UI, maps, and planner flows on curated "
        "data. Beta completes backend integration, auth, admin, empty states, and production "
        "deployment configuration."
    )
    pdf.h1("2. Features included in Beta")
    for t in [
        "Feed/Map discovery with category filters and search",
        "Venue detail, events, favorites, outing planner + directions",
        "Supabase Auth (email/password) and profile session UI",
        "Admin portal for places, events, posts, comment moderation",
        "RLS-secured Postgres schema and media storage bucket",
        "Empty/error states when catalogs are empty or offline",
        "Vercel hosting with SPA rewrites",
    ]:
        pdf.bullet(t)
    pdf.h1("3. How to run")
    pdf.mono(
        "bun install\n"
        "cp .env.example .env   # add Supabase + Maps keys\n"
        "bun run dev\n"
        "# optional schema apply:\n"
        "bun scripts/apply_supabase_schema.mjs\n"
    )
    pdf.h1("4. Database script location")
    pdf.bullet("supabase/migrations/001_init.sql - schema + RLS")
    pdf.bullet("supabase/seed.sql - optional sample seed")
    pdf.bullet("supabase/full_setup.sql - combined apply script")
    pdf.bullet("docs/database/ copies for submission package")
    pdf.h1("5. Known limitations")
    for t in [
        "Live Instagram Graph sync not required; posts managed in admin.",
        "Plan stop drag-reorder UI is visual only; order follows add sequence.",
        "Email confirmation depends on Supabase Auth project settings.",
    ]:
        pdf.bullet(t)
    pdf.h1("6. Next phase (Week 6+)")
    pdf.bullet("Formal testing report and user manual")
    pdf.bullet("Bug bash and UI polish")
    pdf.bullet("Final presentation package")
    out = DOCS / "05_OutYah_Beta_Version_Notes.pdf"
    pdf.output(out)
    return out


def write_submission_checklist():
    pdf = Doc("OutYah - Submission Checklist through July 31")
    pdf.cover(
        "Deliverables Checklist (through July 31)",
        TAGLINE,
        "Special Projects Schedule alignment",
    )
    pdf.add_page()
    pdf.h1("Completed for Weeks 1-5")
    rows = [
        "Week 1 - Project Proposal -> docs/01_OutYah_Project_Proposal.pdf",
        "Week 2 - SRS -> docs/02_OutYah_Software_Requirements_Specification.pdf",
        "Week 3 - System Design -> docs/03_OutYah_System_Design_Document.pdf",
        "Week 4 - Prototype v1 -> GitHub history + live Vercel app",
        "Week 5 - Beta -> source + admin/auth/Supabase + docs/05_OutYah_Beta_Version_Notes.pdf",
        "Professional practice - Weekly reports -> docs/04_OutYah_Weekly_Progress_Reports_Weeks_1-5.pdf",
        "Database script -> docs/database/full_setup.sql",
        "Source code -> GitHub repository",
        "Working software -> https://vtdi-platform.vercel.app",
    ]
    for r in rows:
        pdf.bullet(r)
    pdf.h1("Remaining after July 31 (Weeks 6-7)")
    for t in [
        "Testing Report & User Manual",
        "Final Software Package & Presentation Slides",
        "Reflection / demo rehearsal",
    ]:
        pdf.bullet(t)
    out = DOCS / "00_OutYah_Deliverables_Checklist_through_July_31.pdf"
    pdf.output(out)
    return out


if __name__ == "__main__":
    outs = [
        write_submission_checklist(),
        write_proposal(),
        write_srs(),
        write_design(),
        write_progress_reports(),
        write_beta_notes(),
    ]
    for p in outs:
        print(p)
