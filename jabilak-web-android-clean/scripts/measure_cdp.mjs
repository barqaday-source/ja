import WebSocket from "ws";

const endpoint = process.argv[2] ?? "http://127.0.0.1:9223";
const response = await fetch(`${endpoint}/json`);
const pages = await response.json();
const page = pages.find((item) => item.type === "page");
if (!page?.webSocketDebuggerUrl) throw new Error("No page target found");

const socket = new WebSocket(page.webSocketDebuggerUrl);
let sequence = 0;
const pending = new Map();
socket.on("message", (raw) => {
  const message = JSON.parse(raw.toString());
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
await new Promise((resolve, reject) => { socket.once("open", resolve); socket.once("error", reject); });
const evaluate = (expression) => new Promise((resolve) => {
  const id = ++sequence;
  pending.set(id, resolve);
  socket.send(JSON.stringify({ id, method: "Runtime.evaluate", params: { expression, returnByValue: true } }));
});
await new Promise((resolve) => setTimeout(resolve, 3000));
const result = await evaluate(`JSON.stringify({innerWidth,innerHeight,root:document.querySelector('#root')?.getBoundingClientRect().toJSON(),nodes:[...document.querySelectorAll('div')].map((el)=>({text:(el.textContent||'').trim().replace(/\\s+/g,' ').slice(0,32),rect:el.getBoundingClientRect().toJSON(),display:getComputedStyle(el).display,flex:getComputedStyle(el).flex})).filter((item)=>item.rect.width>0&&item.rect.height>0).slice(0,30)})`);
console.log(result.result?.result?.value ?? result);
socket.close();
