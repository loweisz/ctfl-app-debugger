const stylez = `
  .container {
    padding: 10px;
    width: 500px;
    position: fixed;
    left: 0;
    bottom: 0;
    background: white;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  }
  .messages {
    margin-top: 0.5rem;
    overflow: scroll;
    height: 300px;
  }
  header {
    font-size: 20px;
    font-weight: bold;
  }
  .event {
    padding: 0.25rem;
    border-radius: 0.125rem;
    border: 1px solid grey;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    
  }
  .event > button {
    background: grey;
  }
  .info {
    display: flex;
    justify-content: space-between;
  }
  .iframeWrapper::before {
    position: absolute;
    right: 0;
    content: attr(data-info-text);
    color: white;
    font-size: 10px;
    margin-top: -18px;
    line-height: 12px;
    padding: 2px 6px;
    height: 14px;
    background: #BF3045;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  .iframeWrapper {
    border: 2px solid #BF3045;
    border-radius: 2px;
    position: relative;
  }
  .params {
    display: none;
    word-break: break-word;
    padding: 0.2rem;
    background: #e5ebed;
    margin: 0.3rem 0;
  }
  .showParams {
    padding: 0.2rem;
    background: #2E75D4;
    border-radius: 2px;
    color: white;
  }
`

const getContainerHtml = () => `
  <div id="app-debugger" class="container">
   <header>Messages from apps:</header>
   <ul id="app-debugger-messages" class="messages"></ul>
  </div>
`

const getEventHtml = (method, id, params) => {
  const timestamp = Date.now()
  return `
    <li class="event">
     <div class="info">
       <strong>Method: </strong>${method}
       <button data-id="${timestamp}" class="showParams">Show params</button>
     </div>
     <div id="${timestamp}" class="params">
       ${JSON.stringify(params)}
     </div>
    </li>
  `;
}

const container = document.createElement('div')
let currentOpenParams = null

const MAX_RENDER_ITEM_COUNT = 5

function onParamsButtonClick(e) {
  const buttonTimestamp = e.target.dataset.id
  const paramsContainer = document.getElementById(buttonTimestamp)
  if (currentOpenParams) {
    currentOpenParams.style.display = 'none'
  }

  if (paramsContainer === currentOpenParams) {
    currentOpenParams = null
    paramsContainer.style.display = 'none'
  } else {
    currentOpenParams = paramsContainer
    paramsContainer.style.display = 'block'
  }

}

function activateParamsButtons() {
  const paramsButtons = document.getElementsByClassName('showParams')
  for (const button of paramsButtons) {
    button.addEventListener('click', onParamsButtonClick)
  }

}

function renderNewEvent(data) {
  const eventElement = document.createElement('div');
  eventElement.innerHTML = getEventHtml(data.method, data.id, data.params)
  const list = container.getElementsByTagName('ul')
  const renderedItems = list[0].getElementsByTagName('li')
  // only render a specific amount of elements
  if (renderedItems.length > MAX_RENDER_ITEM_COUNT) {
    renderedItems[renderedItems.length - 1].remove()
  }
  list[0].prepend(eventElement)
  activateParamsButtons()
}

function handleInComingMessage(method, id, params) {
  if (method) {
    renderNewEvent({ method, id, params })
  }
}

async function wrapIframe(iframe) {
  const definitionId = iframe.dataset.appDefinitionId;
  const location = iframe.dataset.location;
  const isWrapped = !!document.querySelector(`[data-definition-id="${definitionId}"][data-location="${location}"]`)

  if (!isWrapped) {
    const iframeParent = iframe.parentElement
    const iframeWrapper = document.createElement('div')
    iframeWrapper.className = 'iframeWrapper'
    iframeWrapper.dataset.definitionId = definitionId
    iframeWrapper.dataset.location = location
    iframeParent.appendChild(iframeWrapper)
    iframeWrapper.appendChild(iframe)
    iframeWrapper.dataset.infoText = `definition: ${definitionId}`
    const appDefinition = await getAppName(definitionId)
    if (appDefinition.name) {
      iframeWrapper.dataset.infoText = `name: ${appDefinition.name}  definition: ${definitionId}`
    }
  }
}

function configureIframe() {
  const iframes = document.querySelectorAll('iframe[title="widget-renderer"]')
  if (!iframes || iframes.length === 0) {
   const messageContainer = document.querySelector('.container')
   messageContainer.children.forEach(child => child.remove())
  }
  for (const iframe of iframes) {
    wrapIframe(iframe)
  }
}

function handleMessageEvents(e) {
  handleInComingMessage(e.data.method, e.data.id, e.data.params)
  configureIframe()
}

function handleHasChangeEvents() {
  configureIframe()
}


function getSpaceId() {
  const urlArgs = window.location.pathname.split('/')
  const spaceIdIndex = urlArgs.findIndex((txt) => txt === 'spaces') + 1
  return urlArgs[spaceIdIndex]
}

async function getAppName(defId) {
  // todo add validation
  const spaceId = getSpaceId()
  const accessToken = sessionStorage.token;
  const space = await window.fetch(`https://api.contentful.com/spaces/${spaceId}`, {
    "headers": {
      "authorization": `Bearer OWd705kLDJFsAxFL22bhfeR5jXlhsNdGZzxnS-iqIxg`,
    },
  }).then(response => response.json())

  const orgId = space.sys.organization.sys.id

  return window.fetch(`https://api.contentful.com/organizations/${orgId}/app_definitions/${defId}`, {
    "headers": {
      "authorization": `Bearer OWd705kLDJFsAxFL22bhfeR5jXlhsNdGZzxnS-iqIxg`,
    },
  }).then(response => response.json())
}



function initMessageEventListener() {
  window.addEventListener('message', handleMessageEvents)
  window.addEventListener('hashchange', handleHasChangeEvents)
}

function renderMessageChannel() {
  container.innerHTML = getContainerHtml()
  const styleTag = document.createElement('style')
  document.head.append(styleTag);
  styleTag.textContent = stylez;
  document.body.appendChild(container)
}

let debuggerStatus = 'off'

function startDebugger() {
  if (debuggerStatus === 'off') {
    debuggerStatus = 'on'
    renderMessageChannel()
    initMessageEventListener()
    configureIframe()
  }
}

function stopDebugger() {
  if (debuggerStatus === 'on') {
    debuggerStatus = 'off'
    window.removeEventListener('message', handleMessageEvents)
    window.removeEventListener('hashchange', handleHasChangeEvents)
    const messageContainer = document.getElementById('app-debugger-messages')
    messageContainer.remove();

    const allIframeWrappers = document.getElementsByClassName('iframeWrapper');
    const wrappers = []
    for (const wrapper of allIframeWrappers) {
      const innerIframe = wrapper.children[0]
      const outerContainer = wrapper.parentElement
      outerContainer.appendChild(innerIframe)
      wrappers.push(wrapper)
    }
    wrappers.forEach(wrapper => wrapper.remove())
  }
}

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.debuggerStatus.newValue === 'off') {
    stopDebugger()
  } else if (changes.debuggerStatus.newValue === 'on') {
    startDebugger()
  }
});

const acceptedHosts = ["app.contentful.com", "app.flinkly.com"]

if (acceptedHosts.includes(window.location.hostname)) {
  chrome.storage.sync.set({ debuggerStatus: 'on' });
  startDebugger()
}


