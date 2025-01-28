// script.js

// ========== 提前应用存储的主题 ==========
(function () {
  const savedTheme = localStorage.getItem('theme') || 'light-theme';
  document.body.classList.add(savedTheme);
})();

// ========== 主题切换部分 ==========
document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');

  // 初始化主题
  const currentTheme = localStorage.getItem('theme') || 'light-theme';
  document.body.classList.add(currentTheme);

  // 延迟启用过渡，避免初次加载时的闪烁
  setTimeout(() => {
      document.body.classList.add('theme-transition');
  }, 50); // 确保页面渲染完成后启用

  // 更新按钮文本
  function updateToggleButton(theme) {
      themeToggleBtn.textContent = theme === 'dark-theme' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  updateToggleButton(currentTheme);

  // 切换主题
  themeToggleBtn.addEventListener('click', () => {
      const isDarkTheme = document.body.classList.contains('dark-theme');
      const newTheme = isDarkTheme ? 'light-theme' : 'dark-theme';

      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleButton(newTheme);
  });
});

// ========== 樱花动画部分 ==========
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();

// 使用防抖处理 resize 事件
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(setCanvasSize, 200);
});

// 樱花类
class Sakura {
  constructor() {
      this.reset();
  }

  reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height;
      this.size = Math.random() * 5 + 2;
      this.speed = Math.random() * 3 + 1;
      this.opacity = Math.random() * 0.8 + 0.2;
  }

  update() {
      this.y += this.speed;
      if (this.y > canvas.height) this.reset();
  }

  draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`;
      ctx.fill();
  }
}

const sakuraArray = Array.from({ length: 80 }, () => new Sakura());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sakuraArray.forEach((sakura) => {
      sakura.update();
      sakura.draw();
  });
  requestAnimationFrame(animate);
}
animate();

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  sakuraArray.filter((sakura) => {
      const dist = Math.hypot(mouseX - sakura.x, mouseY - sakura.y);
      return dist > sakura.size;
  });
});

// ========== 音乐播放器部分 ==========
const audioPlayer = document.getElementById('audio-player');
const playlist = document.getElementById('playlist');
const playlistItems = playlist.querySelectorAll('li');

if (playlistItems.length > 0) {
  playlistItems[0].classList.add('active');
}

const audioSource = document.getElementById('audio-source');

function playSong(songItem) {
  const songSrc = songItem.getAttribute('data-src');
  audioSource.src = songSrc;
  audioPlayer.load();
  audioPlayer.play();

  playlistItems.forEach((item) => item.classList.remove('active'));
  songItem.classList.add('active');
}

playlistItems.forEach((item) => {
  item.addEventListener('click', () => playSong(item));
});

audioPlayer.addEventListener('ended', () => {
  const currentIndex = Array.from(playlistItems).findIndex((item) => item.classList.contains('active'));
  const nextIndex = (currentIndex + 1) % playlistItems.length;
  if (nextIndex !== -1) playSong(playlistItems[nextIndex]);
});



