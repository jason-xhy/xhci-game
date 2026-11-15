/* Chapter 4 navigation keeps the independent lab instances and their state. */
(() => {
 const panels = [...document.querySelectorAll('body > details')];
 const drawer = document.createElement('nav');
 drawer.id = 'chapter-labs';
 drawer.setAttribute('aria-label', 'Chapter 4 laboratories');
 drawer.innerHTML = '<button id="toggle-labs" aria-expanded="false" aria-controls="lab-directory">Chapter 4 laboratories</button><section id="lab-directory" hidden><h2>第 4 章实验</h2><p>主线工厂覆盖 §4.3.1–§4.3.5。以下独立实验可直接打开，无需完成主线。</p><label>按节号或名称查找 <input type="search" placeholder="例如 4.3.6 或 Enable Slot"></label><div class="lab-shortcuts"></div><p role="status"></p></section>';
 document.body.append(drawer);
 const section = drawer.querySelector('section');
 const input = drawer.querySelector('input');
 const status = drawer.querySelector('[role=status]');
 const toggle = drawer.querySelector('#toggle-labs');
 const summaries = new Map();
 for (const panel of panels) {
  panel.removeAttribute('style');
  section.append(panel);
  panel.name = 'chapter4-laboratory';
  const labels = [...panel.querySelectorAll('summary, button')].map(node => node.textContent);
  summaries.set(panel, labels.join(' ').toLowerCase());
 }
 function filter() {
  const query = input.value.toLowerCase().trim().replace(/^§\s*/, '');
  let count = 0;
  for (const [panel, title] of summaries) {
   panel.hidden = !title.includes(query);
   if (!panel.hidden) count++;
  }
  status.textContent = count ? `${count} 个实验` : '没有匹配的实验。试试节号或英文关键词。';
 }
 for (const [query, label] of [
  ['4.3', '设备枚举'], ['Enable Slot', 'Enable Slot'], ['4.3.6', '备用接口'],
  ['4.3.7', '速度 / TT'], ['4.3.8', '带宽恢复']
 ]) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.onclick = () => { input.value = query; filter(); };
  drawer.querySelector('.lab-shortcuts').append(button);
 }
 function setOpen(open) {
  section.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (open) {
   document.exitPointerLock?.();
   input.focus({preventScroll: true});
  }
 }
 toggle.onclick = () => setOpen(section.hidden);
 document.getElementById('browse-labs').onclick = () => setOpen(true);
 drawer.addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.key === 'Escape' && !section.hidden) {
   setOpen(false);
   toggle.focus();
  }
 });
 drawer.addEventListener('pointerdown', e => e.stopPropagation());
 input.addEventListener('input', filter);
 filter();
})();
