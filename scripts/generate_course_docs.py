#!/usr/bin/env python3
"""Generate OutYah Special Projects deliverables (updated through August 2026)."""

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
DATE = "21 August 2026"


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
        "US-06 As a visitor, I want to browse island-wide events for the next six months.",
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
        "FR-04 Venue detail: gallery, actions (favorite, plan, directions), tabbed overview/reviews/hours.",
        "FR-04a Reviews list with source badges; Google-synced snippets; OutYah submit when signed in.",
        "FR-05 Events list and detail pages with schedule status (upcoming/live/past); sorted by date.",
        "FR-06 Auth sign-up/sign-in; profile shows session user.",
        "FR-07 Favorites and plan persist for authenticated users in Supabase.",
        "FR-08 Admin portal gated by profiles.role = admin (nested in main shell).",
        "FR-09 Empty states when Supabase has no content.",
        "FR-10 SPA routes work on Vercel via rewrite to index.html.",
        "FR-11 Admin place create/edit supports parish, price range, media upload, map location.",
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
        "Supabase (Auth, Postgres, Storage) and Google Maps Platform APIs. The browser owns "
        "presentation and interaction, while Supabase provides the durable data and security "
        "boundary. Context providers keep authentication, catalog data, and the user's saved "
        "outing state available across routes without tightly coupling page components."
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
        "Frontend: React 19, Vite, React Router, Tailwind CSS v4, Lucide icons",
        "Backend-as-a-Service: Supabase (Postgres, Auth, RLS, Storage)",
        "Maps: Google Maps JavaScript API, Places Autocomplete, Directions, Place Details",
        "Hosting: Vercel (SPA rewrites in vercel.json)",
        "Tooling: Bun for scripts and local development",
        "Version control: GitHub",
    ]:
        pdf.bullet(t)
    pdf.h2("2.1 Selection rationale")
    pdf.body(
        "React and Vite were selected for fast component-driven development and a lightweight "
        "production build. Supabase reduces backend setup while retaining a relational database, "
        "row-level security, authentication, and storage. Google Maps supplies reliable map tiles, "
        "markers, and routing. Vercel provides automatic deployment from GitHub and supports the "
        "single-page rewrite required by React Router."
    )
    pdf.h1("3. Database Design (ERD description)")
    pdf.body("Core entities and relationships:")
    for t in [
        "profiles (1:1 auth.users) - role user|admin",
        "places - venues with lat/lng, cover/gallery images, hours, rating aggregates",
        "place_reviews - source-tagged reviews (google|outyah|tripadvisor|yelp|instagram)",
        "events - optional FK to places; starts_at/ends_at; recurring flags",
        "posts - Instagram-style media; optional FK to places",
        "post_comments - FK to posts",
        "favorites - composite PK (user_id, place_id)",
        "plan_stops - composite PK (user_id, place_id) + position",
    ]:
        pdf.bullet(t)
    pdf.mono(
        "auth.users --1:1-- profiles\n"
        "places --1:N-- place_reviews\n"
        "places --1:N-- events\n"
        "places --1:N-- posts --1:N-- post_comments\n"
        "users --N:M-- places (via favorites)\n"
        "users --N:M-- places (via plan_stops ordered)\n"
    )
    pdf.h2("3.1 Review model")
    pdf.body(
        "Visitor reviews no longer live only as JSONB on places. The place_reviews table stores "
        "author, rating, body, optional business reply, posted_at, and a source tag so the UI can "
        "badge Google, OutYah, Tripadvisor, and other origins. A trigger keeps places.review_count "
        "aligned with stored rows. Place ratings displayed on cards use Google Place Details "
        "aggregates when synced; listed review snippets come from the Places API (most relevant + "
        "newest). Signed-in users may insert OutYah-sourced reviews only."
    )
    pdf.h1("4. Security Design (RLS)")
    for t in [
        "Public SELECT on places, events, posts, comments, place_reviews",
        "Admin ALL on catalog tables via is_admin()",
        "Authenticated users INSERT OutYah reviews for themselves only",
        "Users manage only their favorites and plan_stops",
        "Storage bucket media: public read, admin write",
    ]:
        pdf.bullet(t)
    pdf.body(
        "The client uses only the Supabase anon key. Authorization is enforced in PostgreSQL rather "
        "than by hiding controls in the browser. Admin screens still check profiles.role for a "
        "clear user experience, but RLS remains the final enforcement layer. Database passwords "
        "and the service-role key are server-only and excluded from Git."
    )
    pdf.h1("5. Interface Design")
    pdf.body(
        "Public and admin navigation share one application shell: desktop sidebar and mobile bottom "
        "nav, with admin links nested under Favorites for authorized users. Home uses a Feed/Map "
        "segmented control and a places grid with cover imagery. Venue detail tabs include Overview, "
        "Reviews (source-filtered), Instagram posts, and Hours. Empty states provide clear CTAs when "
        "catalogs are empty."
    )
    pdf.h2("5.1 Responsive behavior")
    for t in [
        "Desktop: persistent left navigation and multi-column content grids.",
        "Mobile: fixed bottom navigation, horizontally scrollable chips, and single-column forms.",
        "Feed and place cards emphasize photography; Tailwind utility recipes live in src/lib/ui.js.",
        "Admin forms use parish dropdowns, Google Places location pickers, and media uploads.",
    ]:
        pdf.bullet(t)
    pdf.h2("5.2 Data-state behavior")
    pdf.body(
        "Every catalog screen distinguishes loading, populated, empty, and error states. Empty "
        "states explain what is missing and provide an appropriate action, such as adding the "
        "first place for an administrator or returning to discovery for a regular user."
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
        "DB scripts: supabase/migrations/001_init.sql, 002_events_schedule.sql, 003_place_reviews.sql",
        "Optional: supabase/full_setup.sql; seed helpers under scripts/",
        "Client never receives service_role key",
    ]:
        pdf.bullet(t)
    pdf.h1("8. Module Responsibilities")
    for t in [
        "AuthContext: session lifecycle, profile lookup, sign-in, sign-up, sign-out, admin role.",
        "DataContext: Supabase catalog queries, refresh, and in-memory lookup helpers.",
        "AppContext: favorites and ordered plan state, including per-user persistence.",
        "lib/data.js: database-row mapping, place/event/post queries, place review CRUD.",
        "lib/reviews.js: review source metadata, mapping, and rating helpers.",
        "PlaceReviews: source filters, Google/OutYah list, signed-in submit form.",
        "pages/admin: auth-gated CRUD nested in the main shell (AdminLayout is gate only).",
        "scripts/seed_jamaica_catalog.mjs: island-wide places + 6-month events upsert.",
        "scripts/seed_jamaica_island_photos.mjs: Google photos for island venues.",
        "scripts/seed_real_place_reviews.mjs: sync Google Place Details reviews into place_reviews.",
    ]:
        pdf.bullet(t)
    pdf.h1("9. External integrations")
    for t in [
        "Google Maps JS: map markers, venue map, multi-stop directions URLs.",
        "Google Places Autocomplete: admin location picker (address, lat/lng).",
        "Google Place Details: real venue ratings and review text for seeding/sync.",
        "Supabase Storage media bucket: place cover and gallery uploads.",
        "Instagram Graph: optional; tokens may be empty - posts remain admin-managed.",
    ]:
        pdf.bullet(t)
    out = DOCS / "03_OutYah_System_Design_Document.pdf"
    pdf.output(out)
    return out


def write_prototype_notes():
    pdf = Doc("OutYah - Prototype Version 1")
    pdf.cover(
        "Prototype Version 1",
        TAGLINE,
        "Week 4 Deliverable (July 20 - July 24, 2026) - Development I",
    )
    pdf.add_page()
    pdf.h1("1. Prototype Objective")
    pdf.body(
        "Prototype Version 1 demonstrates the complete public discovery journey before the final "
        "backend and administration work. It validates navigation, responsive layouts, visual "
        "hierarchy, venue discovery, maps, and outing planning using representative content."
    )
    pdf.h1("2. Core Modules Implemented")
    for t in [
        "Responsive application shell: desktop sidebar and mobile bottom navigation.",
        "Home discovery feed with search, category chips, event strip, and Feed/Map switch.",
        "Venue detail gallery, metadata, source-tagged reviews, hours, favorites, and plan actions.",
        "Favorites grid and outing planner with suggested stops.",
        "Events list and event detail routes with schedule status badges.",
        "Google Maps markers, category differentiation, and directions links.",
    ]:
        pdf.bullet(t)
    pdf.h1("3. Prototype Navigation Flow")
    pdf.numbered(1, "Open the home feed and search or choose a category.")
    pdf.numbered(2, "Switch to Map to discover venues geographically.")
    pdf.numbered(3, "Open a venue and review its gallery, hours, and location.")
    pdf.numbered(4, "Favorite the venue or add it to the outing plan.")
    pdf.numbered(5, "Open the planner and launch Google Maps directions.")
    pdf.h1("4. Interface Refinement")
    pdf.body(
        "Early versions used heavy card shadows and rounded containers. Prototype feedback led "
        "to a flatter, image-led visual language: photos remain rounded, captions sit directly "
        "on the page background, and borders replace large shadows. This makes scanning faster "
        "and better matches the social discovery concept."
    )
    pdf.h1("5. Prototype Verification")
    for t in [
        "Vite production build completed successfully.",
        "Primary routes were manually exercised on desktop and mobile widths.",
        "Vercel SPA rewrite was added so deep links no longer return 404.",
        "Google Maps API was enabled for map, detail, and planner surfaces.",
    ]:
        pdf.bullet(t)
    pdf.h1("6. Gaps Carried into Week 5")
    for t in [
        "Replace local/sample catalog dependency with Supabase.",
        "Add real authentication and user-specific persistence.",
        "Create role-protected admin content management.",
        "Improve loading, error, and empty data states.",
    ]:
        pdf.bullet(t)
    pdf.h1("7. Prototype Access")
    pdf.bullet(f"GitHub: {REPO}")
    pdf.bullet(f"Live deployment: {LIVE}")
    out = DOCS / "04_OutYah_Prototype_Version_1.pdf"
    pdf.output(out)
    return out


def write_beta_notes():
    pdf = Doc("OutYah - Beta Version Notes")
    pdf.cover(
        "Beta Version (Development II) + August Updates",
        TAGLINE,
        "Week 5 deliverable (27-31 July 2026) with post-beta updates through 21 August 2026",
    )
    pdf.add_page()
    pdf.h1("1. Prototype v1 -> Beta summary")
    pdf.body(
        "Prototype v1 established routing, discovery UI, maps, and planner flows on curated "
        "data. Beta completed backend integration, auth, admin, empty states, and production "
        "deployment. August updates harden content quality: real Kingston venues, island-wide "
        "tourist catalog, six-month events calendar, Google-synced reviews, Tailwind UI recipes, "
        "and removal of mock social counts."
    )
    pdf.h1("2. Features included in Beta (through July 31)")
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
    pdf.h1("3. Post-beta updates (August 2026)")
    pdf.h2("3.1 Real place reviews")
    for t in [
        "New place_reviews table (migration 003) with source tags and RLS.",
        "Venue Reviews tab lists live Google Place Details snippets (most relevant + newest).",
        "Source badges (via Google / OutYah); signed-in users can post OutYah reviews.",
        "Place card ratings use Google aggregates; review counts match listed snippets.",
        "Invented Tripadvisor/Yelp/press seed copy and mock RSVP/like numbers removed.",
        "Instagram cannot supply venue reviews via API; IG remains posts/media only.",
    ]:
        pdf.bullet(t)
    pdf.h2("3.2 Kingston catalog and events")
    for t in [
        "Kingston venues seeded with real names, addresses, and Google/Street View photos.",
        "Events gained starts_at, ends_at, recurring, recurrence_note (migration 002).",
        "Status badges: Upcoming / Happening now / Past; feed shows next upcoming events.",
        "Events page covers the next six months island-wide (not week-only).",
    ]:
        pdf.bullet(t)
    pdf.h2("3.3 Island-wide catalog (19 August 2026)")
    for t in [
        "36 new tourist places across Negril, Montego Bay, Ocho Rios, Portland, south coast, "
        "Blue Mountains, and Kingston extras (49 places total in production).",
        "53 scheduled events Aug 2026 - Feb 2027: jerk festivals, Reggae Marathon, Rebel Salute, "
        "Jazz & Blues, Heroes Day, Christmas Market, NYE parties, recurring venue nights.",
        "scripts/data/jamaica_places.mjs and jamaica_events.mjs hold curated seed definitions.",
        "bun scripts/seed_jamaica_catalog.mjs upserts places + events in one step.",
        "bun scripts/seed_jamaica_island_photos.mjs syncs Google photos to Supabase Storage.",
        "Map and feed now span the full island, not Kingston metro only.",
    ]:
        pdf.bullet(t)
    pdf.h2("3.4 Landing, share plans, and photo moderation (21 August 2026)")
    for t in [
        "Branded landing page at / with Terobytez logo; Explore moved to /explore.",
        "Shareable outing plans: migration 004 shared_plans + /plan/share links; recipients can add stops.",
        "Planner stop reorder (move up / down) and Get Directions multi-stop Google Maps URLs.",
        "Users submit venue photos from place detail (pending); admins approve/reject in Posts queue (migration 005).",
        "Booking contact: call-to-book via phone; optional time-slot chips when curated on a place.",
        "Special Project proposal DOCX updated to as-built feature list matching the live site.",
    ]:
        pdf.bullet(t)
    pdf.h2("3.5 Admin and UI")
    for t in [
        "Admin nested in the main shell (auth gate only; no separate chrome).",
        "Place form: Jamaican parish dropdown, price bounds, cover/gallery upload to Storage.",
        "Google Places Autocomplete + map for lat/lng/address (hidden from raw form fields).",
        "Tailwind CSS v4 + shared UI recipes in src/lib/ui.js.",
    ]:
        pdf.bullet(t)
    pdf.h1("4. Backend Integration")
    pdf.body(
        "OutYah uses Supabase as the catalog database. DataContext loads places, events, "
        "posts, and comments from PostgREST. AuthContext manages email/password sessions and "
        "profile roles. AppContext synchronizes favorites and ordered plan stops for signed-in "
        "users while retaining device-local selections for guests. Reviews load on demand from "
        "place_reviews via fetchReviewsForPlace / createPlaceReview."
    )
    pdf.h2("4.1 Admin workflow")
    for t in [
        "Admin signs in and is authorized through profiles.role.",
        "Dashboard displays catalog totals.",
        "Places, events, and posts can be created, updated, and deleted.",
        "Place media uploads go to the public media storage bucket.",
        "Public pages refresh from Supabase after admin changes.",
    ]:
        pdf.bullet(t)
    pdf.h2("4.2 Review sync scripts")
    pdf.mono(
        "# Island-wide places + 6-month events\n"
        "bun scripts/seed_jamaica_catalog.mjs\n"
        "\n"
        "# Google photos (island venues)\n"
        "bun scripts/seed_jamaica_island_photos.mjs\n"
        "\n"
        "# Apply reviews schema + pull Google Place Details reviews\n"
        "bun scripts/seed_real_place_reviews.mjs\n"
        "\n"
        "# Kingston venues / photos (service role + Maps key)\n"
        "bun scripts/seed_kingston_places.mjs\n"
        "bun scripts/seed_place_photos_from_google.mjs\n"
    )
    pdf.h2("4.3 Live catalog totals (production Supabase)")
    for t in [
        "49 places across 9 parishes (Kingston, Westmoreland, St. James, St. Ann, Portland, "
        "St. Elizabeth, Trelawny, St. Andrew, St. Catherine).",
        "53 events with starts_at/ends_at spanning Aug 2026 through Feb 2027.",
        "198 Google-sourced review snippets in place_reviews (27 venues synced).",
        "See docs/database/CATALOG.md for parish breakdown and event highlights.",
    ]:
        pdf.bullet(t)
    pdf.h1("5. How to run")
    pdf.mono(
        "bun install\n"
        "cp .env.example .env   # add Supabase + Maps keys\n"
        "bun run dev\n"
        "# optional schema apply:\n"
        "bun scripts/apply_supabase_schema.mjs\n"
    )
    pdf.h1("6. Database script location")
    pdf.bullet("supabase/migrations/001_init.sql - core schema + RLS")
    pdf.bullet("supabase/migrations/002_events_schedule.sql - event schedule columns")
    pdf.bullet("supabase/migrations/003_place_reviews.sql - place_reviews + stats trigger")
    pdf.bullet("supabase/seed.sql / full_setup.sql - optional combined apply")
    pdf.bullet("docs/database/ - submission copies of schema scripts + CATALOG.md")
    pdf.h1("7. Acceptance Checks")
    for t in [
        "Production build passes; Vercel deep links resolve via SPA rewrite.",
        "Supabase tables, RLS, and media bucket exist; place_reviews publicly readable.",
        "Venue Reviews tab shows Google-sourced text with source badges.",
        "Admin routes reject signed-out and non-admin users.",
        "Production Supabase seeded: 49 places, 53 events, 198 Google reviews.",
        "Map spans Negril, MoBay, Ocho Rios, Portland, south coast, and Kingston.",
        "Event cards do not invent going/interested counts; IG likes hidden when zero.",
        "Live app: https://vtdi-platform.vercel.app",
    ]:
        pdf.bullet(t)
    pdf.h1("8. Known limitations")
    for t in [
        "Google Place Details returns a small sample of reviews (not the full public total).",
        "Tripadvisor blocks automated scraping; not synced live.",
        "Instagram Graph tokens optional; no venue-review API from Instagram.",
        "Event RSVP is not implemented; going/interested remain unset.",
        "Plan stop drag-reorder UI is visual only; order follows add sequence.",
        "Email confirmation depends on Supabase Auth project settings.",
    ]:
        pdf.bullet(t)
    pdf.h1("9. Next phase")
    pdf.bullet("Formal testing report and user manual")
    pdf.bullet("Optional RSVP and live hours from Google Places Opening Hours")
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
        "Database script -> docs/database/full_setup.sql + docs/database/CATALOG.md",
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
        write_srs(),
        write_design(),
        write_prototype_notes(),
        write_beta_notes(),
    ]
    for p in outs:
        print(p)
