const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
 const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--no-proxy-server']
 });
 try {
  const page = await browser.newPage({viewport: {width: 1280, height: 900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8731/');
  await page.locator('#start').click();
  const commissioning = page.locator('#commission');
  const run = commissioning.getByRole('button', {name: 'Run', exact: true});
  for (let i = 0; i < 7; i++) {
   assert.equal(await run.isDisabled(), true);
   assert.equal(await commissioning.locator('.commission-actions button:enabled').count(), 1);
   await commissioning.locator('.current-action').click();
  }
  assert.equal(await run.isEnabled(), true);
  await commissioning.getByRole('button', {name: 'Corrupt commissioning ERST size'}).click();
  assert.equal(await run.isDisabled(), true);
  assert.equal(await commissioning.locator('.current-action').innerText(), 'Set ERST and ERDP');
  await commissioning.locator('.current-action').click();
  await commissioning.locator('.current-action').click();
  assert.equal(await commissioning.count(), 0);

  const action = page.locator('#guide');
  const expected = [
   '重置 USB2 根端口', '提交 Enable Slot', '领取 Slot ID', '准备设备上下文',
   '提交 Address Device', '领取地址分配完成事件', '提交 GET_DESCRIPTOR',
   '领取描述符传输完成事件', '准备端点配置', '提交 Configure Endpoint',
   '领取端点配置完成事件', '提交 SET_CONFIGURATION', '领取设备配置完成事件', '打卡下班'
  ];
  for (const [index, label] of expected.entries()) {
   const match = await page.waitForFunction(({index, label}) => {
    const {textContent, disabled} = document.querySelector('#guide');
    const stage = document.querySelector('#next-stage').textContent;
    if (!stage.includes(` ${index + 1}/14 · `) || disabled) return false;
    return textContent.startsWith('前往 ') || textContent.startsWith('修复 Cycle') || textContent.startsWith(label)
     ? textContent : false;
   }, {index, label}, {timeout: 45000});
   let text = await match.jsonValue();
   while (!text.startsWith(label)) {
    await action.click();
    const next = await page.waitForFunction(({label, previous}) => {
     const {textContent, disabled} = document.querySelector('#guide');
     if (disabled || textContent === previous) return false;
     return textContent.startsWith('前往 ') || textContent.startsWith('修复 Cycle') || textContent.startsWith(label)
      ? textContent : false;
    }, {label, previous: text}, {timeout: 45000});
    text = await next.jsonValue();
   }
   await action.click();
   console.log(`PASS mouse step ${index + 1}: ${label}`);
  }
  assert.equal(await page.locator('#overlay h3').innerText(), 'SHIFT COMPLETE');
  assert.match(await page.locator('#overlay p').first().innerText(), /5 completion events/);
  assert.deepEqual(errors, []);
 } finally {
  await browser.close();
 }
})().catch(error => {console.error(error); process.exitCode = 1;});
