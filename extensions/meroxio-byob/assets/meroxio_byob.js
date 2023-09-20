const productAllowedValue = document.querySelector('.merox-product-wrapper').getAttribute('productallowed');
const placeholderImage = document.querySelector('.merox-product-wrapper').getAttribute('placeholderImage');
const bundledProductId = document.querySelector('.merox-product-wrapper').getAttribute('bundledProductId');
const themeCurrency = document.querySelector('.merox-product-wrapper').getAttribute('themeCurrency');
const totalPriceCount = document.querySelector('#totalPrice');
const actualPrice = parseFloat(document.querySelector('#actualPrice').getAttribute('actualprice'));
const savedMoneyPercent = document.querySelector('#savedMoneyPercent');
const buttons = document.querySelectorAll('.add-to-bundle');
const atcButton = document.querySelector('#bundaledAddToCart');
const openDialogButton = document.getElementById('open-dialog');
const closeDialogButton = document.getElementById('close-dialog');
const myDialog = document.getElementById('my-dialog');
const selectBoxes = document.querySelectorAll('.m-variant-dropdown');
const removeProductFromNavigationBarBtn = document.querySelectorAll('.removeProductFromNavigationBar');
const newHTML = `<div class="m-empty" productid="" productprice="" productpriceinteger="">
<img loading="lazy" width="80" height="80" class="merox-product-img" src="${placeholderImage}" alt="">
<span class="selectedProductPrice"></span>
<span class="removeProductFromNavigationBar">✕</span>
</div>`;
const targetElement = document.querySelector('.sticky-nav-images');

// Add product to navigation
function addProductToNavigation(productId, productImage, productPrice, productPriceInteger, productTitle, productvariantname) {
    const emptyImage = document.querySelector('.m-empty img');
    if (emptyImage) {
        emptyImage.src = productImage;
        emptyImage.parentElement.setAttribute('productId', productId);
        emptyImage.parentElement.setAttribute('productPrice', productPrice);
        emptyImage.parentElement.setAttribute('productPriceInteger', productPriceInteger);
        emptyImage.parentElement.setAttribute('productTitle', productTitle);
        emptyImage.parentElement.setAttribute('productvariantname', productvariantname);
        emptyImage.parentElement.classList.remove('m-empty');
        emptyImage.parentElement.classList.add('selectedProduct');
        emptyImage.parentElement.querySelector('.selectedProductPrice').textContent = `${themeCurrency} ${productPriceInteger}`;
    }
}

// Remove product to navigation
function removeProductFromNavigation(productId) {
    const selectedProducts = document.querySelectorAll('.selectedProduct');
    let removed = false;
    for (let i = 0; i < selectedProducts.length; i++) {
        const selectedProductId = selectedProducts[i].getAttribute('productid');
        if (selectedProductId == productId) {
            selectedProducts[i].classList.remove('selectedProduct');
            selectedProducts[i].classList.add('m-empty');
            selectedProducts[i].querySelector('img').setAttribute('src', placeholderImage);
            selectedProducts[i].removeAttribute('productid');
            selectedProducts[i].removeAttribute('productprice');
            selectedProducts[i].removeAttribute('productpriceinteger');
            selectedProducts[i].removeAttribute('producttitle');
            selectedProducts[i].querySelector('.selectedProductPrice').textContent = "";
            removed = true;
            break;
        }
    }
}
// Clear All Product
function clearAllProductFromNavigation() {
    const selectedProducts = document.querySelectorAll('.selectedProduct');
    for (let i = 0; i < selectedProducts.length; i++) {
        selectedProducts[i].classList.remove('selectedProduct');
        selectedProducts[i].classList.add('m-empty');
        selectedProducts[i].querySelector('img').setAttribute('src', placeholderImage);
        selectedProducts[i].removeAttribute('productid');
        selectedProducts[i].removeAttribute('productprice');
        selectedProducts[i].removeAttribute('productpriceinteger');
        selectedProducts[i].removeAttribute('producttitle');
        selectedProducts[i].querySelector('.selectedProductPrice').textContent = "";
        totalPriceCount.textContent = "";
        
    }
}

atcButton.addEventListener("click", function() {
    const btn = document.getElementById('bundaledAddToCart');
    const spinner = document.getElementById('m_spinner');
    const btnText = document.getElementById('btnText');
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    const selectedProducts = document.querySelectorAll('.selectedProduct');
    const props = {};
    selectedProducts.forEach((product, index) => {
        const propTitle = product.getAttribute("producttitle");
        const propvariantname = product.getAttribute("productvariantname");
        if (propvariantname === "DEFAULT TITLE") {
            props[`Product ${index + 1}`] = `${propTitle}`;
        } else {
            props[`Product ${index + 1}`] = `${propTitle} || ${propvariantname}`;
        }
    });
    
    bundaledAddToCart(bundledProductId, this, props)
});

closeDialogButton.addEventListener('click', () => {
    myDialog.close();
});

// const clear_btn = document.getElementById('clearAllProduct');
// clear_btn.addEventListener("click", function() {
//     savedMoneyPercent.textContent = "";
//     atcButton.disabled = true;
//     const qtyElements = document.querySelectorAll(".qty");
//     qtyElements.forEach(function(element) {
//         element.value = 0;
//     });
//     clearAllProductFromNavigation();
// });
document.body.addEventListener('click', event => {
    if (event.target.matches('#clearAllProduct')) {
        savedMoneyPercent.textContent = "";
        atcButton.disabled = true;
        const qtyElements = document.querySelectorAll(".qty");
        qtyElements.forEach(function(element) {
            element.value = 0;
        });
        clearAllProductFromNavigation();
    }
  });

buttons.forEach(button => {
        button.addEventListener('click', function() {   
        const productImage = button.parentElement.parentElement.querySelector(".merox-product-img").getAttribute("src");
        const productId = button.closest(".merox-product-item").getAttribute("productid");
        const productPrice = button.closest(".merox-product-item").getAttribute("productPrice");
        const productPriceInteger = button.closest(".merox-product-item").getAttribute("productPriceInteger");
        const productTitle = button.closest(".merox-product-item").getAttribute("productTitle");
        const productvariantname = button.closest(".merox-product-item").getAttribute("productvariantname");
        
        if (document.querySelectorAll('.selectedProduct').length === parseInt(productAllowedValue)) {
            myDialog.showModal();
            return;
        }
        button.classList.add('bundleBtnSpinner');
        button.parentElement.classList.add('bundleBtnSpinnerWrapper');
        button.classList.remove('add-to-bundle');
        button.textContent=""
        setTimeout(() => {
            button.classList.remove('bundleBtnSpinner');
            button.parentElement.classList.remove('bundleBtnSpinnerWrapper');
            button.classList.add('add-to-bundle');
            button.textContent = "Add To Bundle"; // Restore the original text content
        }, 500);
        addProductToNavigation(productId, productImage, productPrice, productPriceInteger, productTitle, productvariantname);
        if (document.querySelectorAll('.selectedProduct').length === parseInt(productAllowedValue)) {
            atcButton.disabled = false;
            
            const selectedProducts = document.querySelectorAll('.selectedProduct');
            
            const totalPrice = Array.from(selectedProducts)
                .map(selectedProduct => parseFloat(selectedProduct.getAttribute('productpriceinteger')))
                .reduce((accumulator, price) => accumulator + price, 0)
                .toFixed(2);
            
            
            const saved = (totalPrice - actualPrice).toFixed(2);
            const savedPercentage = Math.round((saved / totalPrice) * 100);
            
            if (totalPrice > actualPrice) {
                totalPriceCount.textContent = `${themeCurrency} ${totalPrice}`;
                savedMoneyPercent.textContent = `You save ${savedPercentage}%`;
            } else {
                totalPriceCount.textContent = "";
                savedMoneyPercent.textContent = "";
            }
        }
    });
});

// Get all select boxes with class ".m-variant-dropdown"
selectBoxes.forEach(function(selectBox) {
  selectBox.addEventListener('change', function() {
    let selectedOption = this.options[this.selectedIndex];
    let variantPrice = selectedOption.getAttribute('variantprice');
    let variantTitle = selectedOption.getAttribute('variantTitle');
    let variantId = selectedOption.getAttribute('variantId');
    selectBox.parentElement.parentElement.setAttribute('productPriceInteger', variantPrice);
    selectBox.parentElement.parentElement.setAttribute('productvariantname', variantTitle);
    selectBox.parentElement.parentElement.setAttribute('productid', variantId);
    selectBox.parentElement.parentElement.querySelector('.productItemPrice').textContent=`${themeCurrency} ${variantPrice}`
  });
});

// work fine below code also
document.body.addEventListener('click', event => {
    if (event.target.matches('.removeProductFromNavigationBar')) {
      event.target.parentElement.remove();
      targetElement.insertAdjacentHTML('beforeend', newHTML);
      atcButton.disabled = true;
      totalPriceCount.textContent = "";
      savedMoneyPercent.textContent = "";
    }
});
  
  
  
  
