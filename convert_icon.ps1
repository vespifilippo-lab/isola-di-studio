Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\Vespi\Desktop\isola di studio\app_icon.png')
$img.Save('C:\Users\Vespi\Desktop\isola di studio\app_icon_fixed.png', [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
