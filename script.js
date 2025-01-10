// script.js
// script.js

// 主题切换功能
const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// 检查用户是否有首选主题
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    themeToggleBtn.textContent = 'Switch to Light Mode';
} else {
    themeToggleBtn.textContent = 'Switch to Dark Mode';
}

themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        themeToggleBtn.textContent = 'Switch to Light Mode';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
        localStorage.setItem('theme', 'light');
    }
});

// 手风琴功能
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
        const accordionContent = header.nextElementSibling;

        // 如果当前项已经是激活的，关闭它
        if (accordionItem.classList.contains('active')) {
            accordionItem.classList.remove('active');
            accordionContent.style.maxHeight = null;
        } else {
            // 关闭所有手风琴项
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.maxHeight = null;
            });

            // 激活当前手风琴项
            accordionItem.classList.add('active');
            accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
        }
    });
});

// 页面加载时，设置所有手风琴内容的最大高度为0
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion-content').forEach(content => {
        content.style.maxHeight = null;
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.body.classList.add(currentTheme);

        if (currentTheme === 'dark-theme') {
            themeToggleBtn.textContent = 'Switch to Light Mode';
        }
    }

    themeToggleBtn.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme');

        let theme = 'light-theme';
        if (document.body.classList.contains('dark-theme')) {
            themeToggleBtn.textContent = 'Switch to Light Mode';
            theme = 'dark-theme';
        } else {
            themeToggleBtn.textContent = 'Switch to Dark Mode';
        }

        localStorage.setItem('theme', theme);
    });

    // 设置初始按钮文本
    if (document.body.classList.contains('dark-theme')) {
        themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    }
});


document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
        const accordionContent = header.nextElementSibling;

        if (accordionItem.classList.contains('active')) {
            // 收起手风琴项
            accordionItem.classList.remove('active');
            accordionContent.style.maxHeight = null;
        } else {
            // 关闭所有其他展开的项（可选，如果需要允许多个手风琴同时展开可以跳过这部分代码）
            document.querySelectorAll('.accordion-item.active').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-content').style.maxHeight = null;
            });

            // 展开当前手风琴项
            accordionItem.classList.add('active');
            accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
        }
    });
});

function applyTheme(theme) {
    if (theme === 'dark') {
        body.classList.add('dark-theme');
        themeToggleBtn.textContent = 'Switch to Light Mode';
    } else {
        body.classList.remove('dark-theme');
        themeToggleBtn.textContent = 'Switch to Dark Mode';
    }

    // 使用延时更新手风琴内容样式
    setTimeout(() => {
        document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
            content.style.backgroundColor = getComputedStyle(body).getPropertyValue('--bg-color');
            content.style.color = getComputedStyle(body).getPropertyValue('--text-color');
        });
    }, 300); // 与 CSS 的 transition 时间一致
}
