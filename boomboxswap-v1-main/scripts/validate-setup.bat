@echo off
echo ========================================
echo VALIDATION SETUP REFACTORING CSS
echo ========================================
echo.

echo [1] Verification fichiers configuration...
if exist "backstop.json" (
    echo ✅ backstop.json OK
) else (
    echo ❌ backstop.json MANQUANT
)

if exist "package.json" (
    echo ✅ package.json OK
) else (
    echo ❌ package.json MANQUANT
)

if exist ".stylelintrc" (
    echo ✅ .stylelintrc OK
) else (
    echo ❌ .stylelintrc MANQUANT
)

echo.
echo [2] Verification structure tests...
if exist "tests\visual" (
    echo ✅ tests/visual OK
) else (
    echo ❌ tests/visual MANQUANT
)

if exist "tests\visual\reference" (
    echo ✅ tests/visual/reference OK
) else (
    echo ❌ tests/visual/reference MANQUANT
)

if exist "tests\visual\test" (
    echo ✅ tests/visual/test OK
) else (
    echo ❌ tests/visual/test MANQUANT
)

if exist "tests\visual\report" (
    echo ✅ tests/visual/report OK
) else (
    echo ❌ tests/visual/report MANQUANT
)

echo.
echo [3] Verification scripts securite...
if exist "scripts\test-refactoring-step.bat" (
    echo ✅ test-refactoring-step.bat OK
) else (
    echo ❌ test-refactoring-step.bat MANQUANT
)

if exist "scripts\rollback-emergency.bat" (
    echo ✅ rollback-emergency.bat OK
) else (
    echo ❌ rollback-emergency.bat MANQUANT
)

echo.
echo [4] Verification packages (si installes)...
if exist "node_modules\backstopjs" (
    echo ✅ backstopjs installe
) else (
    echo ⚠️ backstopjs non installe (npm install requis)
)

if exist "node_modules\playwright" (
    echo ✅ playwright installe
) else (
    echo ⚠️ playwright non installe (npm install requis)
)

if exist "node_modules\stylelint" (
    echo ✅ stylelint installe
) else (
    echo ⚠️ stylelint non installe (npm install requis)
)

echo.
echo [5] Verification Git...
if exist ".git" (
    echo ✅ Git initialise
) else (
    echo ❌ Git non initialise (git init requis)
)

echo.
echo ========================================
echo SETUP STATUS VERIFIE !
echo ========================================
echo.
pause 