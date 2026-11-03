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
    loadCartFromStorage();
    generateVenueModel();
    renderVenueMap();
    setupEventListeners();
    renderCart();
});

function generateVenueModel() {
    venueData.forEach(zone => {
        for (let r = 1; r <= zone.rows; r++) {
            for (let c = 1; c <= zone.cols; c++) {
                const seatId = `${zone.id}-R${r}-S${c}`;
                const isUnavailable = unavailableSeats.includes(seatId);
                seatsModel[seatId] = {
                    id: seatId, zoneName: zone.name, row: r, col: c, price: zone.price,
                    status: isUnavailable ? 'unavailable' : (cart.includes(seatId) ? 'in-cart' : 'available')
                };
            }
        }
    });
}

function renderVenueMap() {
    const venueContainer = document.getElementById('venue-zones');
    venueContainer.innerHTML = '';
    venueData.forEach(zone => {
        const zoneDiv = document.createElement('div');
        zoneDiv.className = 'zone-container';
        const title = document.createElement('div');
        title.className = 'zone-title';
        title.innerText = `${zone.name} - $${zone.price}`;
        zoneDiv.appendChild(title);
        const gridDiv = document.createElement('div');
        gridDiv.className = 'seat-grid';
        for (let r = 1; r <= zone.rows; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            for (let c = 1; c <= zone.cols; c++) {
                const seatId = `${zone.id}-R${r}-S${c}`;
                const seatData = seatsModel[seatId];
                const seatBtn = document.createElement('button');
                seatBtn.className = `seat ${seatData.status}`;
                seatBtn.dataset.id = seatId;
                seatBtn.title = `${seatData.zoneName}, Row ${r}, Seat ${c} - $${seatData.price}`;
                if (seatData.status === 'unavailable') seatBtn.disabled = true;
                rowDiv.appendChild(seatBtn);
            }
            gridDiv.appendChild(rowDiv);
        }
        zoneDiv.appendChild(gridDiv);
        venueContainer.appendChild(zoneDiv);
    });
}

function handleSeatClick(seatId) {
    const seatData = seatsModel[seatId];
    if (seatData.status === 'unavailable' || seatData.status === 'in-cart') return;

    if (inspectedSeatId && seatsModel[inspectedSeatId].status === 'inspected') {
        seatsModel[inspectedSeatId].status = 'available';
        updateSeatUI(inspectedSeatId);
    }

    inspectedSeatId = seatId;
    seatsModel[seatId].status = 'inspected';
    updateSeatUI(seatId);

    const inspectionDetails = document.getElementById('inspection-details');
    inspectionDetails.innerHTML = `
        <div class="inspect-info">
            <p><strong>Zone:</strong> ${seatData.zoneName}</p>
            <p><strong>Row:</strong> ${seatData.row} | <strong>Seat:</strong> ${seatData.col}</p>
            <p><strong>Price:</strong> <span class="highlight-text">$${seatData.price}</span></p>
        </div>
    `;
    document.getElementById('btn-add-cart').disabled = false;
}

function updateSeatUI(seatId) {
    const seatElement = document.querySelector(`.seat[data-id="${seatId}"]`);
    if (seatElement) seatElement.className = `seat ${seatsModel[seatId].status}`;
}

function setupEventListeners() {
    document.getElementById('venue-map').addEventListener('click', (e) => {
        if (e.target.classList.contains('seat')) handleSeatClick(e.target.dataset.id);
    });
    document.getElementById('btn-add-cart').addEventListener('click', addToCart);
    document.getElementById('btn-zoom-in').addEventListener('click', () => zoom(ZOOM_STEP));
    document.getElementById('btn-zoom-out').addEventListener('click', () => zoom(-ZOOM_STEP));
    document.getElementById('btn-move-up').addEventListener('click', () => pan(0, PAN_STEP));
    document.getElementById('btn-move-down').addEventListener('click', () => pan(0, -PAN_STEP));
    document.getElementById('btn-move-left').addEventListener('click', () => pan(PAN_STEP, 0));
    document.getElementById('btn-move-right').addEventListener('click', () => pan(-PAN_STEP, 0));
    document.getElementById('btn-reset').addEventListener('click', resetView);
}

function addToCart() {
    if (!inspectedSeatId || cart.includes(inspectedSeatId)) return;
    
    cart.push(inspectedSeatId);
    seatsModel[inspectedSeatId].status = 'in-cart';
    updateSeatUI(inspectedSeatId);
    
    inspectedSeatId = null;
    document.getElementById('inspection-details').innerHTML = `<p class="empty-message">Click on an available seat on the map to inspect its details.</p>`;
    document.getElementById('btn-add-cart').disabled = true;
    saveAndRenderCart();
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<li class="empty-message">Your cart is empty.</li>`;
    } else {
        cart.forEach(seatId => {
            const seat = seatsModel[seatId];
            if (!seat) return;
            total += seat.price;
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-details">
                    <span class="cart-item-title">${seat.zoneName} (${seat.id})</span>
                    <span class="cart-item-price">$${seat.price}</span>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${seat.id}')">Remove</button>
            `;
            cartItemsContainer.prepend(li);
        });
    }
    document.getElementById('cart-total').innerText = `$${total}`;
}

function removeFromCart(seatId) {
    const index = cart.indexOf(seatId);
    if (index > -1) {
        cart.splice(index, 1);
        seatsModel[seatId].status = 'available';
        updateSeatUI(seatId);
        if (inspectedSeatId === seatId) inspectedSeatId = null; 
        saveAndRenderCart();
    }
}

function saveAndRenderCart() {
    localStorage.setItem('venueCart', JSON.stringify(cart));
    renderCart();
}

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('venueCart');
        if (saved) {
            const parsedCart = JSON.parse(saved);
            cart = parsedCart.filter(id => !unavailableSeats.includes(id));
            if (cart.length !== parsedCart.length) {
                localStorage.setItem('venueCart', JSON.stringify(cart));
            }
        }
    } catch (error) {
        cart = [];
        localStorage.removeItem('venueCart');
    }
}

function applyMapTransform() {
    const mapEl = document.getElementById('venue-map');
    if (mapEl) 
        mapEl.style.transform = `translate(${mapTranslateX}px, ${mapTranslateY}px) scale(${mapScale})`;
}

function zoom(amount) {
    mapScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, mapScale + amount));
    applyMapTransform();
}

function pan(x, y) {
    mapTranslateX += x; 
    mapTranslateY += y; 
    applyMapTransform();
}

function resetView() {
    mapScale = 1; 
    mapTranslateX = 0; 
    mapTranslateY = 0; 
    applyMapTransform();
}