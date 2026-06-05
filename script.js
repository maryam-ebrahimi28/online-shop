let counter = document.getElementById("counter");
const addToCart = document.querySelectorAll(".add-to-cart");
const cartList = document.getElementById("cart-list");
const totalPriceEl = document.getElementById("price-to-pay");
const clearCartBtn = document.getElementById("clear-cart-btn");

let cart = [];
let total = 0;

function toEnglishDigits(str) {
    return str.toString()
        .replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
        .replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
}

function cleanNumber(value) {
    if (typeof value === "number") return value;
    return Number(
        toEnglishDigits(value)
            .replace(/,/g, "")
            .replace(/٬/g, "")
            .replace(/[^\d]/g, "")
    ) || 0;
}

function saveCartToLocalStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cartList.innerHTML = "";
        cart.forEach(product => {
            createCartItem(product);
        });
    }
    updateCartInfo();
}

function showEmptyCartMessage() {
    if (cart.length === 0) {
        cartList.innerHTML = `<p class="empty-cart-message">سبد خرید خالی است</p>`;
    } else {
        const emptyMessage = cartList.querySelector(".empty-cart-message");
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
}

function createCartItem(product) {
    const items = document.createElement("div");
    items.className = "items";
    items.dataset.id = product.id;
    items.innerHTML = `
        <div class="info-product">
            <h4>${product.title}</h4>
            <p>${product.price.toLocaleString()} تومان</p>
        </div>
        <div class="quantity-controls">
            <button class="decrease-btn">-</button>
            <span class="quantity-val">${product.quantity}</span>
            <button class="increase-btn">+</button>
        </div>
    `;
    cartList.appendChild(items);
    items.querySelector(".increase-btn").addEventListener("click", () => increaseQuantity(product.id));
    items.querySelector(".decrease-btn").addEventListener("click", () => decreaseQuantity(product.id));
}

function addBtn() {
    addToCart.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            let productCard = btn.closest(".product-item");
            let id = productCard.dataset.id;
            let name = productCard.querySelector(".product-name").textContent;
            let priceText = productCard.querySelector(".product-price").textContent;
            let price = cleanNumber(priceText);
            let existingProduct = cart.find(p => p.id === id);
            if (existingProduct) {
                increaseQuantity(id);
                return;
            }
            let product = { id, title: name, price, quantity: 1 };
            cart.push(product);
            createCartItem(product);
            updateCartInfo();
        });
    });
}

function increaseQuantity(id) {
    let product = cart.find(p => p.id === id);
    if (!product) return;
    product.quantity++;
    let cartItem = cartList.querySelector(`[data-id="${id}"]`);
    cartItem.querySelector(".quantity-val").textContent = product.quantity;
    updateCartInfo();
}

function decreaseQuantity(id) {
    let product = cart.find(p => p.id === id);
    if (!product) return;
    product.quantity--;
    if (product.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);
        let cartItem = cartList.querySelector(`[data-id="${id}"]`);
        if (cartItem) cartItem.remove();
        updateCartInfo();
        return;
    }
    let cartItem = cartList.querySelector(`[data-id="${id}"]`);
    cartItem.querySelector(".quantity-val").textContent = product.quantity;
    updateCartInfo();
}

function updateCartInfo() {
    counter.textContent = cart.length;
    total = cart.reduce((sum, product) => {
        return sum + (product.price * product.quantity);
    }, 0);
    totalPriceEl.textContent = total.toLocaleString() + " تومان";
    showEmptyCartMessage();
    saveCartToLocalStorage();
}

function clearCart() {
    cart = [];
    cartList.innerHTML = "";
    localStorage.removeItem("cart");
    updateCartInfo();
}

clearCartBtn.addEventListener("click", clearCart);
addBtn();
loadCartFromLocalStorage();
