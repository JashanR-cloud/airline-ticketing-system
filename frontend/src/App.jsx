import { useEffect, useState } from "react";
import "./App.css";
import { CreateAccountModal, EditAccountModal } from "./components/AccountModal";
import MainTabs from './components/main_tabs/MainTabs';
import LoggedInBanner from "./components/LoggedInBanner";
import SearchFlightsPanel from "./components/main_tabs/SearchFlightsPanel"
import ManageBookingsPanel from "./components/main_tabs/ManageBookingsPanel"
import FlightStatusPanel from "./components/main_tabs/FlightStatusPanel";
import EmployeeDashboard from "./components/EmployeeDashboard";
import SystemAdminDashboard from "./components/SystemAdminDashboard";
import TransactionModal from "./components/TransactionModal";
import CancelConfirmationModal from "./components/main_tabs/CancelConfirmationModal";
import "./components/AccountModal.css";

const API = "https://airline-ticketing-system-gjnr.onrender.com";

const SEAT_OPTIONS = ["No Preference", "Window", "Aisle", "Middle"];
const MEAL_OPTIONS = ["No Preference", "Standard", "Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free", "No Meal"];

// ── Airport metadata for the destination explorer ──
const AIRPORT_META = {
  "Adolfo Suárez Madrid-Barajas Airport":                  { city: "Madrid",        country: "Spain",       flag: "🇪🇸", region: "Europe" },
  "Cancun International Airport":                          { city: "Cancún",        country: "Mexico",      flag: "🇲🇽", region: "Americas" },
  "Charles de Gaulle Airport":                             { city: "Paris",         country: "France",      flag: "🇫🇷", region: "Europe" },
  "Chhatrapati Shivaji Maharaj International Airport":     { city: "Mumbai",        country: "India",       flag: "🇮🇳", region: "Asia-Pacific" },
  "Frankfurt Airport":                                     { city: "Frankfurt",     country: "Germany",     flag: "🇩🇪", region: "Europe" },
  "George Bush Intercontinental Airport":                  { city: "Houston",       country: "USA",         flag: "🇺🇸", region: "Americas" },
  "Hamad International Airport":                           { city: "Doha",          country: "Qatar",       flag: "🇶🇦", region: "Middle East" },
  "Indira Gandhi International Airport":                   { city: "New Delhi",     country: "India",       flag: "🇮🇳", region: "Asia-Pacific" },
  "John F. Kennedy International Airport":                 { city: "New York",      country: "USA",         flag: "🇺🇸", region: "Americas" },
  "Josep Tarradellas Barcelona-El Prat Airport":           { city: "Barcelona",     country: "Spain",       flag: "🇪🇸", region: "Europe" },
  "Leonardo da Vinci-Fiumicino Airport":                   { city: "Rome",          country: "Italy",       flag: "🇮🇹", region: "Europe" },
  "London Gatwick Airport":                                { city: "London",        country: "UK",          flag: "🇬🇧", region: "Europe" },
  "London Heathrow Airport":                               { city: "London",        country: "UK",          flag: "🇬🇧", region: "Europe" },
  "Los Angeles International Airport":                     { city: "Los Angeles",   country: "USA",         flag: "🇺🇸", region: "Americas" },
  "Manchester Airport":                                    { city: "Manchester",    country: "UK",          flag: "🇬🇧", region: "Europe" },
  "Melbourne Airport":                                     { city: "Melbourne",     country: "Australia",   flag: "🇦🇺", region: "Asia-Pacific" },
  "Mexico City International Airport":                     { city: "Mexico City",   country: "Mexico",      flag: "🇲🇽", region: "Americas" },
  "Miami International Airport":                           { city: "Miami",         country: "USA",         flag: "🇺🇸", region: "Americas" },
  "Narita International Airport":                          { city: "Tokyo",         country: "Japan",       flag: "🇯🇵", region: "Asia-Pacific" },
  "Rio de Janeiro/Galeão International Airport":           { city: "Rio de Janeiro",country: "Brazil",      flag: "🇧🇷", region: "Americas" },
  "São Paulo/Guarulhos International Airport":             { city: "São Paulo",     country: "Brazil",      flag: "🇧🇷", region: "Americas" },
  "Singapore Changi Airport":                              { city: "Singapore",     country: "Singapore",   flag: "🇸🇬", region: "Asia-Pacific" },
  "Sydney Kingsford Smith Airport":                        { city: "Sydney",        country: "Australia",   flag: "🇦🇺", region: "Asia-Pacific" },
  "Dubai International Airport":                           { city: "Dubai",         country: "UAE",         flag: "🇦🇪", region: "Middle East" },
};

const REGION_COLORS = {
  "Americas":     { bg: "#fef2f2", accent: "#cf102d", badge: "#cf102d" },
  "Europe":       { bg: "#eff6ff", accent: "#1d4ed8", badge: "#1d4ed8" },
  "Asia-Pacific": { bg: "#f0fdf4", accent: "#16a34a", badge: "#16a34a" },
  "Middle East":  { bg: "#fffbeb", accent: "#d97706", badge: "#d97706" },
  "Other":        { bg: "#f8f8f8", accent: "#555",    badge: "#555" },
};

// ── Vacation Package Catalog ──
const VACATION_PACKAGES = [
  // PARIS
  { id:"pkg-paris-romantic", arrival:"Charles de Gaulle Airport", city:"Paris", flag:"🇫🇷", category:"Romantic", emoji:"💕", name:"Paris Romance Escape", duration:7, price:1299, originalPrice:1599, hotel:"Grand Hôtel Opera ★★★★★", carRental:true, carType:"Convertible", activities:["Eiffel Tower Skip-the-Line","Seine River Dinner Cruise","Versailles Day Trip","Private Champagne Tasting"], meals:"Breakfast & Dinner daily", highlights:["Couples Spa Treatment","Airport Private Transfer","Welcome Champagne & Roses"] },
  { id:"pkg-paris-city", arrival:"Charles de Gaulle Airport", city:"Paris", flag:"🇫🇷", category:"City Break", emoji:"🏙️", name:"Paris City Explorer", duration:5, price:849, originalPrice:1050, hotel:"Hôtel du Marais ★★★★", carRental:false, carType:null, activities:["Louvre Museum Tour","Montmartre Walking Tour","Day Trip to Giverny","Local Food Market Tour"], meals:"Breakfast daily", highlights:["Metro Pass Included","City Guide App","Museum Pass"] },
  { id:"pkg-paris-family", arrival:"Charles de Gaulle Airport", city:"Paris", flag:"🇫🇷", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"Paris Family Adventure", duration:6, price:1099, originalPrice:1350, hotel:"Novotel Paris Centre ★★★★", carRental:true, carType:"Minivan", activities:["Disneyland Paris 2-Day Pass","Eiffel Tower Visit","Kids Cooking Class","Jardin d'Acclimatation"], meals:"Breakfast daily", highlights:["Kids Eat Free","Family Concierge","Baby Equipment on Request"] },

  // LONDON
  { id:"pkg-london-family", arrival:"London Heathrow Airport", city:"London", flag:"🇬🇧", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"London Family Fun Pack", duration:7, price:1199, originalPrice:1499, hotel:"Holiday Inn Kensington ★★★★", carRental:true, carType:"SUV", activities:["Harry Potter Studio Tour","Tower of London","London Eye","Natural History Museum"], meals:"Breakfast daily", highlights:["Oyster Travel Cards","Kids Activity Pack","Priority Check-In"] },
  { id:"pkg-london-romantic", arrival:"London Heathrow Airport", city:"London", flag:"🇬🇧", category:"Romantic", emoji:"💕", name:"London Romantic Getaway", duration:5, price:1099, originalPrice:1350, hotel:"The Savoy ★★★★★", carRental:false, carType:null, activities:["West End Theatre Show","Thames Dinner Cruise","Kew Gardens","Afternoon Tea at Claridge's"], meals:"Breakfast & Afternoon Tea", highlights:["Champagne on Arrival","Pillow Menu","Late Checkout"] },
  { id:"pkg-london-city", arrival:"London Gatwick Airport", city:"London", flag:"🇬🇧", category:"City Break", emoji:"🏙️", name:"London Express Break", duration:4, price:699, originalPrice:880, hotel:"Premier Inn Southbank ★★★", carRental:false, carType:null, activities:["British Museum","Borough Market Tour","Buckingham Palace","Greenwich Observatory"], meals:"Breakfast daily", highlights:["Contactless Travel Card","City Map & Guide","24hr Concierge"] },

  // NEW YORK
  { id:"pkg-nyc-allinclusive", arrival:"John F. Kennedy International Airport", city:"New York", flag:"🇺🇸", category:"All-Inclusive", emoji:"🗽", name:"NYC All-Inclusive Experience", duration:6, price:1599, originalPrice:1999, hotel:"The Plaza Hotel ★★★★★", carRental:false, carType:null, activities:["Broadway Show Tickets","Statue of Liberty Ferry","NYC Helicopter Tour","Fine Dining x3"], meals:"All meals & beverages included", highlights:["$200 Dining Credit","Rooftop Bar Access","Private Airport Transfer","Unlimited Metro Card"] },
  { id:"pkg-nyc-city", arrival:"John F. Kennedy International Airport", city:"New York", flag:"🇺🇸", category:"City Break", emoji:"🏙️", name:"Manhattan Explorer", duration:5, price:999, originalPrice:1250, hotel:"Hilton Midtown ★★★★", carRental:false, carType:null, activities:["Top of the Rock","Central Park Bike Tour","MoMA Museum","Brooklyn Food Tour"], meals:"Breakfast daily", highlights:["Unlimited Metro Card","NYC Pass","Photography Tour"] },
  { id:"pkg-nyc-family", arrival:"John F. Kennedy International Airport", city:"New York", flag:"🇺🇸", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"NYC Family Discovery", duration:7, price:1399, originalPrice:1750, hotel:"Marriott Times Square ★★★★", carRental:true, carType:"SUV", activities:["American Museum of Natural History","Central Park Zoo","Coney Island","LEGOLAND Discovery"], meals:"Breakfast & Dinner daily", highlights:["Kids NYC Guide","Family Concierge","Early Check-In"] },

  // DUBAI
  { id:"pkg-dubai-luxury", arrival:"Dubai International Airport", city:"Dubai", flag:"🇦🇪", category:"All-Inclusive", emoji:"✨", name:"Dubai Ultra-Luxury Retreat", duration:7, price:2499, originalPrice:3200, hotel:"Burj Al Arab Jumeirah ★★★★★+", carRental:true, carType:"Luxury Sedan", activities:["Desert Safari with BBQ","Dubai Frame","Burj Khalifa At the Top","Gold Souk Private Tour"], meals:"All meals & premium beverages", highlights:["Private Butler","Infinity Pool Access","Seaplane Transfer","Spa Credit $300"] },
  { id:"pkg-dubai-romantic", arrival:"Dubai International Airport", city:"Dubai", flag:"🇦🇪", category:"Romantic", emoji:"💕", name:"Dubai Romance in the Desert", duration:5, price:1799, originalPrice:2200, hotel:"Atlantis The Palm ★★★★★", carRental:false, carType:null, activities:["Sunset Desert Camel Ride","Dhow Cruise Dinner","Aquaventure Waterpark","Private Beach Day"], meals:"Breakfast & Dinner", highlights:["Rose Petal Turndown","Couples Spa","Welcome Dates & Arabic Coffee"] },

  // TOKYO
  { id:"pkg-tokyo-adventure", arrival:"Narita International Airport", city:"Tokyo", flag:"🇯🇵", category:"Adventure", emoji:"⛩️", name:"Japan Adventure Quest", duration:10, price:1899, originalPrice:2400, hotel:"Shinjuku Granbell ★★★★", carRental:true, carType:"Compact (JDM)", activities:["Mt. Fuji Day Trip","Kyoto Temple Tour","Tokyo Street Food Tour","Bullet Train Pass","Go-Kart in Tokyo"], meals:"Breakfast daily", highlights:["7-Day JR Pass","Pocket WiFi","IC Card for Transit"] },
  { id:"pkg-tokyo-family", arrival:"Narita International Airport", city:"Tokyo", flag:"🇯🇵", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"Tokyo Family Magic", duration:8, price:1699, originalPrice:2100, hotel:"Keio Plaza Hotel ★★★★", carRental:false, carType:null, activities:["Tokyo Disneyland 2-Day","teamLab Digital Art","Akihabara Electronics Tour","Pokemon Center Visit","Sumo Show"], meals:"Breakfast daily", highlights:["Kids JR Pass","Activity Backpack","24hr Concierge"] },

  // CANCÚN
  { id:"pkg-cancun-allinclusive", arrival:"Cancun International Airport", city:"Cancún", flag:"🇲🇽", category:"All-Inclusive", emoji:"🏖️", name:"Cancún All-Inclusive Paradise", duration:7, price:1199, originalPrice:1599, hotel:"Grand Oasis Cancún ★★★★★", carRental:false, carType:null, activities:["Chichen Itza Tour","Cenote Swim","Cozumel Snorkeling","Tulum Ruins"], meals:"All meals, drinks & snacks unlimited", highlights:["Unlimited Premium Open Bar","Beachfront Room","Swim-Up Bar","Nightclub Access"] },
  { id:"pkg-cancun-family", arrival:"Cancun International Airport", city:"Cancún", flag:"🇲🇽", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"Cancún Family Splash", duration:7, price:999, originalPrice:1299, hotel:"Hard Rock Hotel Cancún ★★★★★", carRental:true, carType:"Minivan", activities:["Xcaret Eco-Park","Xel-Ha Water Park","Snorkeling Tour","Pirate Boat Show"], meals:"All-inclusive for family", highlights:["Kids Club","Baby Pool","Family Suite Upgrade"] },
  { id:"pkg-cancun-romantic", arrival:"Cancun International Airport", city:"Cancún", flag:"🇲🇽", category:"Romantic", emoji:"💕", name:"Cancún Couples Retreat", duration:5, price:1099, originalPrice:1399, hotel:"Le Blanc Spa Resort ★★★★★", carRental:false, carType:null, activities:["Catamaran Sunset Cruise","Couples Massage","Private Cenote Tour","Tulum Ruins at Sunrise"], meals:"All meals & premium drinks", highlights:["Adults-Only Resort","Couples Spa Suite","Private Plunge Pool","Personalized Butler"] },

  // SYDNEY
  { id:"pkg-sydney-adventure", arrival:"Sydney Kingsford Smith Airport", city:"Sydney", flag:"🇦🇺", category:"Adventure", emoji:"🦘", name:"Sydney Adventure Down Under", duration:8, price:1599, originalPrice:2000, hotel:"Ovolo Woolloomooloo ★★★★", carRental:true, carType:"4WD", activities:["Harbour Bridge Climb","Blue Mountains Day Trip","Bondi to Coogee Coastal Walk","Great Barrier Reef Day Tour","Surf Lesson at Bondi"], meals:"Breakfast daily", highlights:["National Parks Pass","Opal Travel Card","Guided Wildlife Tour"] },
  { id:"pkg-sydney-family", arrival:"Sydney Kingsford Smith Airport", city:"Sydney", flag:"🇦🇺", category:"Family", emoji:"👨‍👩‍👧‍👦", name:"Sydney Family Explorer", duration:7, price:1399, originalPrice:1750, hotel:"Novotel Sydney ★★★★", carRental:true, carType:"Minivan", activities:["Sydney Zoo Taronga","SEA LIFE Aquarium","Featherdale Wildlife Park","Luna Park","Royal Botanic Garden"], meals:"Breakfast daily", highlights:["Kids National Parks Pass","Sydney Pass","Family Concierge"] },

  // MIAMI
  { id:"pkg-miami-allinclusive", arrival:"Miami International Airport", city:"Miami", flag:"🇺🇸", category:"All-Inclusive", emoji:"🌴", name:"Miami All-Inclusive Beach Escape", duration:5, price:1099, originalPrice:1399, hotel:"Fontainebleau Miami Beach ★★★★★", carRental:true, carType:"Convertible", activities:["Everglades Airboat Tour","Art Basel District Walk","South Beach Nightlife Tour","Key West Day Trip"], meals:"All meals & premium cocktails", highlights:["Poolside Cabana","Spa Credit $150","VIP Beach Access"] },
  { id:"pkg-miami-romantic", arrival:"Miami International Airport", city:"Miami", flag:"🇺🇸", category:"Romantic", emoji:"💕", name:"Miami Sunset Romance", duration:4, price:899, originalPrice:1150, hotel:"Edition Miami ★★★★★", carRental:false, carType:null, activities:["Sunset Sailboat Cruise","Little Havana Food Tour","Wynwood Street Art Tour","Private Beach Dinner"], meals:"Breakfast & Dinner", highlights:["Ocean View Suite","Couples Spa","Welcome Champagne"] },

  // ROME
  { id:"pkg-rome-city", arrival:"Leonardo da Vinci-Fiumicino Airport", city:"Rome", flag:"🇮🇹", category:"City Break", emoji:"🏛️", name:"Eternal City Roman Holiday", duration:6, price:999, originalPrice:1250, hotel:"Hotel Nazionale Roma ★★★★", carRental:false, carType:null, activities:["Colosseum Skip-the-Line","Vatican Museums Tour","Pompeii Day Trip","Pasta Making Class","Trastevere Food Tour"], meals:"Breakfast daily", highlights:["Roma Pass","Private Guide","Vespa Tour Option"] },
  { id:"pkg-rome-romantic", arrival:"Leonardo da Vinci-Fiumicino Airport", city:"Rome", flag:"🇮🇹", category:"Romantic", emoji:"💕", name:"Roma Amore Romantico", duration:5, price:1149, originalPrice:1450, hotel:"Hotel de Russie ★★★★★", carRental:false, carType:null, activities:["Private Colosseum After-Hours","Amalfi Coast Day Trip","Wine & Cheese Evening","Trevi Fountain Private Visit"], meals:"Breakfast & Dinner", highlights:["Rooftop Aperitivo","Couples Cooking Class","Personal Photographer 1hr"] },

  // BARCELONA
  { id:"pkg-barcelona-city", arrival:"Josep Tarradellas Barcelona-El Prat Airport", city:"Barcelona", flag:"🇪🇸", category:"City Break", emoji:"🎨", name:"Barcelona Art & Culture Break", duration:5, price:849, originalPrice:1080, hotel:"Hotel Arts Barcelona ★★★★★", carRental:false, carType:null, activities:["Sagrada Familia Priority","Park Güell Tour","Flamenco Show","La Boqueria Food Tour","Picasso Museum"], meals:"Breakfast daily", highlights:["T10 Metro Card","FC Barcelona Museum Option","Sunset Rooftop Cocktails"] },
  { id:"pkg-barcelona-romantic", arrival:"Josep Tarradellas Barcelona-El Prat Airport", city:"Barcelona", flag:"🇪🇸", category:"Romantic", emoji:"💕", name:"Barcelona Coastal Romance", duration:6, price:1099, originalPrice:1400, hotel:"W Barcelona ★★★★★", carRental:true, carType:"Convertible", activities:["Costa Brava Day Trip","Private Catamaran","Wine Tour in Penedès","Private Sagrada Familia","Sunset Tapas Tour"], meals:"Breakfast & Dinner", highlights:["Sea View Suite","Couples Spa","Cava Welcome Package"] },

  // RIO DE JANEIRO
  { id:"pkg-rio-adventure", arrival:"Rio de Janeiro/Galeão International Airport", city:"Rio de Janeiro", flag:"🇧🇷", category:"Adventure", emoji:"🌊", name:"Rio Adventure & Carnival", duration:7, price:1299, originalPrice:1650, hotel:"Windsor Atlantica ★★★★★", carRental:true, carType:"Jeep", activities:["Christ the Redeemer","Hang Gliding Over Rio","Sugarloaf Mountain","Favela Tour","Sambadrome Show"], meals:"Breakfast daily", highlights:["Carnival VIP Grandstand","Copacabana Beach Lounge","Caipirinha Welcome Kit"] },

  // HOUSTON (local)
  { id:"pkg-houston-family", arrival:"George Bush Intercontinental Airport", city:"Houston", flag:"🇺🇸", category:"Family", emoji:"🚀", name:"Houston Space City Family Pack", duration:4, price:599, originalPrice:799, hotel:"Marriott Marquis Houston ★★★★", carRental:true, carType:"SUV", activities:["NASA Space Center","Houston Zoo","Downtown Aquarium","Children's Museum","Kemah Boardwalk"], meals:"Breakfast daily", highlights:["NASA Behind-the-Scenes Pass","Metro Day Pass","Family Welcome Gift"] },
  { id:"pkg-houston-city", arrival:"George Bush Intercontinental Airport", city:"Houston", flag:"🇺🇸", category:"City Break", emoji:"🏙️", name:"Houston City Highlights", duration:3, price:449, originalPrice:599, hotel:"Four Seasons Houston ★★★★★", carRental:true, carType:"Sedan", activities:["Museum District Pass","Buffalo Bayou Park","Minute Maid Park Tour","Tex-Mex Culinary Tour"], meals:"Breakfast daily", highlights:["Luxury Spa Access","Rooftop Pool","Concierge Service"] },

  // SINGAPORE
  { id:"pkg-singapore-allinclusive", arrival:"Singapore Changi Airport", city:"Singapore", flag:"🇸🇬", category:"All-Inclusive", emoji:"🦁", name:"Singapore Ultimate Experience", duration:6, price:1799, originalPrice:2300, hotel:"Marina Bay Sands ★★★★★", carRental:false, carType:null, activities:["Gardens by the Bay","Universal Studios Singapore","Sentosa Island Day","Singapore Night Safari","Hawker Centre Food Tour"], meals:"All meals included", highlights:["Infinity Pool on 57th Floor","Casino Access","Sands SkyPark Observation Deck","MRT Pass"] },

  // MUMBAI
  { id:"pkg-mumbai-adventure", arrival:"Chhatrapati Shivaji Maharaj International Airport", city:"Mumbai", flag:"🇮🇳", category:"Adventure", emoji:"🕌", name:"India Heritage & Adventure", duration:9, price:1299, originalPrice:1700, hotel:"Taj Mahal Palace ★★★★★", carRental:true, carType:"Private Car with Driver", activities:["Taj Mahal Sunrise Agra","Ajanta & Ellora Caves","Mumbai Street Food Walk","Elephant Island Caves","Bollywood Studio Tour"], meals:"Breakfast & Dinner", highlights:["Private Guide","Cultural Welcome Ceremony","Yoga Session Daily"] },
];

const PACKAGE_CATEGORIES = ["All", "All-Inclusive", "Family", "Romantic", "Adventure", "City Break"];
const CATEGORY_STYLES = {
  "All-Inclusive": { bg: "#fef3c7", color: "#d97706", icon: "✨" },
  "Family":        { bg: "#dbeafe", color: "#1d4ed8", icon: "👨‍👩‍👧‍👦" },
  "Romantic":      { bg: "#fce7f3", color: "#be185d", icon: "💕" },
  "Adventure":     { bg: "#d1fae5", color: "#065f46", icon: "⛰️" },
  "City Break":    { bg: "#e0e7ff", color: "#3730a3", icon: "🏙️" },
};

function App() {
  const [activeTab, setActiveTab] = useState("search");
  const [airports, setAirports] = useState([]);
  const [cities, setCities] = useState([]);
  const [flightResults, setFlightResults] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isEditingPrefs, setIsEditingPrefs] = useState(false);
  const [prefData, setPrefData] = useState({ seat_preferences: "", meal_preferences: "" });
  const [crudAction, setCrudAction] = useState("");
  const [crudData, setCrudData] = useState({airlineId: "", aircraftId: "", departureAirportId: "", arrivalAirportId: "", departureDate: "", staffSize: "", flightId: "", routeId: "", capacity: ""});

  const [searchMessage, setSearchMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [loadingAirports, setLoadingAirports] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingUserBookings, setLoadingUserBookings] = useState(false);

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [manageResult, setManageResult] = useState(null);
  const [statusResult, setStatusResult] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Employee/Admin - View passengers in Flight
  const [flightManifestSearch, setFlightManifestSearch] = useState("");
  const [flightManifest, setFlightManifest] = useState(null);
  const [loadingFlightManifest, setLoadingFlightManifest] = useState(false);
  const [flightManifestMsg, setFlightManifestMsg] = useState("");

  // Employee Booking Search
  const [searchByUserId, setSearchByUserId] = useState("");
  const [searchByName, setSearchByName] = useState("");
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [passengerSuggestions, setPassengerSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);


  // Staff "book for passenger" modal
  const [bookForModal, setBookForModal] = useState({ show: false, flight: null, passengerId: "", bookingMsg: "" });

    // Booking Transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedFlightForTransaction, setSelectedFlightForTransaction] = useState(null);

    // Cancel Booking Confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Booking confirmation modal
  const [bookingConfirm, setBookingConfirm] = useState(null);

  // Loyalty modal
  const [loyaltyModal, setLoyaltyModal] = useState(null);

  // Free flight mode
  const [freeFlightMode, setFreeFlightMode] = useState(false);

  // Vacation package mode
  const [vacationMode, setVacationMode] = useState(false);
  const [pkgCategory, setPkgCategory] = useState("All");
  const [pkgSearch, setPkgSearch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null); // package chosen to book
  const [savingPackage, setSavingPackage] = useState(false);

  const [showDestinationsModal, setShowDestinationsModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [experienceRatings, setExperienceRatings] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [destSearch, setDestSearch] = useState("");
  const [destRegion, setDestRegion] = useState("All");
  const [expSort, setExpSort] = useState("score");   // "score" | "ontime" | "comfort" | "value"
  const [expSearch, setExpSearch] = useState("");

  const [showRouteFlightsModal, setShowRouteFlightsModal] = useState(false);
  const [routeFlights, setRouteFlights] = useState([]);
  const [selectedRouteLabel, setSelectedRouteLabel] = useState("");
  const [loadingRouteFlights, setLoadingRouteFlights] = useState(false);

  const [loyaltyMilestone, setLoyaltyMilestone] = useState(null);

  // Late cancellation fee warning
  const [showLateFeeModal, setShowLateFeeModal] = useState(false);

  // Cancellation success popup
  const [cancelSuccessInfo, setCancelSuccessInfo] = useState(null);

  // Loyalty welcome popup
  const [showLoyaltyWelcome, setShowLoyaltyWelcome] = useState(false);

  // Loyalty tier discount
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

  const [airlines, setAirlines] = useState([]);
  const [allAircrafts, setAllAircrafts] = useState([]);
  const [loadingAircrafts, setLoadingAircrafts] = useState(false);
  const [allFlights, setAllFlights] = useState([]);
  const [loadingAllFlights, setLoadingAllFlights] = useState(false);
  const [routesWithStatus, setRoutesWithStatus] = useState([]);
  const [loadingRoutesStatus, setLoadingRoutesStatus] = useState(false);
  const [inlineAircraftEdit, setInlineAircraftEdit] = useState({ id: null, capacity: "" });

  const [allPassengers, setAllPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [allBookingsAdmin, setAllBookingsAdmin] = useState([]);
  const [loadingAllBookings, setLoadingAllBookings] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "", role: "Passenger" });
  // Staff Portal login state — separate from passenger login
  const [staffLoginData, setStaffLoginData] = useState({ email: "", password: "" });
  const [staffLoginMessage, setStaffLoginMessage] = useState("");

  // Manage Staff (admin only) — list all staff and create/delete accounts
  const [allStaff, setAllStaff] = useState([]);
  const [newStaffData, setNewStaffData] = useState({ email: "", password: "", first_name: "", last_name: "", department: "", position: "", role: "Employee" });
  const [staffManageMessage, setStaffManageMessage] = useState("");
  const [flightSearch, setFlightSearch] = useState({ departureCityId: "", arrivalCityId: "", departureDate: "", returnDate: "", passengers: 1 });
  const [manageData, setManageData] = useState({ bookingId: "" });
  const [statusData, setStatusData] = useState({ flightId: "" });

  // Flight Ticket Class Prices
  const [selectedClass, setSelectedClass] = useState({});

  const getPriceForClass = (flight, cabinClass) => {
    if (cabinClass === "business") return flight.business_price;
    if (cabinClass === "first") return flight.first_class_price;
    return flight.economy_price; // default
  };

  const getAuthHeaders = (includeJson = true) => {
    const headers = {};
    if (includeJson) headers["Content-Type"] = "application/json";
    if (loggedInUser) {
      headers["x-user-id"] = String(loggedInUser.user_id);
      headers["x-user-role"] = loggedInUser.role;
    }
    return headers;
  };

  useEffect(() => { fetchAirports(); fetchCities(); }, []);

  // Fetch loyalty discount when user logs in
  useEffect(() => {
    if (loggedInUser && loggedInUser.role === "Passenger") {
      fetch(`${API}/loyalty-balance/${loggedInUser.user_id}`, { headers: getAuthHeaders(false) })
        .then(r => r.json())
        .then(data => { if (data.enrolled) setLoyaltyDiscount(data.discount || 0); else setLoyaltyDiscount(0); })
        .catch(() => setLoyaltyDiscount(0));
    } else {
      setLoyaltyDiscount(0);
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser && activeTab === "manage") {
      if (loggedInUser.role === "Passenger") {
        fetchUserBookings();
      } else {
        // Employee / System Admin: load all bookings for the dropdown
        fetchAllBookingsAdmin();
      }
    }
  }, [loggedInUser, activeTab]);

  // Role flags — only 3 roles now
  const isPassenger = loggedInUser?.role === "Passenger";
  const isEmployee = loggedInUser?.role === "Employee";
  const isSystemAdmin = loggedInUser?.role === "System Admin";

  // Passengers can book; System Admin can also book on behalf of users
  const canBook = isPassenger || isEmployee || isSystemAdmin;

  // ── Fetch helpers ──
  const handleCheckLoyalty = async (e) => {
  if (e) e.preventDefault();

  // Show loyalty popup even if user is not logged in yet
  if (!loggedInUser) {
    setLoyaltyModal({
      mode: "guest",
      firstName: "",
      miles: 0,
      tier: "Silver",
      membershipNumber: null,
    });
    return;
  }

  try {
    const response = await fetch(
      `${API}/loyalty-balance/${loggedInUser.user_id}`,
      { headers: getAuthHeaders(false) }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Could not load loyalty account.");
      return;
    }

    if (data.enrolled) {
      setLoyaltyModal({
        mode: "member",
        miles: data.miles || 0,
        tier: data.tier || "Silver",
        membershipNumber: data.membership_number || null,
        firstName: loggedInUser.first_name || "",
      });
    } else {
      setLoyaltyModal({
        mode: "not-enrolled",
        miles: 0,
        tier: "Silver",
        membershipNumber: null,
        firstName: loggedInUser.first_name || "",
      });
    }
  } catch {
    alert("Could not connect to server.");
  }
};
  const handleJoinLoyalty = async () => {
  if (!loggedInUser) {
    setLoyaltyModal(null);
    setShowCreateModal(true);
    return;
  }

  try {
    const response = await fetch(`${API}/join-loyalty`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        passengerId: loggedInUser.passenger_id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Could not join loyalty program.");
      return;
    }

    setLoyaltyModal({
      mode: "member",
      miles: data.miles || 0,
      tier: data.tier || "Silver",
      membershipNumber: data.membership_number || null,
      firstName: loggedInUser.first_name || "",
      justJoined: true,
    });
  } catch {
    alert("Could not connect to server.");
  }
};

const handleOpenLoyaltySignup = () => {
  setLoyaltyModal(null);
  setShowCreateModal(true);
};

  const handleStartFreeFlightMode = () => {
    setLoyaltyModal(null);
    setFreeFlightMode(true);
    setActiveTab("search");
  };

  const handleFlightManifestSearch = async () => {
    if (!flightManifestSearch.trim()) {
      setFlightManifest(null);
      setFlightManifestMsg("Please enter a flight ID.");
      return;
    }

    try {
      setLoadingFlightManifest(true);
      setFlightManifestMsg("");
      setFlightManifest(null);

      const res = await fetch(`${API}/flight-manifest/${flightManifestSearch}`, {
        headers: {
          "x-user-id": String(loggedInUser.user_id),
          "x-user-role": loggedInUser.role,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setFlightManifest(null);
        setFlightManifestMsg(data.error || "Could not load flight manifest.");
        return;
      }

      setFlightManifest(data);
      setFlightManifestMsg(
        `Loaded ${data.passengers.length} passenger${data.passengers.length !== 1 ? "s" : ""} for flight #${data.flight.flight_id}.`
      );
    } catch (err) {
      console.error("Flight manifest search failed:", err);
      setFlightManifest(null);
      setFlightManifestMsg("Could not load flight manifest.");
    } finally {
      setLoadingFlightManifest(false);
    }
  };

  const handleRedeemFlight = async (flight) => {
    try {
      const response = await fetch(`${API}/redeem-flight`, {
        method: "POST", headers: getAuthHeaders(true),
        body: JSON.stringify({ userId: loggedInUser.user_id, passengerId: loggedInUser.passenger_id, flightId: flight.flight_id }),
      });
      const data = await response.json();
      if (response.ok) {
        setFreeFlightMode(false);
        setBookingConfirm({
          bookingId: data.booking_id,
          milesEarned: 0,
          totalMiles: data.remaining_miles,
          milesUsed: data.miles_used,
          passengerName: loggedInUser.first_name + " " + (loggedInUser.last_name || ""),
          departure: flight.departure_airport,
          destination: flight.arrival_airport,
          flightId: flight.flight_id,
          milestone: null,
          newTier: data.new_tier,
          isFree: true,
        });
        fetchUserBookings();
      } else {
        alert(data.error || "Redemption failed.");
      }
    } catch { alert("Could not connect to server."); }
  };

  const savePackageToBooking = async (bookingId, pkg) => {
    if (!pkg || !bookingId) return;
    setSavingPackage(true);
    try {
      await fetch(`${API}/save-package-booking`, {
        method: "POST", headers: getAuthHeaders(true),
        body: JSON.stringify({
          bookingId, packageId: pkg.id, packageName: pkg.name,
          packageCategory: pkg.category, packagePrice: pkg.price,
          destination: pkg.city, durationDays: pkg.duration,
        }),
      });
    } catch { /* non-fatal, booking still succeeded */ }
    finally { setSavingPackage(false); }
  };

  const fetchAirports = async () => {
    try {
      setLoadingAirports(true);
      const response = await fetch(`${API}/airports`);
      const data = await response.json();
      if (!response.ok) { setSearchMessage(data.error || "Could not load airports."); return; }
      setAirports(data);
    } catch { setSearchMessage("Could not connect to backend."); }
    finally { setLoadingAirports(false); }
  };

  const fetchCities = async () => {
    try {
      setLoadingAirports(true);
      const response = await fetch(`${API}/cities`);
      const data = await response.json();
      if (!response.ok) { setSearchMessage(data.error || "Could not load cities."); return; }
      setCities(data);
    } catch { setSearchMessage("Could not connect to backend."); }
    finally { setLoadingAirports(false); }
  };

  const fetchAirlines = async () => {
    try {
      const res = await fetch(`${API}/airlines`, { headers: getAuthHeaders(true) });
      const data = await res.json();
      if (res.ok) setAirlines(data);
    } catch (err) {
      console.error("Failed to fetch airlines", err);
    }
  };

  const fetchUserBookings = async () => {
    if (!loggedInUser) return;
    setLoadingUserBookings(true); setManageMessage("");
    try {
      const response = await fetch(`${API}/my-bookings/${loggedInUser.user_id}`, { headers: getAuthHeaders(false) });
      const data = await response.json();
      if (response.ok) { setUserBookings(data); }
      else { setUserBookings([]); setManageMessage(data.error || "Failed to load bookings."); }
    } catch { setUserBookings([]); setManageMessage("Failed to load your bookings."); }
    finally { setLoadingUserBookings(false); }
  };

  // Employee Seaching for Bookings using ID
  const handleSearchBookings = async (passengerId = null) => {
    let url = `${API}/search-bookings?`;
    if (searchByUserId) url += `userId=${searchByUserId}`;
    else if (passengerId || selectedPassenger) {
      const id = passengerId || selectedPassenger.passenger_id;
      url += `passengerId=${id}`;
    }

    try {
      const res = await fetch(url, { headers: getAuthHeaders(true) });
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };

  // Employee Search bookings using name
  const handlePassengerSearch = async (name) => {
    if (!name || name.length < 2) {
      setPassengerSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`${API}/search-passengers?name=${encodeURIComponent(name)}`, {
        headers: getAuthHeaders(true)
      });
      const data = await res.json();
      setPassengerSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    if (!loggedInUser) return;
    setLoadingReports(true);
    try {
      const res = await fetch(`${API}/reports`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setReports(data);
      else { setReports([]); alert(data.error || "Failed to fetch reports."); }
    } catch { alert("Failed to fetch reports."); }
    finally { setLoadingReports(false); }
  };

  const fetchDestinations = async () => {
    setLoadingDestinations(true);
    try {
      const res = await fetch(`${API}/destinations`);
      const data = await res.json();
      if (res.ok) setDestinations(data);
    } catch (err) {
      console.error("Network error while fetching destinations:", err)
    }
    finally { setLoadingDestinations(false); }
  };

  const fetchExperienceRatings = async () => {
    setLoadingExperience(true);
    try {
      const res = await fetch(`${API}/experience-ratings`);
      const data = await res.json();
      if (res.ok) setExperienceRatings(data);
    } catch (err) { 
      console.error("Network error while fetching experience ratings:", err);
    }
    finally { setLoadingExperience(false); }
  };

  const fetchRouteFlights = async (routeId, label) => {
    if (!loggedInUser) return;
    setLoadingRouteFlights(true); setSelectedRouteLabel(label); setRouteFlights([]); setShowRouteFlightsModal(true);
    try {
      const res = await fetch(`${API}/route-flights/${routeId}`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setRouteFlights(data);
    } catch (err) { 
      console.error("Network error while fetching route flights:", err);
    }
    finally { setLoadingRouteFlights(false); }
  };

  const fetchAllAircrafts = async () => {
    if (!loggedInUser) return;
    setLoadingAircrafts(true);
    try {
      const res = await fetch(`${API}/aircrafts`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setAllAircrafts(data);
    } catch (err) { 
      console.error("Network error while fetching aircrafts:", err);
    }
    finally { setLoadingAircrafts(false); }
  };

  const fetchRoutesWithStatus = async () => {
    if (!loggedInUser) return;
    setLoadingRoutesStatus(true);
    try {
      const res = await fetch(`${API}/routes-with-status`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setRoutesWithStatus(data);
    } catch (err) { 
      console.error("Network error while fetching routes with status:", err);
    }
    finally { setLoadingRoutesStatus(false); }
  };

  const fetchAllPassengers = async () => {
    if (!loggedInUser) return;
    setLoadingPassengers(true);
    try {
      const res = await fetch(`${API}/all-passengers`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setAllPassengers(data);
    } catch (err) { 
      console.error("Network error while fetching all passengers:", err);
    }
    finally { setLoadingPassengers(false); }
  };

  const fetchAllBookingsAdmin = async () => {
    if (!loggedInUser) return;
    setLoadingAllBookings(true);
    try {
      const res = await fetch(`${API}/all-bookings`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setAllBookingsAdmin(data);
    } catch (err) { 
      console.error("Network error while fetching all bookings:", err);
    }
    finally { setLoadingAllBookings(false); }
  };

  const loadEmployeePortal = () => {
    fetchAllPassengers();
    fetchAllBookingsAdmin();
    fetchRoutesWithStatus();
    fetchAllAircrafts();
    fetchReports();
    fetchAllFlights();
  };

  const fetchAllFlights = async () => {
    if (!loggedInUser) return;
    setLoadingAllFlights(true);
    try {
      const res = await fetch(`${API}/all-flights`, { headers: getAuthHeaders(false) });
      const data = await res.json();
      if (res.ok) setAllFlights(data);
    } catch (err) { 
      console.error("Network error while fetching all flights:", err);
    }
    finally { setLoadingAllFlights(false); }
  };

  const [routeMsg, setRouteMsg] = useState({ text: "", type: "" });
  const [aircraftMsg, setAircraftMsg] = useState({ text: "", type: "" });
  const [crudMsg, setCrudMsg] = useState({ text: "", type: "" });
  const [refreshedSection, setRefreshedSection] = useState(""); // which section just refreshed

  const doRefresh = async (section, fetchFn) => {
    setRefreshedSection("");
    await fetchFn();
    setRefreshedSection(section);
    setTimeout(() => setRefreshedSection(""), 2500);
  };

  // Wrapper button component for Refresh with flash feedback
  const RefreshBtn = ({ section, fetchFn, loading }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {refreshedSection === section && (
        <span style={{ fontSize: "13px", color: "#1a6e3c", fontWeight: "600" }}>✅ Refreshed!</span>
      )}
      <button
        className="nav-edit-btn"
        style={{ color: "#222", borderColor: "#222" }}
        onClick={() => doRefresh(section, fetchFn)}
        disabled={loading}
      >
        {loading ? "Loading..." : "Refresh"}
      </button>
    </div>
  );

  const handleToggleRouteStatus = async (routeId) => {
    setRouteMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/toggle-route-status`, { method: "POST", headers: getAuthHeaders(true), body: JSON.stringify({ routeId }) });
      const data = await res.json();
      if (res.ok) {
        fetchRoutesWithStatus();
        setRouteMsg({ text: "✅ Route status updated.", type: "success" });
        setTimeout(() => setRouteMsg({ text: "", type: "" }), 3000);
      } else {
        setRouteMsg({ text: "❌ " + (data.error || "Failed to update route status."), type: "error" });
      }
    } catch { setRouteMsg({ text: "❌ Error connecting to server.", type: "error" }); }
  };

  const handleInlineAircraftUpdate = async (aircraftId) => {
    setAircraftMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API}/update-aircraft`, { method: "PUT", headers: getAuthHeaders(true), body: JSON.stringify({ aircraftId, capacity: inlineAircraftEdit.capacity }) });
      const data = await res.json();
      if (res.ok) {
        setAircraftMsg({ text: "✅ Aircraft capacity updated.", type: "success" });
        setInlineAircraftEdit({ id: null, capacity: "" });
        fetchAllAircrafts();
        setTimeout(() => setAircraftMsg({ text: "", type: "" }), 3000);
      } else {
        setAircraftMsg({ text: "❌ " + (data.error || "Update failed."), type: "error" });
      }
    } catch { setAircraftMsg({ text: "❌ Error connecting to server.", type: "error" }); }
  };

  const handleProcessPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API}/process-booking`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log("✅ Payment successful, showing confirmation");

        setShowTransactionModal(false);
        setSelectedFlightForTransaction(null);

        setBookingConfirm({
          bookingId: result.booking_id,
          departure: selectedFlightForTransaction?.flight?.departure_city || "Departure",
          destination: selectedFlightForTransaction?.flight?.arrival_city || "Destination",
          passengerName: `${loggedInUser?.first_name || ''} ${loggedInUser?.last_name || ''}`.trim() || loggedInUser?.email || "Passenger",
          cabinClass: selectedFlightForTransaction?.cabinClass || "economy",
          isFree: false,            
          milesUsed: 0,
          milesEarned: Math.floor(paymentData.total_amount * 1.5),
          totalMiles: result.new_miles || 10000, 
          milestone: result.milestone || null,
          not_enrolled: result.not_enrolled || false,  
        });

      } else {
        alert(result.error || "Failed to create booking.");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      alert("Could not complete the booking. Please try again.");
    }
  };

  // ── Event handlers ──
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

  // Manage Staff handlers — admin creates/deletes employee and admin accounts
  const fetchAllStaff = async () => {
    try {
      const response = await fetch(`${API}/all-staff`, { headers: getAuthHeaders(false) });
      const data = await response.json();
      if (response.ok) setAllStaff(data);
    } catch { setStaffManageMessage("Could not load staff list."); }
  };
  const handleNewStaffChange = (e) => setNewStaffData({ ...newStaffData, [e.target.name]: e.target.value });
  const handleCreateStaff = async (e) => {
    e.preventDefault(); setStaffManageMessage("");
    try {
      const response = await fetch(`${API}/create-staff`, {
        method: "POST", headers: getAuthHeaders(true),
        body: JSON.stringify(newStaffData),
      });
      const data = await response.json();
      if (!response.ok) { setStaffManageMessage(data.error || "Could not create account."); return; }
      setStaffManageMessage(`Created ${data.role} account (ID: ${data.employee_id}).`);
      setNewStaffData({ email: "", password: "", first_name: "", last_name: "", department: "", position: "", role: "Employee" });
      fetchAllStaff();
    } catch { setStaffManageMessage("Could not connect to backend."); }
  };
  const handleDeleteStaff = async (userId, label) => {
    if (!window.confirm(`Delete staff account for ${label}?`)) return;
    setStaffManageMessage("");
    try {
      const response = await fetch(`${API}/delete-staff`, {
        method: "DELETE", headers: getAuthHeaders(true),
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) { setStaffManageMessage(data.error || "Could not delete account."); return; }
      setStaffManageMessage("Staff account deleted.");
      fetchAllStaff();
    } catch { setStaffManageMessage("Could not connect to backend."); }
  };
  const handleFlightChange = (e) => setFlightSearch({ ...flightSearch, [e.target.name]: e.target.value });
  const handleStatusChange = (e) => setStatusData({ ...statusData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault(); setLoadingLogin(true); setLoginMessage("");
    try {
      const response = await fetch(`${API}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, password: loginData.password, role: loginData.role }),
      });
      const data = await response.json();
      if (!response.ok) { setLoginMessage(data.error || "Login failed."); return; }
      setLoggedInUser(data.user);
      setLoginMessage(`Login successful. Logged in as ${data.user.role}.`);
      setActiveTab("search");
    } catch { setLoginMessage("Could not connect to backend."); }
    finally { setLoadingLogin(false); }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setLoginData({ email: "", password: "", role: "Passenger" });
    setStaffLoginData({ email: "", password: "" }); setStaffLoginMessage("");
    setLoginMessage(""); setManageMessage(""); setStatusMessage("");
    setManageResult(null); setStatusResult(null);
    setUserBookings([]); setReports([]); setAllAircrafts([]);
    setRoutesWithStatus([]); setAllPassengers([]); setAllBookingsAdmin([]);
    setActiveTab("login");
  };

  const handleFlightSubmit = async (e) => {
    e.preventDefault(); setLoadingFlights(true); setSearchMessage(""); setFlightResults([]);
    try {
      const response = await fetch(`${API}/search-flights`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departureCityId: Number(flightSearch.departureCityId), arrivalCityId: Number(flightSearch.arrivalCityId), departureDate: flightSearch.departureDate, passengers: Number(flightSearch.passengers) }),
      });
      const data = await response.json();
      if (!response.ok) { setSearchMessage(data.error || "Something went wrong."); return; }
      if (data.length === 0) setSearchMessage("No flights found.");
      else setSearchMessage(`Found ${data.length} flight(s).`);
      setFlightResults(data);
    } catch { setSearchMessage("Could not connect to backend."); }
    finally { setLoadingFlights(false); }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault(); setLoadingStatus(true); setStatusMessage(""); setStatusResult(null);
    try {
      const response = await fetch(`${API}/flight-status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ flightId: statusData.flightId }) });
      const data = await response.json();
      if (!response.ok) { setStatusMessage(data.error || "Flight not found."); return; }
      setStatusResult(data); setStatusMessage("Flight found.");
    } catch { setStatusMessage("Could not connect to backend."); }
    finally { setLoadingStatus(false); }
  };

  const handleBookFlight = (flight, cabinClass = "economy", numPassengers =1 ) => {
    //debug messages
    console.log("🚀 handleBookFlight called with:", { 
      flightId: flight?.flight_id, 
      cabinClass 
    });

    if (!loggedInUser) {
      console.log("No logged in user → redirecting to login");
      setActiveTab("login");
      return;
    }

    if (!canBook) {
      alert("Only Passenger, Employee, or System Admin accounts can book flights.");
      return;
    }

    //debug message
    console.log("✅ Opening Transaction Modal");

    setSelectedFlightForTransaction({
      flight,
      cabinClass,
      price: getPriceForClass(flight, cabinClass),
      numPassengers: Number(numPassengers) || 1
    });
    setShowTransactionModal(true);
  };

  const executeBooking = async (flight, userId, passengerId) => {
    try {
      const response = await fetch(`${API}/book-flight`, {
        method: "POST", headers: getAuthHeaders(true),
        body: JSON.stringify({ userId, passengerId, flightId: flight.flight_id, passengers: Number(flightSearch.passengers) }),
      });
      const data = await response.json();
      if (response.ok) {
        setBookForModal({ show: false, flight: null, passengerId: "", bookingMsg: "" });

        // Find passenger name for the confirmation screen
        const passenger = allPassengers.find((p) => String(p.passenger_id) === String(passengerId));
        const passengerName = passenger
          ? `${passenger.first_name} ${passenger.last_name}`
          : loggedInUser.first_name || "Passenger";

        // Always show the styled booking confirmation — milestone info included if applicable
        // Also save the selected package if one was chosen
        const pkgToSave = bookForModal.selectedPackage || selectedPackage;
        if (pkgToSave && data.booking_id) {
          savePackageToBooking(data.booking_id, pkgToSave);
        }

        setBookingConfirm({
          bookingId: data.booking_id,
          milesEarned: data.miles_earned || 0,
          totalMiles: data.new_miles || 0,
          passengerName,
          flightId: flight.flight_id,
          departure: flight.departure_airport,
          destination: flight.arrival_airport,
          milestone: data.milestone || null,
          newTier: data.new_tier || null,
          packageAdded: pkgToSave || null,
        });

        // Clear package selection after booking
        setSelectedPackage(null);
        setVacationMode(false);
        setManageData({ bookingId: "" }); setManageResult(null);
        if (isPassenger) fetchUserBookings();
        else fetchAllBookingsAdmin();
      } else {
        setBookForModal((prev) => ({ ...prev, bookingMsg: "❌ Booking failed: " + data.error }));
      }
    } catch {
      setBookForModal((prev) => ({ ...prev, bookingMsg: "❌ Could not connect to the server." }));
    }
  };

  const handleStaffBookSubmit = () => {
    const pid = Number(bookForModal.passengerId);
    if (!pid) { setBookForModal((prev) => ({ ...prev, bookingMsg: "❌ Please select a person." })); return; }
    const person = allPassengers.find((p) => p.passenger_id === pid);
    const targetUserId = person?.user_id || loggedInUser.user_id;
    executeBooking(bookForModal.flight, targetUserId, pid);
  };

  const [actionMsg, setActionMsg] = useState({ text: "", type: "" }); // type: "success" | "error"

  const isWithin48Hours = (bookingId) => {
    const booking = userBookings.find(b => b.booking_id === bookingId);
    if (!booking || !booking.date_of_departure) return false;
    const departure = new Date(booking.date_of_departure);
    const now = new Date();
    const hoursUntilDeparture = (departure - now) / (1000 * 60 * 60);
    return hoursUntilDeparture <= 48;
  };

  const handleCancelBooking = async (bookingId) => {
    setBookingToCancel(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    // If within 48 hours, show late fee warning first
    if (isWithin48Hours(bookingToCancel) && !showLateFeeModal) {
      setShowCancelModal(false);
      setShowLateFeeModal(true);
      return;
    }

    setActionMsg({ text: "", type: "" });
    setShowCancelModal(false);
    setShowLateFeeModal(false);

    try {
      const response = await fetch(`${API}/cancel-booking`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ bookingId: bookingToCancel })
      });

      const data = await response.json();

      if (response.ok) {
        const booking = userBookings.find(b => b.booking_id === bookingToCancel);
        setCancelSuccessInfo(booking ? {
          bookingId: booking.booking_id,
          flightId: booking.flight_id,
          departureCity: booking.departure_city,
          arrivalCity: booking.arrival_city,
          dateDeparture: booking.date_of_departure,
          estimatedTime: booking.estimated_time_hours
        } : { bookingId: bookingToCancel });
        setManageResult(null);
        if (isPassenger) { fetchUserBookings(); }
        if (isEmployee || isSystemAdmin) fetchAllBookingsAdmin();
      } else {
        setActionMsg({ text: "❌ " + (data.error || "Failed to cancel booking."), type: "error" });
      }
    } catch { setActionMsg({ text: "❌ Error connecting to server.", type: "error" }); }
    finally {
      setBookingToCancel(null);
      setShowLateFeeModal(false);
    }
  };

  const handleUpdatePreferences = async (passengerId) => {

    if (!passengerId) {
      setActionMsg({ text: "❌ Could not determine passenger ID for update.", type: "error" });
      return;
    }

    try {
      const response = await fetch(`${API}/update-preferences`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          passengerId: passengerId,
          seatPreferences: prefData.seat_preferences,
          mealPreferences: prefData.meal_preferences
        })
      });

      const data = await response.json();

      if (response.ok) {
        setActionMsg({ text: "✅ Preferences updated successfully!", type: "success" });
        setIsEditingPrefs(false);

        if (isPassenger) {
          // Update bookings cards
          setUserBookings(prevBookings => 
            prevBookings.map(booking => 
              booking.passenger_id === passengerId 
                ? {
                    ...booking,
                    seat_preferences: prefData.seat_preferences,
                    meal_preferences: prefData.meal_preferences
                  }
                : booking
            )
          );
        } else {
          // Update manageResult for employee/admin view
          setManageResult(prev => prev ? {
            ...prev,
            seat_preferences: prefData.seat_preferences,
            meal_preferences: prefData.meal_preferences
          } : null);
        }
      
      } else {
        setActionMsg({ text: "❌ " + (data.error || "Failed to update preferences."), type: "error" });
      }
    } catch (err) {
      console.error(err);
      setActionMsg({ text: "❌ Error connecting to server.", type: "error" });
    }
  };

  const handleCrudSubmit = async (e) => {
    e.preventDefault();
    setCrudMsg({ text: "", type: "" });

    let endpoint = "";
    let method = "POST";
    let bodyData = {};

    if (crudAction === "addFlight") {
      endpoint = "/add-flight";
      method = "POST";

      bodyData = {
        airline_id: crudData.airlineId,
        aircraft_id: crudData.aircraftId,
        departure_airport_id: crudData.departureAirportId,
        arrival_airport_id: crudData.arrivalAirportId,
        date_of_departure: crudData.departureDate,
        staff_size: Number(crudData.staffSize) || 8,
      };
    } 
    else if (crudAction === "updateAircraft") {
      endpoint = "/update-aircraft";
      method = "PUT";
      bodyData = {
        aircraft_id: crudData.aircraftId,
        capacity: Number(crudData.capacity)
      };
    } 
    else if (crudAction === "deleteFlight") {
      endpoint = "/delete-flight";
      method = "DELETE";
      bodyData = { flight_id: crudData.flightId };
    }

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        headers: getAuthHeaders(true),
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (response.ok) {
        setCrudMsg({ text: `✅ ${data.message || "Action completed successfully."}`, type: "success" });
        
        // Reset form
        setCrudData({
          airlineId: "", aircraftId: "", departureAirportId: "", arrivalAirportId: "",
          departureDate: "", staffSize: "", flightId: "", routeId: "", capacity: ""
        });
        setCrudAction("");

        // Refresh relevant data
        fetchReports();
        if (crudAction === "updateAircraft") fetchAllAircrafts();
        if (crudAction === "addFlight" || crudAction === "deleteFlight") {
          // Optional: refresh flights list if you have one
        }
        
        setTimeout(() => setCrudMsg({ text: "", type: "" }), 5000);
      } else {
        setCrudMsg({ text: `❌ ${data.error || "Action failed."}`, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setCrudMsg({ text: "❌ Failed to connect to the server.", type: "error" });
    }
  };

  const handleRegisterSuccess = async (regData) => {
    setShowCreateModal(false);
    try {
      const res = await fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: regData.email, password: regData.password, role: regData.role }) });
      const data = await res.json();
      if (res.ok) { setLoggedInUser(data.user); setActiveTab("search"); return; }
    } catch (err) { 
      console.error("Network error while handling register success:", err);
    }
    setLoginMessage("Account created! Please log in.");
    setLoginData((prev) => ({ ...prev, role: regData.role }));
    setActiveTab("login");
  };

  const handleEditSaved = (updatedUser) => { setLoggedInUser((prev) => ({ ...prev, ...updatedUser }));

    setShowEditModal(false);
    setLoggedInUser(null);
    // Show a brief confirmation — reuse the existing login error area or just alert
    alert("Your account has been deactivated. You have been logged out.");
  };

  const handleAccountDeleted = () => {
    setShowEditModal(false);

    localStorage.clear(); 

    setTimeout(() => {
      setLoggedInUser(null);
      setActiveTab("login");
    }, 800);
  };

  const groupedDestinations = destinations.reduce((acc, d) => {
    if (!acc[d.departure]) acc[d.departure] = [];
    acc[d.departure].push(d);
    return acc;
  }, {});


  return (
    <div className="app">


      {/* ── Booking Confirmation Screen ── */}
      {bookingConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(10,10,20,0.75)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "20px", maxWidth: "500px", width: "100%",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)", overflow: "hidden"
          }}>
            {/* Header band */}
            <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #cf102d 100%)", padding: "32px 36px 28px", textAlign: "center" }}>
              <div style={{ fontSize: "52px", marginBottom: "8px" }}>✈️</div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: "22px", fontWeight: "800", letterSpacing: "0.5px" }}>
                Booking Confirmed!
              </h2>
              <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
                {bookingConfirm.departure} → {bookingConfirm.destination}
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "28px 36px" }}>
              {/* Booking details row */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: "#f8f8f8", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>Booking ID</p>
                  <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>#{bookingConfirm.bookingId}</p>
                </div>
                <div style={{ flex: 1, background: "#f8f8f8", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "1px" }}>Passenger</p>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a2e" }}>{bookingConfirm.passengerName}</p>
                </div>
              </div>

              {/* Cabin Class */}
              {bookingConfirm.cabinClass && (
                <div style={{ 
                  background: "#f0f9ff", 
                  border: "1px solid #7dd3fc", 
                  borderRadius: "10px", 
                  padding: "12px 16px", 
                  marginBottom: "20px" 
                }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#0369a1", fontWeight: "600" }}>
                    Cabin Class: <span style={{ textTransform: "capitalize" }}>{bookingConfirm.cabinClass}</span>
                  </p>
                </div>
              )}

              {/* Loyalty / Miles Section */}
              {bookingConfirm.not_enrolled ? (
                /* ── NOT ENROLLED ── */
                <div style={{
                  background: "linear-gradient(135deg, #fff8e1, #fff3cd)",
                  border: "2px solid #ffcc00",
                  borderRadius: "12px",
                  padding: "24px 20px",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  <p style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "700", color: "#8a6d00" }}>
                    🎯 Earn Rewards with Every Flight
                  </p>
                  <p style={{ margin: "0 0 20px", fontSize: "15px", color: "#555", lineHeight: "1.5" }}>
                    Join our Royal Horizon Loyalty Program to earn miles, unlock tier benefits, and enjoy free flights and upgrades.
                  </p>
                  <button 
                    onClick={() => {
                      setBookingConfirm(null);
                      // TODO: Open loyalty enrollment modal or navigate to loyalty page
                      alert("Loyalty Program enrollment coming soon! (Placeholder)");
                    }}
                    style={{
                      background: "#cf102d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "14px 28px",
                      fontSize: "15px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Join Loyalty Program
                  </button>
                </div>
              ) : (
                /* ── ENROLLED MEMBER ── */
                <div style={{
                  background: "linear-gradient(135deg, #e8f5e9, #f1fff5)",
                  border: "2px solid #1a6e3c",
                  borderRadius: "12px",
                  padding: "18px 20px",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#1a4d2e", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                    🏆 Royal Horizon Loyalty Points
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginTop: "8px" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: "800", color: "#cf102d" }}>
                        +{bookingConfirm.milesEarned}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Miles Earned</p>
                    </div>
                    <div style={{ width: "1px", background: "#e0c800", opacity: 0.5 }} />
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: "26px", fontWeight: "800", color: "#1a6e3c" }}>
                        {bookingConfirm.totalMiles.toLocaleString()}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Total Miles</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Milestone Badge (only for enrolled members) */}
              {!bookingConfirm.not_enrolled && bookingConfirm.milestone && (
                <div style={{ 
                  background: "#fce4ec", 
                  border: "1px solid #f48fb1", 
                  borderRadius: "10px", 
                  padding: "12px 16px", 
                  marginBottom: "20px", 
                  textAlign: "center" 
                }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#b00020" }}>
                    🎉 You've reached <strong>{bookingConfirm.milestone.tier} Tier</strong>! 
                    Welcome to exclusive benefits.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    setBookingConfirm(null);
                    if (isPassenger) { fetchUserBookings(); }
                    else { fetchAllBookingsAdmin(); }
                    setActiveTab("manage");
                  }}
                  style={{ flex: 1, background: "#cf102d", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => { setBookingConfirm(null); setActiveTab("search"); }}
                  style={{ flex: 1, background: "#f0f0f0", color: "#333", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
                >
                  Book Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loyalty Modal ── */}
{loyaltyModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(10,10,20,0.75)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(4px)",
    }}
  >
    <div
      style={{
        background: "#f5f5f5",
        borderRadius: "28px",
        maxWidth: "760px",
        width: "100%",
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #27235c 0%, #2f2a6c 100%)",
          color: "white",
          padding: "42px 28px 34px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "72px", marginBottom: "10px" }}>🏆</div>
        <h2 style={{ fontSize: "44px", margin: "0 0 8px 0", fontWeight: 800 }}>
          Royal Horizon Loyalty
        </h2>
        <p style={{ fontSize: "18px", margin: 0, opacity: 0.9 }}>
          Earn miles on every flight. Redeem for free travel.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "24px",
          }}
        >
          <span style={{ padding: "8px 18px", borderRadius: "999px", border: "1px solid #7c83b7", color: "#b8bfdc", fontWeight: 700 }}>Silver</span>
          <span style={{ padding: "8px 18px", borderRadius: "999px", border: "1px solid #d69d39", color: "#ffb11a", fontWeight: 700 }}>Gold</span>
          <span style={{ padding: "8px 18px", borderRadius: "999px", border: "1px solid #7e57ff", color: "#9b79ff", fontWeight: 700 }}>Platinum</span>
          <span style={{ padding: "8px 18px", borderRadius: "999px", border: "1px solid #00a8d8", color: "#11c5ff", fontWeight: 700 }}>Diamond</span>
        </div>
      </div>

      <div style={{ padding: "34px 34px 24px" }}>
        <div style={{ fontSize: "18px", lineHeight: 1.9, color: "#333", marginBottom: "28px" }}>
          <div>✈️&nbsp; Earn Miles every flight</div>
          <div>🎟️&nbsp; Redeem flights from 1,000 miles</div>
          <div>⬆️&nbsp; Seat upgrades & lounge access</div>
          <div>🎁&nbsp; Exclusive member-only deals</div>
        </div>

        {loyaltyModal.mode === "member" ? (
          <>
            <div
              style={{
                background: "#f1f1f3",
                borderRadius: "22px",
                padding: "24px",
                marginBottom: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#1f2140" }}>
                Welcome back{loyaltyModal.firstName ? `, ${loyaltyModal.firstName}` : ""}!
              </h3>
              <p style={{ margin: "0 0 8px 0", color: "#666" }}>
                Here is your current Royal Horizon Loyalty account.
              </p>
              <div style={{ marginTop: "14px", color: "#222", lineHeight: 1.9, fontWeight: 600 }}>
                <div>Tier: {loyaltyModal.tier || "Silver"}</div>
                <div>Miles: {loyaltyModal.miles || 0}</div>
                {loyaltyModal.membershipNumber && (
                  <div>Membership Number: {loyaltyModal.membershipNumber}</div>
                )}
              </div>
            </div>

            {(loyaltyModal.justJoined || (loyaltyModal.miles || 0) >= 1000) && (
              <button
                onClick={handleStartFreeFlightMode}
                style={{
                  width: "100%",
                  background: "#171936",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "20px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                  marginBottom: "12px",
                }}
              >
                {(loyaltyModal.miles || 0) >= 1000 ? "Redeem Free Flight" : "Search Flights"}
              </button>
            )}

            <button
              onClick={() => setLoyaltyModal(null)}
              style={{
                width: "100%",
                background: "#e9e9ee",
                color: "#333",
                border: "none",
                borderRadius: "18px",
                padding: "16px",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </>
        ) : loyaltyModal.mode === "guest" ? (
          <>
            <div
              style={{
                background: "#f1f1f3",
                borderRadius: "22px",
                padding: "24px",
                marginBottom: "22px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#1f2140" }}>
                Already a member?
              </h3>
              <p style={{ margin: 0, color: "#777" }}>
                Log in to view your miles, tier, and redeem rewards.
              </p>

              <button
                onClick={() => {
                  setLoyaltyModal(null);
                  setActiveTab("login");
                }}
                style={{
                  width: "100%",
                  marginTop: "22px",
                  background: "#171936",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "20px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Log In to My Account
              </button>
            </div>

            <div
              style={{
                background: "#fff5f6",
                border: "3px solid #cf102d",
                borderRadius: "22px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#cf102d" }}>
                Not a member yet?
              </h3>
              <p style={{ margin: "0 0 20px 0", color: "#777" }}>
                Create a free account and join the loyalty program to start earning miles today.
              </p>

              <button
                onClick={handleOpenLoyaltySignup}
                style={{
                  width: "100%",
                  background: "linear-gradient(180deg, #e51635 0%, #bf0620 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "20px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🏆 Create Account & Join Loyalty
              </button>
            </div>

            <button
              onClick={() => setLoyaltyModal(null)}
              style={{
                width: "100%",
                background: "transparent",
                color: "#999",
                border: "none",
                padding: "14px",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Maybe Later
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                background: "#fff5f6",
                border: "3px solid #cf102d",
                borderRadius: "22px",
                padding: "24px",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "22px", color: "#cf102d" }}>
                Not enrolled yet?
              </h3>
              <p style={{ margin: "0 0 20px 0", color: "#777" }}>
                Join Royal Horizon Loyalty to start earning miles on eligible flights and unlock rewards.
              </p>

              <button
                onClick={handleJoinLoyalty}
                style={{
                  width: "100%",
                  background: "linear-gradient(180deg, #e51635 0%, #bf0620 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "18px",
                  padding: "20px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                🏆 Join Loyalty Program
              </button>
            </div>

            <button
              onClick={() => setLoyaltyModal(null)}
              style={{
                width: "100%",
                background: "transparent",
                color: "#999",
                border: "none",
                padding: "14px",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Maybe Later
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)}

      {/* ── Where We Fly — Destination Explorer ── */}
      {showDestinationsModal && (() => {
        // Build unique destination list with metadata + price estimate
        const allDests = [];
        const seen = new Set();
        destinations.forEach((d) => {
          const key = d.arr_id;
          if (!seen.has(key)) {
            seen.add(key);
            const meta = AIRPORT_META[d.arrival] || { city: d.arrival, country: "", flag: "🌍", region: "Other" };
            const minPrice = Math.floor(((d.route_id || 1) * 53 + d.arr_id * 17) % 400) + 149;
            allDests.push({ ...d, ...meta, minPrice });
          }
        });

        const regions = ["All", ...Array.from(new Set(allDests.map((d) => d.region))).sort()];

        const filtered = allDests.filter((d) => {
          const matchRegion = destRegion === "All" || d.region === destRegion;
          const q = destSearch.toLowerCase();
          const matchSearch = !q || d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.arrival.toLowerCase().includes(q);
          return matchRegion && matchSearch;
        }).sort((a, b) => b.total_flights - a.total_flights);

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,20,0.78)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "32px 16px", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "960px", width: "100%", boxShadow: "0 28px 80px rgba(0,0,0,0.45)", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)", padding: "32px 36px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px", color: "#fff", fontSize: "26px", fontWeight: "800", letterSpacing: "0.3px" }}>✈️ Where We Fly</h2>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>
                      {allDests.length} destinations across {regions.length - 1} regions
                    </p>
                  </div>
                  <button onClick={() => { setShowDestinationsModal(false); setDestSearch(""); setDestRegion("All"); }}
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                    ✕ Close
                  </button>
                </div>

                {/* Search bar */}
                <div style={{ position: "relative", marginTop: "20px" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search city, country, or airport..."
                    value={destSearch}
                    onChange={(e) => setDestSearch(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: "10px", border: "none", fontSize: "15px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(6px)" }}
                  />
                </div>

                {/* Region filter tabs */}
                <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                  {regions.map((r) => {
                    const col = REGION_COLORS[r] || REGION_COLORS["Other"];
                    const active = destRegion === r;
                    return (
                      <button key={r} onClick={() => setDestRegion(r)}
                        style={{ padding: "6px 16px", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px", transition: "all 0.15s",
                          background: active ? "#fff" : "rgba(255,255,255,0.12)",
                          color: active ? (col.accent || "#1a1a2e") : "rgba(255,255,255,0.85)" }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destination grid */}
              <div style={{ padding: "28px 32px" }}>
                {loadingDestinations ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    <p style={{ fontSize: "32px", margin: "0 0 10px" }}>🌍</p>
                    <p>Loading destinations...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    <p style={{ fontSize: "32px", margin: "0 0 10px" }}>🔍</p>
                    <p>No destinations found for "{destSearch}"</p>
                    <button onClick={() => { setDestSearch(""); setDestRegion("All"); }} style={{ marginTop: "10px", background: "#f0f0f0", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}>Clear filters</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                    {filtered.map((d) => {
                      const col = REGION_COLORS[d.region] || REGION_COLORS["Other"];
                      const isPopular = d.total_flights > 5;
                      return (
                        <div key={d.route_id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; e.currentTarget.style.borderColor = col.accent; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = "#eee"; }}>

                          {/* Color top band */}
                          <div style={{ background: col.bg, padding: "18px 16px 14px", textAlign: "center", position: "relative" }}>
                            {isPopular && (
                              <span style={{ position: "absolute", top: "8px", right: "8px", background: col.badge, color: "#fff", fontSize: "9px", fontWeight: "800", padding: "2px 7px", borderRadius: "999px", letterSpacing: "0.5px", textTransform: "uppercase" }}>Popular</span>
                            )}
                            <span style={{ fontSize: "38px", display: "block", marginBottom: "4px" }}>{d.flag}</span>
                            <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "800", color: "#1a1a2e" }}>{d.city}</p>
                            <p style={{ margin: 0, fontSize: "12px", color: "#666", fontWeight: "500" }}>{d.country}</p>
                          </div>

                          {/* Details */}
                          <div style={{ padding: "12px 14px" }}>
                            <p style={{ margin: "0 0 8px", fontSize: "10px", color: "#aaa", lineHeight: "1.4" }}>{d.arrival}</p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ background: col.bg, color: col.accent, fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "999px" }}>
                                  {d.region}
                                </span>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ margin: "0 0 1px", fontSize: "10px", color: "#aaa" }}>From</p>
                                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: col.accent }}>${d.minPrice}</p>
                              </div>
                            </div>
                            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "11px" }}>✈️</span>
                              <span style={{ fontSize: "11px", color: "#888" }}>{d.total_flights} flight{d.total_flights !== 1 ? "s" : ""} available</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer stats */}
                {filtered.length > 0 && (
                  <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #eee", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                    {Object.entries(
                      filtered.reduce((acc, d) => { acc[d.region] = (acc[d.region] || 0) + 1; return acc; }, {})
                    ).map(([region, count]) => {
                      const col = REGION_COLORS[region] || REGION_COLORS["Other"];
                      return (
                        <div key={region} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: col.accent, display: "inline-block" }} />
                          <span style={{ fontSize: "13px", color: "#666" }}><strong>{count}</strong> in {region}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Experience Ratings — Route Review Explorer ── */}
      {showExperienceModal && (() => {
        const getMeta = (airportName) => AIRPORT_META[airportName] || { city: airportName.split(" ")[0], country: "", flag: "🌍", region: "Other" };

        const SORT_OPTIONS = [
          { key: "score",   label: "⭐ Overall" },
          { key: "ontime",  label: "🕐 On-Time" },
          { key: "comfort", label: "💺 Comfort" },
          { key: "value",   label: "💰 Value" },
        ];

        const sorted = [...experienceRatings]
          .filter((r) => {
            if (!expSearch) return true;
            const q = expSearch.toLowerCase();
            const depMeta = getMeta(r.departure);
            const arrMeta = getMeta(r.arrival);
            return depMeta.city.toLowerCase().includes(q) || arrMeta.city.toLowerCase().includes(q) ||
              depMeta.country.toLowerCase().includes(q) || arrMeta.country.toLowerCase().includes(q);
          })
          .sort((a, b) => {
            if (expSort === "ontime") return b.on_time_num - a.on_time_num;
            if (expSort === "comfort") return parseFloat(b.comfort_score) - parseFloat(a.comfort_score);
            if (expSort === "value") return parseFloat(b.value_score) - parseFloat(a.value_score);
            return parseFloat(b.experience_score) - parseFloat(a.experience_score);
          });

        const ScoreBar = ({ value, max = 5, color }) => {
          const pct = (parseFloat(value) / max) * 100;
          return (
            <div style={{ flex: 1, background: "#f0f0f0", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "999px" }} />
            </div>
          );
        };

        const rankIcon = (i) => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

        const onTimeBg = (n) => n >= 90 ? "#e8f5e9" : n >= 80 ? "#fff8e1" : "#fce4ec";
        const onTimeColor = (n) => n >= 90 ? "#1a6e3c" : n >= 80 ? "#d97706" : "#b00020";

        const scoreColor = (s) => {
          const v = parseFloat(s);
          if (v >= 4.5) return "#16a34a";
          if (v >= 4.0) return "#1d4ed8";
          if (v >= 3.5) return "#d97706";
          return "#b00020";
        };

        const popStyle = (p) => ({
          bg: p === "High" ? "#e8f5e9" : p === "Medium" ? "#fff8e1" : "#fce4ec",
          col: p === "High" ? "#1a6e3c" : p === "Medium" ? "#d97706" : "#b00020",
        });

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,20,0.78)", zIndex: 9999, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "32px 16px", backdropFilter: "blur(4px)" }}>
            <div style={{ background: "#fff", borderRadius: "20px", maxWidth: "900px", width: "100%", boxShadow: "0 28px 80px rgba(0,0,0,0.45)", overflow: "hidden" }}>

              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #1e3a5f 60%, #0f3460 100%)", padding: "32px 36px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px", color: "#fff", fontSize: "26px", fontWeight: "800" }}>⭐ Route Experience Ratings</h2>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "14px" }}>
                      Passenger ratings across {experienceRatings.length} routes — scored on comfort, service, value & punctuality
                    </p>
                  </div>
                  <button onClick={() => { setShowExperienceModal(false); setExpSearch(""); setExpSort("score"); }}
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>
                    ✕ Close
                  </button>
                </div>

                {/* Search */}
                <div style={{ position: "relative", marginTop: "20px" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
                  <input type="text" placeholder="Search city or country..." value={expSearch} onChange={(e) => setExpSearch(e.target.value)}
                    style={{ width: "100%", padding: "11px 16px 11px 42px", borderRadius: "10px", border: "none", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.12)", color: "#fff", backdropFilter: "blur(6px)" }} />
                </div>

                {/* Sort tabs */}
                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <button key={key} onClick={() => setExpSort(key)}
                      style={{ padding: "6px 16px", borderRadius: "999px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "13px",
                        background: expSort === key ? "#fff" : "rgba(255,255,255,0.12)",
                        color: expSort === key ? "#1a1a2e" : "rgba(255,255,255,0.85)" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards */}
              <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {loadingExperience ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    <p style={{ fontSize: "32px", margin: "0 0 8px" }}>⭐</p><p>Loading ratings...</p>
                  </div>
                ) : sorted.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                    <p>No routes match your search.</p>
                    <button onClick={() => setExpSearch("")} style={{ marginTop: "8px", background: "#f0f0f0", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}>Clear</button>
                  </div>
                ) : sorted.map((r, i) => {
                  const dep = getMeta(r.departure);
                  const arr = getMeta(r.arrival);
                  const pop = popStyle(r.popularity);
                  const medal = rankIcon(i);
                  const sc = parseFloat(r.experience_score);
                  const stars = Math.round(sc);

                  return (
                    <div key={r.route_id} style={{ border: "1px solid #eee", borderRadius: "14px", overflow: "hidden", boxShadow: i < 3 ? "0 2px 12px rgba(0,0,0,0.08)" : "none", borderLeft: i < 3 ? `4px solid ${["#f59e0b","#94a3b8","#cd7f32"][i]}` : "1px solid #eee" }}>
                      <div style={{ padding: "18px 20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>

                        {/* Rank */}
                        <div style={{ minWidth: "36px", textAlign: "center", paddingTop: "2px" }}>
                          {medal ? <span style={{ fontSize: "26px" }}>{medal}</span> : <span style={{ fontSize: "15px", fontWeight: "800", color: "#aaa" }}>#{i + 1}</span>}
                        </div>

                        {/* Route */}
                        <div style={{ flex: "1 1 240px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                            <span style={{ fontSize: "22px" }}>{dep.flag}</span>
                            <div>
                              <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#1a1a2e" }}>{dep.city}</p>
                              <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{dep.country}</p>
                            </div>
                            <span style={{ color: "#aaa", fontSize: "18px", fontWeight: "300" }}>→</span>
                            <span style={{ fontSize: "22px" }}>{arr.flag}</span>
                            <div>
                              <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#1a1a2e" }}>{arr.city}</p>
                              <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{arr.country}</p>
                            </div>
                          </div>
                          <p style={{ margin: 0, fontSize: "11px", color: "#bbb" }}>{r.departure} → {r.arrival}</p>

                          {/* Sub-score bars */}
                          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
                            {[
                              { label: "Comfort",  val: r.comfort_score,  color: "#8b5cf6" },
                              { label: "Service",  val: r.service_score,  color: "#0ea5e9" },
                              { label: "Value",    val: r.value_score,    color: "#16a34a" },
                            ].map(({ label, val, color }) => (
                              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ width: "52px", fontSize: "11px", color: "#888", flexShrink: 0 }}>{label}</span>
                                <ScoreBar value={val} color={color} />
                                <span style={{ width: "28px", fontSize: "11px", fontWeight: "700", color }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", minWidth: "130px" }}>
                          {/* Overall score */}
                          <div style={{ textAlign: "center", background: "#f8f8f8", borderRadius: "12px", padding: "10px 16px" }}>
                            <p style={{ margin: "0 0 2px", fontSize: "28px", fontWeight: "900", color: scoreColor(r.experience_score) }}>{r.experience_score}</p>
                            <div style={{ display: "flex", gap: "1px", justifyContent: "center", marginBottom: "2px" }}>
                              {Array.from({ length: 5 }).map((_, si) => (
                                <span key={si} style={{ fontSize: "12px", color: si < stars ? "#f59e0b" : "#ddd" }}>★</span>
                              ))}
                            </div>
                            <p style={{ margin: 0, fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Overall</p>
                          </div>

                          {/* On-time */}
                          <div style={{ background: onTimeBg(r.on_time_num), borderRadius: "10px", padding: "6px 12px", textAlign: "center" }}>
                            <p style={{ margin: "0 0 1px", fontSize: "16px", fontWeight: "800", color: onTimeColor(r.on_time_num) }}>{r.on_time_rate}</p>
                            <p style={{ margin: 0, fontSize: "10px", color: onTimeColor(r.on_time_num), fontWeight: "600" }}>On-Time · {r.on_time_label}</p>
                          </div>

                          {/* Tags */}
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <span style={{ background: pop.bg, color: pop.col, fontSize: "10px", fontWeight: "800", padding: "3px 9px", borderRadius: "999px" }}>{r.popularity}</span>
                            <span style={{ background: "#f0f0f0", color: "#666", fontSize: "10px", fontWeight: "600", padding: "3px 9px", borderRadius: "999px" }}>✈️ {r.total_flights} flights</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend footer */}
              <div style={{ padding: "16px 32px 24px", display: "flex", gap: "20px", flexWrap: "wrap", borderTop: "1px solid #eee" }}>
                {[["#8b5cf6","Comfort"],["#0ea5e9","Service"],["#16a34a","Value"],["#f59e0b","Top ranked"]].map(([color, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, display: "inline-block" }} />
                    <span style={{ fontSize: "12px", color: "#888" }}>{label}</span>
                  </div>
                ))}
                <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "auto" }}>Rated by verified Royal Horizon passengers</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Route Flights Modal ── */}
      {showRouteFlightsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "32px", maxWidth: "700px", width: "100%", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "#1a1a2e" }}>✈️ Flights: {selectedRouteLabel}</h3>
              <button onClick={() => setShowRouteFlightsModal(false)} style={{ background: "none", border: "1px solid #ddd", borderRadius: "6px", padding: "6px 14px", cursor: "pointer" }}>✕ Close</button>
            </div>
            {loadingRouteFlights ? <p style={{ textAlign: "center", color: "#666" }}>Loading flights...</p> : routeFlights.length === 0 ? <p style={{ textAlign: "center", color: "#666" }}>No flights found for this route.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    {["Flight ID", "Departure", "Arrival", "Date", "Seats"].map((h) => (
                      <th key={h} style={{ padding: "10px", textAlign: "left", borderBottom: "2px solid #ddd" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {routeFlights.map((f) => (
                    <tr key={f.flight_id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>#{f.flight_id}</td>
                      <td style={{ padding: "10px" }}>{f.departure_airport}</td>
                      <td style={{ padding: "10px" }}>{f.arrival_airport}</td>
                      <td style={{ padding: "10px" }}>{new Date(f.date_of_departure).toLocaleString()}</td>
                      <td style={{ padding: "10px" }}>{f.seats_available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Book For Passenger Modal (Employee / System Admin) ── */}
      {bookForModal.show && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "36px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ margin: "0 0 6px", color: "#1a1a2e" }}>📋 Book Flight for Passenger</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
                Flight <strong>#{bookForModal.flight?.flight_id}</strong> → <strong>{bookForModal.flight?.arrival_airport}</strong>
              </p>
              {bookForModal.flight?.price && (
                <div style={{ background: "#fff8f8", border: "2px solid #cf102d", borderRadius: "10px", padding: "8px 16px", textAlign: "center" }}>
                  <p style={{ margin: "0 0 1px", fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Price</p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#cf102d" }}>${bookForModal.flight.price}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px" }}>
                Select Person to Book For
              </label>
              {allPassengers.length > 0 ? (
                <select
                  value={bookForModal.passengerId}
                  onChange={(e) => setBookForModal((prev) => ({ ...prev, passengerId: e.target.value, bookingMsg: "" }))}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">-- Select a person --</option>
                  {allPassengers.map((p) => (
                    <option key={p.passenger_id} value={p.passenger_id}>
                      {p.first_name} {p.last_name} ({p.user_role}) — {p.email}
                    </option>
                  ))}
                </select>
              ) : (
                <select disabled style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px", color: "#999" }}>
                  <option>{loadingPassengers ? "Loading..." : "No passengers found"}</option>
                </select>
              )}
            </div>

            {bookForModal.passengerId && allPassengers.length > 0 && (() => {
              const p = allPassengers.find((x) => String(x.passenger_id) === String(bookForModal.passengerId));
              return p ? (
                <div style={{ background: "#f0f7ff", border: "1px solid #b3d4ff", borderRadius: "8px", padding: "12px 16px", marginBottom: "18px", fontSize: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <p style={{ margin: 0, fontWeight: "700" }}>{p.first_name} {p.last_name}</p>
                    <span style={{ background: p.user_role === "Passenger" ? "#e3f2fd" : "#e8f5e9", color: p.user_role === "Passenger" ? "#1565c0" : "#1a6e3c", fontSize: "11px", fontWeight: "700", padding: "2px 10px", borderRadius: "999px" }}>{p.user_role}</span>
                  </div>
                  <p style={{ margin: "0 0 2px" }}><strong>Email:</strong> {p.email}</p>
                  <p style={{ margin: 0 }}><strong>Seat Pref:</strong> {p.seat_preferences || "None"} · <strong>Meal Pref:</strong> {p.meal_preferences || "None"}</p>
                </div>
              ) : null;
            })()}

            {bookForModal.bookingMsg && (
              <p style={{ color: "#b00020", fontWeight: "600", marginBottom: "14px", fontSize: "14px" }}>{bookForModal.bookingMsg}</p>
            )}

            {/* Optional vacation package picker */}
            {bookForModal.flight && (() => {
              const arrivalName = bookForModal.flight.arrival_airport || "";
              const matchingPkgs = VACATION_PACKAGES.filter((p) => p.arrival === arrivalName);
              if (matchingPkgs.length === 0) return null;
              const currentPkg = bookForModal.selectedPackage;
              return (
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", fontSize: "14px" }}>
                    🏖️ Add Vacation Package <span style={{ fontWeight: "400", color: "#888", fontSize: "12px" }}>(optional)</span>
                  </label>
                  <select
                    value={currentPkg?.id || ""}
                    onChange={(e) => {
                      const pkg = matchingPkgs.find((p) => p.id === e.target.value) || null;
                      setBookForModal((prev) => ({ ...prev, selectedPackage: pkg }));
                    }}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "8px", fontSize: "14px" }}
                  >
                    <option value="">-- No package (flight only) --</option>
                    {matchingPkgs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.emoji} {p.name} · {p.duration}nts · ${p.price}/person
                      </option>
                    ))}
                  </select>
                  {currentPkg && (
                    <div style={{ marginTop: "8px", background: "#f0f9ff", border: "1px solid #7dd3fc", borderRadius: "8px", padding: "10px 14px", fontSize: "13px" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: "700", color: "#0369a1" }}>{currentPkg.emoji} {currentPkg.name}</p>
                      <p style={{ margin: "0 0 2px", color: "#555" }}>🏨 {currentPkg.hotel} · {currentPkg.carRental ? `🚗 ${currentPkg.carType} ·` : ""} 🍽️ {currentPkg.meals}</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "12px" }}>{currentPkg.activities.slice(0,2).join(" · ")}{currentPkg.activities.length > 2 ? ` +${currentPkg.activities.length - 2} more` : ""}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={handleStaffBookSubmit}
                style={{ flex: 1, background: "#cf102d", color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", cursor: "pointer", fontWeight: "700" }}
              >
                Confirm Booking
              </button>
              <button
                type="button"
                onClick={() => setBookForModal({ show: false, flight: null, passengerId: "", bookingMsg: "" })}
                style={{ flex: 1, background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", padding: "12px", fontSize: "15px", cursor: "pointer", fontWeight: "600" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setSelectedFlightForTransaction(null);
        }}
        flight={selectedFlightForTransaction?.flight}
        selectedCabinClass={selectedFlightForTransaction?.cabinClass}
        getPriceForClass={getPriceForClass}
        loggedInUser={loggedInUser}
        numPassengers={selectedFlightForTransaction?.numPassengers || 1}
        onConfirmBooking={handleProcessPayment}
        loyaltyDiscount={loyaltyDiscount}
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setBookingToCancel(null);
        }}
        onConfirm={confirmCancelBooking}
        bookingId={bookingToCancel}
      />

      {/* Late Cancellation Fee Warning Modal */}
      {showLateFeeModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(10, 10, 20, 0.85)", zIndex: 11000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)", overflow: "hidden"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #7a0014, #9a0f19)",
              padding: "28px 32px", textAlign: "center", color: "#fff"
            }}>
              <div style={{ fontSize: "42px", marginBottom: "8px" }}>&#9888;&#65039;</div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Late Cancellation Fee</h2>
            </div>
            <div style={{ padding: "28px 32px", textAlign: "center" }}>
              <p style={{ fontSize: "15px", color: "#333", lineHeight: "1.6" }}>
                Cancellations made within <strong>48 hours</strong> of the scheduled departure time will incur a <strong>$50 late cancellation fee</strong>.
              </p>
              <p style={{ fontSize: "15px", color: "#333", marginTop: "16px", fontWeight: "600" }}>
                Would you still like to proceed with your cancellation?
              </p>
            </div>
            <div style={{
              padding: "20px 28px", borderTop: "1px solid #eee",
              display: "flex", gap: "12px", background: "#fff"
            }}>
              <button onClick={() => { setShowLateFeeModal(false); setBookingToCancel(null); }}
                style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #ddd",
                  background: "#fff", fontWeight: "600", fontSize: "15px", cursor: "pointer" }}>
                No, Keep Booking
              </button>
              <button onClick={confirmCancelBooking}
                style={{ flex: 1, padding: "14px", background: "#b00020", color: "white",
                  border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Success Popup */}
      {cancelSuccessInfo && (() => {
        const dep = cancelSuccessInfo.dateDeparture ? new Date(cancelSuccessInfo.dateDeparture) : null;
        const estHours = cancelSuccessInfo.estimatedTime || 0;
        const arr = dep && estHours ? new Date(dep.getTime() + estHours * 60 * 60 * 1000) : null;
        const estH = Math.floor(estHours);
        const estM = Math.round((estHours - estH) * 60);
        return (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(10, 10, 20, 0.85)", zIndex: 11000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)", overflow: "hidden"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #b00020, #cf102d)",
              padding: "28px 32px", textAlign: "center", color: "#fff"
            }}>
              <div style={{ fontSize: "42px", marginBottom: "8px" }}>&#9989;</div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Booking Cancelled</h2>
            </div>
            <div style={{ padding: "28px 32px", textAlign: "center" }}>
              <p style={{ fontSize: "16px", color: "#333", marginBottom: "16px" }}>
                <strong>Booking #{cancelSuccessInfo.bookingId}</strong> has been successfully cancelled.
              </p>
              {cancelSuccessInfo.flightId && (
                <div style={{ textAlign: "left", background: "#f9f9f9", borderRadius: "10px", padding: "14px 18px", fontSize: "14px", color: "#444", lineHeight: "1.8" }}>
                  <div><strong>Flight ID:</strong> {cancelSuccessInfo.flightId}</div>
                  <div><strong>Route:</strong> {cancelSuccessInfo.departureCity} &#8594; {cancelSuccessInfo.arrivalCity}</div>
                  {dep && <div><strong>Departure:</strong> {dep.toLocaleString()}</div>}
                  {arr && <div><strong>Arrival:</strong> {arr.toLocaleString()}</div>}
                  {estHours > 0 && <div><strong>Estimated Time:</strong> {estH}h {estM}m</div>}
                </div>
              )}
            </div>
            <div style={{
              padding: "20px 28px", borderTop: "1px solid #eee", background: "#fff"
            }}>
              <button onClick={() => setCancelSuccessInfo(null)}
                style={{ width: "100%", padding: "14px", background: "#b00020", color: "white",
                  border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                OK
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Loyalty Welcome Popup */}
      {showLoyaltyWelcome && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(10, 10, 20, 0.85)", zIndex: 11000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(6px)"
        }}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "420px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.35)", overflow: "hidden"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #1a1a2e, #cf102d)",
              padding: "28px 32px", textAlign: "center", color: "#fff"
            }}>
              <div style={{ fontSize: "44px", marginBottom: "8px" }}>&#9992;&#65039;</div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Welcome to the Royal Horizon Airways Family!</h2>
            </div>
            <div style={{ padding: "28px 32px", textAlign: "center" }}>
              <p style={{ fontSize: "16px", color: "#333", marginBottom: "16px", lineHeight: "1.6" }}>
                Thank you for choosing us.
              </p>
              <div style={{ background: "#fff8e1", border: "2px solid #ffcc00", borderRadius: "12px", padding: "16px 20px" }}>
                <p style={{ margin: 0, fontSize: "15px", color: "#8a6d00", fontWeight: "600", lineHeight: "1.6" }}>
                  As a first time gift, users that enroll in the loyalty program get a free <strong>500+ miles!</strong>
                </p>
              </div>
            </div>
            <div style={{ padding: "20px 28px", borderTop: "1px solid #eee", background: "#fff" }}>
              <button onClick={() => setShowLoyaltyWelcome(false)}
                style={{ width: "100%", padding: "14px", background: "#cf102d", color: "white",
                  border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <CreateAccountModal onClose={() => setShowCreateModal(false)} onSuccess={handleRegisterSuccess} />}
      {showEditModal && loggedInUser && <EditAccountModal user={loggedInUser} onClose={() => setShowEditModal(false)} onSaved={handleEditSaved} onAccountDeleted={handleAccountDeleted} />}

      <div className="top-alert">
        Welcome to Royal Horizon Airways — Travel Beyond the Horizon
      </div>

      <nav className="navbar">
        <div className="logo-box">
          <div className="logo">RHA</div>
          <div className="brand-text">Royal Horizon Airways</div>
        </div>
        <ul className="nav-links">
          <li onClick={() => setActiveTab("search")} style={{ cursor: "pointer" }}>BOOK</li>
          <li onClick={() => setActiveTab("manage")} style={{ cursor: "pointer" }}>MANAGE</li>
          <li onClick={async () => { setShowExperienceModal(true); await fetchExperienceRatings(); }} style={{ cursor: "pointer" }}>EXPERIENCE</li>
          <li onClick={async () => { setShowDestinationsModal(true); await fetchDestinations(); }} style={{ cursor: "pointer" }}>WHERE WE FLY</li>
          <li onClick={handleCheckLoyalty} style={{ cursor: "pointer", color: "#ffcc00", fontWeight: "bold" }}>LOYALTY</li>
          {/* Staff Portal link — for Employee and Admin login */}
          
        </ul>
        <div className="nav-right-group">
          {loggedInUser ? (
            <>
              <span className="nav-user-name">{loggedInUser.first_name || loggedInUser.email}</span>
              <button className="nav-edit-btn" onClick={() => setShowEditModal(true)}>Edit Account</button>
              <button className="nav-logout-btn" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <span className="nav-login-link" onClick={() => setActiveTab("login")}>LOG IN</span>
              <button className="nav-register-btn" onClick={() => setShowCreateModal(true)}>Create Account</button>
            </>
          )}
        </div>
      </nav>

      <header className="hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-small">Check our current</p>
            <h1>FLIGHT SCHEDULES</h1>
            <p className="hero-tagline">Travel Beyond the Horizon</p>
            
          </div>
        </div>
      </header>

      <section className="booking-panel">
        {!isSystemAdmin && !isEmployee && (
          <MainTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isPassenger={isPassenger}
            isEmployee={isEmployee}
            isSystemAdmin={isSystemAdmin}
            loggedInUser={loggedInUser}
            loadEmployeePortal={loadEmployeePortal}
          />
        )}

        <div className="panel-content">
          {loggedInUser && (
            <LoggedInBanner
              loggedInUser={loggedInUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setShowEditModal={setShowEditModal}
              handleLogout={handleLogout}
              isSystemAdmin={isSystemAdmin}
              isEmployee={isEmployee}
            />
          )}

          {/* ── Search Flights ── */}
          {activeTab === "search" && (
            <SearchFlightsPanel
              flightSearch={flightSearch}
              handleFlightChange={handleFlightChange}
              handleFlightSubmit={handleFlightSubmit}
              loadingFlights={loadingFlights}
              searchMessage={searchMessage}
              flightResults={flightResults}
              loadingAirports={loadingAirports}
              setActiveTab={setActiveTab}
              setShowCreateModal={setShowCreateModal}
              cities={cities}

              vacationMode={vacationMode}
              setVacationMode={setVacationMode}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
              pkgSearch={pkgSearch}
              setPkgSearch={setPkgSearch}
              pkgCategory={pkgCategory}
              setPkgCategory={setPkgCategory}
              VACATION_PACKAGES={VACATION_PACKAGES}
              PACKAGE_CATEGORIES={PACKAGE_CATEGORIES}
              CATEGORY_STYLES={CATEGORY_STYLES}

              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              getPriceForClass={getPriceForClass}
              handleBookFlight={handleBookFlight}
              handleRedeemFlight={handleRedeemFlight}
              freeFlightMode={freeFlightMode}
              setFreeFlightMode={setFreeFlightMode}

              loggedInUser={loggedInUser}
              isPassenger={isPassenger}
              canBook={canBook}
              loyaltyDiscount={loyaltyDiscount}
            />
          )}

          {/* ── Manage Booking ── */}
          {activeTab === "manage" && (
            <ManageBookingsPanel
              isPassenger={isPassenger}
              loggedInUser={loggedInUser}
              
              // Passenger props
              userBookings={userBookings}
              loadingUserBookings={loadingUserBookings}
              onSearchFlights={() => setActiveTab("search")}
              onCancelBooking={handleCancelBooking}

              // Editing props (shared)
              isEditingPrefs={isEditingPrefs}
              setIsEditingPrefs={setIsEditingPrefs}
              prefData={prefData}
              setPrefData={setPrefData}
              handleUpdatePreferences={handleUpdatePreferences}
              actionMsg={actionMsg}
              setActiveTab={setActiveTab}
            />
          )}

          {/* ── Flight Status ── */}
          {activeTab === "status" && (
            <FlightStatusPanel
              statusData={statusData}
              handleStatusChange={handleStatusChange}
              handleStatusSubmit={handleStatusSubmit}
              loadingStatus={loadingStatus}
              statusMessage={statusMessage}
              statusResult={statusResult}
            />
          )}

          {/* ── Employee Dashboard ── */}
          {activeTab === "employee" && isEmployee && !isSystemAdmin && (
            <EmployeeDashboard
              setActiveTab={setActiveTab}
              setIsEditingPrefs={setIsEditingPrefs}
              prefData={prefData}
              setPrefData={setPrefData}
              handleUpdatePreferences={handleUpdatePreferences}

              // Passengers
              flightManifestSearch={flightManifestSearch}
              setFlightManifestSearch={setFlightManifestSearch}
              flightManifest={flightManifest}
              loadingFlightManifest={loadingFlightManifest}
              flightManifestMsg={flightManifestMsg}
              handleFlightManifestSearch={handleFlightManifestSearch}

              // Bookings
              searchByUserId={searchByUserId}
              searchByName={searchByName}
              setSearchByUserId={setSearchByUserId}
              setSearchByName={setSearchByName}
              searchResults={searchResults}
              handleSearchBookings={handleSearchBookings}
              isEditingPrefs={isEditingPrefs}
              setSelectedPassenger={setSelectedPassenger}
              handlePassengerSearch={handlePassengerSearch}
              passengerSuggestions={passengerSuggestions}
              setPassengerSuggestions={setPassengerSuggestions}
              selectedPassenger={selectedPassenger}

              // Routes
              routesWithStatus={routesWithStatus}
              loadingRoutesStatus={loadingRoutesStatus}
              fetchRoutesWithStatus={fetchRoutesWithStatus}
              routeMsg={routeMsg}
              handleToggleRouteStatus={handleToggleRouteStatus}
              fetchRouteFlights={fetchRouteFlights}
              fetchReports={fetchReports}
              loadingReports={loadingReports}
              reports={reports}
            />
          )}

          {/* ── System Admin Dashboard ── */}
          {activeTab === "systemAdmin" && isSystemAdmin && (
            <SystemAdminDashboard
              setActiveTab={setActiveTab}
              setIsEditingPrefs={setIsEditingPrefs}
              prefData={prefData}
              setPrefData={setPrefData}
              handleUpdatePreferences={handleUpdatePreferences}
              airlines={airlines}
              fetchAirlines={fetchAirlines}
              airports={airports}
              API={API}
              getAuthHeaders={getAuthHeaders}

              // Passengers
              flightManifestSearch={flightManifestSearch}
              setFlightManifestSearch={setFlightManifestSearch}
              flightManifest={flightManifest}
              loadingFlightManifest={loadingFlightManifest}
              flightManifestMsg={flightManifestMsg}
              handleFlightManifestSearch={handleFlightManifestSearch}

              // Bookings
              searchByUserId={searchByUserId}
              searchByName={searchByName}
              setSearchByUserId={setSearchByUserId}
              setSearchByName={setSearchByName}
              searchResults={searchResults}
              handleSearchBookings={handleSearchBookings}
              isEditingPrefs={isEditingPrefs}
              setSelectedPassenger={setSelectedPassenger}
              handlePassengerSearch={handlePassengerSearch}
              passengerSuggestions={passengerSuggestions}
              setPassengerSuggestions={setPassengerSuggestions}
              selectedPassenger={selectedPassenger}
              handleCancelBooking={handleCancelBooking}

              // Routes
              routesWithStatus={routesWithStatus}
              loadingRoutesStatus={loadingRoutesStatus}
              fetchRoutesWithStatus={fetchRoutesWithStatus}
              routeMsg={routeMsg}
              handleToggleRouteStatus={handleToggleRouteStatus}
              fetchRouteFlights={fetchRouteFlights}

              // Aircraft
              allAircrafts={allAircrafts}
              loadingAircrafts={loadingAircrafts}
              fetchAllAircrafts={fetchAllAircrafts}
              inlineAircraftEdit={inlineAircraftEdit}
              setInlineAircraftEdit={setInlineAircraftEdit}
              handleInlineAircraftUpdate={handleInlineAircraftUpdate}
              aircraftMsg={aircraftMsg}

              // Admin Actions (CRUD)
              crudAction={crudAction}
              setCrudAction={setCrudAction}
              crudData={crudData}
              setCrudData={setCrudData}
              handleCrudSubmit={handleCrudSubmit}
              crudMsg={crudMsg}
              actionMsg={actionMsg}
              fetchReports={fetchReports}
              setCrudMsg={setCrudMsg}
              loadingReports={loadingReports}
              reports={reports}

              // Staff Management
              allStaff={allStaff}
              fetchAllStaff={fetchAllStaff}
              newStaffData={newStaffData}
              handleNewStaffChange={handleNewStaffChange}
              handleCreateStaff={handleCreateStaff}
              staffManageMessage={staffManageMessage}
              handleDeleteStaff={handleDeleteStaff}
              loggedInUser={loggedInUser}
            />
          )}


          {/* ── Login ── */}
          {activeTab === "login" && !loggedInUser && (
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <h2>Royal Horizon Airways Login</h2>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} placeholder="Enter your email" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} placeholder="Enter your password" required />
              </div>
              {/* Removed role dropdown, login on main page is for Passengers only */}
              <button type="submit" className="primary-btn">{loadingLogin ? "Logging in..." : "Log In"}</button>
              {loginMessage && (
                <p style={{ marginTop: "14px", fontSize: "18px", color: loginMessage.includes("successful") || loginMessage.includes("created") ? "#1a6e3c" : "#cf102d" }}>{loginMessage}</p>
              )}
              <p style={{ marginTop: "16px", fontSize: "15px", color: "#666" }}>
                Don't have an account?{" "}
                <span style={{ color: "#cf102d", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }} onClick={() => setShowCreateModal(true)}>Create one here</span>
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;

