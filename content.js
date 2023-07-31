// content.js
const myList = [];

function clickButton(selector) {
    const button = document.querySelector(selector);
    if (button) {
      button.click();
    }
}
  
function waitForElementToBeClickable(selector, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
  
      function checkElement() {
        try {
          const element = document.querySelector(selector);
          if (element) {
            resolve(element);
          } else if (Date.now() - startTime >= timeout) {
            resolve(null);
          } else {
            setTimeout(checkElement, 100);
          }
        } catch (error) {
          resolve(null);
        }
      }
  
      checkElement();
    });
}
  
function waitForElementToBeReady(selector, timeout) {
    return new Promise((resolve) => {
      const startTime = Date.now();
  
      function checkElement() {
        try {
          const element = document.querySelector(selector);
          if (element && element.innerText.trim() !== "") {
            resolve(element);
          } else if (Date.now() - startTime >= timeout) {
            resolve(null);
          } else {
            setTimeout(checkElement, 100);
          }
        } catch (error) {
          resolve(null);
        }
      }
  
      checkElement();
    });
}
  
  
async function buyItem() {
  while (true) {
    try {
      const quantityLeftMessage = await waitForElementToBeReady('div.font-caption-body', 1000);
      if (quantityLeftMessage && quantityLeftMessage.innerText.includes(" 0/")) {
        return;
      }

      const itemPrice = await waitForElementToBeReady('div.item-price-value span.text', 1000);
      if (!itemPrice || itemPrice.innerText !== "Free") {
        return;
      }

      const buyButton = await waitForElementToBeClickable('button.btn-growth-lg.btn-fixed-width-lg.PurchaseButton', 1000);
      if (!buyButton) {
        return;
      }
      buyButton.click();

      const confirmationButton = await waitForElementToBeClickable('.modal-button', 1000);
      if (!confirmationButton) {
        return;
      }
      confirmationButton.click();
    } catch (error) {
      console.error(error.message);
      return;
    }
  }
}


async function checkListener() {
  const refreshButton = await waitForElementToBeClickable('span#refresh-details-button', 1000);
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      buyItem();
    });
  }
};
buyItem();
checkListener();