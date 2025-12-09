Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param([string]$InputFile, [string]$OutputFile, [int]$Width, [int]$Height)

    Write-Host "Resizing $InputFile to ${Width}x${Height}..."
    try {
        $image = [System.Drawing.Image]::FromFile($InputFile)
        $bitmap = new-object System.Drawing.Bitmap $Width, $Height
        $graph = [System.Drawing.Graphics]::FromImage($bitmap)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graph.DrawImage($image, 0, 0, $Width, $Height)
        $bitmap.Save($OutputFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $image.Dispose()
        $bitmap.Dispose()
        $graph.Dispose()
        Write-Host "Successfully saved to $OutputFile"
    }
    catch {
        Write-Error "Failed to resize image: $_"
    }
}

$thumbSource = "C:/Users/EC/.gemini/antigravity/brain/f80c25a4-a980-48f9-95eb-6b595daac7d3/thumbnail_base_1765277144200.png"
$bannerSource = "C:/Users/EC/.gemini/antigravity/brain/f80c25a4-a980-48f9-95eb-6b595daac7d3/preview_banner_base_1765277163723.png"

$thumbDest = "C:\Users\EC\Desktop\project\community-issue\thumbnail.png"
$bannerDest = "C:\Users\EC\Desktop\project\community-issue\inline_preview.png"

Resize-Image -InputFile $thumbSource -OutputFile $thumbDest -Width 80 -Height 80
Resize-Image -InputFile $bannerSource -OutputFile $bannerDest -Width 590 -Height 300
