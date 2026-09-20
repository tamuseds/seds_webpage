/*
  ============================================================
  NAVIGATION CONFIG
  ============================================================
  This is the ONLY file you need to touch to add a new subpage
  to the site. Add a new object to the NAV_LINKS array below,
  then create the matching HTML file inside /pages using
  /pages/_template.html as a starting point.

  Example — adding a top-level "Sponsors" page:

    1. Copy pages/_template.html -> pages/sponsors.html
    2. Edit the title/content inside sponsors.html
    3. Add this line to the array below:
         { label: "Sponsors", href: "pages/sponsors.html" },

  Example — adding a page as a SUB-item under an existing parent
  (e.g. a new project under "Projects"):

    Add it to that parent's own "children" array instead of the
    top-level NAV_LINKS array:
         { label: "New Project", href: "/newproject.html" },

  A parent item can have an href (clicking the label navigates
  there) or omit href entirely to be a toggle-only category label
  (like "Projects" below, which has no page of its own).

  The sidebar will pick it up automatically — no other files
  need to change. Order in this array = order in the menu.
  ============================================================
*/

const NAV_LINKS = [
  { label: "Home", href: "/index.html" },
  {
    label: "About",
    href: "/pages/about.html",
    children: [
      { label: "Team", href: "/pages/team.html" },
      { label: "Join", href: "/pages/join.html" }
    ],
  },
  { label: "Speakers", href: "/pages/speakers.html" },
  { label: "Space Networking Fair", href: "/pages/spacenetworkingfair.html" },
  { label: "Student Astronaut Corps", href: "/pages/studentastronautcorps.html" },
  {
    label: "Projects",
    children: [
      { label: "Solar Sail", href: "/pages/sedssolarsail.html" },
      { label: "Lunabotics", href: "/pages/sedslunabotics.html" },
      { label: "Rocket Propulsion Lab", href: "/pages/tsrpl.html" },
      { label: "Design Teams", href: "/pages/design_teams.html" },
    ],
  },
 // { label: "Member Portal", href: "/pages/memberportal.html" },
  { label: "Donate", href: "/pages/donations.html" },
  { label: "Marketplace", href: "/pages/marketplace.html" },
  { label: "Contact", href: "/pages/contact.html" },
];
