$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5000'
$stamp = Get-Random
$email = "tripcheck$stamp@example.com"
$body = @{ username = "tripcheck$stamp"; email = $email; password = 'Password123' } | ConvertTo-Json

$reg = Invoke-RestMethod -Method POST -Uri "$base/api/auth/register" -Body $body -ContentType 'application/json'
$token = $reg.data.accessToken
$headers = @{ Authorization = "Bearer $token" }
Write-Output "Registered $email"

$start = (Get-Date).AddDays(5).ToString('o')
$end = (Get-Date).AddDays(10).ToString('o')
$tripBody = @{ title = 'Test Trip to Paris'; destination = 'Paris'; startDate = $start; endDate = $end } | ConvertTo-Json

$created = Invoke-RestMethod -Method POST -Uri "$base/api/trips" -Body $tripBody -ContentType 'application/json' -Headers $headers
Write-Output "--- CREATE ---"
Write-Output "Created trip id: $($created.data.trip._id) title: $($created.data.trip.title)"

$list = Invoke-RestMethod -Method GET -Uri "$base/api/trips" -Headers $headers
Write-Output "--- LIST (GET /api/trips) ---"
Write-Output "Count: $($list.data.trips.Count)"
$list.data.trips | ForEach-Object { Write-Output "  - $($_.title) ($($_.destination))" }

$up = Invoke-RestMethod -Method GET -Uri "$base/api/trips/filter/upcoming" -Headers $headers
Write-Output "--- UPCOMING (GET /api/trips/filter/upcoming) ---"
Write-Output "Count: $($up.data.trips.Count)"
$up.data.trips | ForEach-Object { Write-Output "  - $($_.title) ($($_.destination))" }
