#!/usr/bin/env python3
"""Victor Lustig money-story, 10 scenes x 6s, 720x1280, PIL-drawn."""
import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 720, 1280
OUT = os.path.expanduser("~/workspace/your_files/money-story-lustig/stills")
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf"

def f(sz): return ImageFont.truetype(FONT, sz)

def gradient(img, top, bottom):
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=c)

def wrap(d, text, font, maxw):
    words = text.split(); lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def title(d, text, y=58, size=56, fill=(20, 20, 40)):
    font = f(size)
    lines = wrap(d, text, font, W - 96)
    yy = y
    for ln in lines:
        d.text((W // 2, yy), ln, font=font, fill=fill, anchor="ma",
               stroke_width=4, stroke_fill=(255, 255, 255))
        yy += size + 8
    return yy

def banner(d, text, size=36):
    font = f(size)
    lines = wrap(d, text, font, W - 140)
    lh = size + 10
    bh = len(lines) * lh + 28
    y0 = H - 120 - bh
    d.rounded_rectangle([28, y0, W - 28, y0 + bh], radius=18,
                        fill=(12, 12, 20), outline=(255, 215, 0), width=4)
    yy = y0 + 14
    for ln in lines:
        d.text((W // 2, yy), ln, font=font, fill=(255, 215, 0), anchor="ma")
        yy += lh
    return y0

def cloud(d, x, y, s=1.0, col=(255, 255, 255, 220)):
    for dx, dy, r in [(-40, 0, 26), (0, -14, 32), (40, 0, 26), (0, 8, 28)]:
        d.ellipse([x + dx * s - r * s, y + dy * s - r * s,
                   x + dx * s + r * s, y + dy * s + r * s], fill=col)

def sun(d, x, y, r=55):
    d.ellipse([x - r - 18, y - r - 18, x + r + 18, y + r + 18], fill=(255, 230, 120, 90))
    d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 214, 64))

def ground(d, y0, col, col2=None):
    d.rectangle([0, y0, W, H], fill=col)
    if col2:
        for x in range(0, W, 90):
            d.line([(x, y0), (x - 40, H)], fill=col2, width=3)

def person(d, cx, feet, h, suit=(25, 25, 35), hat="top", skin=(235, 190, 150),
           moustache=True, tie=(180, 30, 30), shirt=(255, 255, 255)):
    hr = h * 0.085
    leg_h = h * 0.28
    torso_top = feet - h * 0.72
    hip = feet - leg_h
    # legs
    lw = h * 0.075
    d.rectangle([cx - lw - 4, hip, cx - 4, feet], fill=(20, 20, 28))
    d.rectangle([cx + 4, hip, cx + lw + 4, feet], fill=(20, 20, 28))
    d.ellipse([cx - lw - 10, feet - 12, cx + 2, feet + 8], fill=(10, 10, 14))
    d.ellipse([cx - 2, feet - 12, cx + lw + 10, feet + 8], fill=(10, 10, 14))
    # torso jacket
    sw = h * 0.17
    d.polygon([(cx - sw, torso_top), (cx + sw, torso_top),
               (cx + sw * 0.82, hip), (cx - sw * 0.82, hip)], fill=suit)
    # shirt + tie
    d.polygon([(cx - sw * 0.35, torso_top), (cx + sw * 0.35, torso_top),
               (cx, hip - 10)], fill=shirt)
    d.polygon([(cx - 10, torso_top + 8), (cx + 10, torso_top + 8),
               (cx + 6, torso_top + 90), (cx - 6, torso_top + 90)], fill=tie)
    # arms
    d.line([(cx - sw + 6, torso_top + 20), (cx - sw - 14, hip - 30)], fill=suit, width=int(h * 0.045))
    d.line([(cx + sw - 6, torso_top + 20), (cx + sw + 14, hip - 30)], fill=suit, width=int(h * 0.045))
    d.ellipse([cx - sw - 24, hip - 44, cx - sw - 4, hip - 24], fill=skin)
    d.ellipse([cx + sw + 4, hip - 44, cx + sw + 24, hip - 24], fill=skin)
    # head
    hcy = torso_top - hr * 0.9
    d.ellipse([cx - hr, hcy - hr, cx + hr, hcy + hr], fill=skin)
    # ears
    d.ellipse([cx - hr - 8, hcy - 10, cx - hr + 6, hcy + 12], fill=skin)
    d.ellipse([cx + hr - 6, hcy - 10, cx + hr + 8, hcy + 12], fill=skin)
    # eyes
    for ex in (-hr * 0.38, hr * 0.38):
        d.ellipse([cx + ex - 6, hcy - hr * 0.25 - 6, cx + ex + 6, hcy - hr * 0.25 + 6], fill=(20, 20, 20))
    # eyebrows
    d.line([(cx - hr * 0.55, hcy - hr * 0.45), (cx - hr * 0.2, hcy - hr * 0.5)], fill=(40, 30, 20), width=4)
    d.line([(cx + hr * 0.2, hcy - hr * 0.5), (cx + hr * 0.55, hcy - hr * 0.45)], fill=(40, 30, 20), width=4)
    # nose
    d.line([(cx, hcy - hr * 0.1), (cx - 4, hcy + hr * 0.25)], fill=(200, 150, 110), width=4)
    if moustache:
        d.ellipse([cx - hr * 0.5, hcy + hr * 0.28, cx + hr * 0.5, hcy + hr * 0.55], fill=(30, 20, 15))
    # smile
    d.arc([cx - hr * 0.4, hcy + hr * 0.35, cx + hr * 0.4, hcy + hr * 0.85],
          start=15, end=165, fill=(120, 60, 40), width=4)
    # hat
    if hat == "top":
        bw = hr * 2.3
        d.rectangle([cx - bw / 2, hcy - hr - h * 0.13, cx + bw / 2, hcy - hr + 4], fill=(15, 15, 20))
        d.rectangle([cx - hr * 1.35, hcy - hr - 2, cx + hr * 1.35, hcy - hr + 10], fill=(15, 15, 20))
        d.rectangle([cx - bw / 2, hcy - hr - h * 0.05, cx + bw / 2, hcy - hr - h * 0.02], fill=(200, 40, 40))
    elif hat == "bowler":
        d.pieslice([cx - hr * 1.05, hcy - hr - h * 0.09, cx + hr * 1.05, hcy - hr + h * 0.06],
                   start=180, end=360, fill=(40, 30, 25))
        d.rectangle([cx - hr * 1.35, hcy - hr - 2, cx + hr * 1.35, hcy - hr + 10], fill=(40, 30, 25))
    elif hat == "cap":
        d.pieslice([cx - hr * 1.05, hcy - hr - h * 0.08, cx + hr * 1.05, hcy - hr + h * 0.05],
                   start=180, end=360, fill=(25, 45, 110))
        d.rectangle([cx - hr * 1.3, hcy - hr - h * 0.02, cx + hr * 1.3, hcy - hr + 8], fill=(25, 45, 110))
        d.ellipse([cx - 10, hcy - hr - h * 0.05, cx + 10, hcy - hr - h * 0.01], fill=(255, 215, 0))
    return hcy - hr - h * 0.13

def eiffel(d, cx, base, h, col=(70, 45, 25), gold=False):
    apex = base - h
    half = h * 0.30
    lw = max(8, int(h * 0.018))
    # legs
    d.line([(cx - half, base), (cx, apex)], fill=col, width=lw)
    d.line([(cx + half, base), (cx, apex)], fill=col, width=lw)
    d.line([(cx - half * 0.55, base - h * 0.35), (cx + half * 0.55, base - h * 0.35)], fill=col, width=lw)
    # cross bars
    for t in (0.25, 0.5, 0.72, 0.88):
        y = base - h * t
        wdt = half * (1 - t) * 2
        d.line([(cx - wdt / 2, y), (cx + wdt / 2, y)], fill=col, width=max(5, lw - 3))
    # platforms
    for t, pw in ((0.35, 0.62), (0.62, 0.42)):
        y = base - h * t
        wdt = half * (1 - t) * 2 * pw + 60
        d.rectangle([cx - wdt / 2, y - 8, cx + wdt / 2, y + 8], fill=col)
    # spire + lights
    d.line([(cx, apex), (cx, apex - h * 0.10)], fill=col, width=8)
    d.ellipse([cx - 7, apex - h * 0.10 - 7, cx + 7, apex - h * 0.10 + 7], fill=(255, 215, 0))
    if gold:
        for t in (0.2, 0.45, 0.7):
            d.ellipse([cx - 5, base - h * t - 5, cx + 5, base - h * t + 5], fill=(255, 215, 0))

def building(d, x, y, w, h, col):
    d.rectangle([x, y, x + w, y + h], fill=col, outline=(0, 0, 0), width=3)
    for r in range(3):
        for c in range(3):
            wx, wy = x + 18 + c * (w - 36) // 3, y + 20 + r * (h - 40) // 3
            d.rectangle([wx, wy, wx + (w - 60) // 3, wy + (h - 70) // 3], fill=(255, 220, 120))

def lamp(d, x, y, h=150):
    d.line([(x, y), (x, y - h)], fill=(30, 30, 35), width=6)
    d.ellipse([x - 16, y - h - 18, x + 16, y - h + 14], fill=(255, 215, 0), outline=(30, 30, 35), width=3)
    d.ellipse([x - 30, y - h - 30, x + 30, y - h + 26], fill=(255, 230, 120, 70))

def tree(d, x, y, s=1.0):
    d.rectangle([x - 8 * s, y - 50 * s, x + 8 * s, y], fill=(90, 55, 25))
    for dy, r in [(-90, 55), (-130, 42), (-60, 48)]:
        d.ellipse([x - r * s, y + dy * s - r * s, x + r * s, y + dy * s + r * s], fill=(35, 120, 60))

def new_img(top, bottom):
    img = Image.new("RGB", (W, H), top)
    gradient(img, top, bottom)
    return img, ImageDraw.Draw(img)

# ---------------- scenes ----------------
def s01():
    img, d = new_img((70, 140, 220), (190, 225, 250))
    sun(d, 600, 130); cloud(d, 150, 150); cloud(d, 480, 90, 0.8)
    eiffel(d, 600, 1080, 620, col=(90, 60, 35))
    ground(d, 1080, (90, 80, 70), (70, 60, 55))
    lamp(d, 90, 1080); tree(d, 640, 1080, 0.9)
    # newspaper large
    d.rounded_rectangle([60, 210, 660, 1010], radius=10, fill=(250, 244, 225), outline=(20, 20, 20), width=5)
    d.text((360, 250), "LE MATIN", font=f(64), fill=(15, 15, 15), anchor="ma")
    d.text((360, 330), "PARIS, 1925 • EDITION DU MATIN", font=f(24), fill=(80, 80, 80), anchor="ma")
    d.line([(90, 370), (630, 370)], fill=(15, 15, 15), width=4)
    for ln, yy in [("MENARA EIFFEL", 410), ("DIJUAL", 490)]:
        d.text((360, yy), ln, font=f(68), fill=(180, 20, 20) if ln == "DIJUAL" else (15, 15, 15), anchor="ma")
    d.line([(90, 600), (630, 600)], fill=(120, 120, 120), width=2)
    # fake columns
    for x in (90, 260, 430):
        for yy in range(640, 950, 34):
            d.rectangle([x, yy, x + 130, yy + 14], fill=(170, 165, 150))
    d.text((360, 965), "Prix: 25 centimes • 8 Pages", font=f(22), fill=(90, 90, 90), anchor="ma")
    banner(d, "BIAYA PERBAIKAN: 250 JUTA FRANC")
    return img

def s02():
    img, d = new_img((245, 200, 140), (120, 90, 60))
    # window with Paris view
    d.rectangle([60, 240, 300, 620], fill=(150, 200, 240), outline=(60, 40, 20), width=8)
    d.line([(180, 240), (180, 620)], fill=(60, 40, 20), width=6)
    d.line([(60, 430), (300, 430)], fill=(60, 40, 20), width=6)
    eiffel(d, 240, 620, 300, col=(70, 50, 30))
    d.rectangle([420, 240, 680, 620], fill=(200, 160, 110), outline=(60, 40, 20), width=6)
    d.text((550, 300), "PARIS", font=f(44), fill=(90, 50, 20), anchor="ma")
    d.text((550, 380), "1925", font=f(60), fill=(90, 50, 20), anchor="ma")
    ground(d, 1080, (110, 80, 50))
    title(d, "VICTOR LUSTIG")
    person(d, 360, 1040, 640, suit=(25, 25, 35), hat="top")
    # newspaper held in front
    d.rounded_rectangle([230, 700, 490, 900], radius=8, fill=(250, 244, 225), outline=(20, 20, 20), width=4)
    d.text((360, 720), "LE MATIN", font=f(34), fill=(15, 15, 15), anchor="ma")
    d.text((360, 770), "EIFFEL", font=f(48), fill=(180, 20, 20), anchor="ma")
    d.text((360, 830), "DIJUAL", font=f(48), fill=(180, 20, 20), anchor="ma")
    banner(d, "PENIPU PALING LICIN DI EROPA")
    return img

def s03():
    img, d = new_img((120, 30, 40), (70, 15, 25))
    # chandelier
    d.line([(360, 210), (360, 300)], fill=(255, 215, 0), width=6)
    d.rectangle([240, 296, 480, 312], fill=(180, 140, 40))
    for dx in (-90, -45, 0, 45, 90):
        d.line([(360 + dx, 312), (360 + dx, 330)], fill=(255, 215, 0), width=4)
        d.ellipse([360 + dx - 14, 330, 360 + dx + 14, 358], fill=(255, 220, 100))
    # curtains
    d.rectangle([0, 210, 90, 1080], fill=(150, 25, 25))
    d.rectangle([630, 210, 720, 1080], fill=(150, 25, 25))
    # red carpet
    d.polygon([(180, 1080), (540, 1080), (460, 700), (260, 700)], fill=(170, 30, 30))
    title(d, "HOTEL CRILLON", fill=(255, 215, 0))
    # back row: 4 dealers, smaller and higher so heads do not overlap Lustig
    person(d, 120, 920, 430, suit=(70, 55, 40), hat="bowler", moustache=False)
    person(d, 270, 920, 430, suit=(60, 60, 80), hat="bowler", moustache=False)
    person(d, 450, 920, 430, suit=(80, 50, 35), hat="bowler", moustache=False)
    person(d, 600, 920, 430, suit=(45, 60, 45), hat="bowler", moustache=False)
    person(d, 360, 1040, 620, suit=(25, 25, 35), hat="top")
    banner(d, "ENAM PEDAGANG BESI MENUNGGU")
    return img

def s04():
    img, d = new_img((25, 40, 90), (10, 18, 45))
    d.rectangle([0, 1080, 720, 1280], fill=(40, 28, 18))
    # desk
    d.rectangle([70, 760, 650, 1010], fill=(110, 70, 35), outline=(50, 30, 15), width=4)
    title(d, "KONTRAK RAHASIA", fill=(255, 215, 0))
    # big document (narrower so the two men at the sides do not cover its text)
    d.rounded_rectangle([150, 300, 570, 740], radius=8, fill=(250, 244, 225), outline=(20, 20, 20), width=5)
    d.text((360, 330), "KONTRAK PENJUALAN", font=f(36), fill=(15, 15, 15), anchor="ma")
    d.text((360, 410), "7.000 TON", font=f(64), fill=(15, 15, 15), anchor="ma")
    d.text((360, 500), "BESI", font=f(64), fill=(15, 15, 15), anchor="ma")
    d.line([(190, 600), (530, 600)], fill=(120, 120, 120), width=3)
    d.text((360, 625), "TANDA TANGAN DI SINI", font=f(26), fill=(90, 90, 90), anchor="ma")
    # RAHASIA stamp, fully inside the document
    d.rounded_rectangle([330, 660, 545, 725], radius=10, outline=(200, 20, 20), width=5)
    d.text((437, 678), "RAHASIA", font=f(30), fill=(200, 20, 20), anchor="ma")
    person(d, 85, 1010, 470, suit=(25, 25, 35), hat="top")
    person(d, 635, 1010, 470, suit=(70, 55, 40), hat="bowler", moustache=False)
    banner(d, "HARGA: 250.000 FRANC")
    return img

def s05():
    img, d = new_img((200, 120, 80), (90, 50, 35))
    cloud(d, 150, 180, 0.9); cloud(d, 550, 130, 0.7)
    ground(d, 1080, (100, 75, 50))
    tree(d, 55, 1080, 0.8)
    tree(d, 665, 1080, 0.8)
    title(d, "POISSON RAGU")
    # Poisson left, worried; Lustig right whispering
    person(d, 200, 1020, 580, suit=(70, 55, 40), hat="bowler", moustache=False)
    person(d, 520, 1020, 620, suit=(25, 25, 35), hat="top")
    # whisper lines beside Lustig's mouth (mouth is near y=540)
    for yy in (500, 525, 550):
        d.line([(425, yy), (465, yy)], fill=(255, 215, 0), width=5)
    # doubt mark above Poisson
    d.text((200, 300), "?", font=f(110), fill=(255, 215, 0), anchor="ma",
           stroke_width=4, stroke_fill=(20, 20, 20))
    banner(d, "SUAP = BUKTI KEASLIAN")
    return img

def s06():
    img, d = new_img((20, 25, 60), (5, 8, 30))
    # moon + stars
    d.ellipse([580, 240, 650, 310], fill=(240, 240, 210))
    for x, y in [(100, 260), (200, 330), (480, 250), (350, 290), (650, 380)]:
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(255, 255, 255))
    building(d, 40, 700, 150, 380, (50, 45, 70))
    building(d, 530, 660, 150, 420, (55, 48, 75))
    ground(d, 1080, (25, 25, 35))
    title(d, "KOPER PENUH UANG", fill=(255, 215, 0))
    # Lustig first, then the open suitcase in front of him so coins/bills stay visible
    person(d, 360, 1040, 560, suit=(25, 25, 35), hat="top")
    d.rounded_rectangle([170, 780, 550, 1000], radius=16, fill=(120, 75, 35), outline=(50, 30, 15), width=5)
    d.rectangle([170, 780, 550, 830], fill=(90, 55, 25))
    for x in range(200, 540, 60):
        d.ellipse([x, 840, x + 44, 884], fill=(255, 215, 0), outline=(180, 130, 0), width=3)
    for x in range(210, 530, 80):
        d.rectangle([x, 900, x + 60, 950], fill=(80, 180, 90), outline=(20, 100, 40), width=3)
    banner(d, "LUSTIG KABUR KE WINA")
    return img

def s07():
    img, d = new_img((70, 110, 180), (170, 200, 230))
    cloud(d, 150, 160); cloud(d, 520, 120, 0.8)
    # police station facade
    d.rectangle([60, 300, 660, 1080], fill=(200, 190, 170), outline=(40, 40, 40), width=5)
    d.polygon([(60, 300), (360, 200), (660, 300)], fill=(120, 40, 40))
    d.text((360, 330), "POLICE", font=f(56), fill=(25, 45, 110), anchor="ma")
    d.rectangle([280, 700, 440, 1080], fill=(60, 45, 30), outline=(20, 20, 20), width=4)
    d.ellipse([360, 760, 380, 780], fill=(255, 215, 0))
    for x in (130, 520):
        d.rectangle([x, 450, x + 90, 600], fill=(150, 200, 240), outline=(40, 40, 40), width=4)
    ground(d, 1080, (95, 90, 85))
    title(d, "POISSON DI POLISI", fill=(20, 20, 40))
    person(d, 230, 1040, 560, suit=(70, 55, 40), hat="bowler", moustache=False)
    person(d, 500, 1040, 600, suit=(25, 45, 110), hat="cap", moustache=False)
    banner(d, "MALU • IA TIDAK MELAPOR")
    return img

def s08():
    img, d = new_img((230, 180, 90), (140, 100, 55))
    sun(d, 620, 140); cloud(d, 140, 160); cloud(d, 480, 110, 0.8)
    tree(d, 90, 1080); tree(d, 640, 1080, 0.85)
    ground(d, 1080, (120, 95, 60))
    title(d, "SEBULAN KEMUDIAN")
    # big calendar on the LEFT, Lustig on the RIGHT — no overlap
    d.rounded_rectangle([60, 250, 460, 600], radius=14, fill=(250, 244, 225), outline=(20, 20, 20), width=5)
    d.rectangle([60, 250, 460, 330], fill=(180, 25, 25))
    d.text((260, 265), "BULAN DEPAN", font=f(34), fill=(255, 255, 255), anchor="ma")
    for r in range(3):
        for c in range(5):
            x, y = 100 + c * 68, 370 + r * 68
            col = (200, 25, 25) if (r, c) == (1, 2) else (230, 225, 215)
            d.ellipse([x, y, x + 48, y + 48], fill=col, outline=(120, 120, 120), width=2)
    # clock below the calendar
    d.ellipse([150, 660, 250, 760], fill=(250, 244, 225), outline=(20, 20, 20), width=5)
    d.line([(200, 710), (200, 675)], fill=(20, 20, 20), width=5)
    d.line([(200, 710), (228, 720)], fill=(20, 20, 20), width=5)
    person(d, 570, 1040, 560, suit=(25, 25, 35), hat="top")
    # suitcase at bottom left, clear of Lustig
    d.rounded_rectangle([70, 900, 220, 1010], radius=10, fill=(120, 75, 35), outline=(50, 30, 15), width=4)
    banner(d, "DUA KALI LEBIH CEPAT")
    return img

def s09():
    img, d = new_img((90, 160, 230), (200, 225, 250))
    sun(d, 110, 140); cloud(d, 450, 150); cloud(d, 200, 100, 0.7)
    # sea
    d.rectangle([0, 820, 720, 1280], fill=(25, 90, 150))
    for y in (900, 980, 1080, 1180):
        for x in range(0, 720, 120):
            d.arc([x, y, x + 110, y + 40], start=200, end=340, fill=(200, 230, 255), width=5)
    title(d, "KAPAL KE AMERIKA")
    # big ship
    d.polygon([(110, 820), (610, 820), (560, 960), (160, 960)], fill=(140, 35, 35))
    d.rectangle([180, 700, 540, 820], fill=(245, 240, 225), outline=(40, 40, 40), width=4)
    for x in (230, 330, 430):
        d.rectangle([x, 730, x + 50, 790], fill=(150, 200, 240), outline=(40, 40, 40), width=3)
    d.rectangle([250, 560, 310, 700], fill=(60, 60, 70))
    d.rectangle([410, 560, 470, 700], fill=(60, 60, 70))
    d.ellipse([240, 540, 320, 580], fill=(200, 230, 255))
    d.ellipse([400, 540, 480, 580], fill=(200, 230, 255))
    # flag on the left funnel, clear of Lustig's head
    d.line([(200, 560), (200, 430)], fill=(40, 40, 40), width=6)
    d.polygon([(200, 430), (280, 465), (200, 500)], fill=(200, 25, 25))
    person(d, 360, 700, 300, suit=(25, 25, 35), hat="top")
    banner(d, "TARGET BERIKUTNYA: AL CAPONE")
    return img

def s10():
    img, d = new_img((15, 20, 55), (45, 30, 80))
    # stars + fireworks
    for x, y in [(80, 200), (180, 130), (300, 220), (480, 140), (620, 230), (90, 320), (650, 330)]:
        d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(255, 255, 255))
    for cx, cy, col in [(130, 260, (255, 80, 80)), (590, 280, (80, 200, 255))]:
        for a in range(0, 360, 45):
            rad = math.radians(a)
            d.line([(cx, cy), (cx + 55 * math.cos(rad), cy + 55 * math.sin(rad))], fill=col, width=4)
        d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 215, 0))
    eiffel(d, 360, 1010, 700, col=(120, 85, 40), gold=True)
    ground(d, 1010, (20, 25, 45))
    # small crowd silhouettes at base
    for x in (120, 200, 520, 600):
        d.ellipse([x - 18, 950, x + 18, 986], fill=(30, 30, 40))
        d.rectangle([x - 22, 986, x + 22, 1040], fill=(30, 30, 40))
    title(d, "MENARA EIFFEL MASIH BERDIRI", fill=(255, 215, 0), size=50)
    banner(d, "FOLLOW UNTUK CERITA UANG LAINNYA")
    return img

SCENES = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10]
for i, fn in enumerate(SCENES, 1):
    img = fn()
    img.save(f"{OUT}/scene-{i:02d}.png")
    print(f"scene-{i:02d}.png", img.size)
print("done")
