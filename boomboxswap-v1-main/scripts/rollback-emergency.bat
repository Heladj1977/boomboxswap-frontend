@echo off
echo ========================================
echo ROLLBACK URGENCE - INTERFACE CASSÉE
echo ========================================
echo.
echo [1] Restauration index.html...
copy "frontend\index_backup_20250806_032839.html" "frontend\index.html" /Y
echo [2] Restauration boombox.css...
copy "frontend\assets\css\boombox_backup_20250806_032839.css" "frontend\assets\css\boombox.css" /Y
echo.
echo ✅ ROLLBACK COMPLET - Interface restauree
echo.
pause 