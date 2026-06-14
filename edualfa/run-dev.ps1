Set-Location $PSScriptRoot

$backendCmd = 'cd .\backend; npm run dev'
$frontendCmd = 'cd .\frontend; npm run dev'

Write-Host "Starting backend in a new PowerShell window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "Starting frontend in a new PowerShell window..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "\nDone."
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5174 (or 5173 if already in use)"
