'use strict';

let yardAudio = null;
const yardTones = {
 doorbell: [[180,.11,0],[270,.14,.09]],
 fault: [[96,.20,0],[74,.27,.18]],
 event: [[392,.13,0],[587,.24,.10]]
};

function playYardCue(name) {
 if (yardAudio?.state !== 'running') return;
 const now = yardAudio.currentTime;
 for (const [frequency, duration, delay] of yardTones[name]) {
  const start = now + delay;
  const tone = yardAudio.createOscillator();
  const gain = yardAudio.createGain();
  tone.type = name === 'fault' ? 'triangle' : 'sine';
  tone.frequency.setValueAtTime(frequency, start);
  tone.frequency.exponentialRampToValueAtTime(frequency * .78, start + duration);
  gain.gain.setValueAtTime(.001, start);
  gain.gain.exponentialRampToValueAtTime(.075, start + .015);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  tone.connect(gain).connect(yardAudio.destination);
  tone.start(start);
  tone.stop(start + duration);
 }
}

const audioButton = document.getElementById('yard-audio');
audioButton.onclick = async () => {
 audioButton.disabled = true;
 try {
  const wasEnabled = audioButton.getAttribute('aria-pressed') === 'true';
  yardAudio ??= new AudioContext();
  if (wasEnabled) await yardAudio.suspend();
  else await yardAudio.resume();
  const on = yardAudio.state === 'running';
  audioButton.setAttribute('aria-pressed', String(on));
  audioButton.textContent = on ? '关闭现场音效' : '开启现场音效';
  if (on) playYardCue('doorbell');
 } catch {
  audioButton.textContent = '音效暂不可用';
 } finally {
  audioButton.disabled = false;
 }
};
