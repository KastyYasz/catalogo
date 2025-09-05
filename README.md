# Catalogo

A lightweight product catalog website built with plain HTML, CSS, and JavaScript. It renders product cards with an image carousel and basic interactivity, reading data from a simple in-memory array or JSON file. Designed to be deployed on GitHub Pages for easy sharing with clients.

## Features

- Responsive grid of product cards
- Per-card image carousel (next/prev)
- Lightweight search/filter scaffolding (no backend)
- Zero build step: open `index.html` and it works
- Easy hosting on GitHub Pages

## Tech Stack

- **HTML5** for structure  
- **CSS** for layout and visuals  
- **Vanilla JavaScript** for rendering and interactions  
- Optional: a tiny local web server for nicer local testing (e.g., VS Code “Live Server”)

## Project Structure

/catalogo
├─ index.html
├─ /assets
│ ├─ /images
│ └─ /css
├─ /js
│ ├─ app.js # renders cards, carousel controls
│ └─ data.js # product data (array/json)
└─ README.md


> Folder names may differ in your repo; the idea is the same: `index.html`, one JS file that renders, and a data source.

## Getting Started

### Run locally
1. Clone the repository:
   ```bash
   git clone https://github.com/KastyYasz/catalogo.git
   cd catalogo
Open index.html in your browser.
For best results, use a local server to avoid CORS issues when loading images or JSON:

VS Code: install “Live Server,” then “Open with Live Server.”

Or Python: python3 -m http.server and visit http://localhost:8000.

Add or edit products

The catalog reads from a simple data source (an array or JSON).

Open your data file (for example js/data.js) and add items following the existing pattern.

Recommended fields:

id (string or number)

name (string)

price (number or string)

images (array of image URLs)

description (string)

category, tags (optional)

available (boolean), sku (optional)

Usage Notes

Keep image files under assets/images/ and reference them by relative path.

If you use external image URLs, make sure they are publicly accessible over HTTPS.

Avoid very large images; optimize for web to keep loading fast.

Deployment (GitHub Pages)

Push the project to GitHub under KastyYasz/catalogo.

On GitHub, go to Settings → Pages.

Source: “Deploy from a branch.”
Branch: main and Folder: /root.

Wait for the green check.
Your site will be available at:
https://KastyYasz.github.io/catalogo/


Roadmap (nice-to-have)

Category filter and search box UI

Price formatting and currency helper

Simple “favorites” using localStorage

Basic analytics (page views, clicks)

Dark mode toggle

License

MIT. Do what you need, just keep the notice.

Author

Made by Felipe (KastyYasz). If you fork this, rename the project and update the data source to your products.
