"""Extract local study fragments; never modify the source experiments."""
from html.parser import HTMLParser
from pathlib import Path
import json
import shutil
import hashlib
import re
from adapt_engines import build_engines

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parent
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class Node:
    def __init__(self, tag="root", attrs=None, start="", parent=None):
        self.tag, self.attrs, self.start, self.parent = tag, dict(attrs or []), start, parent
        self.children = []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def html(self):
        contents = "".join(child.html() if isinstance(child, Node) else child for child in self.children)
        return self.start + contents + (f"</{self.tag}>" if self.tag not in VOID and self.tag != "root" else "")

    def text(self):
        return "".join(child.text() if isinstance(child, Node) else child for child in self.children)

    def has(self, name):
        return name in self.attrs.get("class", "").split()


class Tree(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=False)
        self.root = self.current = Node()
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.get_starttag_text(), self.current)
        self.current.children.append(node)
        if tag not in VOID:
            self.current = node

    def handle_startendtag(self, tag, attrs):
        self.current.children.append(Node(tag, attrs, self.get_starttag_text(), self.current))

    def handle_endtag(self, tag):
        node = self.current
        while node.parent and node.tag != tag:
            node = node.parent
        if node.tag == tag and node.parent:
            self.current = node.parent

    def handle_data(self, data):
        self.current.children.append(data)

    def handle_entityref(self, name):
        self.current.children.append(f"&{name};")

    def handle_charref(self, name):
        self.current.children.append(f"&#{name};")


def first(root, predicate):
    return next(node for node in root.walk() if predicate(node))


def load(relative):
    return Tree(WORKSPACE / relative).root


def build():
    laper = load("laper/index.html")
    pricing = load("laper/pricing/index.html")
    cromma = load("cromma-landing/index.html")
    (ROOT / "demos").mkdir(exist_ok=True)
    (ROOT / "snapshots").mkdir(exist_ok=True)
    copies = {
        "laper/assets/site.css": "laper.css",
        "laper/lang-flags.js": "lang-flags.js",
        "cromma-landing/styles.css": "cromma.css",
        "cromma-landing/clouds.js": "clouds.js",
        "cromma-landing/field.js": "field.js",
        "cromma-landing/assets/montserrat-Dk9Pm7OY.woff2": "assets/montserrat-Dk9Pm7OY.woff2",
        "laper/assets/landing/laper-feature-script-workspace.png": "assets/editor-workspace.png",
    }
    provenance = []
    for source, target in copies.items():
        destination = ROOT / "snapshots" / target
        destination.parent.mkdir(exist_ok=True, parents=True)
        shutil.copyfile(WORKSPACE / source, destination)
        provenance.append({"source": source, "snapshot": f"snapshots/{target}", "sha256": hashlib.sha256(destination.read_bytes()).hexdigest()})
    build_engines(ROOT)

    def emit(slug, theme, mode, fragment, origin, selector, extra=""):
        # Sample controls stay local, even when their original node was a product link.
        fragment = re.sub(r'\shref="[^"]*"', ' href="#"', fragment)
        fragment = re.sub(r'\sdata-fast-goal="[^"]*"', '', fragment)
        scripts = []
        if mode == "menu" and theme == "laper":
            scripts.append("snapshots/lang-flags.js")
        if mode in {"field", "toast"}:
            scripts.append("engines/field.js")
        if mode == "cloud":
            scripts.append("engines/clouds.js")
        scripts.append("demos/demo.js")
        if mode in {"viewer", "reel", "spring", "toast"}:
            scripts.append("demos/motion.js")
        tags = "\n".join(f'<script {"type=\"module\" " if script.endswith("motion.js") else ""}src="../{script}"></script>' for script in scripts)
        document = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{slug} · Component Atlas</title><link rel="stylesheet" href="../snapshots/{theme}.css">
<link rel="stylesheet" href="demo.css"></head>
<body data-demo="{mode}" data-theme="{theme}" data-variant="{slug}">
<main id="sample" class="sample {extra}">{fragment}</main>
{tags}</body></html>
'''
        (ROOT / "demos" / f"{slug}.html").write_text(document, encoding="utf-8", newline="\n")
        files = [f"demos/{slug}.html", f"snapshots/{theme}.css", "demos/demo.css", *scripts]
        if "demos/motion.js" in scripts:
            files.append("demos/motion-core.js")
        assets = ["snapshots/assets/montserrat-Dk9Pm7OY.woff2"]
        if mode in {"viewer", "spring"}:
            assets.append("snapshots/assets/editor-workspace.png")
        provenance.append({"variant": slug, "source": origin, "selector": selector, "theme": theme, "mode": mode, "files": files, "assets": assets})

    find_text = lambda root, text: first(root, lambda n: n.tag in {"a", "button"} and n.text().strip() == text)
    emit("button-laper-primary", "laper", "button", find_text(laper, "Login").html(), "laper/index.html", "header a[href*='login']")
    outline = first(laper, lambda n: n.tag == "button" and n.text().strip() == "Add files")
    emit("button-laper-outline", "laper", "button", outline.html(), "laper/index.html", "button: Add files")
    tag = find_text(cromma, "Download").html().replace("hidden sm:inline-flex", "inline-flex")
    emit("button-cromma-tag", "cromma", "button", tag, "cromma-landing/index.html", "header a: Download")
    emit("button-cromma-primary", "cromma", "button", find_text(cromma, "Log in").html(), "cromma-landing/index.html", "header button: Log in")
    emit("menu-laper", "laper", "menu", first(laper, lambda n: n.attrs.get("aria-haspopup") == "menu").html(), "laper/index.html + page.js", "header [aria-haspopup='menu']")
    emit("menu-cromma", "cromma", "menu", first(cromma, lambda n: n.attrs.get("aria-label") == "Language").html(), "cromma-landing/index.html + script.js", "header [aria-label='Language']")
    toggle = first(pricing, lambda n: n.attrs.get("role") == "switch")
    emit("billing-laper", "laper", "billing", toggle.parent.html() + '<div class="billing-value"><span data-price>$20</span><small data-unit> / mo.</small><p data-average></p></div>', "laper/pricing/index.html + page.js", "[role='switch']; YEARLY['Laper Senior']", "vertical")
    form = first(cromma, lambda n: n.tag == "form")
    # The attachment affordance is removed: the first edition demonstrates text input only.
    prompt = form.html()
    attach = first(form, lambda n: n.attrs.get("aria-label") == "Attach")
    prompt = prompt.replace(attach.html(), '<span class="text-sm text-muted-foreground">本地交互演示</span>')
    scope = first(form, lambda n: n.tag == "button" and n.text().strip() == "For me")
    prompt = prompt.replace(scope.html(), '')
    emit("prompt-cromma", "cromma", "prompt", prompt, "cromma-landing/index.html + script.js", "#top form; textarea; button[aria-label='Send']", "prompt-sample")
    faq = first(cromma, lambda n: n.attrs.get("id") == "faq")
    questions = [n.parent.html() for n in faq.walk() if n.tag == "button"][:3]
    emit("accordion-cromma", "cromma", "accordion", '<div id="faq" class="faq-sample">' + "".join(questions) + '</div>', "cromma-landing/index.html + script.js", "#faq button[aria-expanded]", "vertical")
    aurora = first(cromma, lambda n: n.has("aurora-fade"))
    dot = first(cromma, lambda n: n.has("dot-grid"))
    emit("aurora-cromma", "cromma", "aurora", '<div class="relative w-full h-full overflow-hidden bg-panel">' + dot.html() + aurora.html() + '<div class="effect-caption relative z-20">Aurora wash<small>旋转色场 · 漂移光束 · 点状网格</small></div></div>', "cromma-landing/index.html + styles.css", "#top .aurora-fade; .dot-grid; .aurora-wash", "full")
    for variant in ["static", "animated"]:
        emit(f"field-{variant}", "cromma", "field", '<div class="effect-caption">Newton field<small>6px 单元 · 透明背景 · 原始着色器</small></div><div class="absolute inset-0" data-field></div>', "cromma-landing/field.js + script.js", "#pricing span.h-44 > div" if variant == "static" else "#top .cromma-edge span.absolute.inset-0 > div", "full relative")
    for variant in ["hero", "footer"]:
        emit(f"cloud-{variant}", "cromma", "cloud", '<div class="absolute inset-0" data-cloud></div><div class="cloud-controls relative z-20"><button type="button" data-pulse>变换云形 ↗</button></div>', "cromma-landing/clouds.js + script.js", "#cloud-root" if variant == "hero" else "#download footer cloud", "full relative")
    reveal = first(cromma, lambda n: n.has("reveal") and n.tag in {"h2", "p"})
    emit("reveal-cromma", "cromma", "reveal", '<div data-reveal>' + reveal.html() + '</div><button class="replay-button" type="button" data-replay>重新播放 ↻</button>', "cromma-landing/styles.css + desk.js", ".reveal → .reveal.is-in", "vertical")
    laper_heading = first(laper, lambda n: n.tag == "h1")
    emit("reveal-laper", "laper", "reveal", '<div data-reveal>' + laper_heading.html() + '</div><button class="replay-button" type="button" data-replay>重新播放 ↻</button>', "laper/index.html + page.js", "h1[style]; reveal()", "vertical")
    text = first(laper, lambda n: n.has("landing-footer-logo-draw"))
    emit("outline-laper", "laper", "outline", text.parent.html(), "laper/index.html + assets/site.css", "footer svg text.landing-footer-logo-draw", "full outline-sample")
    senior = first(pricing, lambda n: n.tag == "h3" and "Senior" in n.text())
    card = senior.parent
    while not card.has("rounded-3xl"):
        card = card.parent
    emit("card-laper", "laper", "card", card.html(), "laper/pricing/index.html", "h3: Laper Senior → .rounded-3xl", "card-sample")
    plan = find_text(cromma, "Choose Plus")
    card = plan.parent
    while not (card.tag == "div" and card.has("group")):
        card = card.parent
    emit("card-cromma", "cromma", "card", card.html(), "cromma-landing/index.html", "#pricing button: Choose Plus → div.group", "card-sample")
    viewer = '<button type="button" data-viewer-open class="viewer-trigger relative overflow-hidden rounded-xl border border-border bg-card shadow-lg" aria-label="展开共享元素预览"><img src="../snapshots/assets/editor-workspace.png" alt="Laper 编辑器样张"><span class="viewer-caption absolute inset-x-0 bottom-0">点击展开 ↗</span></button>'
    emit("viewer-laper", "laper", "viewer", viewer, "laper/page.js", "openLaunchVideo(); videoExpandedRect(); VIDEO_MOVE", "viewer-sample")
    hero = first(laper, lambda n: n.attrs.get("data-fast-scroll") == "scroll_to_hero_chat")
    row = first(hero, lambda n: "perspective" in n.attrs.get("style", ""))
    cards = [n for n in row.children if isinstance(n, Node)][:4]
    items = []
    for node in cards:
        html = re.sub(r' style="[^"]*"', ' style="transform-style:preserve-3d"', node.html(), count=1)
        items.append(html)
    repeated = "".join(items) + "".join(html.replace('<div ', '<div aria-hidden="true" ', 1) for html in items)
    reel = '<div class="reel-stage relative w-full h-full overflow-hidden"><div data-reel class="flex items-center h-full" style="perspective:1000px">' + repeated + '</div><button type="button" data-pause class="replay-button absolute bottom-4 right-4 z-20" aria-pressed="false">暂停循环</button></div>'
    emit("reel-laper", "laper", "reel", reel, "laper/index.html + page.js + page.css", "mountScriptReel(); [data-fast-scroll='scroll_to_hero_chat'] [style*='perspective']", "full")
    spring = '<div data-spring-scroll tabindex="0" aria-label="滚动弹簧预览" class="spring-scroll relative w-full h-full overflow-y-auto"><div class="spring-intro">向下滚动这一预览，观察画面逐渐放大。<small>滚回顶部可反向观察 · 键盘 Page Down / Page Up</small></div><section data-spring-section><div data-spring-frame style="transform:scale(0.96)"><img src="../snapshots/assets/editor-workspace.png" alt="Laper 编辑器样张"></div></section><div class="spring-outro">滚回顶部，画面会回到起始比例。</div></div><output data-scale class="spring-scale absolute top-3 right-3 z-20">0.960</output>'
    emit("spring-laper", "laper", "spring", spring, "laper/page.js", "mountProductShot(); [aria-label='Laper editor product preview']", "full relative")
    source = (WORKSPACE / "cromma-landing/script.js").read_text(encoding="utf-8")
    toast = re.search(r'toast.innerHTML = `([\s\S]*?)`;', source).group(1)
    toast = toast.replace('Not available yet — coming soon.', 'This is a local component preview.')
    fragment = '<button type="button" data-toast-open class="cromma-tag relative overflow-hidden rounded-2xl h-8 px-4">显示材质提示</button><div class="laper-toast-viewport absolute bottom-6 left-1/2 w-125 max-w-[calc(100vw-2rem)]" role="status" aria-live="polite"></div><template id="toast-template"><div class="laper-toast flex min-w-75 max-w-125 items-center gap-3 overflow-hidden rounded-2xl bg-card px-4 py-3">' + toast + '</div></template>'
    emit("toast-cromma", "cromma", "toast", fragment, "cromma-landing/script.js", "showComingSoon(); .laper-toast; toast-progress", "relative")
    (ROOT / "provenance.json").write_text(json.dumps(provenance, ensure_ascii=False, indent=2), encoding="utf-8", newline="\n")
    print(f"Extracted {len(list((ROOT / 'demos').glob('*.html')))} variants. Source experiments unchanged.")


if __name__ == "__main__":
    build()
