Add-Type -AssemblyName System.Drawing

$srcDir = "C:\Users\lsamp\OneDrive\Desktop\PiW\Sprites\ZZ"
$dstDir = "C:\Users\lsamp\OneDrive\Desktop\PiW\Sprites\Clean\Reg7 USUM"

if (-not (Test-Path $dstDir)) {
    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
}

$files = Get-ChildItem -Path $srcDir -Filter "*.png"
Write-Host "Found $($files.Count) PNG files to process..."

$count = 0
foreach ($file in $files) {
    $bmp = [System.Drawing.Bitmap]::FromFile($file.FullName)
    $w = $bmp.Width
    $h = $bmp.Height

    $minX = $w
    $minY = $h
    $maxX = -1
    $maxY = -1

    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            if ($pixel.A -gt 0) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }

    $outPath = Join-Path $dstDir $file.Name

    if ($maxX -ge $minX -and $maxY -ge $minY) {
        $cropW = $maxX - $minX + 1
        $cropH = $maxY - $minY + 1
        $rect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
        $cropped = $bmp.Clone($rect, $bmp.PixelFormat)
        $cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $cropped.Dispose()
    } else {
        # Completely transparent image: copy as-is
        Copy-Item $file.FullName $outPath -Force
    }

    $bmp.Dispose()
    $count++
    if ($count % 50 -eq 0) {
        Write-Host "Processed $count / $($files.Count)..."
    }
}

Write-Host "Done! Processed $count PNGs into $dstDir"
