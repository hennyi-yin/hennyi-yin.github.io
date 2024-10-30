// script.js

document.addEventListener('DOMContentLoaded', function () {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

    if (currentTheme) {
        document.body.classList.add(currentTheme);

        if (currentTheme === 'dark-theme') {
            themeToggleBtn.textContent = 'Day mode';
        }
    }

    themeToggleBtn.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme');

        let theme = 'light-theme';
        if (document.body.classList.contains('dark-theme')) {
            themeToggleBtn.textContent = 'Day mode';
            theme = 'dark-theme';
        } else {
            themeToggleBtn.textContent = 'Night mode';
        }

        localStorage.setItem('theme', theme);
    });

    // 设置初始按钮文本
    if (document.body.classList.contains('dark-theme')) {
        themeToggleBtn.textContent = 'Day mode';
    } else {
        themeToggleBtn.textContent = '切换到夜间模式';
    }
});
