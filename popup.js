document.getElementById("buyItem").addEventListener("click", async function () {
  const itemID = document.getElementById("itemID").value.trim();
  if (itemID === "") {
    alert("Please enter a valid Roblox Item ID.");
  } else {
    chrome.runtime.sendMessage({ action: "buyItem", itemID: itemID });
  }
});

document.getElementById("resetIDs").addEventListener("click", function () {
chrome.runtime.sendMessage({ action: "resetIDs"});
});  

document.getElementById("showIDs").addEventListener("click", function () {
chrome.runtime.sendMessage({ action: "showIDs"});
}); 

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  alert(message.message)
});
