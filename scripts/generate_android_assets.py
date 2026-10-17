import os
import subprocess
from PIL import Image

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES_DIR = os.path.join(BASE_DIR, "android", "app", "src", "main", "res")

def render_html_to_png(html_content, output_path, width, height, transparent=False):
    temp_html = os.path.join(BASE_DIR, "temp_render.html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    cmd = [
        CHROME_PATH,
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=1",
        f"--window-size={width},{height}",
        f"--screenshot={os.path.abspath(output_path)}",
        "file:///" + os.path.abspath(temp_html).replace("\\", "/")
    ]
    if transparent:
        cmd.insert(4, "--default-background-color=00000000")
    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)

def generate_assets():
    print("Generating Master Launcher Icon with user's circular grid logo...")
    # Master Circular Launcher Icon HTML
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
  .circle-badge {
    width: 860px;
    height: 860px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 20px 60px rgba(66, 165, 245, 0.22), 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 8px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
</style>
</head>
<body>
  <div class="circle-badge">
    <svg width="860" height="860" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="0" y1="0" x2="10" y2="0" stroke="#e2e8f0" stroke-width="1.2" />
        </pattern>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="50%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#gridPattern)" opacity="0.85" />
      <g transform="translate(50,50) scale(1.15) translate(-50,-50)">
        <polygon points="21.6,34.2 14.1,42.5 31.6,60.0 24.1,69.2 31.6,75.8 39.9,68.3 58.3,85.8 65.8,78.3" fill="url(#blueGrad)" />
        <polygon points="39.1,16.7 31.6,24.2 75.8,68.3 83.3,60.0 65.8,42.5 84.1,24.2 75.8,15.8 57.4,34.2" fill="url(#blueGrad)" />
      </g>
    </svg>
  </div>
</body>
</html>"""

    # Master Foreground Icon (Centered in 1024x1024 adaptive icon canvas)
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
  .circle-badge {
    width: 660px;
    height: 660px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 16px 48px rgba(66, 165, 245, 0.25);
    border: 6px solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }
</style>
</head>
<body>
  <div class="circle-badge">
    <svg width="660" height="660" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridPatternFg" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#e2e8f0" stroke-width="1.2" />
          <line x1="0" y1="0" x2="10" y2="0" stroke="#e2e8f0" stroke-width="1.2" />
        </pattern>
        <linearGradient id="blueGradFg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="50%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#0284c7" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#gridPatternFg)" opacity="0.85" />
      <g transform="translate(50,50) scale(1.15) translate(-50,-50)">
        <polygon points="21.6,34.2 14.1,42.5 31.6,60.0 24.1,69.2 31.6,75.8 39.9,68.3 58.3,85.8 65.8,78.3" fill="url(#blueGradFg)" />
        <polygon points="39.1,16.7 31.6,24.2 75.8,68.3 83.3,60.0 65.8,42.5 84.1,24.2 75.8,15.8 57.4,34.2" fill="url(#blueGradFg)" />
      </g>
    </svg>
  </div>
</body>
</html>"""

    master_icon_path = os.path.join(BASE_DIR, "master_icon.png")
    master_fg_path = os.path.join(BASE_DIR, "master_fg.png")

    render_html_to_png(icon_html, master_icon_path, 1024, 1024)
    render_html_to_png(foreground_html, master_fg_path, 1024, 1024)

    im_icon = Image.open(master_icon_path)
    im_fg = Image.open(master_fg_path)

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
        im_icon.resize((icon_sz, icon_sz), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher_round.png"))
        # ic_launcher_foreground.png
        im_fg.resize((fg_sz, fg_sz), Image.Resampling.LANCZOS).save(os.path.join(target_dir, "ic_launcher_foreground.png"))
        print(f"Generated launcher icons in {folder} ({icon_sz}x{icon_sz}, fg {fg_sz}x{fg_sz})")

    # Clean master files
    for p in [master_icon_path, master_fg_path]:
        if os.path.exists(p): os.remove(p)

    print("\nGenerating Android 12+ Splash Screen Icon with Logo, Name, and Tagline...")
    splash_icon_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1024px;
    height: 1024px;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }
  .brand-lockup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .circle-badge {
    width: 290px;
    height: 290px;
    border-radius: 50%;
    background: #ffffff;
    border: 6px solid #cbd5e1;
    box-shadow: 0 18px 45px rgba(56, 189, 248, 0.22), 0 4px 14px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 48px;
  }
  .title {
    font-size: 74px;
    font-weight: 800;
    letter-spacing: -0.025em;
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 18px;
    text-align: center;
    line-height: 1.15;
  }
  .subtitle {
    font-size: 38px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-align: center;
  }
</style>
</head>
<body>
  <div class="brand-lockup">
    <div class="circle-badge">
      <svg width="290" height="290" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="splashGrid" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e2e8f0" stroke-width="0.75" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="#e2e8f0" stroke-width="0.75" />
          </pattern>
          <linearGradient id="splashBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="50%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="28" fill="#ffffff" />
        <circle cx="28" cy="28" r="27" fill="url(#splashGrid)" opacity="0.8" />
        <g>
          <polygon points="17.5,22.1 14.7,25.2 21.2,31.7 18.4,35.1 21.2,37.6 24.3,34.8 31.1,41.3 33.9,38.5" fill="url(#splashBlueGrad)" />
          <polygon points="24.0,15.6 21.2,18.4 37.6,34.8 40.4,31.7 33.9,25.2 40.7,18.4 37.6,15.3 30.8,22.1" fill="url(#splashBlueGrad)" />
        </g>
      </svg>
    </div>
    <div class="title">Habit Tracker</div>
    <div class="subtitle">Atomic Daily Loops</div>
  </div>
</body>
</html>"""
    master_splash_icon = os.path.join(BASE_DIR, "master_splash_icon.png")
    render_html_to_png(splash_icon_html, master_splash_icon, 1024, 1024, transparent=True)
    
    with Image.open(master_splash_icon) as im_sp_icon:
        for draw_folder in ["drawable", "drawable-nodpi", "drawable-v24", "drawable-port-xxxhdpi"]:
            icon_target_dir = os.path.join(RES_DIR, draw_folder)
            os.makedirs(icon_target_dir, exist_ok=True)
            im_sp_icon.save(os.path.join(icon_target_dir, "splash_icon.png"))
            print(f"Generated Android 12+ splash icon: {draw_folder}/splash_icon.png (1024x1024)")
    if os.path.exists(master_splash_icon):
        os.remove(master_splash_icon)

    print("\nGenerating Splash Screens matching screenshot...")
    # Splash Screen Template (Clean background, circular grid badge, dual-T icon, title, and tagline)
    def create_splash_html(width, height):
        min_dim = min(width, height)
        scale = min_dim / 390.0
        badge_size = int(84 * scale)
        margin_badge = int(14 * scale)
        title_size = int(22 * scale)
        margin_title = int(5 * scale)
        sub_size = int(11 * scale)
        
        return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    width: {width}px;
    height: {height}px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }}
  .brand-card {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 10;
  }}
  .circle-badge {{
    width: {badge_size}px;
    height: {badge_size}px;
    border-radius: 50%;
    background: #ffffff;
    border: {max(2, int(badge_size * 0.02))}px solid #cbd5e1;
    box-shadow: 0 {int(badge_size * 0.08)}px {int(badge_size * 0.22)}px rgba(56, 189, 248, 0.22), 0 4px 12px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin-bottom: {margin_badge}px;
  }}
  .title {{
    font-size: {title_size}px;
    font-weight: 800;
    letter-spacing: -0.025em;
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: {margin_title}px;
    text-align: center;
    line-height: 1.15;
  }}
  .subtitle {{
    font-size: {sub_size}px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-align: center;
  }}
</style>
</head>
<body>
  <div class="brand-card">
    <div class="circle-badge">
      <svg width="{badge_size}" height="{badge_size}" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="splashGrid" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45 0 0)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#e2e8f0" stroke-width="0.75" />
            <line x1="0" y1="0" x2="6" y2="0" stroke="#e2e8f0" stroke-width="0.75" />
          </pattern>
          <linearGradient id="splashBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="50%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="28" fill="#ffffff" />
        <circle cx="28" cy="28" r="27" fill="url(#splashGrid)" opacity="0.8" />
        <g>
          <polygon points="17.5,22.1 14.7,25.2 21.2,31.7 18.4,35.1 21.2,37.6 24.3,34.8 31.1,41.3 33.9,38.5" fill="url(#splashBlueGrad)" />
          <polygon points="24.0,15.6 21.2,18.4 37.6,34.8 40.4,31.7 33.9,25.2 40.7,18.4 37.6,15.3 30.8,22.1" fill="url(#splashBlueGrad)" />
        </g>
      </svg>
    </div>
    <div class="title">Habit Tracker</div>
    <div class="subtitle">Atomic Daily Loops</div>
  </div>
</body>
</html>"""

    splash_targets = [
        ("drawable", 1080, 1920),
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

    print("\nAll Android startup assets successfully updated with user's logo!")

if __name__ == "__main__":
    generate_assets()
