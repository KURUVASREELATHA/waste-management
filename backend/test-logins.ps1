$tests = @(
  @{ email = 'test@citizen.com';  password = 'password123'; role = 'citizen' },
  @{ email = 'worker@test.com';   password = 'password123'; role = 'worker' },
  @{ email = 'admin@test.com';    password = 'password123'; role = 'admin' },
  @{ email = 'a@g';               password = '123';         role = 'admin' },
  @{ email = 'recycler@test.com'; password = 'password123'; role = 'recycler' }
)

foreach ($t in $tests) {
  $body = @{ email = $t.email; password = $t.password; role = $t.role } | ConvertTo-Json
  try {
    $r = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
    Write-Host ("{0,-20} {1,-25} LOGIN OK (role: {2})" -f $t.role, $t.email, $r.user.role)
  } catch {
    Write-Host ("{0,-20} {1,-25} FAILED: {2}" -f $t.role, $t.email, $_.Exception.Message)
  }
}
