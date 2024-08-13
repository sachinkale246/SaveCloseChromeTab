const MAX_TABS = 30;

chrome.tabs.onCreated.addListener(async () => {
  const tabs = await chrome.tabs.query({});
  if (tabs.length > MAX_TABS) {
    const sortedTabs = tabs.sort((a, b) => b.id - a.id);
    const tabsToClose = sortedTabs.slice(0, MAX_TABS);
    var content = `<html><head><title>Closed Tab history</title><style> .page-header{text-align: left;font-size: 2.5rem;
      font-weight: 300;
        line-height: 1.2;
        padding-bottom: 5px;
        border-bottom: 1px solid lightgray;
    }
    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      border: 1px solid black;
      width: 100%;
    }
    td, th {
      border: 1px solid lightgray;
      text-align: left;
      padding: 8px;
      color: white;
    }
    tr:nth-child(even) {
      background-color: lightgray;
    }
        body { background-color: skyblue;}
    </style>
    </head>
    <body>
    <h3 class='page-header'>Closed Tab history</h3>
      <table>
        <thead>
        <tr>
            <th>No.</th>
            <th>Title</th>
            <th style='text-align: left;'>Url</th>
            </tr>
          </thead>
        <tbody>`;
    var count = 1;
    for (const tab of tabsToClose) {
      content += `<tr><td>${count}</td><td>${tab.title}</td><td><a href='${tab.url}' target='_blank'> ${tab.url}</a></td></tr>`;
      //chrome.tabs.remove(tab.id);
      count++;
    }
    content += '</tbody></table></body><html>'
    var blob = new Blob([content], { type: "text/html" });
    var date = new Date();
    const newDate = `${date.getUTCFullYear()}_${date.getUTCMonth() + 1}_${date.getUTCDay()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`
    const fileName = `TabManagerPro_${newDate}.html`;
    var url = await getBlobUrl(blob);
    try {
      const downloadId = await downloadFile(url, fileName, true);
      console.log('Download started with ID:', downloadId);
      closeTabs(tabsToClose);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
});

async function getBlobUrl(blob) {
  const url = chrome.runtime.getURL('offscreen.html');
  try {
    await chrome.offscreen.createDocument({
      url,
      reasons: ['BLOBS'],
      justification: 'MV3 requirement',
    });
  } catch (err) {
    if (!err.message.startsWith('Only a single offscreen')) throw err;
  }
  const client = (await clients.matchAll({ includeUncontrolled: true }))
    .find(c => c.url === url);
  const mc = new MessageChannel();
  client.postMessage(blob, [mc.port2]);
  const res = await new Promise(cb => (mc.port1.onmessage = cb));
  return res.data;
}

function downloadFile(url, filename, saveAs = false) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: saveAs
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError));
      } else {
        resolve(downloadId);
      }
    });
  });
}


function closeTabs(tabsToClose) {
  for (const tab of tabsToClose) {
    chrome.tabs.remove(tab.id);
  }
}