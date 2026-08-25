$ErrorActionPreference = 'Stop'

$network = Get-NetIPConfiguration |
  Where-Object {
    $_.NetAdapter.Status -eq 'Up' -and
    $_.IPv4DefaultGateway -and
    $_.IPv4Address.IPAddress -notlike '169.254.*'
  } |
  Select-Object -First 1

$hostAddress = $network.IPv4Address.IPAddress | Select-Object -First 1

if (-not $hostAddress) {
  throw 'Could not find an active IPv4 network with a default gateway.'
}

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $hostAddress

Write-Host "Starting Expo Go on $($network.InterfaceAlias) ($hostAddress)"
Write-Host 'Make sure the phone is connected to the same Wi-Fi network.'

& npx.cmd expo start --go --lan --port 0 @args
exit $LASTEXITCODE

