# Project TODO

## Completed Features
- [x] Basic homepage layout with hero section
- [x] Navigation menu (Header component)
- [x] Footer component
- [x] Search functionality for facilities
- [x] State filter dropdown
- [x] Category filter dropdown
- [x] Facility cards with contact info and directions
- [x] Stats section showing totals
- [x] About page with project information
- [x] EPA data integration (1,752 facilities)
- [x] Responsive design
- [x] Submit a Facility form page
- [x] Database schema for facility submissions
- [x] Backend API for facility submissions
- [x] Owner notification on new submissions
- [x] Unit tests for facility submission

## Pending Features
- [x] Admin panel to review submissions
- [x] Interactive map view
- [x] Export approved submissions to main CSV

## In Progress
- [x] Interactive map view with facility markers
- [x] Map clustering for better performance
- [x] Map/list view toggle on homepage

## Data Expansion
- [x] Research retail take-back programs (Best Buy, Staples, Home Depot, etc.)
- [x] Find municipal recycling center databases
- [x] Add local drop-off locations data (60 retail locations added)
- [x] Merge new facilities into master CSV (1,810 total facilities)
- [x] Update website categories (added Retail Take-Back Program)

## Admin Dashboard
- [x] Update database schema with submission status field
- [x] Create admin-only API endpoints for managing submissions
- [x] Build admin dashboard UI with submission list
- [x] Add approve/reject workflow with notes
- [x] Add export approved facilities to CSV functionality
- [x] Protect admin routes with role-based access
- [x] Unit tests for admin functionality

## Enhanced Search
- [x] Add material type filter (extract from materialsAccepted field)
- [x] Add facility type filter (rename from category for clarity)
- [x] Add distance-based filtering with geolocation
- [x] Redesign search bar UI with collapsible advanced filters
- [x] Update both homepage and map view with new filters

## Favorites Feature
- [x] Create favorites database table
- [x] Add backend API endpoints for favorites (add, remove, list)
- [x] Add favorite button to facility cards
- [x] Create favorites page to view saved facilities
- [x] Add favorites link to navigation for logged-in users
- [x] Unit tests for favorites functionality

## Search Autocomplete
- [x] Create autocomplete component with dropdown suggestions
- [x] Index facility names and addresses for fast matching
- [x] Show matching results as user types (debounced)
- [x] Highlight matching text in suggestions
- [x] Allow keyboard navigation (arrow keys, enter to select)
- [x] Integrate into homepage and map view search bars

## Share Feature
- [x] Create share button component with dropdown menu
- [x] Add share via Facebook, Twitter/X, LinkedIn
- [x] Add share via email with pre-filled subject and body
- [x] Add copy link to clipboard functionality
- [x] Integrate share button into facility cards

## Report Issue Feature
- [x] Create facility_reports database table
- [x] Add backend API endpoints for submitting and managing reports
- [x] Create report issue button component with modal form
- [x] Add issue type selection (closed, wrong address, wrong phone, etc.)
- [x] Add reports section to admin dashboard
- [x] Notify admin when new reports are submitted
- [x] Unit tests for report functionality

## Print Feature
- [x] Create print button component for facility cards
- [x] Design print-friendly facility detail layout
- [x] Include facility name, address, contact info, materials accepted
- [x] Add print styles for clean output
- [x] Integrate print button into facility cards

## Rating and Review System
- [x] Create facility_reviews database table
- [x] Add backend API endpoints for reviews (create, list, update, delete)
- [x] Create star rating component
- [x] Build review submission form
- [x] Display average rating and review count on facility cards
- [x] Create reviews section showing all reviews for a facility
- [x] Add helpful votes feature
- [x] Unit tests for review functionality (12 tests)

## Highest Rated Section
- [x] Create backend API endpoint to get top-rated facilities
- [x] Build HighestRated component for homepage
- [x] Display facility cards with ratings and review counts
- [x] Add link to view all on map
- [x] Integrate section into homepage layout
- [x] Unit tests for top-rated functionality (4 tests)

## Review Moderation
- [x] Add status field to reviews (pending, approved, rejected)
- [x] Update backend API with moderation endpoints
- [x] Add Reviews tab to admin dashboard
- [x] Display pending reviews for moderation
- [x] Add approve/reject functionality with notes
- [x] Filter public reviews to show only approved ones
- [x] Unit tests for review moderation (8 tests)

## Facility Detail Page
- [x] Create FacilityDetail page component with dedicated URL route (/facility/:id)
- [x] Display full facility information (name, category, address, contact, materials)
- [x] Add reviews section showing all reviews for the facility
- [x] Integrate mini-map showing facility location
- [x] Add share, print, favorite, and report buttons
- [x] Update facility cards to link to detail page with View Details button
- [x] Add quick actions sidebar (Get Directions, Call Now, Visit Website)

## Nearby Facilities Section
- [x] Calculate distance between facilities using coordinates
- [x] Find facilities within 10-mile radius of current facility
- [x] Display nearby facilities section on detail page
- [x] Show distance, category, and rating for each nearby facility
- [x] Link to nearby facility detail pages
- [x] Add batchStats API endpoint for efficient rating lookups
- [x] Unit tests for batchStats endpoint (4 tests)

## Recyclish Branding
- [x] Upload Recyclish logo to S3
- [x] Add logo to header with link to recyclish.com
- [x] Add logo to footer with link to recyclish.com

## Homepage Hero Image
- [x] Upload transparent Recyclish logo to CDN
- [x] Replace hero image with Recyclish logo
- [x] Adjust logo size to fit hero section

## Mailing List Signup
- [x] Create database schema for newsletter subscribers
- [x] Add backend API endpoint for subscription
- [x] Create mailing list signup form component
- [x] Include email and zip code as required fields
- [x] Add optional age, gender, sex fields
- [x] Add additional information text area
- [x] Integrate signup form into homepage
- [x] Unit tests for subscription endpoint (9 tests)

## Welcome Email for Subscribers
- [x] Research email notification capabilities
- [x] Create welcome email function with recycling tips
- [x] Generate location-based tips using zip code (LLM-powered)
- [x] Integrate welcome email into subscription flow
- [x] Add welcome email preview dialog for subscribers
- [x] Unit tests for welcome email (7 tests)

## Sharps/Needles Disposal Category
- [x] Add "Sharps Disposal" category to facility types
- [x] Update category colors for sharps (maroon badge)
- [x] Research sharps disposal locations (pharmacies, hospitals, drop-off sites)
- [x] Add sharps disposal facilities to database (109 locations across 25+ cities)
- [x] Update search filters to include sharps category
- [x] Facilities include: health departments, hospitals, CVS, Walgreens, municipal centers

## AI Recycling Chatbot
- [x] Create chatbot backend API endpoint with LLM integration
- [x] Add recycling knowledge context (sharps disposal, GLP-1, local options)
- [x] Build floating chatbot UI component with RecycleBot branding
- [x] Implement chat history and conversation context
- [x] Add suggested prompts for common questions
- [x] Unit tests for chatbot functionality (6 tests)

## SEO Meta Tags
- [x] Create SEO/meta tag component for dynamic page titles
- [x] Add Open Graph tags for social sharing
- [x] Add Twitter Card meta tags
- [x] Implement on facility detail pages
- [x] Add structured data (JSON-LD) for RecyclingCenter schema

## New Recycling Categories
- [x] Add Cardboard Recycling category and facilities (20 locations)
- [x] Add Metals Recycling category and facilities (20 locations)
- [x] Add Clothing Recycling category and facilities (20 locations)
- [x] Update category colors in UI components
- [x] Update hero text with new facility count (1,981) and 14 categories
