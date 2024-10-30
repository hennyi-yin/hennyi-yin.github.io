// script.js

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
