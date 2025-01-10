// script.js

// ========== 主题切换部分 ==========
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// 读取本地存储的主题，没有则默认为 'light-theme'
const savedTheme = localStorage.getItem('theme') || 'light-theme';
// 给 body 添加初始主题类
body.classList.add(savedTheme);

// 初始化按钮文本
themeToggleBtn.textContent = (savedTheme === 'dark-theme')
  ? 'Switch to Light Mode'
  : 'Switch to Dark Mode';

// 点击按钮时切换主题
themeToggleBtn.addEventListener('click', () => {
  const isDark = body.classList.contains('dark-theme');
  // 确定新主题
  const newTheme = isDark ? 'light-theme' : 'dark-theme';

  // 移除旧主题类，添加新主题类
  body.classList.remove('light-theme', 'dark-theme');
  body.classList.add(newTheme);

  // 更新按钮文本
  themeToggleBtn.textContent = (newTheme === 'dark-theme')
    ? 'Switch to Light Mode'
    : 'Switch to Dark Mode';

  // 存储到 localStorage
  localStorage.setItem('theme', newTheme);
});


// ========== 樱花动画部分 ==========

// 获取 canvas
const canvas = document.getElementById('sakura-canvas');
const ctx = canvas.getContext('2d');

// 调整 canvas 尺寸
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// 定义一个 Sakura 类
class Sakura {
  constructor() {
    this.reset();
  }

  reset() {
    // 出现在顶部上方随机位置
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    // 大小、速度等
    this.size = Math.random() * 5 + 2;
    this.speed = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.8 + 0.2;
  }

  update() {
    this.y += this.speed;
    if (this.y > canvas.height) {
      this.reset();
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 182, 193, ${this.opacity})`;
    ctx.fill();
  }
}

// 创建樱花数组
let sakuraArray = [];
for (let i = 0; i < 80; i++) {
  sakuraArray.push(new Sakura());
}

// 动画循环
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sakuraArray.forEach(sakura => {
    sakura.update();
    sakura.draw();
  });
  requestAnimationFrame(animate);
}
animate();

// 点击事件：移除花瓣
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  sakuraArray = sakuraArray.filter((sakura) => {
    const dist = Math.hypot(mouseX - sakura.x, mouseY - sakura.y);
    return dist > sakura.size;
  });
});
