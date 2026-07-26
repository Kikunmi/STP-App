# Start both backend and frontend for local development (PowerShell)
Start-Process -NoNewWindow -WorkingDirectory "k:\STP-App\backend" -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command npm run dev"
Start-Process -NoNewWindow -WorkingDirectory "k:\STP-App\frontend" -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command $env:VITE_API_URL='http://localhost:5000'; npm run dev"
Write-Host "Started backend and frontend in background. Backend: http://localhost:5000, Frontend: http://localhost:5174 (or next available port)"
