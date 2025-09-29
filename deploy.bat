@echo off
echo 🚀 开始部署到 GitHub Pages...

:: 1. 构建项目
npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败，退出...
    exit /b %errorlevel%
)

:: 2. 提交 dist 到 gh-pages 分支
git add dist -f
git commit -m "deploy"
git subtree push --prefix dist origin gh-pages

echo ✅ 部署完成！
pause
