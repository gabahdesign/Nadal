"""Prepare density-specific launcher images from the approved icon artwork.

Run with Python 3 and Pillow. Generates resources only; it does not build an APK.
"""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
res = root / 'android/app/src/main/res'
source = Image.open(root / 'assets/nadal-icon-original.png').convert('RGBA')
w, h = source.size
# Remove the neutral display margin; Android applies its own launcher mask.
art = source.crop((round(w*.054), round(h*.057), round(w*.947), round(h*.946)))
art = art.resize((1024, 1024), Image.Resampling.LANCZOS)
mask = Image.new('L', (1024, 1024)); ImageDraw.Draw(mask).rounded_rectangle((6,6,1017,1017),radius=246,fill=255)
art.putalpha(mask)

def gradient(size):
    im=Image.new('RGBA',(size,size)); pix=im.load()
    top=(119,215,248); bottom=(0,77,225)
    for y in range(size):
        t=y/max(size-1,1)
        color=tuple(round(a*(1-t)+b*t) for a,b in zip(top,bottom))+(255,)
        for x in range(size): pix[x,y]=color
    return im

# Legacy launcher bitmap: full artwork, without a baked-in grey border.
legacy=gradient(1024); legacy.alpha_composite(art)
(root/'assets').mkdir(exist_ok=True)
legacy.convert('RGB').save(root/'assets/nadal-icon-preview.png',optimize=True)
for folder, size, foreground_size in [('mdpi',48,108),('hdpi',72,162),('xhdpi',96,216),('xxhdpi',144,324),('xxxhdpi',192,432)]:
    directory=res / ('mipmap-'+folder);directory.mkdir(exist_ok=True)
    icon=legacy.resize((size,size),Image.Resampling.LANCZOS)
    icon.save(directory/'ic_launcher.png',optimize=True)
    round_mask=Image.new('L',(size,size));ImageDraw.Draw(round_mask).ellipse((0,0,size-1,size-1),fill=255)
    rounded=icon.copy();rounded.putalpha(round_mask);rounded.save(directory/'ic_launcher_round.png',optimize=True)
    # The main artwork remains inside the adaptive mask's central safe area.
    fg=Image.new('RGBA',(foreground_size,foreground_size),(0,0,0,0))
    image_size=round(foreground_size*.78)
    part=art.resize((image_size,image_size),Image.Resampling.LANCZOS)
    fg.alpha_composite(part,((foreground_size-image_size)//2,)*2)
    fg.save(directory/'ic_launcher_foreground.png',optimize=True)
print('Icones Android generades per a cinc densitats.')
