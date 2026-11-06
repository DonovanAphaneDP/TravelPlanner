# Travel Planner Dashboard

A modern, responsive **Travel Planner** web application built with **PHP**, **HTML**, **CSS**, and **JavaScript**.

## Features

- **Dashboard Overview** – Total trips, upcoming / completed counts, and overall budget summary
- **Trip Management** – Add, edit, view, and delete trips
- **Beautiful Trip Cards** – Cover images, status badges, date range, and budget progress bars
- **Trip Detail View** – Full itinerary timeline, packing list with checkboxes, budget ring chart, and notes
- **Packing List** – Interactive checkboxes that persist to the server
- **Search** – Filter trips by title or destination
- **Responsive Design** – Works on desktop, tablet, and mobile (collapsible sidebar)
- **Toast Notifications** – Feedback for all actions
- **File-based Storage** – Data stored in `data/trips.json` (no database required)

## Project Structure

```
TravelPlanner/
├── index.php          # Main dashboard page
├── api.php            # REST-like API endpoints (JSON)
├── css/
│   └── style.css      # All styles
├── js/
│   └── script.js      # Client-side logic
├── data/
│   └── trips.json     # Trip data storage
└── README.md
```

## Requirements

- PHP 7.4+ (or 8.x) with `json` extension enabled
- A web server (Apache, Nginx, or PHP built-in server)

## How to Run

### Option 1 – PHP Built-in Server (easiest)

```bash
cd TravelPlanner
php -S localhost:8000
```

Then open **http://localhost:8000** in your browser.

### Option 2 – Apache / Nginx

Place the `TravelPlanner` folder in your web root (e.g. `htdocs` or `/var/www/html`) and navigate to the folder URL.

Make sure the `data/` directory is writable by the web server:

```bash
chmod 755 data
chmod 644 data/trips.json
```

## API Endpoints

| Action            | Method | Description                    |
|-------------------|--------|--------------------------------|
| `?action=get_trips`     | GET    | Return all trips               |
| `?action=add_trip`      | POST   | Create a new trip              |
| `?action=update_trip`   | POST   | Update an existing trip        |
| `?action=delete_trip`   | POST   | Delete a trip by ID            |
| `?action=toggle_packing`| POST   | Toggle packing item status     |

All POST endpoints expect JSON body.

## Sample Data

Three sample trips are included (Tokyo, Paris, Bali) so you can explore the UI immediately.

## Customization

- Change colors in `css/style.css` (`:root` variables)
- Add more default packing items in `api.php` (inside `add_trip` case)
- Extend the itinerary editor by enhancing the detail view forms

## License

Free for personal and educational use.
