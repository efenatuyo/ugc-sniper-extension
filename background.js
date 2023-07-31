let myList = [];
let already_running = [];
let already_bought = [];
const STORAGE_KEY = "xolo_list";

function initializeMyList() {
  chrome.storage.local.get([STORAGE_KEY], function (data) {
    myList = data[STORAGE_KEY] || [];
    processItemDetails();
  });
}

chrome.runtime.onInstalled.addListener(initializeMyList);

async function getItemDetails(itemID) {
  const url = `https://economy.roblox.com/v2/assets/${itemID}/details`;
  const headers = {
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive'
  };
  try {
    const response = await fetch(url, { headers });
    if (response.status === 200) {
      const item = await response.json();
      if (!item) {
        return;
      }

      const info = {
        price: item.PriceInRobux || 0,
        item_id: parseInt(item.AssetId),
      };
      if (!info.price) {
        info.price = 0;
      }

      if (!(item.IsForSale && item.Remaining !== 0) ||
        info.price > 0 ||
        item.SaleLocation === 'ExperiencesDevApiOnly'
      ) {
        if (info.price > 0 || item.SaleLocation === 'ExperiencesDevApiOnly' || item.Remaining === 0) {
          const index = myList.indexOf(info.item_id);
          if (index !== -1) {
            myList.splice(index, 1);
            saveMyList();
          }
        }
        return;
      }
      if (already_bought.includes(parseInt(itemID))) { return; }
      already_bought.push(parseInt(itemID))
      const robloxURL = `https://www.roblox.com/catalog/${itemID}`;
      chrome.tabs.create({ url: robloxURL });
      const index = myList.indexOf(info.item_id);
      if (index !== -1) {
        myList.splice(index, 1);
        saveMyList();
      }
      return info;
    } else if (response.status === 429) {
      throw new Error("V2 hit ratelimit");
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  } finally {
    const index = already_running.indexOf(itemID);
    if (index !== -1) {
      already_running.splice(index, 1);
    }
  }
}

function saveMyList() {
  chrome.storage.local.set({ [STORAGE_KEY]: myList });
}

function addToMyList(itemID) {
  if (!myList.includes(parseInt(itemID))) {
    myList.push(parseInt(itemID));
    saveMyList();
    initializeMyList();
  } else {
    chrome.runtime.sendMessage({ action: "showAlert", message: 'Item ID already added.' });
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "buyItem") {
    const itemID = message.itemID;
    if (myList.includes(parseInt(itemID))) {
      chrome.runtime.sendMessage({ action: "showAlert", message: 'Item ID already added.' });
      return;
    }
    addToMyList(itemID);
  } else if (message.action === "resetIDs") {
    myList = [];
    saveMyList();
    chrome.runtime.sendMessage({ action: "showAlert", message: 'Item IDs reset.' });
  } else if (message.action === "showIDs") {
    chrome.runtime.sendMessage({ action: "showAlert", message: myList.join(", ") });
  }
});

async function processItemDetails() {
  for (const itemID of myList) {
    if (!already_running.includes(parseInt(itemID))) {
      already_running.push(parseInt(itemID));
      await getItemDetails(parseInt(itemID));
    }
  }
}

function runPeriodicTask() {
  initializeMyList();
  setTimeout(runPeriodicTask, 100);
}

runPeriodicTask();