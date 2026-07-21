#!/usr/bin/env python3
"""Generate OutYah Software Requirements Specification PDF."""

from pathlib import Path
from fpdf import FPDF

OUT = Path(__file__).resolve().parent.parent / "docs" / "OutYah_Software_Requirements_Specification.pdf"
FIGMA_PLACEHOLDER = "[Paste Figma URL here after uploading the website]"


class SRS(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(self.epw - 20, 8, "OutYah - Software Requirements Specification", align="L")
        self.cell(20, 8, f"{self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(140, 140, 140)
        self.cell(0, 10, "Confidential - Academic submission", align="C")

    def h1(self, text):
        self.ln(4)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(26, 36, 28)
        self.multi_cell(0, 9, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def h2(self, text):
        self.ln(3)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(31, 107, 79)
        self.multi_cell(0, 7, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def h3(self, text):
        self.ln(2)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(26, 36, 28)
        self.multi_cell(0, 6, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def body(self, text):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, text, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def bullet(self, text, indent=8):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5.5, f"- {text}", new_x="LMARGIN", new_y="NEXT")

    def numbered(self, n, text, indent=8):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(40, 40, 40)
        self.set_x(self.l_margin + indent)
        self.multi_cell(0, 5.5, f"{n}. {text}", new_x="LMARGIN", new_y="NEXT")

    def kv(self, key, value):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 5.5, f"{key}: {value}", new_x="LMARGIN", new_y="NEXT")

    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(self.epw - 20, 8, "OutYah - Software Requirements Specification", align="L")
        self.cell(20, 8, f"{self.page_no()}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = SRS(format="A4", unit="mm")
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()

    # Title page
    pdf.ln(30)
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(31, 107, 79)
    pdf.multi_cell(0, 10, "Software Requirements Specification", align="C")
    pdf.ln(4)
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(26, 36, 28)
    pdf.multi_cell(0, 9, "OutYah", align="C")
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "", 12)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 7, "Jamaica Outing Discovery Platform", align="C")
    pdf.ln(12)
    pdf.set_font("Helvetica", "", 11)
    pdf.set_text_color(40, 40, 40)
    for line in [
        "Document version: 1.0",
        "Date: 21 July 2026",
        "Status: Draft for academic submission",
        "Product: OutYah (web application)",
        f"Wireframes (Figma): {FIGMA_PLACEHOLDER}",
    ]:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 7, line, align="C")
    pdf.ln(16)
    pdf.set_x(pdf.l_margin)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        6,
        "Prepared to satisfy: Gather requirements, user stories, functional and non-functional requirements, and simple wireframes.",
        align="C",
    )

    # 1. Introduction
    pdf.add_page()
    pdf.h1("1. Introduction")
    pdf.h2("1.1 Purpose")
    pdf.body(
        "This Software Requirements Specification (SRS) defines the requirements for OutYah, "
        "a curated discovery web application that helps users find bars, restaurants, nightlife, "
        "attractions, beaches, cafes, cinemas, and recreational activities across Jamaica. "
        "It is intended for stakeholders, developers, and academic assessment."
    )
    pdf.h2("1.2 Scope")
    pdf.body(
        "OutYah is a responsive React single-page application. Users browse an image-forward feed, "
        "search and filter venues, view venue details, save favorites, build an ordered outing plan, "
        "explore venues on Google Maps, and discover events. The current release uses curated sample "
        "venue data and client-side state for favorites and plans."
    )
    pdf.h2("1.3 Definitions")
    for k, v in [
        ("Venue / Place", "A discoverable location such as a restaurant, bar, beach, or attraction."),
        ("Outing plan", "An ordered list of venues a user intends to visit in one trip."),
        ("Feed", "The primary visual discovery stream of venue cards."),
        ("Category", "A classification such as restaurant, bar, cafe, beach, attraction, movies, or gaming."),
    ]:
        pdf.kv(k, v)

    pdf.h2("1.4 References")
    pdf.bullet("OutYah web prototype (local Vite React application)")
    pdf.bullet(f"UI wireframes / mockups: {FIGMA_PLACEHOLDER}")
    pdf.bullet("Google Maps Platform - Maps JavaScript API, Directions API")

    # 2. Overall description
    pdf.h1("2. Overall Description")
    pdf.h2("2.1 Product perspective")
    pdf.body(
        "OutYah is a standalone web client. It consumes static curated data in the prototype and "
        "embeds Google Maps for geographic exploration and multi-stop routing. Navigation uses a "
        "desktop sidebar and a mobile bottom tab bar."
    )
    pdf.h2("2.2 Product functions (summary)")
    for t in [
        "Discover venues via a visual home feed with category chips and search.",
        "Explore venues on an interactive Google Map with category-colored pins.",
        "Open a venue detail page with gallery, hours, reviews, amenities, and map embed.",
        "Favorite venues and manage a personal favorites list.",
        "Build an outing plan and open multi-stop driving directions.",
        "Browse events and RSVP-style event detail information.",
        "View a simple user profile summary.",
    ]:
        pdf.bullet(t)

    pdf.h2("2.3 User classes")
    pdf.bullet("Visitor / Guest: browses feed, search, map, and venue details (prototype treats all users as logged-in demo user).")
    pdf.bullet("Planner: builds multi-stop outing routes and opens directions.")
    pdf.bullet("Social discoverer: saves favorites and browses events.")

    pdf.h2("2.4 Operating environment")
    pdf.bullet("Modern evergreen browsers (Chrome, Safari, Firefox, Edge) on desktop and mobile.")
    pdf.bullet("Network access required for map tiles, images, and Google Directions.")
    pdf.bullet("Development stack: React 19, Vite, React Router, Lucide icons, @react-google-maps/api.")

    pdf.h2("2.5 Design / brand constraints")
    pdf.bullet("Clean, modern travel-app polish with social-feed energy.")
    pdf.bullet("Primary accent teal/green; light neutral background; image-forward cards with minimal chrome.")
    pdf.bullet("Fully responsive layouts (single/double column collapsing on small screens).")

    # 3. Requirements gathering
    pdf.h1("3. Requirements Gathering")
    pdf.h2("3.1 Problem statement")
    pdf.body(
        "Travelers and locals struggle to find trustworthy, visually engaging recommendations for "
        "where to go across Jamaica's parishes and major hubs (Kingston, Montego Bay, Ocho Rios, Negril). "
        "Existing tools are either text-heavy directories, video-first social apps, or generic maps without "
        "outing planning."
    )
    pdf.h2("3.2 Goals")
    pdf.bullet("Make discovery visual and fast (image-first feed).")
    pdf.bullet("Support parish/area and category filtering.")
    pdf.bullet("Connect discovery to action: favorite, plan, and get directions.")
    pdf.bullet("Show geography clearly via Google Maps with category-distinct map pins.")

    pdf.h2("3.3 Stakeholders")
    pdf.bullet("End users seeking outings in Jamaica")
    pdf.bullet("Course instructor / assessor")
    pdf.bullet("Product owner / student developer")

    pdf.h2("3.4 Elicitation methods used")
    pdf.bullet("Review of comparable products (visual discovery feeds, travel apps, Google Maps).")
    pdf.bullet("Prototype-driven design from an existing Jamaica outing mockup concept.")
    pdf.bullet("Iterative UI refinement (reduce heavy card chrome; enable real maps).")

    # 4. User stories
    pdf.h1("4. User Stories")
    stories = [
        ("US-01", "As a visitor", "I want to browse a visual feed of venues", "so I can quickly decide where to go."),
        ("US-02", "As a visitor", "I want to filter by category (bars, restaurants, beaches, etc.)", "so I only see relevant places."),
        ("US-03", "As a visitor", "I want to search by name, neighborhood, or area", "so I can find a specific place."),
        ("US-04", "As a visitor", "I want to open a venue detail page", "so I can see photos, hours, address, and reviews."),
        ("US-05", "As a visitor", "I want to favorite a venue", "so I can return to it later."),
        ("US-06", "As a planner", "I want to add venues to an outing plan in order", "so I can organize my night or day trip."),
        ("US-07", "As a planner", "I want to see my plan on a map with a driving route", "so I understand travel between stops."),
        ("US-08", "As a planner", "I want a Get Directions action", "so I can open turn-by-turn navigation."),
        ("US-09", "As a visitor", "I want to explore venues on a map with category-colored pins", "so I can discover by location and type."),
        ("US-10", "As a visitor", "I want to browse events", "so I can find nightlife and social activities."),
        ("US-11", "As a mobile user", "I want bottom navigation", "so I can switch sections with one thumb."),
        ("US-12", "As a desktop user", "I want a persistent sidebar", "so I can navigate while scanning content."),
    ]
    pdf.body("Format: ID - As a <role>, I want <capability>, so that <benefit>.")
    for sid, role, want, so in stories:
        pdf.bullet(f"{sid} - {role}, I want {want}, {so}")

    # 5. Functional requirements
    pdf.h1("5. Functional Requirements")
    pdf.h2("5.1 Navigation & shell")
    fr = [
        ("FR-01", "The system shall provide primary navigation to Feed, Explore, Plan, Events, Profile, and Favorites."),
        ("FR-02", "On viewports below desktop breakpoint, the system shall show a fixed bottom navigation bar."),
        ("FR-03", "On desktop viewports, the system shall show a left sidebar with the same destinations."),
    ]
    pdf.h2("5.2 Home feed")
    fr += [
        ("FR-04", "The system shall display a responsive grid of venue cards with image, category badge, rating, location, and price level."),
        ("FR-05", "The system shall allow filtering venues by category chips including an All / For You option."),
        ("FR-06", "The system shall filter the feed by free-text search across name, neighborhood, area, and tags."),
        ("FR-07", "The system shall surface a horizontal strip of upcoming events on the home feed."),
    ]
    pdf.h2("5.3 Explore map")
    fr += [
        ("FR-08", "The system shall render an interactive Google Map centered on Jamaica with markers for visible venues."),
        ("FR-09", "Map markers shall use distinct colors and glyphs based on venue category."),
        ("FR-10", "Selecting a marker or rail item shall update the selected venue summary card."),
        ("FR-11", "The explore view shall support search filtering of map markers."),
    ]
    pdf.h2("5.4 Venue detail")
    fr += [
        ("FR-12", "The system shall show a photo gallery, category, open status, rating, price, and location."),
        ("FR-13", "The system shall provide actions: Add to outing, Directions, and Favorite."),
        ("FR-14", "The system shall show overview (description, amenities, address, phone), reviews, and hours tabs."),
        ("FR-15", "The system shall embed a Google Map pin for the venue on the overview tab."),
    ]
    pdf.h2("5.5 Favorites & planner")
    fr += [
        ("FR-16", "The system shall persist favorites in client state for the session (prototype) and list them on Favorites."),
        ("FR-17", "The system shall allow adding/removing venues from an ordered outing plan."),
        ("FR-18", "The planner shall display a route map for two or more stops using Google Directions."),
        ("FR-19", "The planner shall provide a Get Directions link that opens Google Maps with ordered waypoints."),
    ]
    pdf.h2("5.6 Events & profile")
    fr += [
        ("FR-20", "The system shall list events and open an event detail view with time, place, and attendees."),
        ("FR-21", "The system shall display a profile summary for the demo user (name, handle, stats entry points)."),
    ]
    for fid, text in fr:
        pdf.bullet(f"{fid}: {text}")

    # 6. Non-functional
    pdf.h1("6. Non-Functional Requirements")
    pdf.h2("6.1 Usability")
    nfr = [
        ("NFR-01", "Primary flows (feed -> detail -> favorite/plan) shall be reachable within three taps/clicks."),
        ("NFR-02", "UI copy and layout shall remain readable on screens from ~360px width upward."),
        ("NFR-03", "Visual design shall prioritize images over heavy card shadows and borders."),
    ]
    pdf.h2("6.2 Performance")
    nfr += [
        ("NFR-04", "Initial interactive feed shall load within an acceptable SPA budget on broadband (< 3s typical)."),
        ("NFR-05", "Venue images shall use lazy loading where applicable."),
    ]
    pdf.h2("6.3 Reliability & compatibility")
    nfr += [
        ("NFR-06", "The application shall degrade gracefully if the Maps API key is missing (fallback message)."),
        ("NFR-07", "The application shall support the latest two major versions of major browsers."),
    ]
    pdf.h2("6.4 Security & privacy")
    nfr += [
        ("NFR-08", "API keys shall be stored in environment variables (not committed to source control)."),
        ("NFR-09", "Maps API keys should be HTTP-referrer restricted in Google Cloud Console."),
    ]
    pdf.h2("6.5 Maintainability")
    nfr += [
        ("NFR-10", "UI structure shall be organized into pages, shared layout, reusable components, and data modules."),
        ("NFR-11", "Category colors and map pin glyphs shall be centralized for consistency."),
    ]
    for nid, text in nfr:
        pdf.bullet(f"{nid}: {text}")

    # 7. Wireframes
    pdf.h1("7. Simple Wireframes")
    pdf.body(
        "High-fidelity UI is implemented in the React prototype. Simple structural wireframes "
        "will be published to Figma after the live website is imported. Replace the placeholder below "
        "with the final share link before submission."
    )
    pdf.h3("7.1 Figma link")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(31, 107, 79)
    pdf.multi_cell(0, 7, FIGMA_PLACEHOLDER)
    pdf.ln(2)

    pdf.h3("7.2 Screen inventory (wireframe list)")
    screens = [
        ("W1 Home Feed", "Header greeting, search, category chips, event strip, venue grid, bottom/side nav."),
        ("W2 Explore Map", "Search, Google Map with category pins, selected venue bar, horizontal venue rail."),
        ("W3 Venue Detail", "Gallery, title/meta, action buttons, booking slots (if any), tabs, mini map."),
        ("W4 Favorites", "Heading My Favorites / Favorites, grid of saved venues or empty state."),
        ("W5 Outing Planner", "Ordered stop list, clear/get directions, route map panel, suggested stops."),
        ("W6 Events", "Event cards grid; event detail with attendees and RSVP affordance."),
        ("W7 Profile", "Avatar, bio, stats, links into favorites/plan."),
    ]
    for name, desc in screens:
        pdf.bullet(f"{name}: {desc}")

    pdf.h3("7.3 Key user flow")
    pdf.numbered(1, "Land on Home Feed and filter by category or search.")
    pdf.numbered(2, "Open a Venue Detail page from a card.")
    pdf.numbered(3, "Favorite the venue and/or Add to outing.")
    pdf.numbered(4, "Open Favorites to review saved places, or Plan to reorder stops.")
    pdf.numbered(5, "On Plan, review the route map and tap Get Directions.")
    pdf.numbered(6, "Optionally use Explore map to discover by geography.")

    pdf.h3("7.4 Low-fidelity layout notes (ASCII)")
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(40, 40, 40)
    wire = (
        "FEED (mobile)              EXPLORE                    PLANNER\n"
        "+------------------+      +------------------+      +------------------+\n"
        "| Search           |      | Search           |      | Title + lede      |\n"
        "| [Chips.........] |      | [==== MAP =====] |      | 1. Stop A         |\n"
        "| Events strip ->  |      | | category pins | |      | 2. Stop B         |\n"
        "| [Img][Img]       |      | + selected card  |      | [Route MAP]       |\n"
        "| name / meta      |      | rail of venues   |      | [Get Directions]  |\n"
        "|==== bottom nav ==|      |==== bottom nav ==|      |==== bottom nav ==|\n"
        "+------------------+      +------------------+      +------------------+"
    )
    pdf.multi_cell(0, 4, wire)

    # 8. Data & interfaces
    pdf.h1("8. Data Requirements & External Interfaces")
    pdf.h2("8.1 Venue attributes (minimum)")
    pdf.body(
        "id, name, category, neighborhood, area, images, rating, reviewCount, priceRange, "
        "tags, open status, description, amenities, address, phone, map.lat/lng, hours, reviews."
    )
    pdf.h2("8.2 External interfaces")
    pdf.bullet("Google Maps JavaScript API - map rendering and markers")
    pdf.bullet("Google Directions API - multi-stop route polylines on planner")
    pdf.bullet("Image CDN / Unsplash URLs - venue photography in prototype")

    # 9. Future
    pdf.h1("9. Future Enhancements (out of scope for v1)")
    for t in [
        "Real authentication and cloud-synced favorites/plans",
        "Live inventory / booking integrations",
        "User-generated posts and photo uploads",
        "Push notifications for events near the user",
        "Offline caching of favorites",
    ]:
        pdf.bullet(t)

    pdf.h1("10. Acceptance Criteria (high level)")
    for t in [
        "All primary routes render without runtime errors.",
        "Feed filtering and search update the visible venue set.",
        "Explore shows category-differentiated map pins.",
        "Favorites and plan update when the user toggles actions on a venue.",
        "Planner Get Directions opens a valid Google Maps directions URL for the stop order.",
        "Layouts remain usable on mobile and desktop widths.",
        "Figma wireframe URL is attached in section 7.1 before final turn-in.",
    ]:
        pdf.bullet(t)

    pdf.ln(8)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(
        0,
        6,
        "End of document. After you upload the site to Figma, send the share URL and this PDF can be regenerated with the link filled in.",
    )

    pdf.output(OUT)
    print(OUT)


if __name__ == "__main__":
    build()
