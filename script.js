let counter = document.getElementById("counter");
const addToCart = document.querySelectorAll(".add-to-cart");
const cartList = document.getElementById("cart-list");
const totalPriceEl = document.getElementById("price-to-pay");
const clearCartBtn = document.getElementById("clear-cart-btn");

let cart = [];
let total = 0;

function toPersianDigits(n) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

function convertAllNumbersInPage() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    
    while (node = walker.nextNode()) {
        const parent = node.parentElement;
        if (parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE' && parent.tagName !== 'INPUT' && parent.tagName !== 'TEXTAREA') {
            if (/\d/.test(node.nodeValue)) {
                node.nodeValue = toPersianDigits(node.nodeValue);
            }
        }
    }
}

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
};

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
};

function createCartItem(product) {
    const items = document.createElement("div");
    items.className = "items";
    items.dataset.id = product.id;

    items.innerHTML = `
        <div class="info-product">
            <h4>${product.title}</h4>
            <p>${cleanNumber(product.price).toLocaleString("fa-IR")} تومان</p>
        </div>

        <div class="quantity-controls">
            <button class="decrease-btn">-</button>
            <span class="quantity-val">${toPersianDigits(cleanNumber(product.quantity))}</span>
            <button class="increase-btn">+</button>
        </div>
    `;

    cartList.appendChild(items);

    const increaseBtn = items.querySelector(".increase-btn");
    const decreaseBtn = items.querySelector(".decrease-btn");

    increaseBtn.addEventListener("click", function () {
        increaseQuantity(product.id);
    });

    decreaseBtn.addEventListener("click", function () {
        decreaseQuantity(product.id);
    });
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

            let product = {
                id: id,
                title: name,
                price: price,
                quantity: 1
            };

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
    let quantityVal = cartItem.querySelector(".quantity-val");

    quantityVal.textContent = toPersianDigits(product.quantity);

    updateCartInfo();
}

function decreaseQuantity(id) {
    let product = cart.find(p => p.id === id);

    if (!product) return;

    product.quantity--;

    if (product.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);

        let cartItem = cartList.querySelector(`[data-id="${id}"]`);

        if (cartItem) {
            cartItem.remove();
        }

        updateCartInfo();
        return;
    }

    let cartItem = cartList.querySelector(`[data-id="${id}"]`);
    let quantityVal = cartItem.querySelector(".quantity-val");

    quantityVal.textContent = toPersianDigits(product.quantity);

    updateCartInfo();
}

function updateCartInfo() {
    counter.textContent = toPersianDigits(cart.length);

    total = cart.reduce((sum, product) => {
        const price = cleanNumber(product.price);
        const quantity = cleanNumber(product.quantity);

        return sum + price * quantity;
    }, 0);

    totalPriceEl.textContent = total.toLocaleString("fa-IR") + " تومان";

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
