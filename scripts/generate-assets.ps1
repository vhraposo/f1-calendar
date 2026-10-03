Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot '..\assets\images'
$tempDir = Join-Path $env:TEMP 'f1calendar-assets'
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

function New-Graphics([int]$size, [string]$background) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  if ($background -eq 'transparent') {
    $graphics.Clear([System.Drawing.Color]::Transparent)
  } else {
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml($background))
  }
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Points([int[][]]$coordinates) {
  $points = [System.Drawing.Point[]]::new($coordinates.Count)
  for ($index = 0; $index -lt $coordinates.Count; $index++) {
    $points[$index] = [System.Drawing.Point]::new($coordinates[$index][0], $coordinates[$index][1])
  }
  return $points
}

function Save-Png($canvas, [string]$name) {
  $canvas.Graphics.Dispose()
  $path = Join-Path $tempDir $name
  $canvas.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Bitmap.Dispose()
  Copy-Item -LiteralPath $path -Destination (Join-Path $assetsDir $name) -Force
}

$red = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#E10600'))
$redSoft = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#7A0B08'))
$white = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F5F5F5'))
$pureWhite = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)

# Full icon
$canvas = New-Graphics 1024 '#070708'
$g = $canvas.Graphics
$g.FillPolygon($red, (New-Points @((180, 700), (520, 220), (640, 220), (300, 700))))
$g.FillPolygon($redSoft, (New-Points @((420, 800), (760, 320), (830, 320), (490, 800))))
$g.FillPolygon($red, (New-Points @((660, 880), (860, 600), (920, 600), (720, 880))))
$tile = 56
for ($row = 0; $row -lt 3; $row++) {
  for ($col = 0; $col -lt 3; $col++) {
    if (($row + $col) % 2 -eq 0) {
      $g.FillRectangle($white, 120 + $col * $tile, 140 + $row * $tile, $tile, $tile)
    }
  }
}
Save-Png $canvas 'icon.png'

# Adaptive foreground
$canvas = New-Graphics 1024 'transparent'
$g = $canvas.Graphics
$g.FillPolygon($red, (New-Points @((330, 700), (600, 330), (700, 330), (430, 700))))
for ($row = 0; $row -lt 2; $row++) {
  for ($col = 0; $col -lt 2; $col++) {
    if (($row + $col) % 2 -eq 0) {
      $g.FillRectangle($white, 340 + $col * 56, 360 + $row * 56, 56, 56)
    }
  }
}
Save-Png $canvas 'android-icon-foreground.png'

# Adaptive background
$canvas = New-Graphics 1024 '#070708'
Save-Png $canvas 'android-icon-background.png'

# Monochrome
$canvas = New-Graphics 1024 'transparent'
$g = $canvas.Graphics
$g.FillPolygon($pureWhite, (New-Points @((330, 700), (600, 330), (700, 330), (430, 700))))
for ($row = 0; $row -lt 2; $row++) {
  for ($col = 0; $col -lt 2; $col++) {
    if (($row + $col) % 2 -eq 0) {
      $g.FillRectangle($pureWhite, 340 + $col * 56, 360 + $row * 56, 56, 56)
    }
  }
}
Save-Png $canvas 'android-icon-monochrome.png'

# Splash mark
$canvas = New-Graphics 512 'transparent'
$g = $canvas.Graphics
$g.FillPolygon($red, (New-Points @((150, 360), (300, 160), (355, 160), (205, 360))))
for ($row = 0; $row -lt 2; $row++) {
  for ($col = 0; $col -lt 2; $col++) {
    if (($row + $col) % 2 -eq 0) {
      $g.FillRectangle($white, 155 + $col * 32, 175 + $row * 32, 32, 32)
    }
  }
}
Save-Png $canvas 'splash-icon.png'

# Favicon
$canvas = New-Graphics 64 '#070708'
$g = $canvas.Graphics
$g.FillPolygon($red, (New-Points @((14, 50), (36, 18), (48, 18), (26, 50))))
Save-Png $canvas 'favicon.png'

$red.Dispose(); $redSoft.Dispose(); $white.Dispose(); $pureWhite.Dispose()
Write-Output 'Generated icon, adaptive icon, splash and favicon assets.'
