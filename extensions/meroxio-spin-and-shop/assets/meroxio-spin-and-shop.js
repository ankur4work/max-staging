document.addEventListener("DOMContentLoaded", function() {
"use strict";

  const spin_btn = document.querySelector("#spinButton-jackpot");
  const listContainer = document.querySelector(".list-jackpot");
  const listItems = listContainer.querySelectorAll("li");
  const totalItems = listItems.length;
  let dealPrice = document.querySelector("#deal-price-jackpot").textContent
  const addToCartButton = document.querySelector("#add-to-cart-button-jackpot");

  let totalPrice = 0;
  let itemHeight = 200;
  if (window.innerWidth < 768) {
    itemHeight = 180;
  }

  if (spin_btn) {
    spin_btn.addEventListener("click", function(e) {
      const slots = document.querySelectorAll(".slot-jackpot");
      addToCartButton.setAttribute("disabled",true)
      let indices = Array.from({
        length: totalItems
      }, (_, i) => i);

      slots.forEach(slot => {
        const list = slot.querySelector(".list-jackpot");
        const randomIndex = Math.floor(Math.random() * indices.length);
        const chosenIndex = indices[randomIndex];
        indices = indices.filter((_, i) => i !== randomIndex);

        const offset = - chosenIndex * itemHeight;
        list.style.top = `${offset}px`;

        list.addEventListener("transitionend", () => {
          const activeItem = list.children[chosenIndex];
          const previousActiveItem = slot.querySelector(".selectedProduct");
          if (previousActiveItem) {
            previousActiveItem.classList.remove("selectedProduct");
          }
          activeItem.classList.add("selectedProduct");
          totalPrice = 0;
          const items = document.querySelectorAll(".selectedProduct .product-price-jackpot[data-price]");
          items.forEach(function(element) {
            const price = parseFloat(element.getAttribute("data-price"));
            if (!isNaN(price)) {
              totalPrice += price;
            }
          });
          const slotComparePrice = document.querySelector("#mrp-price-jackpot");
          if (slotComparePrice) {
            slotComparePrice.textContent = `MRP : ₹${totalPrice}`;
          }
          const normalPrice = document.querySelector(".normalPrice-jackpot");
          if (normalPrice) {
            if (dealPrice > totalPrice) {
              normalPrice.textContent = '';
              slotComparePrice.textContent = '';
              normalPrice.style.display = 'none';
            } else {
              normalPrice.style.display = 'block';
            }
          }
          const saveAmt = totalPrice - dealPrice;
          const discountPercentage = (totalPrice - dealPrice) / totalPrice;
          const finalDiscountPercentage = discountPercentage * 100;
          const slotSaveAmt = document.querySelector("#save-price-jackpot");
          if (slotSaveAmt) {
            slotSaveAmt.textContent = `You Save : ₹${Math.ceil(saveAmt)} (${Math.ceil(finalDiscountPercentage)}% Off)`;
          }
          addToCartButton.removeAttribute("disabled")

        }, {once: true});
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
const actualProductId = document.querySelector("#spin-and-shop").getAttribute("data-actual-product");

  const addToCartButton = document.querySelector("#add-to-cart-button-jackpot");
  const goToCartButton = document.querySelector("#go-to-cart-button-jackpot");
  goToCartButton.addEventListener('click',(event) => {
    window.location.href = '/cart';
  });
  addToCartButton.addEventListener('click', async (event) => {
    try {
      addToCartButton.classList.add("active")
      const props = {};
      const selectedProducts = document.querySelectorAll(".selectedProduct");
      selectedProducts.forEach((product, index) => {
        const propTitle = product.getAttribute("data-title");
        props[`Product ${index + 1}`] = `${propTitle}`;
      });
      const requestData = {
        quantity: 1,
        id: actualProductId,
        properties: props
      };
  
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        const data = await response.json();
        addToCartButton.classList.remove("active");
        addToCartButton.classList.add("hide");
        goToCartButton.classList.add("show");
        // window.location.href = '/cart';
      } else {
        addToCartButton.classList.remove("active");
        addToCartButton.classList.add("hide");
        goToCartButton.classList.add("show");
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  const popupInner = document.querySelector(".spin-and-shop-container")
  const jackpotModal = document.querySelector("#spin-and-shop");
  const jackpotCloseButton = document.querySelector("#jackpot-close-button");
  const jackpotIcon =  document.querySelector("#jackpot-icon");
  const jackpotOpenModal = document.querySelector("#jackpotOpenModal");
  jackpotIcon.addEventListener("click",function(){
    jackpotModal.showModal();
     popupInner.classList.add("active"); 
     setTimeout(() => {
      const spin_btn = document.querySelector("#spinButton-jackpot");
      if (spin_btn) {
        spin_btn.click();
      }
    }, 500); 
    })
  jackpotOpenModal.addEventListener("click",function(){
    jackpotModal.showModal();
     popupInner.classList.add("active");  
     setTimeout(() => {
      const spin_btn = document.querySelector("#spinButton-jackpot");
      if (spin_btn) {
        spin_btn.click();
      }
    }, 500); 
    })

  jackpotModal.addEventListener("click", function(e) {
    if(e.target.id==="spin-and-shop"){
      popupInner.classList.remove("active");  
      setTimeout(function() {
        jackpotModal.close();
    }, 300);
    }
  });
  jackpotCloseButton.addEventListener("click", function(e) {
      popupInner.classList.remove("active");  
      setTimeout(function() {
        jackpotModal.close();
    }, 300);
  });
  document.querySelector("#spinButton-jackpot").addEventListener("touchstart", function(event) {
      document.querySelector("#spin-up-jackpot").style.display = "none";
      document.querySelector("#spin-down-jackpot").style.display = "block";
  });
  
  document.querySelector("#spinButton-jackpot").addEventListener("touchend", function(event) {
      document.querySelector("#spin-down-jackpot").style.display = "none";
      document.querySelector("#spin-up-jackpot").style.display = "block";
  });
  
  document.querySelector("#spinButton-jackpot").addEventListener("mousedown", function(event) {
      document.querySelector("#spin-up-jackpot").style.display = "none";
      document.querySelector("#spin-down-jackpot").style.display = "block";
  });
  
  document.querySelector("#spinButton-jackpot").addEventListener("mouseup", function(event) {
      document.querySelector("#spin-down-jackpot").style.display = "none";
      document.querySelector("#spin-up-jackpot").style.display = "block";
  });
  })
   