const MAX_TABS = 30;

chrome.tabs.onCreated.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  if (tabs.length > MAX_TABS) {
    const sortedTabs = tabs.sort((a, b) => b.id - a.id);
    const tabsToClose = sortedTabs.slice(MAX_TABS);
    var content = `<html><head><style>table, th, td {border: 1px solid black;border-collapse: collapse;}</style></head><body><table><thead><th>Title</th><th style='text-align: left;'>Url</th></thead><tbody>`;
    for (const tab of tabsToClose) {
      content += `<tr><td>${tab.title}</td><td><a href='${tab.url}' target='_blank'> ${tab.url}</a></td></tr>`;
      chrome.tabs.remove(tab.id);
    }
    content += '</tbody></table></body><html>'
    var blob = new Blob([content], {type: "text/html"});
    var date = new Date(); 
    const newDate = `${date.getUTCFullYear()}_${date.getUTCMonth() + 1}_${date.getUTCDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`
    const fileName = `ChromeClosedTabsUrls_${newDate}.html`;
    const dataURL = `data:${blob.type};base64,${btoa(content)}`;
    chrome.downloads.download({
      url: dataURL,
      filename: fileName,
      saveAs: true
    });
  }
});