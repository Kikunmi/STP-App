$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000'
$body = @{ username = 'refactoruser'; email = 'refactoruser@example.com'; password = 'Password123' } | ConvertTo-Json

try {
    $reg = Invoke-RestMethod -Method POST -Uri "$base/api/auth/register" -Body $body -ContentType 'application/json'
    Write-Output '--- REGISTER OK ---'
    $reg | ConvertTo-Json -Depth 5
    $token = $reg.data.accessToken
} catch {
    Write-Output '--- REGISTER RESPONSE (may already exist) ---'
    Write-Output $_.ErrorDetails.Message
    $login = @{ email = 'refactoruser@example.com'; password = 'Password123' } | ConvertTo-Json
    $l = Invoke-RestMethod -Method POST -Uri "$base/api/auth/login" -Body $login -ContentType 'application/json'
    Write-Output '--- LOGIN OK ---'
    $l | ConvertTo-Json -Depth 5
    $token = $l.data.accessToken
}

Write-Output '--- PROFILE (with token) ---'
$headers = @{ Authorization = "Bearer $token" }
$profile = Invoke-RestMethod -Method GET -Uri "$base/api/auth/profile" -Headers $headers
$profile | ConvertTo-Json -Depth 5
