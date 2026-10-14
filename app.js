const venueData = [
    { id: 'VIP', name: 'VIP Front', price: 150, rows: 4, cols: 12 },
    { id: 'REG', name: 'General Admission', price: 85, rows: 6, cols: 16 },
    { id: 'BAL', name: 'Balcony', price: 50, rows: 5, cols: 14 }
];
const unavailableSeats = [
    'VIP-R1-S3', 'VIP-R1-S4', 'VIP-R3-S10', 'VIP-R3-S11',
    'REG-R2-S5', 'REG-R2-S6', 'REG-R5-S15', 'REG-R5-S16',
    'BAL-R1-S7', 'BAL-R1-S8', 'BAL-R4-S1', 'BAL-R5-S13', 'BAL-R5-S14'
];

let seatsModel = {}; 
let cart = [];       
let inspectedSeatId = null;

let mapScale = 1; let mapTranslateX = 0; let mapTranslateY = 0;
const PAN_STEP = 50; const ZOOM_STEP = 0.2; 
const MIN_ZOOM = 0.4; const MAX_ZOOM = 3;

document.addEventListener('DOMContentLoaded', () => {
    
});