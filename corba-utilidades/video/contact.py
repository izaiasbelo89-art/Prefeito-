import sys, glob
from PIL import Image, ImageDraw
files = sorted(glob.glob('out/stills/*.png'))
cols = 4; w, h = 360, 640
rows = (len(files)+cols-1)//cols
sheet = Image.new('RGB', (cols*w, rows*(h+24)), 'white')
d = ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w,h))
    x, y = (i%cols)*w, (i//cols)*(h+24)
    sheet.paste(im, (x, y+24)); d.text((x+6,y+4), f.split('/')[-1], fill='black')
sheet.save(sys.argv[1] if len(sys.argv)>1 else 'out/sheet.png')
