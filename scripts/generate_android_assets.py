import os
import subprocess
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

def render_html_to_png(html_content, output_path, width, height):
    temp_html = os.path.join(BASE_DIR, "temp_render.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={output_path}",
        "file:///" + os.path.abspath(temp_html).replace("\\", "/")
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)

def generate_assets():
    print("Generating Master Launcher Icon...")
    # Master Launcher Icon HTML (Square Squircle)
    icon_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1024px;
    height: 1024px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .icon-wrapper {
    width: 820px;
    height: 820px;
    border-radius: 240px;
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(2, 132, 199, 0.22), 0 8px 24px rgba(13, 148, 136, 0.15);
    border: 18px solid rgba(13, 148, 136, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
</style>
</head>
<body>
  <div class="icon-wrapper">
    <svg width="620" height="620" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dhtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id="dhtFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <!-- Outer Habit Loop Arc -->
      <path d="M 28 10 A 18 18 0 1 1 13 36" stroke="url(#dhtLogoGrad)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="28" cy="10" r="3.2" fill="#0d9488" />
      <circle cx="46" cy="28" r="3.2" fill="#0284c7" />
      <circle cx="13" cy="36" r="3.2" fill="#38bdf8" />
      <!-- Inner Momentum Core -->
      <path d="M 28 19 C 31.5 23.5, 35 26, 35 30.5 C 35 34.3, 31.8 37, 28 37 C 24.2 37, 21 34.3, 21 30.5 C 21 26.5, 24.5 23.5, 28 19 Z" fill="url(#dhtFlameGrad)" />
      <circle cx="28" cy="31.5" r="2.1" fill="#ffffff" />
    </svg>
  </div>
</body>
</html>"""

    # Master Foreground Icon (for adaptive icons, centered in 1024x1024 canvas)
    foreground_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1024px;
    height: 1024px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .icon-wrapper {
    width: 600px;
    height: 600px;
    border-radius: 175px;
    background: #ffffff;
    box-shadow: 0 16px 48px rgba(2, 132, 199, 0.25);
    border: 14px solid rgba(13, 148, 136, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="icon-wrapper">
    <svg width="450" height="450" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dhtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id="dhtFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M 28 10 A 18 18 0 1 1 13 36" stroke="url(#dhtLogoGrad)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="28" cy="10" r="3.2" fill="#0d9488" />
      <circle cx="46" cy="28" r="3.2" fill="#0284c7" />
      <circle cx="13" cy="36" r="3.2" fill="#38bdf8" />
      <path d="M 28 19 C 31.5 23.5, 35 26, 35 30.5 C 35 34.3, 31.8 37, 28 37 C 24.2 37, 21 34.3, 21 30.5 C 21 26.5, 24.5 23.5, 28 19 Z" fill="url(#dhtFlameGrad)" />
      <circle cx="28" cy="31.5" r="2.1" fill="#ffffff" />
    </svg>
  </div>
</body>
</html>"""

    # Master Round Icon
    round_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1024px;
    height: 1024px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }
  .icon-wrapper {
    width: 860px;
    height: 860px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 24px 64px rgba(2, 132, 199, 0.22);
    border: 20px solid rgba(13, 148, 136, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
</head>
<body>
  <div class="icon-wrapper">
    <svg width="600" height="600" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dhtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
        <linearGradient id="dhtFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="50%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <path d="M 28 10 A 18 18 0 1 1 13 36" stroke="url(#dhtLogoGrad)" stroke-width="3.8" stroke-linecap="round" />
      <circle cx="28" cy="10" r="3.2" fill="#0d9488" />
      <circle cx="46" cy="28" r="3.2" fill="#0284c7" />
      <circle cx="13" cy="36" r="3.2" fill="#38bdf8" />
      <path d="M 28 19 C 31.5 23.5, 35 26, 35 30.5 C 35 34.3, 31.8 37, 28 37 C 24.2 37, 21 34.3, 21 30.5 C 21 26.5, 24.5 23.5, 28 19 Z" fill="url(#dhtFlameGrad)" />
      <circle cx="28" cy="31.5" r="2.1" fill="#ffffff" />
    </svg>
  </div>
</body>
</html>"""

    master_icon_path = os.path.join(BASE_DIR, "master_icon.png")
    master_fg_path = os.path.join(BASE_DIR, "master_fg.png")
    master_round_path = os.path.join(BASE_DIR, "master_round.png")

    render_html_to_png(icon_html, master_icon_path, 1024, 1024)
    render_html_to_png(foreground_html, master_fg_path, 1024, 1024)
    render_html_to_png(round_html, master_round_path, 1024, 1024)

    im_icon = Image.open(master_icon_path)
    im_fg = Image.open(master_fg_path)
    im_round = Image.open(master_round_path)

    # Launcher sizes
    mipmap_sizes = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }

    for folder, (icon_sz, fg_sz) in mipmap_sizes.items():
        target_dir = os.path.join(RES_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)
        # ic_launcher.png
        im_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher.png"))
        # ic_launcher_round.png
        im_round.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher_round.png"))
        # ic_launcher_foreground.png
        im_fg.resize((fg_sz, fg_sz), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher_foreground.png"))
        print(f"Generated launcher icons in {folder} ({icon_sz}x{icon_sz}, fg {fg_sz}x{fg_sz})")

    # Clean master files
    for p in [master_icon_path, master_fg_path, master_round_path]:
        if os.path.exists(p): os.remove(p)

    print("\nGenerating Splash Screens...")
    # Splash Screen Template (Portrait & Landscape)
    def create_splash_html(width, height):
        # Responsive scale based on height/width
        min_dim = min(width, height)
        logo_size = int(min_dim * 0.38)
        title_size = max(24, int(min_dim * 0.08))
        sub_size = max(11, int(min_dim * 0.032))
        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: {width}px;
    height: {height}px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }}
  .ambient-glow {{
    position: absolute;
    width: {int(logo_size * 2.2)}px;
    height: {int(logo_size * 2.2)}px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, rgba(2, 132, 199, 0.06) 50%, transparent 75%);
    pointer-events: none;
  }}
  .brand-card {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }}
  .logo-box {{
    width: {logo_size}px;
    height: {logo_size}px;
    border-radius: {int(logo_size * 0.28)}px;
    background: #ffffff;
    border: {max(2, int(logo_size * 0.025))}px solid rgba(13, 148, 136, 0.35);
    box-shadow: 0 {int(logo_size * 0.08)}px {int(logo_size * 0.2)}px rgba(2, 132, 199, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: {int(min_dim * 0.045)}px;
  }}
  .title {{
    font-size: {title_size}px;
    font-weight: 800;
    letter-spacing: -0.025em;
    background: linear-gradient(135deg, #0f766e 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: {int(min_dim * 0.015)}px;
    text-align: center;
  }}
  .subtitle {{
    font-size: {sub_size}px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
  }}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="brand-card">
    <div class="logo-box">
      <svg width="{int(logo_size * 0.72)}" height="{int(logo_size * 0.72)}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dhtLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0d9488" />
            <stop offset="50%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
          <linearGradient id="dhtFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0d9488" />
            <stop offset="50%" stop-color="#0ea5e9" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>
        <path d="M 28 10 A 18 18 0 1 1 13 36" stroke="url(#dhtLogoGrad)" stroke-width="3.8" stroke-linecap="round" />
        <circle cx="28" cy="10" r="3.2" fill="#0d9488" />
        <circle cx="46" cy="28" r="3.2" fill="#0284c7" />
        <circle cx="13" cy="36" r="3.2" fill="#38bdf8" />
        <path d="M 28 19 C 31.5 23.5, 35 26, 35 30.5 C 35 34.3, 31.8 37, 28 37 C 24.2 37, 21 34.3, 21 30.5 C 21 26.5, 24.5 23.5, 28 19 Z" fill="url(#dhtFlameGrad)" />
        <circle cx="28" cy="31.5" r="2.1" fill="#ffffff" />
      </svg>
    </div>
    <div class="title">Habit Tracker</div>
    <div class="subtitle">Atomic Daily Loops</div>
  </div>
</body>
</html>"""

    splash_targets = [
        ("drawable", 480, 320),
        ("drawable-port-mdpi", 320, 480),
        ("drawable-port-hdpi", 480, 800),
        ("drawable-port-xhdpi", 720, 1280),
        ("drawable-port-xxhdpi", 960, 1600),
        ("drawable-port-xxxhdpi", 1280, 1920),
        ("drawable-land-mdpi", 480, 320),
        ("drawable-land-hdpi", 800, 480),
        ("drawable-land-xhdpi", 1280, 720),
        ("drawable-land-xxhdpi", 1600, 960),
        ("drawable-land-xxxhdpi", 1920, 1280),
    ]

    for folder, w, h in splash_targets:
        target_dir = os.path.join(RES_DIR, folder)
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, "splash.png")
        html = create_splash_html(w, h)
        render_html_to_png(html, target_path, w, h)
        print(f"Generated splash screen: {folder}/splash.png ({w}x{h})")

    print("\nAll Android startup assets successfully generated!")

if __name__ == "__main__":
    generate_assets()
