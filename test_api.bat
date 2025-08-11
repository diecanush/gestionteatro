@echo off
REM Este script envia una peticion PUT para actualizar un producto de snackbar.

curl -X PUT http://69.62.95.248:8080/api/snackbar/p1 ^
-H "Content-Type: application/json" ^
-d "{\"stock\": 10}"

echo.
echo.
echo Peticion de actualizacion enviada para el producto p6.
pause